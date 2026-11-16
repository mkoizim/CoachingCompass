import type {
  Player,
  PlayerStats,
  Stat,
  HitterStats,
  PitcherStats,
  CatcherStats,
} from '@/lib/types';

// Illustrative stats only: CoachingCompass generates plausible random numbers
// around MLB-average baselines so the AI summary has something to reason about.

const defaultHitterStats: HitterStats = {
  xwoba: { value: 0.315, percentile: 50 },
  xba: { value: 0.24, percentile: 50 },
  xslg: { value: 0.4, percentile: 50 },
  avgExitVelo: { value: 90, percentile: 50 },
  barrelRate: { value: 8, percentile: 50 },
  hardHitRate: { value: 40, percentile: 50 },
  sweetSpotRate: { value: 33, percentile: 50 },
  batSpeed: { value: 70, percentile: 50 },
  squaredUpRate: { value: 26, percentile: 50 },
  chaseRate: { value: 28, percentile: 50 },
  whiffRate: { value: 24, percentile: 50 },
  kRate: { value: 22, percentile: 50 },
  bbRate: { value: 8, percentile: 50 },
  range: { value: 0, percentile: 50 },
  armValue: { value: 0, percentile: 50 },
  armStrength: { value: 85, percentile: 50 },
  sprintSpeed: { value: 27, percentile: 50 },
};

const defaultCatcherStats: CatcherStats = {
  ...defaultHitterStats, // Includes all batting and running stats
  armStrength: { value: 80, percentile: 50 },
  blocksAboveAverage: { value: 0, percentile: 50 },
  csAboveAverage: { value: 0, percentile: 50 },
  framingRuns: { value: 0, percentile: 50 },
};

const defaultPitcherStats: PitcherStats = {
  pitchingRunValue: { value: 0, percentile: 50 },
  fastballRunValue: { value: 0, percentile: 50 },
  breakingRunValue: { value: 0, percentile: 50 },
  offspeedRunValue: { value: 0, percentile: 50 },
  xera: { value: 4.0, percentile: 50 },
  xba: { value: 0.24, percentile: 50 },
  fastballVelo: { value: 93, percentile: 50 },
  avgExitVelo: { value: 88, percentile: 50 },
  chaseRate: { value: 28, percentile: 50 },
  whiffRate: { value: 25, percentile: 50 },
  kRate: { value: 22, percentile: 50 },
  bbRate: { value: 8, percentile: 50 },
  barrelRate: { value: 7, percentile: 50 },
  hardHitRate: { value: 38, percentile: 50 },
  gbRate: { value: 45, percentile: 50 },
  extension: { value: 6.5, percentile: 50 },
};

// Helper function to generate a random stat
const createRandomStat = (baseValue: number, valueRange: number, higherIsBetter = true): Stat => {
  const percentile = Math.floor(Math.random() * 99) + 1;
  const valueMultiplier = (percentile - 50) / 50; // a value from -1 to 1
  const value = baseValue + valueRange * valueMultiplier;
  return { value, percentile };
};

// Generate random stats for a new hitter
export const generateRandomHitterStats = (): HitterStats => {
  return {
    xwoba: createRandomStat(0.315, 0.1),
    xba: createRandomStat(0.24, 0.05),
    xslg: createRandomStat(0.4, 0.2),
    avgExitVelo: createRandomStat(90, 8),
    barrelRate: createRandomStat(8, 7),
    hardHitRate: createRandomStat(40, 15),
    sweetSpotRate: createRandomStat(33, 5),
    batSpeed: createRandomStat(70, 10),
    squaredUpRate: createRandomStat(26, 8),
    chaseRate: createRandomStat(28, 8, false),
    whiffRate: createRandomStat(24, 10, false),
    kRate: createRandomStat(22, 12, false),
    bbRate: createRandomStat(8, 5),
    range: createRandomStat(0, 5),
    armValue: createRandomStat(0, 5),
    armStrength: createRandomStat(85, 10),
    sprintSpeed: createRandomStat(27, 2),
  };
};

export const generateRandomCatcherStats = (): CatcherStats => {
  const baseHitterStats = generateRandomHitterStats();
  return {
    ...baseHitterStats,
    armStrength: createRandomStat(80, 6),
    blocksAboveAverage: createRandomStat(0, 5),
    csAboveAverage: createRandomStat(0, 5),
    framingRuns: createRandomStat(0, 10),
  };
};

// Generate random stats for a new pitcher
export const generateRandomPitcherStats = (): PitcherStats => {
  return {
    pitchingRunValue: createRandomStat(0, 10),
    fastballRunValue: createRandomStat(0, 10),
    breakingRunValue: createRandomStat(0, 10),
    offspeedRunValue: createRandomStat(0, 10),
    xera: createRandomStat(4.0, 1.5, false), // lower is better
    xba: createRandomStat(0.24, 0.04, false), // lower is better
    fastballVelo: createRandomStat(93, 5),
    avgExitVelo: createRandomStat(88, 4, false), // lower is better
    chaseRate: createRandomStat(28, 6),
    whiffRate: createRandomStat(25, 8),
    kRate: createRandomStat(22, 8),
    bbRate: createRandomStat(8, 3, false), // lower is better
    barrelRate: createRandomStat(7, 3, false), // lower is better
    hardHitRate: createRandomStat(38, 8, false), // lower is better
    gbRate: createRandomStat(45, 10),
    extension: createRandomStat(6.5, 0.8),
  };
};

export function generateRandomStats(position: Player['position']): PlayerStats {
  switch (position) {
    case 'Pitcher':
      return generateRandomPitcherStats();
    case 'Catcher':
      return generateRandomCatcherStats();
    default:
      return generateRandomHitterStats();
  }
}

/** Fills in any stat keys missing from older records with neutral defaults. */
export function withDefaultStats(player: Player): Player {
  const defaults: PlayerStats =
    player.position === 'Pitcher'
      ? defaultPitcherStats
      : player.position === 'Catcher'
        ? defaultCatcherStats
        : defaultHitterStats;
  return { ...player, stats: { ...defaults, ...(player.stats ?? {}) } as PlayerStats };
}
