export interface QueueObject {
  foodId: string;
  userId:string;
  userAllergies : string[];
  failureAttempts: number;
  delayBeforeTrial: number;
}

export interface Result {
  safeOrNot?: boolean,
  reason?: string,
  status:string,
  foodItemDetails?:{
    name: string,
    itemImage: string,
    ingredientsImage:string,
    nutrientsImage: string,
    ingredients: string,
  }
  error? : boolean;
}