'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { generateProfileSummary } from '@/app/actions/summarize';
import { savePlayer, removePlayer } from '@/lib/demo-store';
import type {
  Player,
  PlayerSurvey,
  Feedback,
  HitterStats,
  PitcherStats,
  CatcherStats,
  ProfileSummary,
} from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Sparkles,
  Pencil,
  MessageSquare,
  User,
  ChevronsRight,
  Trophy,
  BookOpen,
  Group,
  Clock,
  Gauge,
  MessageCircle,
  Tv,
  UserCog,
  Goal,
  Sailboat,
  Info,
  MoreVertical,
  Trash2,
  Zap,
  Compass,
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { StatBar } from '@/components/StatBar';

interface PlayerProfileClientProps {
  player: Player;
}

const BaseballDiamondIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2L2 12l10 10 10-10L12 2z"></path>
    <circle cx="12" cy="17" r="1"></circle>
    <circle cx="17" cy="12" r="1"></circle>
    <circle cx="12" cy="7" r="1"></circle>
    <circle cx="7" cy="12" r="1"></circle>
  </svg>
);

const PitcherMoundIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 17c.9-1.3 2.1-2.4 3.5-3.3C7.2 12.5 9.1 12 12 12s4.8.5 6.5 1.7c1.4.9 2.6 2 3.5 3.3" />
    <path d="M12 12a3 3 0 0 1-3-3V7a3 3 0 0 1 6 0v2a3 3 0 0 1-3 3Z" />
  </svg>
);

const BaseballIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a10 10 0 0 0-10 10c0 4 2.5 7.4 6 9" />
    <path d="M12 22a10 10 0 0 0 10-10c0-4-2.5-7.4-6-9" />
    <path d="M4.2 16.5c1 1.3 2.5 2.2 4.2 2.5" />
    <path d="M15.6 5c1.7.3 3.2 1.2 4.2 2.5" />
  </svg>
);

const radioValueMapping: { [key: string]: string } = {
  // performanceAnalysisPreference
  data: 'Hard numbers and data',
  feel: 'How it felt',
  mix: 'A mix of both data and feel',
  // coachExplanationPreference
  takeaway: 'The simple, key takeaway',
  details: 'All the details and the "why"',
  balanced: 'The key takeaway with one or two pieces of evidence',
  // feedbackStyle
  blunt: 'Direct and blunt truth',
  encouraging: 'Encouraging and confidence-building',
  'balanced-feedback': 'A balance, depending on the situation',
  // remoteCoachingOpenness
  yes: 'Open to remote coaching',
  no: 'Prefers in-person coaching',
};

const progressImportanceMapping: { [key: string]: string } = {
  daily: 'Prioritize acknowledging small, everyday wins.',
  process: 'Looking for improvement over long run',
};

const surveyQuestionMapping: { [key: string]: string } = {
  learningStyleRanking: 'Rank how you prefer to learn new physical skills:',
  learningSettingRanking: 'Rank your preferred learning settings:',
  coachingTimingRanking: 'Rank your preferred times to receive coaching:',
  motivationRanking: 'Rank your motivations in your career:',
  performanceAnalysisPreference: 'How do you prefer to analyze your performance?',
  coachExplanationPreference: 'When a coach is explaining something, what do you prefer?',
  progressImportance: 'How important is it for you to see progress?',
  feedbackStyle: 'What style of feedback is most effective for you?',
  remoteCoachingOpenness:
    'Are you open to remote coaching (FaceTime, text messages, emails with notes/data, etc.)?',
  bestCoachDescription: 'Describe the best coach you ever had. What made them so effective?',
  improvementGoals:
    'What would you like to work on to improve as a player and accomplish your goals?',
  hobbies: 'What do you enjoy doing away from the baseball field?',
};

const SurveyDetail = ({
  icon,
  title,
  questionKey,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  questionKey: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-start gap-4">
    <div className="text-primary pt-1">{icon}</div>
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <h4 className="font-bold font-headline text-primary">{title}</h4>
        <Popover>
          <PopoverTrigger asChild>
            <button className="text-muted-foreground hover:text-primary transition-colors">
              <Info className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="text-sm" side="top" align="start">
            <p className="font-semibold">Survey Question:</p>
            <p>{surveyQuestionMapping[questionKey]}</p>
          </PopoverContent>
        </Popover>
      </div>
      <div className="leading-relaxed">{children}</div>
    </div>
  </div>
);

const RankedList = ({ items }: { items: string[] }) => (
  <ol className="list-inside space-y-2">
    {items.map((item, index) => (
      <li key={index} className="flex items-center gap-2">
        <Badge variant="secondary" className="text-base">
          {index + 1}
        </Badge>
        <span>{item}</span>
      </li>
    ))}
  </ol>
);

const NOTES_INCREMENT = 5;

const BattingStatBlock = ({ stats }: { stats: HitterStats | CatcherStats }) => (
  <div>
    <h3 className="font-headline text-lg flex items-center gap-2 mb-2">
      <BaseballDiamondIcon className="w-5 h-5 text-primary" />
      Batting
    </h3>
    <div className="space-y-1">
      <StatBar label="xwOBA" stat={stats.xwoba} />
      <StatBar label="xBA" stat={stats.xba} />
      <StatBar label="xSLG" stat={stats.xslg} />
      <StatBar label="Avg Exit Velo" stat={stats.avgExitVelo} />
      <StatBar label="Barrel %" stat={stats.barrelRate} />
      <StatBar label="Hard-Hit %" stat={stats.hardHitRate} />
      <StatBar label="Sweet-Spot %" stat={stats.sweetSpotRate} />
      <StatBar label="Bat Speed" stat={stats.batSpeed} />
      <StatBar label="Squared-Up %" stat={stats.squaredUpRate} />
      <StatBar label="Chase %" stat={stats.chaseRate} higherIsBetter={false} />
      <StatBar label="Whiff %" stat={stats.whiffRate} higherIsBetter={false} />
      <StatBar label="K %" stat={stats.kRate} higherIsBetter={false} />
      <StatBar label="BB %" stat={stats.bbRate} />
    </div>
  </div>
);

const RunningStatBlock = ({ stats }: { stats: HitterStats | CatcherStats }) => (
  <div>
    <h3 className="font-headline text-lg flex items-center gap-2 mb-2">
      <Zap className="w-5 h-5 text-primary" />
      Running
    </h3>
    <div className="space-y-1">
      <StatBar label="Sprint Speed" stat={stats.sprintSpeed} />
    </div>
  </div>
);

const CatcherStatsBlock = ({ stats }: { stats: CatcherStats }) => (
  <>
    <BattingStatBlock stats={stats} />
    <hr />
    <div>
      <h3 className="font-headline text-lg flex items-center gap-2 mb-2">
        <BaseballIcon className="w-5 h-5 text-primary" />
        Fielding
      </h3>
      <div className="space-y-1">
        <StatBar label="Framing Runs" stat={stats.framingRuns} />
        <StatBar label="Blocks Above Avg" stat={stats.blocksAboveAverage} />
        <StatBar label="CS Above Avg" stat={stats.csAboveAverage} />
        <StatBar label="Arm Strength" stat={stats.armStrength} />
      </div>
    </div>
    <hr />
    <RunningStatBlock stats={stats} />
  </>
);

const HitterStatsBlock = ({ stats }: { stats: HitterStats }) => (
  <>
    <BattingStatBlock stats={stats} />
    <hr />
    <div>
      <h3 className="font-headline text-lg flex items-center gap-2 mb-2">
        <BaseballIcon className="w-5 h-5 text-primary" />
        Fielding
      </h3>
      <div className="space-y-1">
        <StatBar label="Range (OAA)" stat={stats.range} />
        <StatBar label="Arm Value" stat={stats.armValue} />
        <StatBar label="Arm Strength" stat={stats.armStrength} />
      </div>
    </div>
    <hr />
    <RunningStatBlock stats={stats} />
  </>
);

const PitcherStatsBlock = ({ stats }: { stats: PitcherStats }) => (
  <div className="space-y-6">
    <div>
      <h3 className="font-headline text-lg flex items-center gap-2 mb-2">
        <Trophy className="w-5 h-5 text-primary" />
        Value
      </h3>
      <div className="space-y-1">
        <StatBar label="Pitching Run Value" stat={stats.pitchingRunValue} />
        <StatBar label="Fastball Run Value" stat={stats.fastballRunValue} />
        <StatBar label="Breaking Run Value" stat={stats.breakingRunValue} />
        <StatBar label="Offspeed Run Value" stat={stats.offspeedRunValue} />
      </div>
    </div>
    <hr />
    <div>
      <h3 className="font-headline text-lg flex items-center gap-2 mb-2">
        <PitcherMoundIcon className="w-5 h-5 text-primary" />
        Pitching
      </h3>
      <div className="space-y-1">
        <StatBar label="xERA" stat={stats.xera} higherIsBetter={false} />
        <StatBar label="xBA" stat={stats.xba} higherIsBetter={false} />
        <StatBar label="Fastball Velo" stat={stats.fastballVelo} />
        <StatBar label="Avg Exit Velo" stat={stats.avgExitVelo} higherIsBetter={false} />
        <StatBar label="Chase %" stat={stats.chaseRate} />
        <StatBar label="Whiff %" stat={stats.whiffRate} />
        <StatBar label="K %" stat={stats.kRate} />
        <StatBar label="BB %" stat={stats.bbRate} higherIsBetter={false} />
        <StatBar label="Barrel %" stat={stats.barrelRate} higherIsBetter={false} />
        <StatBar label="Hard-Hit %" stat={stats.hardHitRate} higherIsBetter={false} />
        <StatBar label="GB %" stat={stats.gbRate} />
        <StatBar label="Extension" stat={stats.extension} />
      </div>
    </div>
  </div>
);

export function PlayerProfileClient({ player: initialPlayer }: PlayerProfileClientProps) {
  const [player, setPlayer] = useState(initialPlayer);
  const [summary, setSummary] = useState<ProfileSummary | null>(player.profileSummary || null);
  const [isGenerating, startGenerating] = useTransition();
  const [feedbackToSubmit, setFeedbackToSubmit] = useState('');
  const [feedbackToEdit, setFeedbackToEdit] = useState<Feedback | null>(null);
  const [visibleNotesCount, setVisibleNotesCount] = useState(NOTES_INCREMENT);
  const { toast } = useToast();
  const router = useRouter();

  // Persist every change to this browser's demo sandbox (never to the shared roster).
  const initialPlayerRef = useRef(initialPlayer);
  useEffect(() => {
    if (player !== initialPlayerRef.current) {
      savePlayer(player);
    }
  }, [player]);

  const handleGenerateSummary = () => {
    startGenerating(async () => {
      try {
        const sortedFeedback = [...player.feedback].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        const surveyDataForAI = {
          position: player.position || '',
          learningStyleRanking: player.survey.learningStyleRanking || [],
          performanceAnalysisPreference: player.survey.performanceAnalysisPreference || '',
          coachExplanationPreference: player.survey.coachExplanationPreference || '',
          learningSettingRanking: player.survey.learningSettingRanking || [],
          coachingTimingRanking: player.survey.coachingTimingRanking || [],
          progressImportance: player.survey.progressImportance || '',
          feedbackStyle: player.survey.feedbackStyle || '',
          motivationRanking: player.survey.motivationRanking || [],
          remoteCoachingOpenness: player.survey.remoteCoachingOpenness || '',
          bestCoachDescription: player.survey.bestCoachDescription || '',
          improvementGoals: player.survey.improvementGoals || '',
          hobbies: player.survey.hobbies || '',
          coachingNotes: sortedFeedback.map((f) => f.text) || [],
          stats: player.stats,
        };
        const result = await generateProfileSummary(surveyDataForAI);
        if (!result.ok) {
          throw new Error(result.error);
        }
        const summaryWithDate: ProfileSummary = {
          ...result.summary,
          generatedDate: new Date().toISOString(),
        };
        setSummary(summaryWithDate);
        setPlayer((prev) => ({ ...prev, profileSummary: summaryWithDate }));
      } catch (error) {
        console.error('Error generating summary:', error);
        toast({
          title: 'Error',
          description:
            error instanceof Error && error.message
              ? error.message
              : 'Failed to generate AI summary. Please try again later.',
          variant: 'destructive',
        });
      }
    });
  };

  useEffect(() => {
    if (!player.profileSummary) {
      handleGenerateSummary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFeedbackSubmit = async () => {
    if (!feedbackToSubmit.trim()) return;
    const feedback = {
      id: `f${Date.now()}`,
      date: new Date().toISOString(),
      text: feedbackToSubmit.trim(),
    };
    try {
      const sortedFeedback = [feedback, ...player.feedback].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      setPlayer((prev) => ({ ...prev, feedback: sortedFeedback }));
      setFeedbackToSubmit('');
      toast({
        title: 'Success',
        description: 'Your note has been submitted.',
      });
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Failed to submit note.',
        variant: 'destructive',
      });
    }
  };

  const handleFeedbackUpdate = async () => {
    if (!feedbackToEdit) return;
    try {
      const edited = { ...feedbackToEdit, date: new Date().toISOString() };
      setPlayer((prev) => {
        const updatedFeedback = prev.feedback.map((fb) => (fb.id === edited.id ? edited : fb));
        return { ...prev, feedback: updatedFeedback };
      });
      setFeedbackToEdit(null);
      toast({
        title: 'Note Updated',
        description: 'Your coaching note has been successfully updated.',
      });
    } catch (e) {
      toast({
        title: 'Update Failed',
        description: 'There was an error updating your note.',
        variant: 'destructive',
      });
    }
  };

  const handleFeedbackDelete = async (feedbackId: string) => {
    try {
      setPlayer((prev) => ({
        ...prev,
        feedback: prev.feedback.filter((fb) => fb.id !== feedbackId),
      }));
      toast({
        title: 'Note Deleted',
        description: 'Your coaching note has been removed.',
      });
    } catch (e) {
      toast({
        title: 'Delete Failed',
        description: 'There was an error deleting your note.',
        variant: 'destructive',
      });
    }
  };

  const handlePlayerDelete = async () => {
    try {
      removePlayer(player.id);
      toast({
        title: 'Player Deleted',
        description: `${player.name} has been removed from the roster.`,
      });
      router.push('/');
    } catch (e) {
      toast({
        title: 'Delete Failed',
        description: 'There was an error deleting this player.',
        variant: 'destructive',
      });
    }
  };

  const sortedFeedback = [...player.feedback].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const renderStats = () => {
    if (!player.stats) return null;
    switch (player.position) {
      case 'Pitcher':
        return <PitcherStatsBlock stats={player.stats as PitcherStats} />;
      case 'Catcher':
        return <CatcherStatsBlock stats={player.stats as CatcherStats} />;
      case 'Infielder':
      case 'Outfielder':
      case 'Utility':
        return <HitterStatsBlock stats={player.stats as HitterStats} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <AlertDialog>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Avatar className="h-32 w-32 border-4 border-primary shadow-lg">
            {player.avatarUrl ? (
              <AvatarImage
                src={player.avatarUrl}
                alt={player.name}
                data-ai-hint="baseball headshot"
              />
            ) : (
              <AvatarFallback className="text-4xl">
                <User className="h-16 w-16" />
              </AvatarFallback>
            )}
          </Avatar>
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-5xl font-headline font-bold text-primary">{player.name}</h1>
            <p className="text-xl text-muted-foreground font-medium">{player.position}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/player/${player.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Player Survey
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Player
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the player and all of their
              associated data from the roster.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePlayerDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Player
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="text-center text-xs text-muted-foreground max-w-4xl mx-auto italic">
        CoachingCompass provides helpful guidance for effective coach-player communication. It does
        not provide directives or orders for how to communicate with players. Always use
        CoachingCompass guidance with your best professional coaching judgement.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2 text-2xl">
                <Sparkles className="text-accent" />
                AI-Powered Profile Summary
              </CardTitle>
              <CardDescription>
                A summary for coaches, generated by AI. Always review full profile details.
                {summary?.generatedDate && (
                  <span className="block text-xs mt-1">
                    Last generated: {format(new Date(summary.generatedDate), 'PPp')}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isGenerating && !summary ? (
                <div className="flex items-center gap-2 text-muted-foreground p-4">
                  <Loader2 className="animate-spin" />
                  <span>Generating summary...</span>
                </div>
              ) : summary ? (
                <div className="space-y-4 text-base leading-relaxed">
                  <p>{summary.intro}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                      <h4 className="font-bold text-green-700">Do</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {summary.dos?.map((item, index) => (
                          <li key={`do-${index}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-red-700">Don't</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {summary.donts?.map((item, index) => (
                          <li key={`dont-${index}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {summary.focusAreas && summary.focusAreas.length > 0 && (
                    <div>
                      <h4 className="font-bold font-headline text-primary mt-4">
                        Suggested Coaching Focus Areas
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {summary.focusAreas.map((item, index) => (
                          <li key={`focus-${index}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No summary available. Generate one!</p>
              )}
              <Button onClick={handleGenerateSummary} disabled={isGenerating} className="mt-4">
                {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
                {isGenerating ? 'Generating...' : 'Regenerate Summary'}
              </Button>
            </CardContent>
          </Card>

          <Accordion type="multiple" defaultValue={['survey']} className="space-y-8">
            <AccordionItem value="survey" className="border-none">
              <Card>
                <AccordionTrigger className="p-6 hover:no-underline w-full">
                  <CardHeader className="p-0 text-left flex-1">
                    <CardTitle className="font-headline text-2xl">Player Survey</CardTitle>
                    <CardDescription>
                      The player's self-reported preferences and motivations.
                    </CardDescription>
                  </CardHeader>
                  <Button
                    variant="outline"
                    size="icon"
                    asChild
                    className="ml-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link href={`/player/${player.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="space-y-6 text-base pt-6 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <SurveyDetail
                        icon={<UserCog />}
                        title="How to Deliver the Message"
                        questionKey="coachExplanationPreference"
                      >
                        <p>{radioValueMapping[player.survey.coachExplanationPreference]}</p>
                      </SurveyDetail>
                      <SurveyDetail
                        icon={<ChevronsRight />}
                        title="What Resonates with the Player"
                        questionKey="performanceAnalysisPreference"
                      >
                        <p>{radioValueMapping[player.survey.performanceAnalysisPreference]}</p>
                      </SurveyDetail>
                      <SurveyDetail
                        icon={<BookOpen />}
                        title="Learning Preferences"
                        questionKey="learningStyleRanking"
                      >
                        <RankedList items={player.survey.learningStyleRanking} />
                      </SurveyDetail>
                      <SurveyDetail
                        icon={<Group />}
                        title="Preferred Learning Settings"
                        questionKey="learningSettingRanking"
                      >
                        <RankedList items={player.survey.learningSettingRanking} />
                      </SurveyDetail>
                      <SurveyDetail
                        icon={<Clock />}
                        title="Coaching Timing"
                        questionKey="coachingTimingRanking"
                      >
                        <RankedList items={player.survey.coachingTimingRanking} />
                      </SurveyDetail>
                      <SurveyDetail
                        icon={<Trophy />}
                        title="Motivations"
                        questionKey="motivationRanking"
                      >
                        <RankedList items={player.survey.motivationRanking} />
                      </SurveyDetail>
                      <SurveyDetail
                        icon={<Gauge />}
                        title="When Player Needs to See Progress"
                        questionKey="progressImportance"
                      >
                        <p>{progressImportanceMapping[player.survey.progressImportance]}</p>
                      </SurveyDetail>
                      <SurveyDetail
                        icon={<MessageCircle />}
                        title="Prefers Bluntness or Encouragement"
                        questionKey="feedbackStyle"
                      >
                        <p>{radioValueMapping[player.survey.feedbackStyle]}</p>
                      </SurveyDetail>
                      <SurveyDetail
                        icon={<Tv />}
                        title="Remote Coaching"
                        questionKey="remoteCoachingOpenness"
                      >
                        <p>{radioValueMapping[player.survey.remoteCoachingOpenness]}</p>
                      </SurveyDetail>
                    </div>
                    <hr />
                    <SurveyDetail
                      icon={<User />}
                      title="Description of Best Coach"
                      questionKey="bestCoachDescription"
                    >
                      <p>{player.survey.bestCoachDescription}</p>
                    </SurveyDetail>
                    <SurveyDetail
                      icon={<Goal />}
                      title="Self-Identified Goals"
                      questionKey="improvementGoals"
                    >
                      <p>{player.survey.improvementGoals}</p>
                    </SurveyDetail>
                    <SurveyDetail icon={<Sailboat />} title="Hobbies" questionKey="hobbies">
                      <p>{player.survey.hobbies}</p>
                    </SurveyDetail>
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="space-y-8">
          <Accordion type="multiple" defaultValue={['notes', 'stats']} className="space-y-8">
            <AccordionItem value="notes" className="border-none">
              <Card>
                <div className="flex items-center p-6">
                  <AccordionTrigger className="flex-1 p-0 hover:no-underline">
                    <CardHeader className="p-0 text-left">
                      <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        Coaching Notes
                      </CardTitle>
                    </CardHeader>
                  </AccordionTrigger>
                  <div className="flex items-center gap-2 ml-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="text-muted-foreground hover:text-primary transition-colors">
                          <Info className="h-4 w-4" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="text-sm" side="top" align="start">
                        <p>
                          Enhance the player's profile by recording notes of prior interactions. The
                          profile will learn from your notes and adapt recommendations for improving
                          future coaching interactions.
                        </p>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <AccordionContent>
                  <CardContent className="border-t pt-6">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full mb-4">
                          <MessageSquare />
                          Submit Note
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="font-headline text-2xl">Submit Note</DialogTitle>
                          <DialogDescription>
                            Add a new coaching note to the player's log.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <Textarea
                            placeholder="Type your note here..."
                            maxLength={2000}
                            value={feedbackToSubmit}
                            onChange={(e) => setFeedbackToSubmit(e.target.value)}
                            className="min-h-[120px]"
                          />
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button onClick={handleFeedbackSubmit}>Submit</Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <div className="space-y-4">
                      {sortedFeedback.length > 0 ? (
                        <>
                          {sortedFeedback.slice(0, visibleNotesCount).map((fb) => (
                            <Dialog key={fb.id}>
                              <AlertDialog>
                                <div className="text-sm p-3 bg-secondary rounded-lg border group relative">
                                  <p className="font-medium pr-8">{fb.text}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {format(new Date(fb.date), 'PP')}
                                  </p>
                                  <div className="absolute top-2 right-2">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                        >
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DialogTrigger
                                          asChild
                                          onSelect={() => setFeedbackToEdit({ ...fb })}
                                        >
                                          <DropdownMenuItem>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Edit
                                          </DropdownMenuItem>
                                        </DialogTrigger>
                                        <AlertDialogTrigger asChild>
                                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                            <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                                            <span className="text-destructive">Delete</span>
                                          </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the
                                      coaching note.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleFeedbackDelete(fb.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </Dialog>
                          ))}
                          {sortedFeedback.length > visibleNotesCount && (
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => setVisibleNotesCount((prev) => prev + NOTES_INCREMENT)}
                            >
                              Load More Notes
                            </Button>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No notes yet.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>

            <AccordionItem value="stats" className="border-none">
              <Card>
                <AccordionTrigger className="p-6 hover:no-underline w-full">
                  <CardHeader className="p-0 text-left flex-1">
                    <CardTitle className="font-headline text-2xl">Key Stats</CardTitle>
                    <CardDescription>
                      Stats are randomly generated for prototype purposes. Production version would
                      incorporate live stats.
                    </CardDescription>
                  </CardHeader>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="space-y-4 border-t pt-6">{renderStats()}</CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
      <Dialog open={!!feedbackToEdit} onOpenChange={(isOpen) => !isOpen && setFeedbackToEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Edit Note</DialogTitle>
            <DialogDescription>Update your coaching note.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              maxLength={2000}
              placeholder="Type your note here..."
              value={feedbackToEdit?.text || ''}
              onChange={(e) => {
                if (feedbackToEdit) {
                  setFeedbackToEdit({ ...feedbackToEdit, text: e.target.value });
                }
              }}
              className="min-h-[120px]"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button onClick={handleFeedbackUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
