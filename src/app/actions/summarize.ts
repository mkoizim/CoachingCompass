'use server';

import { headers } from 'next/headers';
import {
  summarizePlayerProfile,
  SummarizePlayerProfileInputSchema,
  type SummarizePlayerProfileInput,
  type SummarizePlayerProfileOutput,
} from '@/ai/flows/summarize-player-profile';

export type SummarizeResult =
  | { ok: true; summary: SummarizePlayerProfileOutput }
  | { ok: false; error: string };

// Best-effort abuse protection for the public demo. Serverless instances don't share
// memory, so this is per-instance; the hard ceiling is the Gemini API key's own quota.
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 15;
const recent = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const hits = (recent.get(key) ?? []).filter(t => now - t < WINDOW_MS);
  if (hits.length >= MAX_PER_WINDOW) {
    recent.set(key, hits);
    return true;
  }
  hits.push(now);
  recent.set(key, hits);
  if (recent.size > 5000) recent.clear(); // bound memory
  return false;
}

export async function generateProfileSummary(input: SummarizePlayerProfileInput): Promise<SummarizeResult> {
  const parsed = SummarizePlayerProfileInputSchema.safeParse({
    ...input,
    // Only the most recent notes matter for the summary; cap what we send to the model.
    coachingNotes: (input.coachingNotes ?? []).slice(0, 20),
  });
  if (!parsed.success) {
    return { ok: false, error: 'This profile has more text than the demo accepts. Try shortening the survey answers or notes.' };
  }

  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown';
  if (isRateLimited(ip)) {
    return { ok: false, error: 'You have generated a lot of summaries in the last hour. Please try again later.' };
  }

  try {
    const summary = await summarizePlayerProfile(parsed.data);
    return { ok: true, summary };
  } catch (e) {
    console.error('AI summary generation failed:', e);
    return { ok: false, error: 'The AI summary service is unavailable right now. Please try again later.' };
  }
}
