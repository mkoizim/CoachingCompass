/**
 * @fileOverview Generates a concise summary of a player's profile based on their survey responses and coaching notes.
 *
 * Core Genkit flow, shared by the rate-limited server action (src/app/actions/summarize.ts)
 * and the seed script (scripts/seed-demo.ts). Not itself exposed to the browser.
 *
 * - summarizePlayerProfile - A function that generates the player profile summary.
 * - SummarizePlayerProfileInput - The input type for the summarizePlayerProfile function.
 * - SummarizePlayerProfileOutput - The return type for the summarizePlayerProfile function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const StatSchema = z.object({
  value: z.number(),
  percentile: z.number(),
});

const BattingStatsSchema = z.object({
  xwoba: StatSchema,
  xba: StatSchema,
  xslg: StatSchema,
  avgExitVelo: StatSchema,
  barrelRate: StatSchema,
  hardHitRate: StatSchema,
  sweetSpotRate: StatSchema,
  batSpeed: StatSchema,
  squaredUpRate: StatSchema,
  chaseRate: StatSchema,
  whiffRate: StatSchema,
  kRate: StatSchema,
  bbRate: StatSchema,
});

const BaseRunningStatsSchema = z.object({
  sprintSpeed: StatSchema,
});

const HitterStatsSchema = BattingStatsSchema.merge(BaseRunningStatsSchema).extend({
  range: StatSchema,
  armValue: StatSchema,
  armStrength: StatSchema,
});

const CatcherStatsSchema = BattingStatsSchema.merge(BaseRunningStatsSchema).extend({
  armStrength: StatSchema,
  blocksAboveAverage: StatSchema,
  csAboveAverage: StatSchema,
  framingRuns: StatSchema,
});

const PitcherStatsSchema = z.object({
  pitchingRunValue: StatSchema,
  fastballRunValue: StatSchema,
  breakingRunValue: StatSchema,
  offspeedRunValue: StatSchema,
  xera: StatSchema,
  xba: StatSchema,
  fastballVelo: StatSchema,
  avgExitVelo: StatSchema,
  chaseRate: StatSchema,
  whiffRate: StatSchema,
  kRate: StatSchema,
  bbRate: StatSchema,
  barrelRate: StatSchema,
  hardHitRate: StatSchema,
  gbRate: StatSchema,
  extension: StatSchema,
});

const PlayerStatsSchema = z.union([HitterStatsSchema, CatcherStatsSchema, PitcherStatsSchema]);

export const SummarizePlayerProfileInputSchema = z.object({
  position: z.string().max(200).optional().default('').describe("The player's primary position."),
  learningStyleRanking: z
    .array(z.string().max(200))
    .max(10)
    .optional()
    .default([])
    .describe("The player's ranked preferences for learning new physical skills."),
  performanceAnalysisPreference: z
    .string()
    .max(200)
    .optional()
    .default('')
    .describe('How the player prefers to analyze their performance (e.g., data, feel, or a mix).'),
  coachExplanationPreference: z
    .string()
    .max(200)
    .optional()
    .default('')
    .describe("The player's preference for how a coach explains concepts."),
  learningSettingRanking: z
    .array(z.string().max(200))
    .max(10)
    .optional()
    .default([])
    .describe("The player's ranked preferences for learning settings."),
  coachingTimingRanking: z
    .array(z.string().max(200))
    .max(10)
    .optional()
    .default([])
    .describe("The player's ranked preferences for when they receive coaching."),
  progressImportance: z
    .string()
    .max(200)
    .optional()
    .default('')
    .describe('How important it is for the player to see progress.'),
  feedbackStyle: z
    .string()
    .max(200)
    .optional()
    .default('')
    .describe('The style of feedback that is most effective for the player.'),
  motivationRanking: z
    .array(z.string().max(200))
    .max(10)
    .optional()
    .default([])
    .describe("The player's ranked career motivations."),
  remoteCoachingOpenness: z
    .string()
    .max(200)
    .optional()
    .default('')
    .describe("The player's openness to remote coaching methods."),
  bestCoachDescription: z
    .string()
    .max(1500)
    .optional()
    .default('')
    .describe("The player's description of the best coach they've had."),
  improvementGoals: z
    .string()
    .max(1500)
    .optional()
    .default('')
    .describe('What the player wants to work on to improve.'),
  hobbies: z
    .string()
    .max(1500)
    .optional()
    .default('')
    .describe('What the player enjoys doing outside of baseball.'),
  coachingNotes: z
    .array(z.string().max(2000))
    .max(20)
    .optional()
    .default([])
    .describe('A list of notes from coaches about their interactions with the player.'),
  stats: PlayerStatsSchema.optional().describe("The player's key performance statistics."),
});
export type SummarizePlayerProfileInput = z.infer<typeof SummarizePlayerProfileInputSchema>;

const SummarizePlayerProfileOutputSchema = z.object({
  intro: z
    .string()
    .describe(
      "A brief paragraph (2-3 sentences) summarizing the player's key characteristics, including their primary motivation, learning style, and how they analyze their performance.",
    ),
  dos: z
    .array(z.string())
    .describe(
      'A list of specific, scannable "Dos" for coaching this player based on their preferences for feedback, communication, and coaching timing.',
    ),
  donts: z
    .array(z.string())
    .describe(
      'A list of specific, scannable "Don\'ts" for coaching this player based on their preferences for feedback, communication, and coaching timing. Avoid confusing phrasing like double negatives (e.g., "Don\'t avoid talking about..."). Be direct.',
    ),
  focusAreas: z
    .array(z.string())
    .describe(
      "A bulleted list of 3-5 brief, non-prescriptive concepts or skills for a coach to focus on with the player. Base this list on a synthesis of the player's stated goals, recent coaching notes, and their weakest statistical areas. For each item, cite the reason in parentheses, e.g., 'Swing Decision-Making (player's stated goal)' or 'Pitch Recognition (chase % is 22.4%)'.",
    ),
});
export type SummarizePlayerProfileOutput = z.infer<typeof SummarizePlayerProfileOutputSchema>;

export async function summarizePlayerProfile(
  input: SummarizePlayerProfileInput,
): Promise<SummarizePlayerProfileOutput> {
  return summarizePlayerProfileFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizePlayerProfilePrompt',
  input: { schema: SummarizePlayerProfileInputSchema },
  output: { schema: SummarizePlayerProfileOutputSchema },
  prompt: `You are an expert baseball coach and player development analyst. Your task is to synthesize a player's survey responses, coaching notes, and key stats into a concise, actionable coaching summary. This summary should highlight the player's learning style, motivations, and communication preferences so a coach can quickly understand the best way to work with them.

  **Player Position:** {{{position}}}

  **Survey Responses (Player's Stated Preferences):**
  - **Primary Motivations (Ranked):** {{{motivationRanking}}}
  - **Preferred Learning Style (Ranked):** {{{learningStyleRanking}}}
  - **Preferred Learning Setting (Ranked):** {{{learningSettingRanking}}}
  - **Preferred Coaching Timing (Ranked):** {{{coachingTimingRanking}}}
  - **Performance Analysis Preference:** {{{performanceAnalysisPreference}}}
  - **Coaching Explanation Preference:** {{{coachExplanationPreference}}}
  - **Feedback Style Preference:** {{{feedbackStyle}}}
  - **Stance on Progress:** {{{progressImportance}}}
  - **Openness to Remote Coaching:** {{{remoteCoachingOpenness}}}
  - **Description of Best Coach:** {{{bestCoachDescription}}}
  - **Stated Improvement Goals:** {{{improvementGoals}}}
  - **Hobbies/Interests:** {{{hobbies}}}

  **Coaching Notes (Coach's Observations):**
  {{#if coachingNotes}}
  {{#each coachingNotes}}
  - {{{this}}}
  {{/each}}
  {{else}}
  No coaching notes have been provided yet.
  {{/if}}

  **Key Statistics:**
  {{#if stats}}
    {{#with stats}}
      {{#if xwoba}}xwOBA: {{xwoba.value}} ({{xwoba.percentile}}th percentile){{/if}}
      {{#if xba}}xBA: {{xba.value}} ({{xba.percentile}}th percentile){{/if}}
      {{#if xslg}}xSLG: {{xslg.value}} ({{xslg.percentile}}th percentile){{/if}}
      {{#if avgExitVelo}}Avg Exit Velo: {{avgExitVelo.value}} ({{avgExitVelo.percentile}}th percentile){{/if}}
      {{#if barrelRate}}Barrel %: {{barrelRate.value}} ({{barrelRate.percentile}}th percentile){{/if}}
      {{#if hardHitRate}}Hard-Hit %: {{hardHitRate.value}} ({{hardHitRate.percentile}}th percentile){{/if}}
      {{#if chaseRate}}Chase %: {{chaseRate.value}} ({{chaseRate.percentile}}th percentile){{/if}}
      {{#if whiffRate}}Whiff %: {{whiffRate.value}} ({{whiffRate.percentile}}th percentile){{/if}}
      {{#if kRate}}K %: {{kRate.value}} ({{kRate.percentile}}th percentile){{/if}}
      {{#if bbRate}}BB %: {{bbRate.value}} ({{bbRate.percentile}}th percentile){{/if}}
      {{#if sprintSpeed}}Sprint Speed: {{sprintSpeed.value}} ({{sprintSpeed.percentile}}th percentile){{/if}}
      {{#if xera}}xERA: {{xera.value}} ({{xera.percentile}}th percentile){{/if}}
      {{#if fastballVelo}}Fastball Velo: {{fastballVelo.value}} ({{fastballVelo.percentile}}th percentile){{/if}}
      {{#if gbRate}}GB %: {{gbRate.value}} ({{gbRate.percentile}}th percentile){{/if}}
    {{/with}}
  {{else}}
    No stats provided.
  {{/if}}


  **Instructions:**
  Generate a summary with the following fields. Use the survey responses as the primary source of information. Use the coaching notes to refine and add nuance to your summary. If a coaching note contradicts a survey response, give more weight to the real-world observation from the note.

  1.  **intro:** A brief paragraph (2-3 sentences) summarizing the player's key characteristics, including their primary motivation, learning style, and how they analyze their performance.
  2.  **dos:** A list of specific, scannable "Dos" for coaching this player based on their preferences for feedback, communication, and coaching timing. Word these directly and clearly. For example, instead of "Do try to connect with them", say "Connect with them".
  3.  **donts:** A list of specific, scannable "Don'ts" for coaching this player based on their preferences. Avoid confusing phrasing like double negatives (e.g., "Don't avoid talking about..."). Be direct.
  4.  **focusAreas:** A bulleted list of 3-5 brief, non-prescriptive concepts or skills for a coach to focus on with the player. Base this list on a synthesis of the player's stated goals, recent coaching notes, and their weakest statistical areas. For each item, cite the reason in parentheses, e.g., 'Swing Decision-Making (player's stated goal)' or 'Pitch Recognition (chase % is 22.4%)'.

  **Tone:** The summary should be direct and to-the-point. Avoid extra or filler words. It should be insightful, objective, and written in a way that helps a coach build a strong, productive relationship with the player.
  `,
});

const summarizePlayerProfileFlow = ai.defineFlow(
  {
    name: 'summarizePlayerProfileFlow',
    inputSchema: SummarizePlayerProfileInputSchema,
    outputSchema: SummarizePlayerProfileOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  },
);
