'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type {
  FoodLog,
  FoodLogInsert,
  FoodLogUpdate,
  Food,
  MealSlot,
  DailyNutritionSummary,
} from '../types/nutrition.types';
import { calculateFoodMacros, getSuggestedMealSlot } from '../services/nutritionCalculator';
import { getFoodById } from '../services/foodCacheService';
import { dispatchFoodLoggedEvent } from '@/features/checkin';
import { getLocalDateString } from '@/lib/date';

export interface UseFoodLogResult {
  logs: FoodLog[];
  isLoading: boolean;
  error: string | null;
  addLog: (foodId: string, servings?: number, options?: AddLogOptions) => Promise<FoodLog>;
  updateLog: (logId: string, updates: FoodLogUpdate) => Promise<void>;
  deleteLog: (logId: string) => Promise<void>;
  getDailySummary: (date?: string) => DailyNutritionSummary;
  refetch: () => Promise<void>;
}

interface AddLogOptions {
  mealSlot?: MealSlot | null;
  logDate?: string;
  notes?: string;
  photoUrl?: string;
  isPlanned?: boolean;
  quickLogged?: boolean;
}

export function useFoodLog(date?: string): UseFoodLogResult {
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetDate = date || getLocalDateString();

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLogs([]);
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('food_logs')
        .select(`
          *,
          food:foods(*)
        `)
        .eq('user_id', user.id)
        .eq('log_date', targetDate)
        .order('logged_at', { ascending: true });

      if (fetchError) throw fetchError;

      setLogs((data as FoodLog[]) || []);
    } catch (err) {
      console.error('Error fetching food logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load food logs');
    } finally {
      setIsLoading(false);
    }
  }, [targetDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const addLog = useCallback(
    async (
      foodId: string,
      servings = 1,
      options: AddLogOptions = {}
    ): Promise<FoodLog> => {
      setError(null);

      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Not authenticated');
        }

        // Get food details to calculate macros
        const food = await getFoodById(foodId);
        if (!food) {
          throw new Error('Food not found');
        }

        const macros = calculateFoodMacros(food, servings);
        const mealSlot = options.mealSlot ?? (getSuggestedMealSlot() as MealSlot | null);
        const logDate = options.logDate || targetDate;

        const insert: FoodLogInsert = {
          user_id: user.id,
          food_id: foodId,
          log_date: logDate,
          logged_at: new Date().toISOString(),
          meal_slot: mealSlot,
          servings,
          calories_logged: macros.calories,
          protein_logged: macros.protein,
          carbs_logged: macros.carbs,
          fat_logged: macros.fat,
          quick_logged: options.quickLogged || false,
          photo_url: options.photoUrl || null,
          notes: options.notes || null,
          is_planned: options.isPlanned || false,
        };

        const { data, error: insertError } = await supabase
          .from('food_logs')
          .insert(insert)
          .select(`
            *,
            food:foods(*)
          `)
          .single();

        if (insertError) throw insertError;

        const newLog = data as FoodLog;

        // Update local state if it's for the current date
        if (logDate === targetDate) {
          setLogs(prev => [...prev, newLog].sort(
            (a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
          ));
        }

        // Notify check-in prompt that food was logged (Phase 2)
        dispatchFoodLoggedEvent();

        return newLog;
      } catch (err) {
        console.error('Error adding food log:', err);
        setError(err instanceof Error ? err.message : 'Failed to add food');
        throw err;
      }
    },
    [targetDate]
  );

  const updateLog = useCallback(
    async (logId: string, updates: FoodLogUpdate) => {
      setError(null);

      try {
        const supabase = createClient();
        // If servings changed, recalculate macros
        let macroUpdates = {};
        if (updates.servings !== undefined) {
          const log = logs.find(l => l.id === logId);
          if (log?.food) {
            const macros = calculateFoodMacros(log.food, updates.servings);
            macroUpdates = {
              calories_logged: macros.calories,
              protein_logged: macros.protein,
              carbs_logged: macros.carbs,
              fat_logged: macros.fat,
            };
          }
        }

        const { error: updateError } = await supabase
          .from('food_logs')
          .update({ ...updates, ...macroUpdates })
          .eq('id', logId);

        if (updateError) throw updateError;

        // Update local state
        setLogs(prev =>
          prev.map(log =>
            log.id === logId ? { ...log, ...updates, ...macroUpdates } : log
          )
        );
      } catch (err) {
        console.error('Error updating food log:', err);
        setError(err instanceof Error ? err.message : 'Failed to update food');
        throw err;
      }
    },
    [logs]
  );

  const deleteLog = useCallback(
    async (logId: string) => {
      setError(null);

      try {
        const supabase = createClient();
        const { error: deleteError } = await supabase
          .from('food_logs')
          .delete()
          .eq('id', logId);

        if (deleteError) throw deleteError;

        // Update local state
        setLogs(prev => prev.filter(log => log.id !== logId));
      } catch (err) {
        console.error('Error deleting food log:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete food');
        throw err;
      }
    },
    []
  );

  const getDailySummary = useCallback(
    (summaryDate?: string): DailyNutritionSummary => {
      const dateToSummarize = summaryDate || targetDate;
      const dayLogs = logs.filter(log => log.log_date === dateToSummarize);

      const totals = dayLogs.reduce(
        (acc, log) => ({
          calories: acc.calories + (log.calories_logged || 0),
          protein: acc.protein + (log.protein_logged || 0),
          carbs: acc.carbs + (log.carbs_logged || 0),
          fat: acc.fat + (log.fat_logged || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      return {
        date: dateToSummarize,
        total_calories: Math.round(totals.calories),
        total_protein: Math.round(totals.protein * 10) / 10,
        total_carbs: Math.round(totals.carbs * 10) / 10,
        total_fat: Math.round(totals.fat * 10) / 10,
        target_calories: 0, // Filled by consumer using nutrition profile
        target_protein: 0,
        target_carbs: 0,
        target_fat: 0,
        meals: dayLogs,
      };
    },
    [logs, targetDate]
  );

  return {
    logs,
    isLoading,
    error,
    addLog,
    updateLog,
    deleteLog,
    getDailySummary,
    refetch: fetchLogs,
  };
}

/**
 * Hook to get logs across a date range
 */
export function useFoodLogRange(startDate: string, endDate: string) {
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLogs([]);
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('food_logs')
        .select(`
          *,
          food:foods(*)
        `)
        .eq('user_id', user.id)
        .gte('log_date', startDate)
        .lte('log_date', endDate)
        .order('log_date', { ascending: true })
        .order('logged_at', { ascending: true });

      if (fetchError) throw fetchError;

      setLogs((data as FoodLog[]) || []);
    } catch (err) {
      console.error('Error fetching food log range:', err);
      setError(err instanceof Error ? err.message : 'Failed to load food logs');
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    isLoading,
    error,
    refetch: fetchLogs,
  };
}
