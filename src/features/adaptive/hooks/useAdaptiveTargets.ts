'use client';

/**
 * Phase 3: Adaptive Daily Targets - Main Hook (Web)
 */

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { calculateAdaptiveTargets } from '../utils/adaptiveCalculations';
import { getLocalDateString } from '@/lib/date';
import type {
  AdaptiveTargets,
  DailyNutritionSummary,
  UseAdaptiveTargetsReturn,
} from '../types';

/**
 * Hook to fetch and calculate adaptive daily targets with trends
 */
export function useAdaptiveTargets(): UseAdaptiveTargetsReturn {
  const [data, setData] = useState<AdaptiveTargets | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('Not authenticated');
        setData(null);
        return;
      }

      const today = getLocalDateString();
      const yesterday = getLocalDateString(new Date(Date.now() - 86400000));
      const weekAgo = getLocalDateString(new Date(Date.now() - 7 * 86400000));

      // Fetch all data in parallel
      const [profileResult, todayLogsResult, weekSummariesResult] = await Promise.all([
        // Get user's nutrition targets
        supabase
          .from('profiles')
          .select('target_calories, target_protein, target_carbs, target_fat')
          .eq('id', user.id)
          .single(),

        // Get today's food logs for current totals
        supabase
          .from('food_logs')
          .select('calories_logged, protein_logged, carbs_logged, fat_logged')
          .eq('user_id', user.id)
          .eq('log_date', today),

        // Get week's summaries (excluding today)
        supabase
          .from('daily_nutrition_summaries')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', weekAgo)
          .lt('date', today)
          .order('date', { ascending: false }),
      ]);

      // Handle errors
      if (profileResult.error) {
        console.error('Profile fetch error:', profileResult.error);
      }

      // Extract profile targets with defaults
      const profile = profileResult.data;
      const userTargets = {
        calories: profile?.target_calories ?? 2000,
        protein: profile?.target_protein ?? 150,
        carbs: profile?.target_carbs ?? 200,
        fat: profile?.target_fat ?? 65,
      };

      // Calculate today's totals from food logs
      const todayLogs = todayLogsResult.data ?? [];
      const todayCurrent = todayLogs.reduce(
        (acc, log) => ({
          calories: acc.calories + (log.calories_logged ?? 0),
          protein: acc.protein + (log.protein_logged ?? 0),
          carbs: acc.carbs + (log.carbs_logged ?? 0),
          fat: acc.fat + (log.fat_logged ?? 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      // Get week summaries
      const weekSummaries = (weekSummariesResult.data ?? []) as DailyNutritionSummary[];

      // Find yesterday's summary
      const yesterdaySummary = weekSummaries.find((s) => s.date === yesterday) ?? null;

      // Calculate adaptive targets
      const adaptiveTargets = calculateAdaptiveTargets({
        todayCurrent,
        userTargets,
        yesterday: yesterdaySummary,
        weekSummaries,
      });

      setData(adaptiveTargets);
    } catch (err) {
      console.error('useAdaptiveTargets error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch adaptive targets');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook to fetch a specific day's nutrition summary
 */
export function useDailySummary(date: string) {
  const [data, setData] = useState<DailyNutritionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSummary() {
      try {
        setIsLoading(true);
        setError(null);

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setError('Not authenticated');
          return;
        }

        const { data: summary, error: fetchError } = await supabase
          .from('daily_nutrition_summaries')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', date)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError;
        }

        setData(summary as DailyNutritionSummary | null);
      } catch (err) {
        console.error('useDailySummary error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch summary');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSummary();
  }, [date]);

  return { data, isLoading, error };
}

/**
 * Hook to fetch the last 7 days of nutrition summaries
 */
export function useWeekSummaries() {
  const [data, setData] = useState<DailyNutritionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSummaries() {
      try {
        setIsLoading(true);
        setError(null);

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setError('Not authenticated');
          return;
        }

        const weekAgo = getLocalDateString(new Date(Date.now() - 7 * 86400000));

        const { data: summaries, error: fetchError } = await supabase
          .from('daily_nutrition_summaries')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', weekAgo)
          .order('date', { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        setData((summaries ?? []) as DailyNutritionSummary[]);
      } catch (err) {
        console.error('useWeekSummaries error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch summaries');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSummaries();
  }, []);

  return { data, isLoading, error };
}
