'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingUp, TrendingDown, Minus, CheckCircle2 } from 'lucide-react';
import type { GoalType } from '@/types/database';

interface GoalProgressProps {
  goal: GoalType;
  currentWeight: number | null;
  startWeight: number | null;
  weeklyChange: number | null;
}

export function GoalProgress({ goal, currentWeight, startWeight, weeklyChange }: GoalProgressProps) {
  const goalConfig = {
    gain_muscle: {
      title: 'Building Muscle',
      description: 'Focus on strength gains and progressive overload',
      targetDirection: 'up',
      color: 'var(--success)',
      bgColor: 'rgba(52,199,89,0.1)',
    },
    lose_fat: {
      title: 'Losing Fat',
      description: 'Creating a sustainable caloric deficit',
      targetDirection: 'down',
      color: 'var(--primary-deep)',
      bgColor: 'var(--primary-light)',
    },
    maintain: {
      title: 'Maintaining',
      description: 'Building healthy habits while staying consistent',
      targetDirection: 'stable',
      color: 'var(--primary-lavender)',
      bgColor: 'var(--primary-light)',
    },
  }[goal];

  const totalChange = currentWeight && startWeight ? currentWeight - startWeight : null;

  // Determine if on track
  const isOnTrack = (() => {
    if (weeklyChange === null) return null;
    if (goal === 'lose_fat') return weeklyChange <= 0;
    if (goal === 'gain_muscle') return weeklyChange >= 0;
    if (goal === 'maintain') return Math.abs(weeklyChange) < 1; // Within 1 lb is on track
    return null;
  })();

  // Calculate a visual progress (just for display)
  const progressPercent = (() => {
    if (!totalChange) return 0;
    // Arbitrary target of 20 lbs change for full progress bar
    const target = 20;
    const progress = Math.abs(totalChange) / target * 100;
    return Math.min(progress, 100);
  })();

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[var(--neutral-dark)]">Goal Progress</CardTitle>
          {isOnTrack !== null && (
            <div className={`flex items-center gap-1 text-sm ${isOnTrack ? 'text-[var(--success)]' : 'text-[var(--accent-coral)]'}`}>
              {isOnTrack ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>On track</span>
                </>
              ) : (
                <>
                  <Target className="h-4 w-4" />
                  <span>Needs focus</span>
                </>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Goal Card */}
        <div
          className="p-4 rounded-xl"
          style={{ backgroundColor: goalConfig.bgColor }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'white' }}
            >
              <Target className="h-5 w-5" style={{ color: goalConfig.color }} />
            </div>
            <div>
              <p className="font-semibold text-[var(--neutral-dark)]">{goalConfig.title}</p>
              <p className="text-sm text-[var(--neutral-gray)]">{goalConfig.description}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-semibold text-[var(--neutral-dark)]">
              {startWeight ? `${startWeight}` : '—'}
            </p>
            <p className="text-xs text-[var(--neutral-gray)]">Starting lbs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-[var(--neutral-dark)]">
              {currentWeight ? `${currentWeight}` : '—'}
            </p>
            <p className="text-xs text-[var(--neutral-gray)]">Current lbs</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              {totalChange !== null && (
                totalChange > 0 ? (
                  <TrendingUp className="h-4 w-4 text-[var(--success)]" />
                ) : totalChange < 0 ? (
                  <TrendingDown className="h-4 w-4 text-[var(--accent-coral)]" />
                ) : (
                  <Minus className="h-4 w-4 text-[var(--neutral-gray)]" />
                )
              )}
              <p className="text-2xl font-semibold text-[var(--neutral-dark)]">
                {totalChange !== null ? `${totalChange > 0 ? '+' : ''}${totalChange.toFixed(1)}` : '—'}
              </p>
            </div>
            <p className="text-xs text-[var(--neutral-gray)]">Total change</p>
          </div>
        </div>

        {/* Progress Bar */}
        {totalChange !== null && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[var(--neutral-gray)]">
              <span>Progress</span>
              <span>{Math.abs(totalChange).toFixed(1)} lbs {goal === 'lose_fat' ? 'lost' : goal === 'maintain' ? 'changed' : 'gained'}</span>
            </div>
            <div className="h-2 bg-[var(--neutral-gray-light)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: goalConfig.color,
                }}
              />
            </div>
          </div>
        )}

        {/* Weekly Trend */}
        {weeklyChange !== null && (
          <div className="flex items-center justify-between p-3 bg-[var(--neutral-gray-light)] rounded-xl">
            <span className="text-sm text-[var(--neutral-gray)]">This week</span>
            <div className="flex items-center gap-2">
              {weeklyChange > 0 ? (
                <TrendingUp className="h-4 w-4 text-[var(--success)]" />
              ) : weeklyChange < 0 ? (
                <TrendingDown className="h-4 w-4 text-[var(--accent-coral)]" />
              ) : (
                <Minus className="h-4 w-4 text-[var(--neutral-gray)]" />
              )}
              <span className={`font-medium ${
                weeklyChange > 0 ? 'text-[var(--success)]' :
                weeklyChange < 0 ? 'text-[var(--accent-coral)]' :
                'text-[var(--neutral-gray)]'
              }`}>
                {weeklyChange > 0 ? '+' : ''}{weeklyChange.toFixed(1)} lbs
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
