'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { FrequentFood, Food, MealSlot, QuickLogAction } from '../types/nutrition.types';

export interface UseFrequentFoodsResult {
  frequentFoods: FrequentFood[];
  quickActions: QuickLogAction[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Get the current time window for meal suggestions
 */
function getCurrentMealWindow(): MealSlot | null {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 10) return 'breakfast';
  if (hour >= 11 && hour < 14) return 'lunch';
  if (hour >= 17 && hour < 20) return 'dinner';
  return 'snack';
}

/**
 * Check if a time matches the current meal window
 */
function isTimeRelevant(timeOfDay: string | null, mealSlot: MealSlot | null): boolean {
  const currentWindow = getCurrentMealWindow();

  // If no preference data, treat as neutral
  if (!timeOfDay && !mealSlot) return true;

  // Check meal slot match
  if (mealSlot === currentWindow) return true;

  // Check time of day match
  if (timeOfDay) {
    const [hours] = timeOfDay.split(':').map(Number);
    const currentHour = new Date().getHours();

    // Within 2 hours of typical time
    if (Math.abs(hours - currentHour) <= 2) return true;
  }

  return false;
}

export function useFrequentFoods(limit = 20): UseFrequentFoodsResult {
  const [frequentFoods, setFrequentFoods] = useState<FrequentFood[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFrequentFoods = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setFrequentFoods([]);
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('frequent_foods')
        .select(`
          *,
          food:foods(*)
        `)
        .eq('user_id', user.id)
        .order('log_count', { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;

      setFrequentFoods((data as FrequentFood[]) || []);
    } catch (err) {
      console.error('Error fetching frequent foods:', err);
      setError(err instanceof Error ? err.message : 'Failed to load frequent foods');
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchFrequentFoods();
  }, [fetchFrequentFoods]);

  // Sort frequent foods by time relevance, then by frequency
  const quickActions = useMemo((): QuickLogAction[] => {
    if (frequentFoods.length === 0) return [];

    // Split into time-relevant and other
    const relevant: FrequentFood[] = [];
    const other: FrequentFood[] = [];

    for (const ff of frequentFoods) {
      if (isTimeRelevant(ff.typical_time_of_day, ff.typical_meal_slot)) {
        relevant.push(ff);
      } else {
        other.push(ff);
      }
    }

    // Time-relevant first, sorted by frequency
    const sorted = [
      ...relevant.sort((a, b) => b.log_count - a.log_count),
      ...other.sort((a, b) => b.log_count - a.log_count),
    ];

    return sorted
      .filter(ff => ff.food) // Only include if food data is available
      .map(ff => ({
        food: ff.food as Food,
        typicalServings: 1, // Could be calculated from historical data
        mealSlot: ff.typical_meal_slot,
        frequency: ff.log_count,
      }));
  }, [frequentFoods]);

  return {
    frequentFoods,
    quickActions,
    isLoading,
    error,
    refetch: fetchFrequentFoods,
  };
}

/**
 * Hook to get quick actions for a specific meal slot
 */
export function useQuickActionsForMeal(mealSlot: MealSlot) {
  const { quickActions, isLoading, error } = useFrequentFoods(50);

  const filteredActions = useMemo(() => {
    return quickActions.filter(
      action => action.mealSlot === mealSlot || action.mealSlot === null
    );
  }, [quickActions, mealSlot]);

  return {
    quickActions: filteredActions,
    isLoading,
    error,
  };
}
