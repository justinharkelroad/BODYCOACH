'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw, Loader2, TrendingUp, TrendingDown, Dumbbell, Target } from 'lucide-react';
import type { BodyStat, WorkoutLog, GoalType } from '@/types/database';

interface WeeklyInsightsProps {
  stats: BodyStat[];
  workouts: WorkoutLog[];
  goal: GoalType;
  name: string;
}

interface InsightData {
  summary: string;
  highlights: string[];
  suggestion: string;
}

export function WeeklyInsights({ stats, workouts, goal, name }: WeeklyInsightsProps) {
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Generate insights based on data (client-side for now, could be API)
  const generateInsights = () => {
    setIsLoading(true);

    // Simulate AI processing
    setTimeout(() => {
      const weeklyStats = stats.slice(0, 7);
      const startWeight = weeklyStats[weeklyStats.length - 1]?.weight_lbs;
      const endWeight = weeklyStats[0]?.weight_lbs;
      const weightChange = startWeight && endWeight ? endWeight - startWeight : null;
      const workoutCount = workouts.length;
      const avgWeight = weeklyStats.length > 0
        ? weeklyStats.reduce((sum, s) => sum + (s.weight_lbs || 0), 0) / weeklyStats.length
        : null;

      const goalPhrases = {
        gain_muscle: 'building muscle',
        lose_fat: 'fat loss',
        maintain: 'maintaining',
      };

      let summary = '';
      const highlights: string[] = [];
      let suggestion = '';

      // Generate summary based on goal and progress
      if (weightChange !== null) {
        if (goal === 'lose_fat') {
          if (weightChange < 0) {
            summary = `Great progress this week, ${name}! You're on track with your ${goalPhrases[goal]} goal.`;
            highlights.push(`Lost ${Math.abs(weightChange).toFixed(1)} lbs this week`);
          } else if (weightChange > 0) {
            summary = `This week was challenging, but every day is a new opportunity. Let's refocus on your goals.`;
            highlights.push(`Weight fluctuated by +${weightChange.toFixed(1)} lbs`);
          } else {
            summary = `Steady week! Maintaining is still progress. Keep pushing toward your goals.`;
            highlights.push('Weight remained stable');
          }
        } else if (goal === 'gain_muscle') {
          if (weightChange > 0) {
            summary = `Solid gains this week, ${name}! Your ${goalPhrases[goal]} journey is progressing well.`;
            highlights.push(`Gained ${weightChange.toFixed(1)} lbs this week`);
          } else if (weightChange < 0) {
            summary = `Focus on increasing calories and protein to support your muscle-building goals.`;
            highlights.push(`Weight dropped by ${Math.abs(weightChange).toFixed(1)} lbs`);
          } else {
            summary = `Consistent week! Consider progressive overload in your workouts.`;
            highlights.push('Weight remained stable');
          }
        } else if (goal === 'maintain') {
          if (Math.abs(weightChange) < 1) {
            summary = `Perfect consistency this week, ${name}! You're staying right on track.`;
            highlights.push('Weight remained stable');
          } else {
            summary = `Small fluctuation this week, but that's normal. Stay consistent with your routine.`;
            highlights.push(`Weight changed by ${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} lbs`);
          }
        }
      } else {
        summary = `Welcome back, ${name}! Start logging your weight to track your progress.`;
      }

      // Add workout highlights
      if (workoutCount > 0) {
        highlights.push(`Completed ${workoutCount} workout${workoutCount > 1 ? 's' : ''}`);
      }

      if (weeklyStats.length >= 5) {
        highlights.push(`${weeklyStats.length} days of consistent tracking`);
      }

      // Generate suggestion
      if (workoutCount < 3) {
        suggestion = 'Try to fit in at least 3 workouts next week for optimal progress.';
      } else if (weeklyStats.length < 5) {
        suggestion = 'Log your weight daily for more accurate tracking and insights.';
      } else if (goal === 'gain_muscle') {
        suggestion = 'Focus on progressive overload - add weight or reps to your lifts.';
      } else if (goal === 'lose_fat') {
        suggestion = 'Stay consistent with your nutrition and aim for a slight caloric deficit.';
      } else {
        suggestion = 'Keep up the great work! Consistency is key to reaching your goals.';
      }

      setInsights({ summary, highlights, suggestion });
      setIsLoading(false);
      setHasGenerated(true);
    }, 1000);
  };

  return (
    <Card className="border-[var(--primary-deep)] bg-gradient-to-br from-[var(--primary-light)] to-white">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[var(--primary-deep)]" />
          <CardTitle className="text-[var(--primary-deep)] text-base">Weekly Insights</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {!hasGenerated && !isLoading ? (
          <div className="text-center py-4">
            <p className="text-sm text-[var(--neutral-gray)] mb-3">
              Get AI-powered insights on your progress
            </p>
            <Button onClick={generateInsights} size="sm" variant="secondary">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Insights
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 text-[var(--primary-deep)] animate-spin" />
          </div>
        ) : insights ? (
          <div className="space-y-4">
            <p className="text-sm text-[var(--neutral-dark)] leading-relaxed">
              {insights.summary}
            </p>

            {insights.highlights.length > 0 && (
              <div className="space-y-2">
                {insights.highlights.map((highlight, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-[var(--primary-deep)]" />
                    <span className="text-[var(--neutral-dark)]">{highlight}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="p-3 bg-[var(--theme-surface)] rounded-xl">
              <div className="flex items-start gap-2">
                <Target className="h-4 w-4 text-[var(--primary-deep)] mt-0.5 flex-shrink-0" />
                <p className="text-sm text-[var(--neutral-dark)]">{insights.suggestion}</p>
              </div>
            </div>

            <button
              onClick={generateInsights}
              className="flex items-center gap-1 text-xs text-[var(--neutral-gray)] hover:text-[var(--primary-deep)] transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
