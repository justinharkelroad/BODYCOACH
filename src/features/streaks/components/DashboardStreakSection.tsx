'use client';

import { isFeatureEnabled } from '@/lib/featureFlags';
import { StreakCard } from './StreakCard';
import { MilestoneProgress } from '@/features/milestones';

interface DashboardStreakSectionProps {
  className?: string;
}

/**
 * Dashboard section showing streak and milestone progress
 * This is a client component that can be added to the server-rendered dashboard
 */
export function DashboardStreakSection({ className = '' }: DashboardStreakSectionProps) {
  const showStreaks = isFeatureEnabled('streaks');
  const showMilestones = isFeatureEnabled('milestones');

  if (!showStreaks && !showMilestones) {
    return null;
  }

  return (
    <section className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔥</span>
          <h2 className="text-lg font-semibold text-[var(--theme-text)]">Your Progress</h2>
        </div>
        {showMilestones && <MilestoneProgress />}
      </div>

      {showStreaks && <StreakCard />}
    </section>
  );
}
