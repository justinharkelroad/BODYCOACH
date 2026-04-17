'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { DailyCheckin } from '@/types/database';
import type { CheckinSummary, CheckinWeeklyAverages } from '../types';
import { getLocalDateString } from '@/lib/date';

export interface UseCheckinHistoryResult {
  checkins: DailyCheckin[];
  summaries: CheckinSummary[];
  weeklyAverages: CheckinWeeklyAverages;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Calculate weekly averages from check-ins
 */
function calculateWeeklyAverages(checkins: DailyCheckin[]): CheckinWeeklyAverages {
  const daysWithCheckins = checkins.length;

  if (daysWithCheckins === 0) {
    return {
      energy: null,
      mood: null,
      sleep: null,
      daysWithCheckins: 0,
    };
  }

  // Calculate averages only from non-null values
  const energyValues = checkins.filter((c) => c.energy_level !== null).map((c) => c.energy_level!);
  const moodValues = checkins.filter((c) => c.mood_level !== null).map((c) => c.mood_level!);
  const sleepValues = checkins.filter((c) => c.sleep_quality !== null).map((c) => c.sleep_quality!);

  const avgEnergy = energyValues.length > 0
    ? energyValues.reduce((a, b) => a + b, 0) / energyValues.length
    : null;
  const avgMood = moodValues.length > 0
    ? moodValues.reduce((a, b) => a + b, 0) / moodValues.length
    : null;
  const avgSleep = sleepValues.length > 0
    ? sleepValues.reduce((a, b) => a + b, 0) / sleepValues.length
    : null;

  return {
    energy: avgEnergy ? Math.round(avgEnergy * 10) / 10 : null,
    mood: avgMood ? Math.round(avgMood * 10) / 10 : null,
    sleep: avgSleep ? Math.round(avgSleep * 10) / 10 : null,
    daysWithCheckins,
  };
}

/**
 * Convert full check-in to summary
 */
function toSummary(checkin: DailyCheckin): CheckinSummary {
  return {
    date: checkin.date,
    energyLevel: checkin.energy_level,
    moodLevel: checkin.mood_level,
    sleepQuality: checkin.sleep_quality,
    hasNotes: !!checkin.notes && checkin.notes.trim().length > 0,
  };
}

/**
 * Hook to get check-in history for the last N days
 */
export function useCheckinHistory(days: number = 7): UseCheckinHistoryResult {
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setCheckins([]);
        setIsLoading(false);
        return;
      }

      // Calculate date range
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - days + 1);

      const { data, error: queryError } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', getLocalDateString(startDate))
        .lte('date', getLocalDateString(today))
        .order('date', { ascending: false });

      if (queryError) throw queryError;

      setCheckins((data as DailyCheckin[]) || []);
    } catch (err) {
      console.error('Error fetching check-in history:', err);
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setIsLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Calculate derived values
  const summaries = checkins.map(toSummary);
  const weeklyAverages = calculateWeeklyAverages(checkins);

  return {
    checkins,
    summaries,
    weeklyAverages,
    isLoading,
    error,
    refetch: fetchHistory,
  };
}
