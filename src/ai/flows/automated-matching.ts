// src/ai/flows/automated-matching.ts
'use server';
/**
 * @fileOverview An AI-powered matching tool to automatically suggest connections between providers with surplus food and recipients in need.
 *
 * - automatedMatching - A function that handles the automated matching process.
 * - AutomatedMatchingInput - The input type for the automatedMatching function.
 * - AutomatedMatchingOutput - The return type for the automatedMatching function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutomatedMatchingInputSchema = z.object({
  providerLocation: z
    .string()
    .describe('The geographical location of the food provider.'),
  providerPreferences: z
    .string()
    .describe('The stated preferences of the food provider.'),
  recipientLocation: z
    .string()
    .describe('The geographical location of the recipient.'),
  recipientNeeds: z.string().describe('The needs of the recipient.'),
});
export type AutomatedMatchingInput = z.infer<typeof AutomatedMatchingInputSchema>;

const AutomatedMatchingOutputSchema = z.object({
  matchSuggestion: z
    .string()
    .describe(
      'A suggestion for a match between a provider and a recipient, including reasons for the match.'
    ),
  confidenceScore: z
    .number()
    .describe('A confidence score (0-1) indicating the strength of the match.'),
});
export type AutomatedMatchingOutput = z.infer<typeof AutomatedMatchingOutputSchema>;

export async function automatedMatching(input: AutomatedMatchingInput): Promise<AutomatedMatchingOutput> {
  return automatedMatchingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'automatedMatchingPrompt',
  input: {schema: AutomatedMatchingInputSchema},
  output: {schema: AutomatedMatchingOutputSchema},
  prompt: `You are an AI assistant designed to match food providers with recipients in need.

  Analyze the following information to suggest a match and provide a confidence score:

  Provider Location: {{{providerLocation}}}
  Provider Preferences: {{{providerPreferences}}}
  Recipient Location: {{{recipientLocation}}}
  Recipient Needs: {{{recipientNeeds}}}

  Consider geographical proximity and stated preferences to find the best possible match.
  Provide a match suggestion and a confidence score (0-1) for the match.
  The confidence score should reflect the likelihood of a successful match based on the provided information.
  The recipient needs should be fulfilled by the provider.
  Make sure to explain the reasoning behind the match suggestion.`,
});

const automatedMatchingFlow = ai.defineFlow(
  {
    name: 'automatedMatchingFlow',
    inputSchema: AutomatedMatchingInputSchema,
    outputSchema: AutomatedMatchingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
