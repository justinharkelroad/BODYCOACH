'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type {
  SavedMeal,
  SavedMealItem,
  SavedMealInsert,
  SavedMealItemInsert,
} from '../types/nutrition.types';

export interface UseSavedMealsResult {
  savedMeals: SavedMeal[];
  favorites: SavedMeal[];
  isLoading: boolean;
  error: string | null;
  createMeal: (name: string, foodItems: { foodId: string; servings: number }[]) => Promise<SavedMeal>;
  updateMeal: (mealId: string, updates: { name?: string; is_favorite?: boolean }) => Promise<void>;
  deleteMeal: (mealId: string) => Promise<void>;
  addItemToMeal: (mealId: string, foodId: string, servings?: number) => Promise<void>;
  removeItemFromMeal: (mealId: string, itemId: string) => Promise<void>;
  logSavedMeal: (mealId: string, servingMultiplier?: number) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useSavedMeals(): UseSavedMealsResult {
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedMeals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSavedMeals([]);
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('saved_meals')
        .select(`
          *,
          items:saved_meal_items(
            *,
            food:foods(*)
          )
        `)
        .eq('user_id', user.id)
        .order('use_count', { ascending: false });

      if (fetchError) throw fetchError;

      setSavedMeals((data as SavedMeal[]) || []);
    } catch (err) {
      console.error('Error fetching saved meals:', err);
      setError(err instanceof Error ? err.message : 'Failed to load saved meals');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedMeals();
  }, [fetchSavedMeals]);

  const createMeal = useCallback(
    async (
      name: string,
      foodItems: { foodId: string; servings: number }[]
    ): Promise<SavedMeal> => {
      setError(null);

      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Not authenticated');
        }

        // Create the meal
        const mealInsert: SavedMealInsert = {
          user_id: user.id,
          name,
          is_favorite: false,
          use_count: 0,
          last_used_at: null,
        };

        const { data: meal, error: mealError } = await supabase
          .from('saved_meals')
          .insert(mealInsert)
          .select()
          .single();

        if (mealError) throw mealError;

        // Add items to the meal
        if (foodItems.length > 0) {
          const itemInserts: SavedMealItemInsert[] = foodItems.map(item => ({
            saved_meal_id: meal.id,
            food_id: item.foodId,
            servings: item.servings,
          }));

          const { error: itemsError } = await supabase
            .from('saved_meal_items')
            .insert(itemInserts);

          if (itemsError) throw itemsError;
        }

        // Refetch to get complete data with items
        await fetchSavedMeals();

        return meal as SavedMeal;
      } catch (err) {
        console.error('Error creating saved meal:', err);
        setError(err instanceof Error ? err.message : 'Failed to create meal');
        throw err;
      }
    },
    [fetchSavedMeals]
  );

  const updateMeal = useCallback(
    async (mealId: string, updates: { name?: string; is_favorite?: boolean }) => {
      setError(null);

      try {
        const supabase = createClient();
        const { error: updateError } = await supabase
          .from('saved_meals')
          .update(updates)
          .eq('id', mealId);

        if (updateError) throw updateError;

        // Update local state
        setSavedMeals(prev =>
          prev.map(meal =>
            meal.id === mealId ? { ...meal, ...updates } : meal
          )
        );
      } catch (err) {
        console.error('Error updating saved meal:', err);
        setError(err instanceof Error ? err.message : 'Failed to update meal');
        throw err;
      }
    },
    []
  );

  const deleteMeal = useCallback(
    async (mealId: string) => {
      setError(null);

      try {
        const supabase = createClient();
        const { error: deleteError } = await supabase
          .from('saved_meals')
          .delete()
          .eq('id', mealId);

        if (deleteError) throw deleteError;

        // Update local state
        setSavedMeals(prev => prev.filter(meal => meal.id !== mealId));
      } catch (err) {
        console.error('Error deleting saved meal:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete meal');
        throw err;
      }
    },
    []
  );

  const addItemToMeal = useCallback(
    async (mealId: string, foodId: string, servings = 1) => {
      setError(null);

      try {
        const supabase = createClient();
        const { error: insertError } = await supabase
          .from('saved_meal_items')
          .insert({
            saved_meal_id: mealId,
            food_id: foodId,
            servings,
          });

        if (insertError) throw insertError;

        await fetchSavedMeals();
      } catch (err) {
        console.error('Error adding item to meal:', err);
        setError(err instanceof Error ? err.message : 'Failed to add item');
        throw err;
      }
    },
    [fetchSavedMeals]
  );

  const removeItemFromMeal = useCallback(
    async (mealId: string, itemId: string) => {
      setError(null);

      try {
        const supabase = createClient();
        const { error: deleteError } = await supabase
          .from('saved_meal_items')
          .delete()
          .eq('id', itemId)
          .eq('saved_meal_id', mealId);

        if (deleteError) throw deleteError;

        await fetchSavedMeals();
      } catch (err) {
        console.error('Error removing item from meal:', err);
        setError(err instanceof Error ? err.message : 'Failed to remove item');
        throw err;
      }
    },
    [fetchSavedMeals]
  );

  const logSavedMeal = useCallback(
    async (mealId: string, servingMultiplier = 1) => {
      setError(null);

      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Not authenticated');
        }

        const meal = savedMeals.find(m => m.id === mealId);
        if (!meal || !meal.items) {
          throw new Error('Meal not found');
        }

        // Log each food item in the meal
        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toISOString();

        const logs = meal.items.map(item => ({
          user_id: user.id,
          food_id: item.food_id,
          log_date: today,
          logged_at: now,
          servings: item.servings * servingMultiplier,
          calories_logged: (item.food?.calories || 0) * item.servings * servingMultiplier,
          protein_logged: (item.food?.protein || 0) * item.servings * servingMultiplier,
          carbs_logged: (item.food?.carbs || 0) * item.servings * servingMultiplier,
          fat_logged: (item.food?.fat || 0) * item.servings * servingMultiplier,
          quick_logged: true,
          notes: `From saved meal: ${meal.name}`,
        }));

        const { error: logError } = await supabase
          .from('food_logs')
          .insert(logs);

        if (logError) throw logError;

        // Update meal usage stats
        await supabase
          .from('saved_meals')
          .update({
            use_count: (meal.use_count || 0) + 1,
            last_used_at: now,
          })
          .eq('id', mealId);

        // Update local state
        setSavedMeals(prev =>
          prev.map(m =>
            m.id === mealId
              ? { ...m, use_count: (m.use_count || 0) + 1, last_used_at: now }
              : m
          )
        );
      } catch (err) {
        console.error('Error logging saved meal:', err);
        setError(err instanceof Error ? err.message : 'Failed to log meal');
        throw err;
      }
    },
    [savedMeals]
  );

  const favorites = savedMeals.filter(meal => meal.is_favorite);

  return {
    savedMeals,
    favorites,
    isLoading,
    error,
    createMeal,
    updateMeal,
    deleteMeal,
    addItemToMeal,
    removeItemFromMeal,
    logSavedMeal,
    refetch: fetchSavedMeals,
  };
}
