'use client';

import { useStreak } from '../hooks/useStreak';
import { isFeatureEnabled } from '@/lib/featureFlags';

interface StreakBadgeProps {
  className?: string;
}

/**
 * Small badge showing streak count - for dashboard header
 */
export function StreakBadge({ className = '' }: StreakBadgeProps) {
  const { streak, isLoading } = useStreak();

  // Feature flag check
  if (!isFeatureEnabled('streaks')) {
    return null;
  }

  if (isLoading || !streak || streak.currentStreak === 0) {
    return null;
  }

  const isAtRisk = streak.status === 'at_risk';
  const isFrozen = streak.status === 'frozen';

  const bgColor = isAtRisk
    ? 'bg-amber-500'
    : isFrozen
      ? 'bg-blue-400'
      : 'bg-[var(--theme-primary)]';

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
        ${bgColor} text-white font-semibold text-sm
        ${className}
      `}
    >
      <span>{isFrozen ? '❄️' : '🔥'}</span>
      <span>{streak.currentStreak}</span>
    </div>
  );
}
