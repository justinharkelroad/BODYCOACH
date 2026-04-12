'use client';

import { Clock, MapPin, Check, Loader2 } from 'lucide-react';
import type { MealSuggestion } from '../types';

interface SuggestionCardProps {
  suggestion: MealSuggestion;
  onLog: (suggestion: MealSuggestion) => void;
  isLogging?: boolean;
}

/**
 * Card displaying a single meal suggestion with items and macros
 */
export function SuggestionCard({
  suggestion,
  onLog,
  isLogging = false,
}: SuggestionCardProps) {
  return (
    <div className="bg-white border border-[rgba(184,169,232,0.1)] rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[rgba(184,169,232,0.1)]">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-[var(--neutral-dark)]">
              {suggestion.name}
            </h3>
            <p className="text-sm text-[var(--neutral-gray)] mt-1">
              {suggestion.description}
            </p>
          </div>
          {suggestion.isRestaurant && suggestion.restaurantName && (
            <div className="flex items-center gap-1 text-xs text-[var(--primary-deep)] bg-[rgba(184,169,232,0.1)] px-2 py-1 rounded-full shrink-0">
              <MapPin className="h-3 w-3" />
              {suggestion.restaurantName}
            </div>
          )}
        </div>

        {suggestion.prepTime && !suggestion.isRestaurant && (
          <div className="flex items-center gap-1 text-xs text-[var(--neutral-gray)] mt-2">
            <Clock className="h-3 w-3" />
            {suggestion.prepTime}
          </div>
        )}
      </div>

      {/* Items */}
      <div className="p-4 space-y-2">
        {suggestion.items.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-sm py-2 border-b border-[rgba(184,169,232,0.05)] last:border-0"
          >
            <div className="flex-1 min-w-0">
              <div className="text-[var(--neutral-dark)] truncate">{item.name}</div>
              <div className="text-xs text-[var(--neutral-gray)]">
                {item.servingSize}
              </div>
            </div>
            <div className="text-right text-xs text-[var(--neutral-gray)] shrink-0 ml-2">
              <div className="font-medium text-orange-500">{item.calories} cal</div>
              <div>P: {item.protein}g</div>
            </div>
          </div>
        ))}
      </div>

      {/* Total Macros */}
      <div className="px-4 py-3 bg-[var(--neutral-gray-light)]">
        <div className="grid grid-cols-4 gap-2 text-center text-sm">
          <div>
            <div className="font-bold text-orange-500">{suggestion.totalCalories}</div>
            <div className="text-xs text-[var(--neutral-gray)]">cal</div>
          </div>
          <div>
            <div className="font-semibold text-[var(--accent-coral)]">{suggestion.totalProtein}g</div>
            <div className="text-xs text-[var(--neutral-gray)]">protein</div>
          </div>
          <div>
            <div className="font-semibold text-[var(--primary-deep)]">{suggestion.totalCarbs}g</div>
            <div className="text-xs text-[var(--neutral-gray)]">carbs</div>
          </div>
          <div>
            <div className="font-semibold text-[var(--success)]">{suggestion.totalFat}g</div>
            <div className="text-xs text-[var(--neutral-gray)]">fat</div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="p-4 pt-3">
        <button
          onClick={() => onLog(suggestion)}
          disabled={isLogging}
          className="w-full py-3 bg-[var(--primary-deep)] text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[var(--primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLogging ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Logging...
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Log This Meal
            </>
          )}
        </button>
      </div>
    </div>
  );
}
