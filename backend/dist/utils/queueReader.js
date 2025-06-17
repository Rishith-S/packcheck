"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = processQueue;
exports.stopProcessing = stopProcessing;
const generative_ai_1 = require("@google/generative-ai");
const constants_1 = require("./constants");
const cloudflare_1 = require("@upstash/redis/cloudflare");
const sse_1 = require("./sse");
const prismaClient_1 = __importDefault(require("./prismaClient"));
let isProcessing = false;
let shouldContinueProcessing = true;
const redis = new cloudflare_1.Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
function processQueue() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (isProcessing) {
            return;
        }
        isProcessing = true;
        try {
            while (shouldContinueProcessing) {
                const foodDetails = (yield redis.rpop("foodIds"));
                try {
                    if (!foodDetails) {
                        break;
                    }
                    const foodData = yield fetch(`https://world.openfoodfacts.org/api/v0/product/${foodDetails.foodId}`);
                    const data = yield foodData.json();
                    const foodItemUserDetails = yield prismaClient_1.default.foodItemsStatus.findFirst({
                        where: {
                            userEmail: foodDetails.userId,
                            foodId: foodDetails.foodId
                        }
                    });
                    if (foodItemUserDetails) {
                        (0, sse_1.notifySSEClients)(foodDetails.foodId, foodDetails.userId, {
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
                        });
                        return;
                    }
                    const d = new Date();
                    let seconds = d.getSeconds();
                    const GEMINI_API = process.env[`GEMINI_API_KEY_${Math.ceil(seconds / 15)}`];
                    const genAI = new generative_ai_1.GoogleGenerativeAI(GEMINI_API);
                    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
                    const prompt = (0, constants_1.createPrompt)(JSON.stringify({
                        allergens: data.product.allergens,
                        allergens_from_ingredients: data.product.allergens_from_ingredients,
                        allergens_from_user: data.product.allergens_from_user,
                        allergens_hierarchy: data.product.allergens_hierarchy,
                        allergens_tags: data.product.allergens_tags,
                        ingredients_text: data.product.ingredients_text,
                        ingredients_text_en: data.product.ingredients_text_en,
                        ingredients_text_with_allergens: data.product.ingredients_text_with_allergens
                    }), foodDetails.userAllergies);
                    try {
                        const result = yield model.generateContent(prompt);
                        const text = (_a = result.response.candidates) === null || _a === void 0 ? void 0 : _a[0].content.parts[0].text;
                        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
                        if (jsonMatch) {
                            const jsonString = jsonMatch[1];
                            const jsonData = JSON.parse(jsonString);
                            if (jsonData.error === undefined) {
                                yield prismaClient_1.default.foodItemsStatus.create({
                                    data: {
                                        foodName: data.product.product_name,
                                        userEmail: foodDetails.userId,
                                        reason: jsonData.reason,
                                        status: jsonData.safeOrNot,
                                        foodId: foodDetails.foodId
                                    },
                                });
                            }
                            (0, sse_1.notifySSEClients)(foodDetails.foodId, foodDetails.userId, Object.assign(Object.assign({}, jsonData), { status: 'close', foodItemDetails: {
                                    name: data.product.product_name,
                                    itemImage: data.product.image_front_url,
                                    ingredientsImage: data.product.image_ingredients_url,
                                    nutrientsImage: data.product.image_nutrition_url,
                                    ingredients: data.product.ingredients_text,
                                } }));
                        }
                    }
                    catch (error) {
                        console.error("Error processing item:", error);
                        if (foodDetails.failureAttempts != 0) {
                            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                                const retryFoodDetails = {
                                    foodId: foodDetails.foodId,
                                    userId: foodDetails.userId,
                                    userAllergies: foodDetails.userAllergies,
                                    failureAttempts: foodDetails.failureAttempts - 1,
                                    delayBeforeTrial: foodDetails.delayBeforeTrial + 2,
                                };
                                yield redis.lpush("foodIds", retryFoodDetails);
                                processQueue();
                            }), foodDetails.delayBeforeTrial * 1000);
                        }
                    }
                }
                catch (error) {
                    console.log(error);
                    (0, sse_1.notifySSEClients)(foodDetails.foodId, foodDetails.userId, { status: 'error', error: true });
                }
            }
        }
        catch (error) {
            console.error("Fatal error in queue processor:", error);
        }
        finally {
            isProcessing = false;
        }
    });
}
// Add this to gracefully handle worker shutdowns
function stopProcessing() {
    shouldContinueProcessing = false;
}
