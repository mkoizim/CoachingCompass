'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { RankingQuestion } from './RankingQuestion';
import { newLocalPlayerId, savePlayer } from '@/lib/demo-store';
import { generateRandomStats } from '@/lib/stats';
import { Player } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { randomPlayerAlias } from '@/lib/aliases';

const surveyFormSchema = z
  .object({
    nameOrAlias: z.enum(['enter', 'alias'], { required_error: 'Please choose an option.' }),
    name: z.string().max(80, { message: 'Name must be 80 characters or fewer.' }).optional(),
    position: z.enum(['Pitcher', 'Catcher', 'Infielder', 'Outfielder', 'Utility'], {
      required_error: 'Please select a position.',
    }),
    avatarUrl: z
      .string()
      .url({ message: 'Please enter a valid URL.' })
      .optional()
      .or(z.literal('')),
    learningStyleRanking: z
      .array(z.object({ value: z.string() }))
      .min(1, 'Please rank at least one learning style option.')
      .transform((arr) => arr.map((item) => item.value)),
    performanceAnalysisPreference: z.string({ required_error: 'Please select an option.' }),
    coachExplanationPreference: z.string({ required_error: 'Please select an option.' }),
    learningSettingRanking: z
      .array(z.object({ value: z.string() }))
      .min(1, 'Please rank at least one learning setting option.')
      .transform((arr) => arr.map((item) => item.value)),
    coachingTimingRanking: z
      .array(z.object({ value: z.string() }))
      .min(1, 'Please rank at least one coaching timing option.')
      .transform((arr) => arr.map((item) => item.value)),
    progressImportance: z.string({ required_error: 'Please select an option.' }),
    feedbackStyle: z.string({ required_error: 'Please select an option.' }),
    motivationRanking: z
      .array(z.object({ value: z.string() }))
      .min(1, 'Please rank at least one motivation option.')
      .transform((arr) => arr.map((item) => item.value)),
    remoteCoachingOpenness: z.string({ required_error: 'Please select an option.' }),
    bestCoachDescription: z
      .string()
      .min(10, { message: 'Please provide a more detailed answer.' })
      .max(1500, { message: 'Please keep this under 1,500 characters.' }),
    improvementGoals: z
      .string()
      .min(10, { message: 'Please provide a more detailed answer.' })
      .max(1500, { message: 'Please keep this under 1,500 characters.' }),
    hobbies: z
      .string()
      .min(2, { message: 'Please tell us at least one hobby.' })
      .max(1500, { message: 'Please keep this under 1,500 characters.' }),
  })
  .refine(
    (data) => {
      if (data.nameOrAlias === 'enter') {
        return !!data.name && data.name.length >= 2;
      }
      return true;
    },
    {
      message: 'Name must be at least 2 characters.',
      path: ['name'],
    },
  );

// The ranking fields are edited as { value } objects and transformed to string[] on submit.
type SurveyFormInput = z.input<typeof surveyFormSchema>;
type SurveyFormValues = z.output<typeof surveyFormSchema>;

const rankingOptions = {
  learningStyle: [
    'Watching videos of myself or others',
    'Having a coach explain it to me',
    'Reading about the technique',
    'Reviewing data (like Blast, TrackMan, etc.)',
    'Feeling it out through drills/practice',
  ],
  learningSettings: [
    'A one-on-one setting with a coach',
    'A small group with other players',
    'By myself, working on my own',
  ],
  coachingTiming: [
    'As soon as it happens; during the game is fine',
    'After the game; I don’t want distractions during the game',
    'The next day; I like to sleep on it before hearing from my coach',
    'When I ask for it; I’ll come to a coach when I think something is wrong.',
  ],
  motivations: [
    'Financial success',
    'Winning championships',
    'Being the best I can be',
    'Earning praise and respect',
    'Making my teammates better',
  ],
};

interface SurveyFormProps {
  player?: Player | null;
}

export function SurveyForm({ player }: SurveyFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditMode = !!player;

  const form = useForm<SurveyFormInput, unknown, SurveyFormValues>({
    resolver: zodResolver(surveyFormSchema),
    mode: 'onChange',
    defaultValues:
      isEditMode && player
        ? {
            name: player.name,
            nameOrAlias: 'enter',
            position: player.position,
            avatarUrl: player.avatarUrl || '',
            ...player.survey,
            learningStyleRanking: player.survey.learningStyleRanking.map((value) => ({ value })),
            learningSettingRanking: player.survey.learningSettingRanking.map((value) => ({
              value,
            })),
            coachingTimingRanking: player.survey.coachingTimingRanking.map((value) => ({ value })),
            motivationRanking: player.survey.motivationRanking.map((value) => ({ value })),
          }
        : {
            name: '',
            nameOrAlias: 'enter',
            avatarUrl: '',
            learningStyleRanking: [],
            learningSettingRanking: [],
            coachingTimingRanking: [],
            motivationRanking: [],
            bestCoachDescription: '',
            improvementGoals: '',
            hobbies: '',
          },
  });

  const onSubmit = async (data: SurveyFormValues) => {
    try {
      let finalName = data.name;
      if (data.nameOrAlias === 'alias') {
        finalName = randomPlayerAlias();
      }

      const { name, nameOrAlias, position, avatarUrl, ...surveyData } = data;

      const playerData = {
        name: finalName || 'Anonymous Player',
        position,
        avatarUrl: avatarUrl || '',
        survey: surveyData,
      };

      if (isEditMode && player) {
        savePlayer({
          ...player,
          ...playerData,
          // Hitters, catchers and pitchers track different stats.
          stats: position === player.position ? player.stats : generateRandomStats(position),
        });
        toast({
          title: 'Survey Updated!',
          description: 'Your profile has been successfully updated.',
        });
        router.push(`/player/${player.id}`);
      } else {
        const newPlayerId = newLocalPlayerId();
        savePlayer({
          ...playerData,
          id: newPlayerId,
          stats: generateRandomStats(position),
          feedback: [],
          profileSummary: null,
        });
        toast({
          title: 'Survey Submitted!',
          description: 'Thank you for completing the survey. Your profile has been created.',
        });
        router.push(`/player/${newPlayerId}`);
      }
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: 'There was an error submitting your survey. Please try again.',
        variant: 'destructive',
      });
      console.error(error);
    }
  };

  const { isSubmitting, isValid, errors } = form.formState;
  const nameOrAliasValue = form.watch('nameOrAlias');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          {isEditMode ? 'Update Player Information' : 'Player Information'}
        </CardTitle>
        <CardDescription>
          Please complete the entire survey. All fields are required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Public demo</AlertTitle>
              <AlertDescription>
                Please don&rsquo;t enter real personal information. Your answers are saved only in
                this browser, but AI summaries are generated by Google Gemini.
              </AlertDescription>
            </Alert>
            <FormField
              control={form.control}
              name="nameOrAlias"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>1. What is your name?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                      disabled={isEditMode}
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="enter" />
                        </FormControl>
                        <FormLabel className="font-normal">Enter my name</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="alias" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Generate a random alias for me
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <CardDescription>
                    The alias feature is for prototype demonstration purposes to enhance privacy and
                    would not be used in production.
                  </CardDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {nameOrAliasValue === 'enter' && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John Doe" {...field} disabled={isEditMode} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Optional: Profile Picture URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/your-photo.png" {...field} />
                  </FormControl>
                  <CardDescription>
                    If you leave this blank, a placeholder image will be used.
                  </CardDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>2. What is your position?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your primary position" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Pitcher">Pitcher</SelectItem>
                      <SelectItem value="Catcher">Catcher</SelectItem>
                      <SelectItem value="Infielder">Infielder</SelectItem>
                      <SelectItem value="Outfielder">Outfielder</SelectItem>
                      <SelectItem value="Utility">Utility</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="learningStyleRanking"
              render={() => (
                <RankingQuestion
                  control={form.control}
                  name="learningStyleRanking"
                  label="3. Rank how you prefer to learn new physical skills:"
                  options={rankingOptions.learningStyle}
                />
              )}
            />

            <FormField
              control={form.control}
              name="performanceAnalysisPreference"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>4. How do you prefer to analyze your performance?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="data" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Hard numbers and data (like exit velocity or spin rate)
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="feel" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          How it felt (like "felt smooth," "felt powerful")
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="mix" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          A mix of both data and feel ("This is what 'good data' feels like”)
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="coachExplanationPreference"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>
                    5. When a coach is explaining something, what do you prefer?
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="takeaway" />
                        </FormControl>
                        <FormLabel className="font-normal">The simple, key takeaway</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="details" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          All the details and the "why" behind it
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="balanced" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          The key takeaway with one or two pieces of evidence
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="learningSettingRanking"
              render={() => (
                <RankingQuestion
                  control={form.control}
                  name="learningSettingRanking"
                  label="6. Rank your preferred learning settings:"
                  options={rankingOptions.learningSettings}
                />
              )}
            />

            <FormField
              control={form.control}
              name="coachingTimingRanking"
              render={() => (
                <RankingQuestion
                  control={form.control}
                  name="coachingTimingRanking"
                  label="7. Rank your preferred times to receive coaching:"
                  options={rankingOptions.coachingTiming}
                />
              )}
            />

            <FormField
              control={form.control}
              name="progressImportance"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>8. How important is it for you to see progress?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="daily" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          I need to feel like I'm getting better every day (at least a little bit)
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="process" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          I trust the process and am comfortable if gains don't show up right away
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="feedbackStyle"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>9. What style of feedback is most effective for you?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="blunt" />
                        </FormControl>
                        <FormLabel className="font-normal">Direct and blunt truth</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="encouraging" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Encouraging and confidence-building
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="balanced-feedback" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          A balance, depending on the situation
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="motivationRanking"
              render={() => (
                <RankingQuestion
                  control={form.control}
                  name="motivationRanking"
                  label="10. Rank your motivations in your career:"
                  options={rankingOptions.motivations}
                />
              )}
            />

            <FormField
              control={form.control}
              name="remoteCoachingOpenness"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>
                    11. Are you open to remote coaching (FaceTime, text messages, emails with
                    notes/data, etc.)?
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="yes" />
                        </FormControl>
                        <FormLabel className="font-normal">Yes, I am</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="no" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          No, I prefer all coaching in person
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bestCoachDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    12. Describe the best coach you ever had. What made them so effective?
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about them..."
                      {...field}
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="improvementGoals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    13. What would you like to work on to improve as a player and accomplish your
                    goals?
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., improve plate discipline, increase velocity..."
                      {...field}
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hobbies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>14. What do you enjoy doing away from the baseball field?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., fishing, video games, reading..."
                      {...field}
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {Object.keys(errors).length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Incomplete Survey</AlertTitle>
                <AlertDescription>
                  Please complete all the required questions before submitting.
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              {isSubmitting ? 'Submitting...' : isEditMode ? 'Update Survey' : 'Submit Survey'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
