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
const TIMEOUT_MS = 50_000;
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

  const started = Date.now();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`timed out after ${TIMEOUT_MS / 1000}s`)), TIMEOUT_MS);
    });
    const summary = await Promise.race([summarizePlayerProfile(parsed.data), timeout]);
    console.log(`AI summary generated in ${Date.now() - started}ms`);
    return { ok: true, summary };
  } catch (e) {
    const detail = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    console.error(`AI summary generation failed after ${Date.now() - started}ms: ${detail}`);
    return { ok: false, error: 'The AI summary service is unavailable right now. Please try again later.' };
  } finally {
    clearTimeout(timer);
  }
}
