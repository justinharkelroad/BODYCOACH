'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { MealSuggestion, SuggestedMealItem } from '../types';
import type { MealSlot } from '@/features/nutrition/types/nutrition.types';
import { getSuggestedMealSlot } from '@/features/nutrition/services/nutritionCalculator';
import { dispatchFoodLoggedEvent } from '@/features/checkin';
import { getLocalDateString } from '@/lib/date';

export interface UseLogSuggestionResult {
  isLogging: boolean;
  error: string | null;
  logSuggestion: (suggestion: MealSuggestion, mealSlot?: MealSlot) => Promise<void>;
}

/**
 * Generate a unique ID for AI-suggested foods
 */
function generateFoodId(): string {
  return `ai_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Hook to log all items from an AI meal suggestion
 */
export function useLogSuggestion(): UseLogSuggestionResult {
  const [isLogging, setIsLogging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logSuggestion = useCallback(
    async (suggestion: MealSuggestion, mealSlot?: MealSlot) => {
      setIsLogging(true);
      setError(null);

      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          throw new Error('Not authenticated');
        }

        const today = getLocalDateString();
        const slot = mealSlot ?? (getSuggestedMealSlot() as MealSlot | null);

        // Create food entries and logs for each item
        for (const item of suggestion.items) {
          // First, cache the AI-suggested food in the foods table
          const foodId = generateFoodId();

          const { error: foodError } = await supabase
            .from('foods')
            .insert({
              id: foodId,
              source: 'user_created',
              external_id: foodId,
              name: item.name,
              brand: suggestion.isRestaurant ? suggestion.restaurantName : 'AI Suggested',
              serving_size: parseServingSize(item.servingSize),
              serving_unit: parseServingUnit(item.servingSize),
              calories: item.calories,
              protein: item.protein,
              carbs: item.carbs,
              fat: item.fat,
            });

          if (foodError) {
            console.error('Error caching food:', foodError);
            throw new Error(`Failed to save food: ${item.name}`);
          }

          // Then create the food log entry
          const { error: logError } = await supabase
            .from('food_logs')
            .insert({
              user_id: user.id,
              food_id: foodId,
              log_date: today,
              logged_at: new Date().toISOString(),
              meal_slot: slot,
              servings: 1,
              calories_logged: item.calories,
              protein_logged: item.protein,
              carbs_logged: item.carbs,
              fat_logged: item.fat,
              quick_logged: false,
              notes: `AI suggested as part of: ${suggestion.name}`,
              is_planned: false,
            });

          if (logError) {
            console.error('Error logging food:', logError);
            throw new Error(`Failed to log food: ${item.name}`);
          }
        }

        // Notify check-in that food was logged
        dispatchFoodLoggedEvent();
      } catch (err) {
        console.error('Error logging suggestion:', err);
        setError(err instanceof Error ? err.message : 'Failed to log meal');
        throw err;
      } finally {
        setIsLogging(false);
      }
    },
    []
  );

  return {
    isLogging,
    error,
    logSuggestion,
  };
}

/**
 * Parse serving size number from string like "1 cup" or "4 oz"
 */
function parseServingSize(servingStr: string): number {
  const match = servingStr.match(/^([\d.]+)/);
  return match ? parseFloat(match[1]) : 1;
}

/**
 * Parse serving unit from string like "1 cup" or "4 oz"
 */
function parseServingUnit(servingStr: string): string {
  const match = servingStr.match(/^[\d.]+\s*(.+)$/);
  return match ? match[1].trim() : 'serving';
}
