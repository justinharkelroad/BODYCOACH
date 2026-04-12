'use client';

import { useState, useCallback } from 'react';
import type {
  MealSuggestion,
  MealSuggestionRequest,
  MealSuggestionsResponse,
  MealType,
} from '../types';

export interface UseMealSuggestionsResult {
  suggestions: MealSuggestion[];
  isLoading: boolean;
  error: string | null;
  requestId: string | null;
  fetchSuggestions: (
    remainingMacros: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    },
    mealType: MealType,
    preferences?: MealSuggestionRequest['preferences']
  ) => Promise<void>;
  clear: () => void;
}

/**
 * Hook to fetch AI-powered meal suggestions
 */
export function useMealSuggestions(): UseMealSuggestionsResult {
  const [suggestions, setSuggestions] = useState<MealSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  const fetchSuggestions = useCallback(
    async (
      remainingMacros: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
      },
      mealType: MealType,
      preferences?: MealSuggestionRequest['preferences']
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const request: MealSuggestionRequest = {
          remainingCalories: remainingMacros.calories,
          remainingProtein: remainingMacros.protein,
          remainingCarbs: remainingMacros.carbs,
          remainingFat: remainingMacros.fat,
          mealType,
          preferences,
        };

        const response = await fetch('/api/nutrition/meal-suggestions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch meal suggestions');
        }

        const data: MealSuggestionsResponse = await response.json();
        setSuggestions(data.suggestions);
        setRequestId(data.requestId);
      } catch (err) {
        console.error('Error fetching meal suggestions:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch suggestions');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clear = useCallback(() => {
    setSuggestions([]);
    setError(null);
    setRequestId(null);
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    requestId,
    fetchSuggestions,
    clear,
  };
}
