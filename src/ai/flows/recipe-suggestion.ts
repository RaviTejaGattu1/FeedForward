'use server';
/**
 * @fileOverview An AI-powered recipe suggestion tool.
 *
 * - generateRecipeSuggestion - A function that suggests a recipe.
 * - RecipeSuggestionInput - The input type for the generateRecipeSuggestion function.
 * - RecipeSuggestionOutput - The return type for the generateRecipeSuggestion function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RecipeSuggestionInputSchema = z.object({
  foodItem: z.string().describe('The food item to base the recipe on.'),
});
export type RecipeSuggestionInput = z.infer<typeof RecipeSuggestionInputSchema>;

const RecipeSuggestionOutputSchema = z.object({
  suggestion: z
    .string()
    .describe('The recipe suggestion, including other required items.'),
});
export type RecipeSuggestionOutput = z.infer<
  typeof RecipeSuggestionOutputSchema
>;

export async function generateRecipeSuggestion(
  input: RecipeSuggestionInput
): Promise<RecipeSuggestionOutput> {
  return recipeSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recipeSuggestionPrompt',
  input: { schema: RecipeSuggestionInputSchema },
  output: { schema: RecipeSuggestionOutputSchema },
  prompt: `You are an AI assistant for the FeedForward app. Your goal is to help food providers maximize their donations.

A user is listing a food item: '{{{foodItem}}}'.

Suggest a simple, delicious recipe that a recipient can make using this item with minimal additional ingredients and effort.
The tone should be encouraging and helpful.
Phrase the suggestion like this: "Hey, the simplest dish a recipient can make using this item is [Dish Name]. It also requires [Ingredient A, B, C] to make it. You can donate them too if you have them, to deliver a complete meal!"
Keep the suggestion concise (around 50 words).
If the item is not something that can be used in a recipe (e.g., a ready-to-eat meal), just return an encouraging message about their donation.
**CRITICAL: You MUST use perfect English spelling and grammar. Do not use slang or misspellings (e.g., use "Hi" or "Hey", not "Hy"). Your response will be rejected if it contains errors.**

Return your response in JSON format.
`,
  config: {
    safetySettings: [
        {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_ONLY_HIGH',
        },
        {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_ONLY_HIGH'
        }
    ]
  }
});

const recipeSuggestionFlow = ai.defineFlow(
  {
    name: 'recipeSuggestionFlow',
    inputSchema: RecipeSuggestionInputSchema,
    outputSchema: RecipeSuggestionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The model did not return a suggestion. This might be due to safety settings or an internal error.');
    }
    return output;
  }
);
