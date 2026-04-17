'use client';

import { useMemo } from 'react';
import { useNutritionProfile } from '@/features/nutrition/hooks/useNutritionProfile';
import { useFoodLog } from '@/features/nutrition/hooks/useFoodLog';
import { getLocalDateString } from '@/lib/date';

export interface RemainingMacros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface UseRemainingMacrosResult {
  remaining: RemainingMacros;
  targets: RemainingMacros;
  consumed: RemainingMacros;
  isLoading: boolean;
}

/**
 * Hook to calculate remaining macros for the day
 */
export function useRemainingMacros(date?: string): UseRemainingMacrosResult {
  const targetDate = date || getLocalDateString();
  const { profile, isLoading: profileLoading } = useNutritionProfile();
  const { logs, isLoading: logsLoading } = useFoodLog(targetDate);

  const result = useMemo(() => {
    // Get target values
    const targets: RemainingMacros = {
      calories: profile?.target_calories || 2000,
      protein: profile?.target_protein || 150,
      carbs: profile?.target_carbs || 200,
      fat: profile?.target_fat || 65,
    };

    // Calculate consumed totals
    const consumed = logs.reduce(
      (acc, log) => ({
        calories: acc.calories + (log.calories_logged || 0),
        protein: acc.protein + (log.protein_logged || 0),
        carbs: acc.carbs + (log.carbs_logged || 0),
        fat: acc.fat + (log.fat_logged || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    // Calculate remaining (don't go below 0)
    const remaining: RemainingMacros = {
      calories: Math.max(0, Math.round(targets.calories - consumed.calories)),
      protein: Math.max(0, Math.round(targets.protein - consumed.protein)),
      carbs: Math.max(0, Math.round(targets.carbs - consumed.carbs)),
      fat: Math.max(0, Math.round(targets.fat - consumed.fat)),
    };

    return { remaining, targets, consumed };
  }, [profile, logs]);

  return {
    ...result,
    isLoading: profileLoading || logsLoading,
  };
}
