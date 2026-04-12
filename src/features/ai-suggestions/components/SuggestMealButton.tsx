'use client';

import { Sparkles } from 'lucide-react';

interface SuggestMealButtonProps {
  remainingCalories: number;
  onClick: () => void;
  disabled?: boolean;
}

/**
 * Button to open AI meal suggestions modal
 * Shows remaining calories as subtitle
 */
export function SuggestMealButton({
  remainingCalories,
  onClick,
  disabled = false,
}: SuggestMealButtonProps) {
  // Only show when remaining calories > 200
  if (remainingCalories <= 200) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-[var(--primary-deep)] to-[var(--primary)] rounded-xl text-white shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-lg">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="text-left">
          <div className="font-semibold">Suggest a Meal</div>
          <div className="text-sm text-white/80">
            {remainingCalories} cal remaining
          </div>
        </div>
      </div>
      <div className="text-white/80">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </button>
  );
}
