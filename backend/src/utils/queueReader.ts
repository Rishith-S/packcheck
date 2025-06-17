import {
  GenerateContentResult,
  GoogleGenerativeAI,
} from "@google/generative-ai";
import { createPrompt } from "./constants";
import { Redis } from "@upstash/redis/cloudflare";
import { QueueObject, Result } from "./types";
import { notifySSEClients } from "./sse";
import prisma from "./prismaClient";

let isProcessing = false;
let shouldContinueProcessing = true;

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function processQueue() {
  if (isProcessing) {
    return;
  }

  isProcessing = true;
  try {
    while (shouldContinueProcessing) {
      const foodDetails: QueueObject = (await redis.rpop(
        "foodIds"
      )) as unknown as QueueObject;
      try {
        if (!foodDetails) {
          break;
        }
        const foodData = await fetch(
          `https://world.openfoodfacts.org/api/v0/product/${foodDetails.foodId}`
        );
        const data = await foodData.json()
        const foodItemUserDetails = await prisma.foodItemsStatus.findFirst({
          where:{
            userEmail: foodDetails.userEmail,
            foodId: foodDetails.foodId
          }
        })
        if(foodItemUserDetails){
          notifySSEClients(foodDetails.foodId, foodDetails.userEmail, {
            safeOrNot: foodItemUserDetails.status,
            reason: foodItemUserDetails.reason,
            status: 'close',
            foodItemDetails: {
              name: data.product.product_name,
              itemImage: data.product.image_front_url,
              ingredientsImage: data.product.image_ingredients_url,
              nutrientsImage: data.product.image_nutrition_url,
              ingredients: data.product.ingredients_text,
            }
          })
          return;
        }
        const d = new Date();
        let seconds = d.getSeconds();
        const GEMINI_API = process.env[`GEMINI_API_KEY_${Math.ceil(seconds / 15)}`];
        const genAI = new GoogleGenerativeAI(GEMINI_API!);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        const prompt = createPrompt(JSON.stringify({
          allergens: data.product.allergens,
          allergens_from_ingredients: data.product.allergens_from_ingredients,
          allergens_from_user: data.product.allergens_from_user,
          allergens_hierarchy: data.product.allergens_hierarchy,
          allergens_tags: data.product.allergens_tags,
          ingredients_text: data.product.ingredients_text,
          ingredients_text_en: data.product.ingredients_text_en,
          ingredients_text_with_allergens: data.product.ingredients_text_with_allergens
        }), foodDetails.userAllergies)
        try {
          const result: GenerateContentResult = await model.generateContent(
            prompt
          );
          const text = result.response.candidates?.[0].content.parts[0].text!;
          const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
          if (jsonMatch) {
            const jsonString = jsonMatch[1];
            const jsonData: Result = JSON.parse(jsonString);
            if(jsonData.error === undefined){
              await prisma.foodItemsStatus.create({
                data: {
                  foodName: data.product.product_name,
                  userEmail: foodDetails.userEmail,
                  reason: jsonData.reason!,
                  status: jsonData.safeOrNot!,
                  foodId: foodDetails.foodId
                },
              });
            }
            notifySSEClients(foodDetails.foodId, foodDetails.userEmail, {
              ...jsonData,
              status: 'close',
              foodItemDetails: {
                name: data.product.product_name,
                itemImage: data.product.image_front_url,
                ingredientsImage: data.product.image_ingredients_url,
                nutrientsImage: data.product.image_nutrition_url,
                ingredients: data.product.ingredients_text,
              }
            })
          }
        } catch (error) {
          console.error("Error processing item:", error);
          if (foodDetails.failureAttempts != 0) {
            setTimeout(async () => {
              const retryFoodDetails: QueueObject = {
                foodId: foodDetails.foodId,
                userEmail: foodDetails.userEmail,
                userAllergies: foodDetails.userAllergies,
                failureAttempts: foodDetails.failureAttempts - 1,
                delayBeforeTrial: foodDetails.delayBeforeTrial + 2,
              };
              await redis.lpush("foodIds", retryFoodDetails);
              processQueue()
            }, foodDetails.delayBeforeTrial * 1000);
          }
        }
      } catch (error) {
        console.log(error);
        notifySSEClients(foodDetails.foodId, foodDetails.userEmail, { status: 'error', error: true })
      }
    }
  } catch (error) {
    console.error("Fatal error in queue processor:", error);
  } finally {
    isProcessing = false;
  }
}

// Add this to gracefully handle worker shutdowns
export function stopProcessing() {
  shouldContinueProcessing = false;
}
