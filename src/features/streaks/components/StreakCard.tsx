'use client';

import Link from 'next/link';
import { useStreak } from '../hooks/useStreak';
import { getStreakMessage } from '../utils/streakCalculations';
import { isFeatureEnabled } from '@/lib/featureFlags';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardCheck } from 'lucide-react';

interface StreakCardProps {
  className?: string;
}

/**
 * Full streak card for dashboard - shows detailed info
 */
export function StreakCard({ className = '' }: StreakCardProps) {
  const { streak, isLoading, freezeStreak, isFreezing, error } = useStreak();

  // Feature flag check
  if (!isFeatureEnabled('streaks')) {
    return null;
  }

  if (isLoading) {
    return <StreakCardSkeleton className={className} />;
  }

  // No streak data yet - show call to action
  if (!streak) {
    return (
      <Link href="/check-in">
        <Card className={`${className} hover:shadow-md transition-shadow cursor-pointer`}>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[var(--theme-surface-elevated)] flex items-center justify-center">
                  <span className="text-2xl">🔥</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--theme-text)]">
                    Start Your Streak
                  </h3>
                  <p className="text-sm text-[var(--theme-text-secondary)]">
                    Check in today to begin
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[14px] font-normal text-white bg-[var(--theme-primary)] px-4 py-2 rounded-[980px]">
                <ClipboardCheck className="h-4 w-4" />
                Check in
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  const statusConfig = {
    active: {
      icon: '🔥',
      bgColor: 'bg-gradient-to-br from-orange-400 to-red-500',
      textColor: 'text-white',
    },
    at_risk: {
      icon: '⚠️',
      bgColor: 'bg-gradient-to-br from-amber-400 to-orange-500',
      textColor: 'text-white',
    },
    frozen: {
      icon: '❄️',
      bgColor: 'bg-gradient-to-br from-blue-400 to-cyan-500',
      textColor: 'text-white',
    },
    broken: {
      icon: '💔',
      bgColor: 'bg-[var(--theme-surface-elevated)]',
      textColor: 'text-[var(--theme-text)]',
    },
  };

  const config = statusConfig[streak.status];
  const message = getStreakMessage(streak);

  return (
    <Card className={className}>
      <CardContent>
        <div className="flex items-start gap-4">
          {/* Icon circle */}
          <div
            className={`
              flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center
              ${config.bgColor}
            `}
          >
            <span className="text-2xl">{config.icon}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold text-[var(--theme-text)]">
                {streak.currentStreak}
              </h3>
              <span className="text-sm text-[var(--theme-text-secondary)]">
                day{streak.currentStreak !== 1 ? 's' : ''}
              </span>
            </div>

            <p className="text-sm text-[var(--theme-text-secondary)] mt-0.5">
              {message}
            </p>

            {/* Freeze button when at risk */}
            {streak.status === 'at_risk' && streak.canFreeze && (
              <div className="mt-3">
                <Button
                  onClick={() => freezeStreak()}
                  disabled={isFreezing}
                  variant="secondary"
                  size="sm"
                  className="gap-1.5"
                >
                  <span>❄️</span>
                  {isFreezing ? 'Freezing...' : 'Freeze Streak'}
                </Button>
                <p className="text-xs text-[var(--theme-text-muted)] mt-1.5">
                  {streak.freezesRemaining} freeze remaining this week
                </p>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-500 mt-2">{error}</p>
            )}
          </div>
        </div>

        {/* Check-in button */}
        <div className="mt-4">
          <Link href="/check-in">
            <button className="w-full flex items-center justify-center gap-2 text-[14px] font-normal text-white bg-[var(--theme-primary)] px-4 py-2.5 rounded-[980px] hover:bg-[var(--theme-primary-light)] transition-colors">
              <ClipboardCheck className="h-4 w-4" />
              Daily Check-in
            </button>
          </Link>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-[var(--theme-divider)]">
          <div className="text-center">
            <p className="text-xl font-bold text-[var(--theme-text)]">
              {streak.totalDaysLogged}
            </p>
            <p className="text-xs text-[var(--theme-text-secondary)]">
              Total Days
            </p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-[var(--theme-text)]">
              {streak.longestStreak}
            </p>
            <p className="text-xs text-[var(--theme-text-secondary)]">
              Best Streak
            </p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-[var(--theme-text)]">
              {streak.freezesRemaining}
            </p>
            <p className="text-xs text-[var(--theme-text-secondary)]">
              Freezes Left
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StreakCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <Card className={className}>
      <CardContent>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-[var(--theme-surface-elevated)] animate-pulse" />
          <div className="flex-1">
            <div className="h-8 w-16 bg-[var(--theme-surface-elevated)] rounded animate-pulse" />
            <div className="h-4 w-32 bg-[var(--theme-surface-elevated)] rounded animate-pulse mt-2" />
          </div>
        </div>
        <div className="flex gap-6 mt-4 pt-4 border-t border-[var(--theme-divider)]">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center">
              <div className="h-6 w-8 bg-[var(--theme-surface-elevated)] rounded animate-pulse mx-auto" />
              <div className="h-3 w-12 bg-[var(--theme-surface-elevated)] rounded animate-pulse mt-1 mx-auto" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
