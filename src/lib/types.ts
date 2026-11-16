export interface Player {
  id: string;
  name: string;
  position: 'Pitcher' | 'Catcher' | 'Infielder' | 'Outfielder' | 'Utility';
  avatarUrl: string;
  stats: PlayerStats;
  survey: PlayerSurvey;
  profileSummary: ProfileSummary | null;
  feedback: Feedback[];
}

export type PlayerStats = HitterStats | PitcherStats | CatcherStats;

export interface ProfileSummary {
  intro: string;
  dos: string[];
  donts: string[];
  focusAreas: string[];
  generatedDate?: string;
}

export interface Stat {
  value: number;
  percentile: number;
}

export interface BattingStats {
  xwoba: Stat;
  xba: Stat;
  xslg: Stat;
  avgExitVelo: Stat;
  barrelRate: Stat;
  hardHitRate: Stat;
  sweetSpotRate: Stat;
  batSpeed: Stat;
  squaredUpRate: Stat;
  chaseRate: Stat;
  whiffRate: Stat;
  kRate: Stat;
  bbRate: Stat;
}

export interface BaseRunningStats {
  sprintSpeed: Stat;
}

export interface HitterStats extends BattingStats, BaseRunningStats {
  // Fielding
  range: Stat;
  armValue: Stat;
  armStrength: Stat;
}

export interface CatcherStats extends BattingStats, BaseRunningStats {
  // Fielding
  armStrength: Stat;
  blocksAboveAverage: Stat;
  csAboveAverage: Stat;
  framingRuns: Stat;
}

export interface PitcherStats {
  pitchingRunValue: Stat;
  fastballRunValue: Stat;
  breakingRunValue: Stat;
  offspeedRunValue: Stat;
  xera: Stat;
  xba: Stat;
  fastballVelo: Stat;
  avgExitVelo: Stat;
  chaseRate: Stat;
  whiffRate: Stat;
  kRate: Stat;
  bbRate: Stat;
  barrelRate: Stat;
  hardHitRate: Stat;
  gbRate: Stat;
  extension: Stat;
}

export interface PlayerSurvey {
  learningStyleRanking: string[];
  performanceAnalysisPreference: string;
  coachExplanationPreference: string;
  learningSettingRanking: string[];
  coachingTimingRanking: string[];
  progressImportance: string;
  feedbackStyle: string;
  motivationRanking: string[];
  remoteCoachingOpenness: string;
  bestCoachDescription: string;
  improvementGoals: string;
  hobbies: string;
}

export interface Feedback {
  id: string;
  date: string; // ISO date string
  text: string;
}
