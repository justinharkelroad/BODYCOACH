'use client';

import { useRef } from 'react';
import { Plus } from 'lucide-react';
import type { QuickLogAction, Food } from '../types/nutrition.types';

interface QuickActionButtonProps {
  food: Food;
  frequency: number;
  onTap: () => void;
  onLongPress: () => void;
}

function QuickActionButton({ food, frequency, onTap, onLongPress }: QuickActionButtonProps) {
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  const handleTouchStart = () => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      onLongPress();
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    if (!isLongPress.current) {
      onTap();
    }
  };

  const handleTouchCancel = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  // Get initials or emoji for the food
  const getDisplayChar = (name: string) => {
    // Common food emojis based on keywords
    const emojiMap: Record<string, string> = {
      chicken: '🍗',
      beef: '🥩',
      fish: '🐟',
      salmon: '🐟',
      egg: '🥚',
      bread: '🍞',
      rice: '🍚',
      pasta: '🍝',
      salad: '🥗',
      apple: '🍎',
      banana: '🍌',
      orange: '🍊',
      milk: '🥛',
      cheese: '🧀',
      yogurt: '🥛',
      coffee: '☕',
      tea: '🍵',
      water: '💧',
      juice: '🧃',
      smoothie: '🥤',
      pizza: '🍕',
      burger: '🍔',
      sandwich: '🥪',
      soup: '🍲',
      oatmeal: '🥣',
      cereal: '🥣',
      protein: '💪',
      shake: '🥤',
    };

    const lowerName = name.toLowerCase();
    for (const [keyword, emoji] of Object.entries(emojiMap)) {
      if (lowerName.includes(keyword)) {
        return emoji;
      }
    }

    // Default to first letter
    return name.charAt(0).toUpperCase();
  };

  const displayChar = getDisplayChar(food.name);
  const isEmoji = displayChar.length > 1;

  return (
    <button
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchCancel}
      className="flex flex-col items-center gap-1 flex-shrink-0"
    >
      <div className="w-14 h-14 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary-deep)] shadow-sm active:scale-95 transition-transform">
        <span className={isEmoji ? 'text-2xl' : 'text-xl font-bold'}>
          {displayChar}
        </span>
      </div>
      <span className="text-xs text-[var(--neutral-gray)] max-w-14 truncate text-center">
        {food.name.split(' ')[0]}
      </span>
      {frequency > 5 && (
        <span className="text-[10px] text-[var(--neutral-gray)]">
          {frequency}×
        </span>
      )}
    </button>
  );
}

interface QuickActionsBarProps {
  actions: QuickLogAction[];
  onQuickLog: (food: Food, servings: number) => void;
  onLongPress: (food: Food) => void;
  onAddNew: () => void;
  isLoading?: boolean;
}

export function QuickActionsBar({
  actions,
  onQuickLog,
  onLongPress,
  onAddNew,
  isLoading
}: QuickActionsBarProps) {
  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="w-14 h-14 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
            <div className="w-10 h-3 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {/* Add new button */}
        <button
          onClick={onAddNew}
          className="flex flex-col items-center gap-1 flex-shrink-0"
        >
          <div className="w-14 h-14 rounded-full border-2 border-dashed border-[rgba(184,169,232,0.3)] flex items-center justify-center text-[var(--neutral-gray)] active:scale-95 transition-transform">
            <Plus size={24} />
          </div>
          <span className="text-xs text-[var(--neutral-gray)]">Add</span>
        </button>

        {/* Quick action buttons */}
        {actions.map((action) => (
          <QuickActionButton
            key={action.food.id}
            food={action.food}
            frequency={action.frequency}
            onTap={() => onQuickLog(action.food, action.typicalServings)}
            onLongPress={() => onLongPress(action.food)}
          />
        ))}

        {actions.length === 0 && (
          <div className="flex items-center px-4 text-sm text-[var(--neutral-gray)]">
            Your frequent foods will appear here
          </div>
        )}
      </div>

      {/* Fade edge indicator */}
      {actions.length > 4 && (
        <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-white dark:from-zinc-900 to-transparent pointer-events-none" />
      )}
    </div>
  );
}
