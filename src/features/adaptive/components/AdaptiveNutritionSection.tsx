'use client';

/**
 * Phase 3: Adaptive Nutrition Section Component (Web)
 * Complete section showing all adaptive macro cards and AI suggestion
 */

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useAdaptiveTargets } from '../hooks/useAdaptiveTargets';
import { AdaptiveMacroCard } from './AdaptiveMacroCard';
import { AISuggestionBanner } from './AISuggestionBanner';
import { useState } from 'react';

// Log Food Quick Action Button - Always visible
function LogFoodButton({ calories, target }: { calories?: number; target?: number }) {
  return (
    <Link
      href="/nutrition"
      className="block w-full bg-[var(--theme-primary-dark)] hover:bg-[var(--theme-primary)] rounded-2xl p-4 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.01]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/25 flex items-center justify-center">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">Log Food</p>
            <p className="text-sm text-white/85">Search foods & restaurants</p>
          </div>
        </div>
        {calories !== undefined && target !== undefined && (
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{calories}</p>
            <p className="text-xs text-white/85">/ {target} cal</p>
          </div>
        )}
      </div>
    </Link>
  );
}

export function AdaptiveNutritionSection() {
  const { data, isLoading, error } = useAdaptiveTargets();
  const [dismissedSuggestion, setDismissedSuggestion] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <LogFoodButton />
        <div className="h-6 w-32 bg-[var(--theme-divider)] rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-36 bg-[var(--theme-divider)] rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <LogFoodButton />
        <div className="p-4 bg-[var(--theme-error)]/10 rounded-2xl border border-[var(--theme-error)]/30">
          <p className="text-sm text-[var(--theme-error)]">
            Failed to load nutrition data. Please try again.
          </p>
        </div>
      </div>
    );
  }

  // Define macro colors matching the theme
  const macroColors = {
    calories: 'var(--theme-primary)',
    protein: 'var(--theme-success)',
    carbs: 'var(--theme-accent)',
    fat: 'var(--theme-secondary)',
  };

  return (
    <div className="space-y-4">
      {/* Log Food Quick Action - Always Visible */}
      <LogFoodButton calories={data.calories.current} target={data.calories.target} />

      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--theme-text)]">
          Today's Nutrition
        </h2>
        {data.daysLoggedThisWeek > 0 && (
          <span className="text-sm text-[var(--theme-text-secondary)]">
            {data.daysLoggedThisWeek}/7 days this week
          </span>
        )}
      </div>

      {/* AI Suggestion Banner */}
      {data.suggestion && !dismissedSuggestion && (
        <AISuggestionBanner
          suggestion={data.suggestion}
          onDismiss={() => setDismissedSuggestion(true)}
        />
      )}

      {/* Macro Cards Grid */}
      <div className="grid grid-cols-2 gap-4">
        <AdaptiveMacroCard
          label="Calories"
          unit=" cal"
          trend={data.calories}
          color={macroColors.calories}
        />
        <AdaptiveMacroCard
          label="Protein"
          unit="g"
          trend={data.protein}
          color={macroColors.protein}
        />
        <AdaptiveMacroCard
          label="Carbs"
          unit="g"
          trend={data.carbs}
          color={macroColors.carbs}
        />
        <AdaptiveMacroCard
          label="Fat"
          unit="g"
          trend={data.fat}
          color={macroColors.fat}
        />
      </div>
    </div>
  );
}
