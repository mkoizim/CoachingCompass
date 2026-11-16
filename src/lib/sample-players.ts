import type { Player } from '@/lib/types';

export type SamplePlayer = Omit<Player, 'id' | 'stats' | 'feedback' | 'profileSummary'> & { id: string };

// The fictional players seeded into Firestore's demoPlayers collection (see scripts/seed-demo.ts).
export const samplePlayers: SamplePlayer[] = [
    {
        id: 'kenji-takahashi',
        name: 'Kenji Takahashi',
        position: 'Outfielder',
        avatarUrl: '',
        survey: {
            learningStyleRanking: ['Watching videos of myself or others', 'Feeling it out through drills/practice', 'Having a coach explain it to me', 'Reviewing data (like Blast, TrackMan, etc.)', 'Reading about the technique'],
            performanceAnalysisPreference: 'mix',
            coachExplanationPreference: 'balanced',
            learningSettingRanking: ['A one-on-one setting with a coach', 'By myself, working on my own', 'A small group with other players'],
            coachingTimingRanking: ['After the game; I don’t want distractions during the game', 'When I ask for it; I’ll come to a coach when I think something is wrong.', 'The next day; I like to sleep on it before hearing from my coach', 'As soon as it happens; during the game is fine'],
            progressImportance: 'process',
            feedbackStyle: 'balanced',
            motivationRanking: ['Being the best I can be', 'Winning championships', 'Earning praise and respect', 'Making my teammates better', 'Financial success'],
            remoteCoachingOpenness: 'yes',
            bestCoachDescription: "My college coach was amazing. He was really good at explaining complex things in a simple way and always knew when to push me and when to back off.",
            improvementGoals: "I want to improve my plate discipline and cut down on my strikeouts against left-handed pitchers. I also want to work on my base running.",
            hobbies: "I enjoy fishing and playing video games in my downtime. I'm also learning to play the guitar."
        },
    },
    {
        id: 'jackson-adler',
        name: 'Jackson Adler',
        position: 'Pitcher',
        avatarUrl: '',
        survey: {
            learningStyleRanking: ['Reviewing data (like Blast, TrackMan, etc.)', 'Watching videos of myself or others', 'Feeling it out through drills/practice', 'Having a coach explain it to me', 'Reading about the technique'],
            performanceAnalysisPreference: 'mix',
            coachExplanationPreference: 'balanced',
            learningSettingRanking: ['By myself, working on my own', 'A one-on-one setting with a coach', 'A small group with other players'],
            coachingTimingRanking: ['The next day; I like to sleep on it before hearing from my coach', 'When I ask for it; I’ll come to a coach when I think something is wrong.', 'After the game; I don’t want distractions during the game', 'As soon as it happens; during the game is fine'],
            progressImportance: 'process',
            feedbackStyle: 'balanced',
            motivationRanking: ['Being the best I can be', 'Financial success', 'Winning championships', 'Earning praise and respect', 'Making my teammates better'],
            remoteCoachingOpenness: 'yes',
            bestCoachDescription: "My pitching coach in the minors was instrumental. He helped me understand my data and how to use it to create a game plan for every hitter. He was a great strategist.",
            improvementGoals: "I'm working on developing a consistent third pitch (changeup) and improving my command of the fastball to the glove side.",
            hobbies: "I'm really into chess and poker. I like the strategy and mental games. I also read a lot of biographies."
        },
    },
    {
        id: 'leo-martinez',
        name: 'Leo Martinez',
        position: 'Catcher',
        avatarUrl: '',
        survey: {
            learningStyleRanking: ['Feeling it out through drills/practice', 'Having a coach explain it to me', 'Watching videos of myself or others', 'Reading about the technique', 'Reviewing data (like Blast, TrackMan, etc.)'],
            performanceAnalysisPreference: 'data',
            coachExplanationPreference: 'details',
            learningSettingRanking: ['A one-on-one setting with a coach', 'A small group with other players', 'By myself, working on my own'],
            coachingTimingRanking: ['After the game; I don’t want distractions during the game', 'The next day; I like to sleep on it before hearing from my coach', 'When I ask for it; I’ll come to a coach when I think something is wrong.', 'As soon as it happens; during the game is fine'],
            progressImportance: 'process',
            feedbackStyle: 'blunt',
            motivationRanking: ['Making my teammates better', 'Winning championships', 'Earning praise and respect', 'Being the best I can be', 'Financial success'],
            remoteCoachingOpenness: 'no',
            bestCoachDescription: "The best coach I had was my catching instructor. He was tough but fair, and extremely knowledgeable. He demanded perfection and I respected that a lot.",
            improvementGoals: "I'm focused on improving my pitch framing and my game calling. Offensively, I want to be more consistent with my contact.",
            hobbies: "I'm a big outdoorsman. I love to hunt and fish. I also help coach my little brother's team."
        },
    },
    {
        id: 'javier-rojas',
        name: 'Javier Rojas',
        position: 'Infielder',
        avatarUrl: '',
        survey: {
            learningStyleRanking: ['Having a coach explain it to me', 'Watching videos of myself or others', 'Feeling it out through drills/practice', 'Reading about the technique', 'Reviewing data (like Blast, TrackMan, etc.)'],
            performanceAnalysisPreference: 'feel',
            coachExplanationPreference: 'takeaway',
            learningSettingRanking: ['A small group with other players', 'A one-on-one setting with a coach', 'By myself, working on my own'],
            coachingTimingRanking: ['As soon as it happens; during the game is fine', 'When I ask for it; I’ll come to a coach when I think something is wrong.', 'After the game; I don’t want distractions during the game', 'The next day; I like to sleep on it before hearing from my coach'],
            progressImportance: 'daily',
            feedbackStyle: 'encouraging',
            motivationRanking: ['Winning championships', 'Earning praise and respect', 'Being the best I can be', 'Making my teammates better', 'Financial success'],
            remoteCoachingOpenness: 'yes',
            bestCoachDescription: "My high school coach was the best. He was a great motivator and always made me feel like I could do anything. He was very positive and encouraging.",
            improvementGoals: "I want to work on my defensive range and my throwing accuracy. I also want to improve my power hitting to the opposite field.",
            hobbies: "I like to cook and spend time with my family. I also enjoy watching movies and listening to music."
        },
    },
];
