'use server';

/**
 * @fileOverview Generates homepage statistics and a motivational blurb.
 *
 * - generateHomepageContent - A function that generates the homepage content.
 * - HomepageContentInput - The input type for the generateHomepageContent function.
 * - HomepageContentOutput - The return type for the generateHomepageContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HomepageContentInputSchema = z.object({
  foodDeliveredLbs: z.number().describe('Total pounds of food delivered.'),
  hungerMetKcal: z.number().describe('Total kilocalories of hunger met.'),
  livesImpacted: z.number().describe('Total number of lives impacted.'),
});
export type HomepageContentInput = z.infer<typeof HomepageContentInputSchema>;

const HomepageContentOutputSchema = z.object({
  foodDeliveredLbs: z.number().describe('Total pounds of food delivered.'),
  hungerMetKcal: z.number().describe('Total kilocalories of hunger met.'),
  livesImpacted: z.number().describe('Total number of lives impacted.'),
  motivationalBlurb: z.string().describe('A motivational blurb to reinforce the impact of FeedForward.'),
});
export type HomepageContentOutput = z.infer<typeof HomepageContentOutputSchema>;

export async function generateHomepageContent(input: HomepageContentInput): Promise<HomepageContentOutput> {
  return homepageContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'homepageContentPrompt',
  input: {schema: HomepageContentInputSchema},
  output: {schema: HomepageContentOutputSchema},
  prompt: `Generate homepage statistics and a motivational blurb based on the following data:

Food Delivered: {{foodDeliveredLbs}} lbs
Hunger Met: {{hungerMetKcal}} kcal
Lives Impacted: {{livesImpacted}}

Write a short motivational blurb (max 50 words) to reinforce the impact of FeedForward. Make the blurb sound positive, inspirational, and action-oriented.`,
});

const homepageContentFlow = ai.defineFlow(
  {
    name: 'homepageContentFlow',
    inputSchema: HomepageContentInputSchema,
    outputSchema: HomepageContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
