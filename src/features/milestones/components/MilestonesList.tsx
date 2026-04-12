'use client';

import { isFeatureEnabled } from '@/lib/featureFlags';
import { useMilestones } from '../hooks/useMilestones';
import { MILESTONES, getMilestonesByCategory, type Milestone } from '../data/milestones';
import type { MilestoneCategory } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MilestonesListProps {
  className?: string;
  showLocked?: boolean;
}

/**
 * Display all milestones with earned/locked states
 */
export function MilestonesList({ className = '', showLocked = true }: MilestonesListProps) {
  const { earnedMilestones, unlockedCount, totalCount, isLoading } = useMilestones();

  // Feature flag check
  if (!isFeatureEnabled('milestones')) {
    return null;
  }

  if (isLoading) {
    return <MilestonesListSkeleton className={className} />;
  }

  const earnedIds = new Set(earnedMilestones.map((m) => m.id));
  const categories: MilestoneCategory[] = ['streak', 'logging', 'protein', 'exploration'];

  const categoryLabels: Record<MilestoneCategory, string> = {
    streak: 'Streaks',
    logging: 'Logging',
    protein: 'Protein',
    consistency: 'Consistency',
    exploration: 'Exploration',
  };

  return (
    <div className={className}>
      {/* Progress summary */}
      <div className="mb-6 text-center">
        <p className="text-3xl font-bold text-[var(--theme-text)]">
          {unlockedCount} / {totalCount}
        </p>
        <p className="text-sm text-[var(--theme-text-secondary)]">
          Milestones Unlocked
        </p>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {categories.map((category) => {
          const categoryMilestones = getMilestonesByCategory(category);
          const earned = categoryMilestones.filter((m) => earnedIds.has(m.id));
          const locked = categoryMilestones.filter((m) => !earnedIds.has(m.id));

          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{categoryLabels[category]}</span>
                  <span className="text-sm font-normal text-[var(--theme-text-secondary)]">
                    {earned.length} / {categoryMilestones.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {/* Earned milestones */}
                  {earned.map((milestone) => (
                    <MilestoneBadge key={milestone.id} milestone={milestone} locked={false} />
                  ))}

                  {/* Locked milestones */}
                  {showLocked &&
                    locked.map((milestone) => (
                      <MilestoneBadge
                        key={milestone.id}
                        milestone={milestone}
                        locked={true}
                      />
                    ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

interface MilestoneBadgeProps {
  milestone: Milestone;
  locked: boolean;
  size?: 'sm' | 'md';
}

/**
 * Single milestone badge with locked/unlocked state
 */
export function MilestoneBadge({ milestone, locked, size = 'md' }: MilestoneBadgeProps) {
  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-14 h-14 text-2xl',
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`
          ${sizeClasses[size]} rounded-full flex items-center justify-center
          ${
            locked
              ? 'bg-[var(--theme-surface-elevated)] opacity-40 grayscale'
              : 'bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-accent)]'
          }
        `}
        title={locked ? `Locked: ${milestone.description}` : milestone.name}
      >
        <span className={locked ? 'opacity-50' : ''}>{milestone.icon}</span>
      </div>
      <span
        className={`
          text-[10px] text-center leading-tight max-w-[60px]
          ${locked ? 'text-[var(--theme-text-muted)]' : 'text-[var(--theme-text-secondary)]'}
        `}
      >
        {locked ? '???' : milestone.name}
      </span>
    </div>
  );
}

/**
 * Compact milestone progress indicator
 */
interface MilestoneProgressProps {
  className?: string;
}

export function MilestoneProgress({ className = '' }: MilestoneProgressProps) {
  const { earnedMilestones, unlockedCount, totalCount, isLoading } = useMilestones();

  if (!isFeatureEnabled('milestones') || isLoading) {
    return null;
  }

  // Show last 3 earned milestones
  const recentMilestones = earnedMilestones.slice(0, 3);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex -space-x-2">
        {recentMilestones.map((m) => (
          <div
            key={m.id}
            className="w-8 h-8 rounded-full bg-[var(--theme-primary)] flex items-center justify-center border-2 border-[var(--theme-surface)]"
          >
            <span className="text-sm">{m.icon}</span>
          </div>
        ))}
        {recentMilestones.length === 0 && (
          <div className="w-8 h-8 rounded-full bg-[var(--theme-surface-elevated)] flex items-center justify-center">
            <span className="text-sm">🏆</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-[var(--theme-text)]">
          {unlockedCount} / {totalCount}
        </p>
        <p className="text-xs text-[var(--theme-text-secondary)]">Milestones</p>
      </div>
    </div>
  );
}

function MilestonesListSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <div className="mb-6 text-center">
        <div className="h-9 w-20 bg-[var(--theme-surface-elevated)] rounded animate-pulse mx-auto" />
        <div className="h-4 w-32 bg-[var(--theme-surface-elevated)] rounded animate-pulse mx-auto mt-2" />
      </div>
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 w-24 bg-[var(--theme-surface-elevated)] rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div
                    key={j}
                    className="w-14 h-14 rounded-full bg-[var(--theme-surface-elevated)] animate-pulse mx-auto"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
