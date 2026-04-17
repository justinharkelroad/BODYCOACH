'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCheckinHistory } from '../hooks/useCheckinHistory';
import {
  getEnergyOption,
  getMoodOption,
  getSleepOption,
  type CheckinSummary,
} from '../types';
import { isFeatureEnabled } from '@/lib/featureFlags';
import { getLocalDateString } from '@/lib/date';

interface CheckinDayRowProps {
  summary: CheckinSummary;
}

function CheckinDayRow({ summary }: CheckinDayRowProps) {
  const [y, m, d] = summary.date.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const isToday = getLocalDateString() === summary.date;
  const dayName = isToday
    ? 'Today'
    : date.toLocaleDateString('en-US', { weekday: 'short' });
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const energy = getEnergyOption(summary.energyLevel);
  const mood = getMoodOption(summary.moodLevel);
  const sleep = getSleepOption(summary.sleepQuality);

  return (
    <div className="flex items-center justify-between py-3 border-b border-[var(--theme-divider)] last:border-b-0">
      {/* Date */}
      <div className="w-20">
        <p className={`text-sm font-medium ${isToday ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-text)]'}`}>
          {dayName}
        </p>
        <p className="text-xs text-[var(--theme-text-secondary)]">{dateStr}</p>
      </div>

      {/* Emoji indicators */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center">
          <span className="text-lg">{energy?.emoji || '—'}</span>
          <span className="text-[10px] text-[var(--theme-text-muted)]">Energy</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg">{mood?.emoji || '—'}</span>
          <span className="text-[10px] text-[var(--theme-text-muted)]">Mood</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg">{sleep?.emoji || '—'}</span>
          <span className="text-[10px] text-[var(--theme-text-muted)]">Sleep</span>
        </div>
      </div>

      {/* Notes indicator */}
      <div className="w-8 text-center">
        {summary.hasNotes && (
          <span className="text-[var(--theme-text-muted)]" title="Has notes">
            <svg className="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </span>
        )}
      </div>
    </div>
  );
}

interface WeeklyAveragesProps {
  energy: number | null;
  mood: number | null;
  sleep: number | null;
  daysWithCheckins: number;
}

function WeeklyAverages({ energy, mood, sleep, daysWithCheckins }: WeeklyAveragesProps) {
  if (daysWithCheckins === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-around py-4 bg-[var(--theme-surface-elevated)] rounded-xl">
      <div className="text-center">
        <p className="text-lg font-bold text-[var(--theme-text)]">
          {energy !== null ? energy.toFixed(1) : '—'}
        </p>
        <p className="text-xs text-[var(--theme-text-secondary)]">Avg Energy</p>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-[var(--theme-text)]">
          {mood !== null ? mood.toFixed(1) : '—'}
        </p>
        <p className="text-xs text-[var(--theme-text-secondary)]">Avg Mood</p>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-[var(--theme-text)]">
          {sleep !== null ? sleep.toFixed(1) : '—'}
        </p>
        <p className="text-xs text-[var(--theme-text-secondary)]">Avg Sleep</p>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-[var(--theme-primary)]">
          {daysWithCheckins}
        </p>
        <p className="text-xs text-[var(--theme-text-secondary)]">Days</p>
      </div>
    </div>
  );
}

interface CheckinHistoryProps {
  days?: number;
  className?: string;
}

/**
 * Display check-in history as a list with weekly averages
 */
export function CheckinHistory({ days = 7, className = '' }: CheckinHistoryProps) {
  const { summaries, weeklyAverages, isLoading, error } = useCheckinHistory(days);

  // Feature flag check
  if (!isFeatureEnabled('moodCheckin')) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-[var(--theme-surface-elevated)] rounded-xl" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-[var(--theme-surface-elevated)] rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent>
          <p className="text-center text-[var(--theme-text-secondary)] py-8">
            Failed to load check-in history
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Check-in History</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Weekly Averages */}
        <WeeklyAverages {...weeklyAverages} />

        {/* List of days */}
        <div className="mt-4">
          {summaries.length === 0 ? (
            <p className="text-center text-[var(--theme-text-secondary)] py-4">
              No check-ins yet. Log some food to get started!
            </p>
          ) : (
            summaries.map((summary) => (
              <CheckinDayRow key={summary.date} summary={summary} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
