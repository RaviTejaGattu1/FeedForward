'use server';
/**
 * @fileOverview An AI-powered recipe suggestion tool.
 *
 * - generateRecipeSuggestion - A function that suggests a recipe.
 * - RecipeSuggestionInput - The input type for the generateRecipeSuggestion function.
 * - RecipeSuggestionOutput - The return type for the generateRecipeSuggestion function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

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

const generationPrompt = ai.definePrompt({
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

const proofreadPrompt = ai.definePrompt({
    name: 'recipeProofreadPrompt',
    input: { schema: z.object({ textToProofread: z.string() }) },
    output: { schema: RecipeSuggestionOutputSchema },
    prompt: `You are a proofreader. Your only job is to correct spelling and grammar mistakes in the following text.
    
    **CRITICAL RULE:** Pay special attention to greetings. If you see "Hy," you MUST correct it to "Hey" or "Hi." Do not leave any spelling or grammar errors.
    
    Return the corrected text in a JSON object with a single key: "suggestion".
    
    Text to proofread: "{{{textToProofread}}}"`,
});


const recipeSuggestionFlow = ai.defineFlow(
  {
    name: 'recipeSuggestionFlow',
    inputSchema: RecipeSuggestionInputSchema,
    outputSchema: RecipeSuggestionOutputSchema,
  },
  async (input) => {
    // Step 1: Generate the initial suggestion
    const generationResult = await generationPrompt(input);
    const initialSuggestion = generationResult.output?.suggestion;

    if (!initialSuggestion) {
      throw new Error('The model did not return an initial suggestion. This might be due to safety settings or an internal error.');
    }

    // Step 2: Proofread the suggestion
    const proofreadResult = await proofreadPrompt({ textToProofread: initialSuggestion });
    const finalSuggestion = proofreadResult.output;
    
    if (!finalSuggestion) {
        throw new Error('The proofreading step failed to return a valid suggestion.');
    }
    
    return finalSuggestion;
  }
);
