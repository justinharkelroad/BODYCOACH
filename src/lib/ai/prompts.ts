import type { Profile, BodyStat, WorkoutLog } from '@/types/database';

export interface CoachContext {
  user: {
    name: string;
    goal: 'gain_muscle' | 'lose_fat' | 'maintain';
    activityLevel: string;
    currentWeight: number | null;
    startingWeight: number | null;
  };
  recentStats: BodyStat[];
  recentWorkouts: WorkoutLog[];
  progressTrend: 'gaining' | 'losing' | 'maintaining' | 'unknown';
}

const goalPhrases = {
  gain_muscle: 'build muscle and increase strength',
  lose_fat: 'lose fat while maintaining muscle',
  maintain: 'maintain weight and build healthy habits',
};

const activityDescriptions: Record<string, string> = {
  sedentary: 'sedentary (little or no exercise)',
  light: 'lightly active (light exercise 1-2 days/week)',
  moderate: 'moderately active (moderate exercise 3-5 days/week)',
  active: 'very active (hard exercise 6-7 days/week)',
  athlete: 'athlete level (training 2x per day)',
};

export function buildNutritionCoachPrompt(context: CoachContext): string {
  const goalPhrase = goalPhrases[context.user.goal];
  const activityDesc = activityDescriptions[context.user.activityLevel] || context.user.activityLevel;

  const weightInfo = context.user.currentWeight
    ? `Current weight: ${context.user.currentWeight} lbs${context.user.startingWeight ? `, started at ${context.user.startingWeight} lbs` : ''}`
    : 'Weight: not yet logged';

  const trendInfo = context.progressTrend !== 'unknown'
    ? `Recent trend: ${context.progressTrend} weight`
    : '';

  return `You are a supportive and knowledgeable nutrition coach helping ${context.user.name || 'this user'} ${goalPhrase}.

CONTEXT:
- Goal: ${context.user.goal.replace('_', ' ')}
- ${weightInfo}
- Activity level: ${activityDesc}
${trendInfo ? `- ${trendInfo}` : ''}

GUIDELINES:
- Give practical, actionable nutrition advice
- Consider their specific goal in all recommendations
- Suggest specific foods, portions, meal timing, and macros when relevant
- Be encouraging but honest about what it takes to reach their goals
- Ask clarifying questions when you need more info about their situation
- Keep responses conversational and easy to understand
- Use bullet points for meal suggestions or food lists
- Never provide medical advice - recommend consulting professionals for health concerns

RESPONSE STYLE:
- Warm, supportive, and motivating
- Concise (2-3 paragraphs max unless a detailed plan is requested)
- Use simple language, avoid jargon
- Focus on sustainable habits, not quick fixes`;
}

export function buildWorkoutCoachPrompt(context: CoachContext): string {
  const goalPhrase = goalPhrases[context.user.goal];
  const activityDesc = activityDescriptions[context.user.activityLevel] || context.user.activityLevel;

  const recentWorkoutsSummary = context.recentWorkouts.length > 0
    ? `Recent workouts (last 7 days): ${context.recentWorkouts.length} sessions logged`
    : 'No recent workouts logged';

  const goalFocus = {
    gain_muscle: 'progressive overload and hypertrophy',
    lose_fat: 'calorie burn while preserving muscle',
    maintain: 'balanced fitness and sustainable habits',
  }[context.user.goal];

  return `You are an experienced and encouraging workout coach helping ${context.user.name || 'this user'} ${goalPhrase}.

CONTEXT:
- Goal: ${context.user.goal.replace('_', ' ')}
- Activity level: ${activityDesc}
- ${recentWorkoutsSummary}

GUIDELINES:
- Design workouts appropriate for their experience and activity level
- Prioritize compound movements for ${goalFocus}
- Include warm-up recommendations when prescribing workouts
- Suggest progressive overload strategies
- Balance muscle groups appropriately
- Adapt recommendations based on available equipment (ask if unclear)
- Be encouraging and celebrate their commitment to fitness

WHEN PRESCRIBING WORKOUTS:
- Include exercise name, sets, reps, and rest periods
- Group exercises logically (e.g., by muscle group or circuit)
- Explain the "why" behind your programming choices
- Suggest modifications for different fitness levels

RESPONSE STYLE:
- Energetic and motivating
- Clear and structured (use formatting for workout plans)
- Practical and actionable
- Keep explanations concise unless detail is requested`;
}

export function buildContextFromProfile(
  profile: Profile,
  stats: BodyStat[],
  workouts: WorkoutLog[]
): CoachContext {
  // Get current and starting weight
  const sortedStats = [...stats].sort(
    (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
  );
  const currentWeight = sortedStats[0]?.weight_lbs || null;
  const startingWeight = sortedStats[sortedStats.length - 1]?.weight_lbs || null;

  // Determine trend (compare last 2 weeks)
  let progressTrend: CoachContext['progressTrend'] = 'unknown';
  if (sortedStats.length >= 2) {
    const recentAvg = sortedStats.slice(0, Math.min(3, sortedStats.length))
      .reduce((sum, s) => sum + (s.weight_lbs || 0), 0) / Math.min(3, sortedStats.length);
    const olderAvg = sortedStats.slice(-Math.min(3, sortedStats.length))
      .reduce((sum, s) => sum + (s.weight_lbs || 0), 0) / Math.min(3, sortedStats.length);

    const diff = recentAvg - olderAvg;
    if (diff > 0.5) progressTrend = 'gaining';
    else if (diff < -0.5) progressTrend = 'losing';
    else progressTrend = 'maintaining';
  }

  return {
    user: {
      name: profile.full_name || '',
      goal: profile.goal,
      activityLevel: profile.activity_level || 'moderate',
      currentWeight,
      startingWeight,
    },
    recentStats: sortedStats.slice(0, 14),
    recentWorkouts: workouts,
    progressTrend,
  };
}
