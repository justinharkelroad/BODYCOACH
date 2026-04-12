'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EnergyMoodSelector } from './EnergyMoodSelector';
import { useTodaysCheckin } from '../hooks/useTodaysCheckin';
import { useSubmitCheckin } from '../hooks/useSubmitCheckin';
import { useCheckinHistory } from '../hooks/useCheckinHistory';
import {
  ENERGY_OPTIONS,
  MOOD_OPTIONS,
  getEnergyOption,
  getMoodOption,
  getSleepOption,
} from '../types';
import type { CheckinLevel } from '../types';
import { isFeatureEnabled } from '@/lib/featureFlags';

interface DashboardCheckinSectionProps {
  className?: string;
}

/**
 * Dashboard section for daily check-in
 * Shows today's check-in status or a quick check-in form
 */
export function DashboardCheckinSection({ className = '' }: DashboardCheckinSectionProps) {
  const { checkin, isLoading, refetch } = useTodaysCheckin();
  const { submitCheckin, isSubmitting } = useSubmitCheckin();
  const { weeklyAverages } = useCheckinHistory(7);

  // Quick check-in form state (only energy + mood)
  const [energyLevel, setEnergyLevel] = useState<CheckinLevel | null>(null);
  const [moodLevel, setMoodLevel] = useState<CheckinLevel | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Feature flag check
  if (!isFeatureEnabled('moodCheckin')) {
    return null;
  }

  const handleQuickCheckin = async () => {
    if (!energyLevel && !moodLevel) return;

    try {
      await submitCheckin({
        energyLevel,
        moodLevel,
      });
      await refetch();
      setShowForm(false);
      setEnergyLevel(null);
      setMoodLevel(null);
    } catch (error) {
      console.error('Failed to submit check-in:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-6 w-32 bg-[var(--theme-surface-elevated)] rounded" />
            <div className="h-16 bg-[var(--theme-surface-elevated)] rounded-xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // User has already checked in today - show summary
  if (checkin) {
    const energy = getEnergyOption(checkin.energy_level);
    const mood = getMoodOption(checkin.mood_level);
    const sleep = getSleepOption(checkin.sleep_quality);

    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Today&apos;s Check-in</span>
            <span className="text-sm font-normal text-green-600">Completed</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-around py-2">
            {energy && (
              <div className="text-center">
                <span className="text-2xl">{energy.emoji}</span>
                <p className="text-xs text-[var(--theme-text-secondary)] mt-1">Energy</p>
              </div>
            )}
            {mood && (
              <div className="text-center">
                <span className="text-2xl">{mood.emoji}</span>
                <p className="text-xs text-[var(--theme-text-secondary)] mt-1">Mood</p>
              </div>
            )}
            {sleep && (
              <div className="text-center">
                <span className="text-2xl">{sleep.emoji}</span>
                <p className="text-xs text-[var(--theme-text-secondary)] mt-1">Sleep</p>
              </div>
            )}
          </div>

          {/* Week stats */}
          {weeklyAverages.daysWithCheckins > 1 && (
            <div className="mt-4 pt-4 border-t border-[var(--theme-divider)]">
              <p className="text-xs text-[var(--theme-text-secondary)] mb-2">This week</p>
              <div className="flex items-center gap-4 text-sm">
                {weeklyAverages.energy !== null && (
                  <span>Energy: <strong>{weeklyAverages.energy.toFixed(1)}</strong></span>
                )}
                {weeklyAverages.mood !== null && (
                  <span>Mood: <strong>{weeklyAverages.mood.toFixed(1)}</strong></span>
                )}
                <span className="text-[var(--theme-text-muted)]">
                  {weeklyAverages.daysWithCheckins} days
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // No check-in yet - show prompt or form
  if (!showForm) {
    return (
      <Card className={className}>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[var(--theme-text)]">
                Daily Check-in
              </h3>
              <p className="text-sm text-[var(--theme-text-secondary)]">
                How are you feeling today?
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowForm(true)}
            >
              Check In
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show quick check-in form
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Quick Check-in</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <EnergyMoodSelector
            label="Energy"
            options={ENERGY_OPTIONS}
            value={energyLevel}
            onChange={setEnergyLevel}
            disabled={isSubmitting}
          />

          <EnergyMoodSelector
            label="Mood"
            options={MOOD_OPTIONS}
            value={moodLevel}
            onChange={setMoodLevel}
            disabled={isSubmitting}
          />

          <div className="flex gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setEnergyLevel(null);
                setMoodLevel(null);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleQuickCheckin}
              disabled={(!energyLevel && !moodLevel) || isSubmitting}
              isLoading={isSubmitting}
            >
              Save
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
