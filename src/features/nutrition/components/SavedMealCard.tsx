'use client';

import { useState } from 'react';
import { Star, MoreVertical, Trash2, Edit2, Plus, Minus } from 'lucide-react';
import type { SavedMeal } from '../types/nutrition.types';

interface SavedMealCardProps {
  meal: SavedMeal;
  onLog: (mealId: string, servingMultiplier: number) => void;
  onToggleFavorite: (mealId: string, isFavorite: boolean) => void;
  onEdit?: (meal: SavedMeal) => void;
  onDelete?: (mealId: string) => void;
}

export function SavedMealCard({
  meal,
  onLog,
  onToggleFavorite,
  onEdit,
  onDelete
}: SavedMealCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showServingPicker, setShowServingPicker] = useState(false);
  const [servingMultiplier, setServingMultiplier] = useState(1);

  const handleQuickLog = () => {
    onLog(meal.id, 1);
  };

  const handleLongPress = () => {
    setShowServingPicker(true);
  };

  const handleLogWithMultiplier = () => {
    onLog(meal.id, servingMultiplier);
    setShowServingPicker(false);
    setServingMultiplier(1);
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      {/* Main content - tap to log */}
      <button
        onClick={handleQuickLog}
        onContextMenu={(e) => {
          e.preventDefault();
          handleLongPress();
        }}
        className="w-full p-4 text-left active:bg-zinc-50 dark:active:bg-zinc-700"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{meal.name}</h3>
              {meal.is_favorite && (
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
              )}
            </div>
            <p className="text-sm text-zinc-500 mt-1">
              {meal.items?.length || 0} items • Used {meal.use_count}×
            </p>
          </div>

          {/* Macros */}
          <div className="text-right">
            <div className="font-semibold text-orange-500">
              {Math.round(meal.total_calories || 0)} cal
            </div>
            <div className="text-xs text-zinc-500">
              P: {Math.round(meal.total_protein || 0)}g •
              C: {Math.round(meal.total_carbs || 0)}g •
              F: {Math.round(meal.total_fat || 0)}g
            </div>
          </div>
        </div>

        {/* Food items preview */}
        {meal.items && meal.items.length > 0 && (
          <div className="mt-2 text-xs text-zinc-500">
            {meal.items.slice(0, 3).map((item, i) => (
              <span key={item.id}>
                {item.food?.name || 'Unknown'}
                {item.servings !== 1 && ` (${item.servings}×)`}
                {i < Math.min(meal.items!.length - 1, 2) && ', '}
              </span>
            ))}
            {meal.items.length > 3 && ` +${meal.items.length - 3} more`}
          </div>
        )}
      </button>

      {/* Action bar */}
      <div className="flex items-center border-t border-zinc-100 dark:border-zinc-700">
        <button
          onClick={() => onToggleFavorite(meal.id, !meal.is_favorite)}
          className="flex-1 py-2 flex items-center justify-center gap-1 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700"
        >
          <Star
            size={16}
            className={meal.is_favorite ? 'text-yellow-500 fill-yellow-500' : ''}
          />
          {meal.is_favorite ? 'Saved' : 'Save'}
        </button>

        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700" />

        <button
          onClick={() => setShowMenu(!showMenu)}
          className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700"
        >
          <MoreVertical size={16} />
        </button>
      </div>

      {/* Dropdown menu */}
      {showMenu && (
        <div className="border-t border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
          {onEdit && (
            <button
              onClick={() => {
                onEdit(meal);
                setShowMenu(false);
              }}
              className="w-full px-4 py-3 flex items-center gap-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700"
            >
              <Edit2 size={16} />
              Edit Meal
            </button>
          )}
          <button
            onClick={() => {
              setShowServingPicker(true);
              setShowMenu(false);
            }}
            className="w-full px-4 py-3 flex items-center gap-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            <Plus size={16} />
            Log with Different Portion
          </button>
          {onDelete && (
            <button
              onClick={() => {
                onDelete(meal.id);
                setShowMenu(false);
              }}
              className="w-full px-4 py-3 flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 size={16} />
              Delete Meal
            </button>
          )}
        </div>
      )}

      {/* Serving picker modal */}
      {showServingPicker && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-center mb-4">
              Log {meal.name}
            </h3>

            {/* Portion adjuster */}
            <div className="flex items-center justify-center gap-6 mb-6">
              <button
                onClick={() => setServingMultiplier(prev => Math.max(0.25, prev - 0.25))}
                className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center"
              >
                <Minus size={24} />
              </button>
              <div className="text-center">
                <div className="text-3xl font-bold">{servingMultiplier}×</div>
                <div className="text-sm text-zinc-500">portion</div>
              </div>
              <button
                onClick={() => setServingMultiplier(prev => prev + 0.25)}
                className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center"
              >
                <Plus size={24} />
              </button>
            </div>

            {/* Calculated totals */}
            <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3 mb-6 text-center">
              <span className="text-xl font-bold text-orange-500">
                {Math.round((meal.total_calories || 0) * servingMultiplier)} cal
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowServingPicker(false);
                  setServingMultiplier(1);
                }}
                className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleLogWithMultiplier}
                className="flex-1 py-3 bg-orange-500 text-white rounded-lg font-medium"
              >
                Log Meal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface SavedMealsListProps {
  meals: SavedMeal[];
  onLog: (mealId: string, servingMultiplier: number) => void;
  onToggleFavorite: (mealId: string, isFavorite: boolean) => void;
  onEdit?: (meal: SavedMeal) => void;
  onDelete?: (mealId: string) => void;
  emptyMessage?: string;
}

export function SavedMealsList({
  meals,
  onLog,
  onToggleFavorite,
  onEdit,
  onDelete,
  emptyMessage = "No saved meals yet"
}: SavedMealsListProps) {
  if (meals.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {meals.map(meal => (
        <SavedMealCard
          key={meal.id}
          meal={meal}
          onLog={onLog}
          onToggleFavorite={onToggleFavorite}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
