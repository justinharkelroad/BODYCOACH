'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import { SuggestionCard } from './SuggestionCard';
import { useMealSuggestions } from '../hooks/useMealSuggestions';
import { useLogSuggestion } from '../hooks/useLogSuggestion';
import type { MealType, MealSuggestion } from '../types';
import type { MealSlot } from '@/features/nutrition/types/nutrition.types';

interface MealSuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  remainingMacros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  onMealLogged?: () => void;
}

const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
];

/**
 * Get suggested meal type based on current time
 */
function getSuggestedMealType(): MealType {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 10) return 'breakfast';
  if (hour >= 11 && hour < 14) return 'lunch';
  if (hour >= 17 && hour < 20) return 'dinner';
  return 'snack';
}

/**
 * Modal for AI meal suggestions
 */
export function MealSuggestionsModal({
  isOpen,
  onClose,
  remainingMacros,
  onMealLogged,
}: MealSuggestionsModalProps) {
  const [selectedMealType, setSelectedMealType] = useState<MealType>(getSuggestedMealType);
  const [loggingId, setLoggingId] = useState<string | null>(null);

  const {
    suggestions,
    isLoading,
    error,
    fetchSuggestions,
    clear,
  } = useMealSuggestions();

  const { logSuggestion, isLogging } = useLogSuggestion();

  // Fetch suggestions when modal opens or meal type changes
  useEffect(() => {
    if (isOpen && remainingMacros.calories > 200) {
      fetchSuggestions(remainingMacros, selectedMealType);
    }
  }, [isOpen, selectedMealType, remainingMacros, fetchSuggestions]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      clear();
      setLoggingId(null);
    }
  }, [isOpen, clear]);

  const handleMealTypeChange = (mealType: MealType) => {
    setSelectedMealType(mealType);
  };

  const handleRefresh = () => {
    fetchSuggestions(remainingMacros, selectedMealType);
  };

  const handleLogMeal = async (suggestion: MealSuggestion) => {
    try {
      setLoggingId(suggestion.id);
      // Map meal type to meal slot
      const mealSlot = selectedMealType as MealSlot;
      await logSuggestion(suggestion, mealSlot);
      onMealLogged?.();
      onClose();
    } catch {
      // Error is handled in hook
    } finally {
      setLoggingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center">
      <div className="bg-[var(--theme-surface)] w-full sm:max-w-2xl sm:rounded-[24px] rounded-t-[24px] max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[rgba(184,169,232,0.1)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[rgba(184,169,232,0.1)] rounded-lg">
              <Sparkles className="h-5 w-5 text-[var(--primary-deep)]" />
            </div>
            <div>
              <h2 className="font-semibold text-[var(--neutral-dark)]">
                AI Meal Suggestions
              </h2>
              <p className="text-sm text-[var(--neutral-gray)]">
                {remainingMacros.calories} cal remaining
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--neutral-gray)] hover:text-[var(--neutral-dark)] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Meal Type Selector */}
        <div className="px-4 pt-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {MEAL_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => handleMealTypeChange(type.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedMealType === type.value
                    ? 'bg-[var(--primary-deep)] text-white'
                    : 'bg-[var(--neutral-gray-light)] text-[var(--neutral-dark)] hover:bg-[rgba(184,169,232,0.2)]'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-[var(--primary-deep)] border-t-transparent rounded-full animate-spin" />
                <Sparkles className="absolute inset-0 m-auto h-5 w-5 text-[var(--primary-deep)]" />
              </div>
              <p className="text-[var(--neutral-gray)] mt-4">
                Creating meal suggestions...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="p-4 bg-red-50 rounded-xl text-center">
                <p className="text-red-600 font-medium">Unable to get suggestions</p>
                <p className="text-red-500 text-sm mt-1">{error}</p>
              </div>
              <button
                onClick={handleRefresh}
                className="mt-4 flex items-center gap-2 text-[var(--primary-deep)] font-medium"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-[var(--neutral-gray)]">
                No suggestions available
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onLog={handleLogMeal}
                  isLogging={isLogging && loggingId === suggestion.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLoading && suggestions.length > 0 && (
          <div className="p-4 border-t border-[rgba(184,169,232,0.1)]">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="w-full py-3 bg-[var(--neutral-gray-light)] text-[var(--neutral-dark)] rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[rgba(184,169,232,0.2)] transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Get Different Ideas
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
