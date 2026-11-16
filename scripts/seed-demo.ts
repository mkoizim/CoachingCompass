/**
 * Seeds the shared, read-only sample roster in Firestore (`demoPlayers`).
 *
 * Each sample player gets randomized illustrative stats, a couple of coaching notes,
 * and an AI profile summary generated once here, so public visitors can browse the
 * roster without triggering any model calls.
 *
 * Firestore Security Rules normally block all writes. To run this, temporarily allow
 * writes to `demoPlayers` (see README), then restore `firestore.rules`.
 *
 *   GEMINI_API_KEY=... npx tsx scripts/seed-demo.ts            # seed with AI summaries
 *   npx tsx scripts/seed-demo.ts --no-ai                       # seed without summaries
 *   npx tsx scripts/seed-demo.ts --dry-run                     # print, don't write
 */
import { doc, setDoc, terminate } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { samplePlayers } from '@/lib/sample-players';
import { generateRandomStats } from '@/lib/stats';
import type { Feedback, Player, ProfileSummary } from '@/lib/types';

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const withAI = !args.has('--no-ai');

const sampleNotes: Record<string, string[]> = {
  'kenji-takahashi': [
    'Showed him video of his swing decisions against lefties; he picked up the early hip rotation himself. Worked better than me describing it.',
    'Asked to save in-game adjustments for after the game. Respect that going forward.',
  ],
  'jackson-adler': [
    'Walked through his changeup spin efficiency data. He wants the numbers first, then a plan; skip the pep talk.',
  ],
  'leo-martinez': [
    'Framing session went well. He responds to direct, specific corrections and wants the detail behind them.',
    'Mentioned he likes helping the younger catchers; consider pairing him with them in bullpen sessions.',
  ],
  'javier-rojas': [
    'Quick encouragement between innings landed well. He played looser after a positive word in the dugout.',
  ],
};

function notesFor(id: string): Feedback[] {
  const day = 24 * 60 * 60 * 1000;
  return (sampleNotes[id] ?? []).map((text, i) => ({
    id: `seed-${id}-${i}`,
    date: new Date(Date.now() - (i + 1) * 3 * day).toISOString(),
    text,
  }));
}

async function summarize(player: Omit<Player, 'profileSummary'>): Promise<ProfileSummary | null> {
  if (!withAI) return null;
  // Imported lazily so --no-ai and --dry-run work without a Gemini key.
  const { summarizePlayerProfile } = await import('@/ai/flows/summarize-player-profile');
  const result = await summarizePlayerProfile({
    position: player.position,
    ...player.survey,
    coachingNotes: player.feedback.map(f => f.text),
    stats: player.stats,
  });
  return { ...result, generatedDate: new Date().toISOString() };
}

async function main() {
  for (const sample of samplePlayers) {
    const { id, ...rest } = sample;
    const base: Omit<Player, 'profileSummary'> = {
      ...rest,
      id,
      stats: generateRandomStats(sample.position),
      feedback: notesFor(id),
    };
    const profileSummary = await summarize(base);
    const { id: _id, ...data } = { ...base, profileSummary };

    if (dryRun) {
      console.log(JSON.stringify({ id, ...data }, null, 2));
      continue;
    }
    await setDoc(doc(db, 'demoPlayers', id), data);
    console.log(`Seeded ${sample.name} (${id})${profileSummary ? ' with AI summary' : ''}`);
  }
  await terminate(db);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
