'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { UserStreak } from '@/types/database';
import {
  calculateStreakStatus,
  calculateStreakAfterLog,
  formatDateString,
  type StreakData,
  type StreakStatusResult,
} from '../utils/streakCalculations';

export interface UseStreakResult {
  streak: StreakStatusResult | null;
  rawStreak: UserStreak | null;
  isLoading: boolean;
  error: string | null;
  freezeStreak: () => Promise<void>;
  isFreezing: boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook for accessing and managing user streak data
 */
export function useStreak(): UseStreakResult {
  const [rawStreak, setRawStreak] = useState<UserStreak | null>(null);
  const [hasLoggedToday, setHasLoggedToday] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFreezing, setIsFreezing] = useState(false);

  const fetchStreak = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setRawStreak(null);
        setHasLoggedToday(false);
        setIsLoading(false);
        return;
      }

      // Fetch streak data
      const { data: streakData, error: streakError } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // PGRST116 = not found, which is okay for new users
      if (streakError && streakError.code !== 'PGRST116') {
        throw streakError;
      }

      setRawStreak(streakData as UserStreak | null);

      // Check if user has logged food today
      const today = formatDateString(new Date());
      const { count } = await supabase
        .from('food_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('log_date', today);

      setHasLoggedToday((count ?? 0) > 0);
    } catch (err) {
      console.error('Error fetching streak:', err);
      setError(err instanceof Error ? err.message : 'Failed to load streak');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  const freezeStreak = useCallback(async () => {
    if (isFreezing) return;

    setIsFreezing(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekStartStr = formatDateString(weekStart);

      // Check if streak record exists
      if (!rawStreak) {
        // Create a new streak record with freeze
        const { error: insertError } = await supabase
          .from('user_streaks')
          .insert({
            user_id: user.id,
            streak_frozen_at: new Date().toISOString(),
            freezes_used_this_week: 1,
            freeze_week_start: weekStartStr,
          });

        if (insertError) throw insertError;
      } else {
        // Check if it's a new week - reset counter if so
        const storedWeekStart = rawStreak.freeze_week_start;
        const isNewWeek = !storedWeekStart || storedWeekStart !== weekStartStr;
        const newFreezeCount = isNewWeek ? 1 : (rawStreak.freezes_used_this_week ?? 0) + 1;

        // Update existing streak
        const { error: updateError } = await supabase
          .from('user_streaks')
          .update({
            streak_frozen_at: new Date().toISOString(),
            freezes_used_this_week: newFreezeCount,
            freeze_week_start: weekStartStr,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      }

      // Refetch to update UI
      await fetchStreak();
    } catch (err) {
      console.error('Error freezing streak:', err);
      setError(err instanceof Error ? err.message : 'Failed to freeze streak');
      throw err;
    } finally {
      setIsFreezing(false);
    }
  }, [rawStreak, fetchStreak, isFreezing]);

  // Calculate status from raw data
  const streak =
    rawStreak !== null
      ? calculateStreakStatus(
          {
            currentStreak: rawStreak.current_streak,
            longestStreak: rawStreak.longest_streak,
            lastLogDate: rawStreak.last_log_date,
            streakStartDate: rawStreak.streak_start_date,
            streakFrozenAt: rawStreak.streak_frozen_at,
            freezesUsedThisWeek: rawStreak.freezes_used_this_week,
            freezeWeekStart: rawStreak.freeze_week_start,
            totalDaysLogged: rawStreak.total_days_logged,
          },
          hasLoggedToday
        )
      : hasLoggedToday
        ? // User has logged today but no streak record yet - they have 1 day
          {
            currentStreak: 1,
            longestStreak: 1,
            status: 'active' as const,
            canFreeze: false,
            freezesRemaining: 1,
            totalDaysLogged: 1,
            daysUntilStreakBreaks: 1,
          }
        : null;

  return {
    streak,
    rawStreak,
    isLoading,
    error,
    freezeStreak,
    isFreezing,
    refetch: fetchStreak,
  };
}

export interface UseUpdateStreakResult {
  updateStreak: () => Promise<{
    newStreak: number;
    newLongest: number;
    isNewDay: boolean;
  }>;
  isUpdating: boolean;
}

/**
 * Hook to update streak when food is logged
 * Call this after every successful food log
 */
export function useUpdateStreakOnLog(): UseUpdateStreakResult {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateStreak = useCallback(async () => {
    setIsUpdating(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get current streak
      let { data: streak } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Create if doesn't exist
      if (!streak) {
        const { data: newStreak, error: insertError } = await supabase
          .from('user_streaks')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (insertError) throw insertError;
        streak = newStreak;
      }

      // Calculate new streak
      const streakData: StreakData = {
        currentStreak: streak.current_streak,
        longestStreak: streak.longest_streak,
        lastLogDate: streak.last_log_date,
        streakStartDate: streak.streak_start_date,
        streakFrozenAt: streak.streak_frozen_at,
        freezesUsedThisWeek: streak.freezes_used_this_week,
        freezeWeekStart: streak.freeze_week_start,
        totalDaysLogged: streak.total_days_logged,
      };

      const { newStreak, newLongest, isNewDay, newStreakStartDate } =
        calculateStreakAfterLog(streakData);

      if (isNewDay) {
        const today = formatDateString(new Date());

        const { error: updateError } = await supabase
          .from('user_streaks')
          .update({
            current_streak: newStreak,
            longest_streak: newLongest,
            last_log_date: today,
            streak_start_date: newStreakStartDate,
            streak_frozen_at: null, // Clear freeze
            total_days_logged: streak.total_days_logged + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      }

      return { newStreak, newLongest, isNewDay };
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return {
    updateStreak,
    isUpdating,
  };
}
