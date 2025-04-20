export const createPrompt = (foodItemDetails: string, userAllergiesString: string[]) => {
  const userAllergies = userAllergiesString.map(allergy => allergy.toLowerCase()).join(', ');
  return `You are a food safety checker.
Given:
- 'foodItemDetails': a string describing ingredients in a food item.
- 'userAllergies': a list of specific allergens the user is allergic to.

Your job:
1. Check if any ingredients in 'foodItemDetails' directly match or are related to the items in 'userAllergies'.
2. If there's any match, return 'safeOrNot: false' and explain which ingredient(s) caused the issue.
3. If there's no match, return 'safeOrNot: true' and explain why it's safe.

Respond strictly in this format:
{
  safeOrNot: boolean,
  reason: string
}

Examples:

Input:
foodItemDetails = "Contains milk, sugar, cocoa"
userAllergies = ["milk"]

Output:
{
  safeOrNot: false,
  reason: "Contains milk which is one of the your allergies."
}

Input:
foodItemDetails = "Contains rice, salt, sunflower oil"
userAllergies = ["peanuts", "gluten"]

Output:
{
  safeOrNot: true,
  reason: "None of the listed ingredients match the your allergies."
}

Now evaluate:
${foodItemDetails}
Allergies:
${userAllergies}`;
};