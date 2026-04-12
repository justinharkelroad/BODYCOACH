'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Barcode, Plus, Minus, Check } from 'lucide-react';
import { useFoodSearch } from '../hooks/useFoodSearch';
import { FatSecretAttribution } from './FatSecretAttribution';
import type { FoodSearchResult, MealSlot } from '../types/nutrition.types';

interface FoodSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFood: (food: FoodSearchResult, servings: number, mealSlot?: MealSlot) => void;
  onScanBarcode?: () => void;
  defaultMealSlot?: MealSlot | null;
}

export function FoodSearchModal({
  isOpen,
  onClose,
  onSelectFood,
  onScanBarcode,
  defaultMealSlot
}: FoodSearchModalProps) {
  const { query, setQuery, results, isLoading, error, clear } = useFoodSearch();
  const [selectedFood, setSelectedFood] = useState<FoodSearchResult | null>(null);
  const [servings, setServings] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      clear();
      setSelectedFood(null);
      setServings(1);
    }
  }, [isOpen, clear]);

  const handleSelectFood = (food: FoodSearchResult) => {
    setSelectedFood(food);
    setServings(1);
  };

  const handleConfirm = () => {
    if (selectedFood) {
      onSelectFood(selectedFood, servings, defaultMealSlot || undefined);
      onClose();
    }
  };

  const handleServingChange = (delta: number) => {
    setServings(prev => Math.max(0.25, Math.round((prev + delta) * 4) / 4));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center">
      <div className="bg-[var(--theme-surface)] w-full sm:max-w-lg sm:rounded-[24px] rounded-t-[24px] max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center gap-2 p-4 border-b border-[rgba(184,169,232,0.1)]">
          <div className="flex-1 flex items-center bg-[var(--neutral-gray-light)] rounded-xl">
            <Search className="ml-3 text-[var(--neutral-gray)] flex-shrink-0" size={20} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search foods..."
              className="flex-1 px-2 py-2 bg-transparent rounded-xl focus:outline-none text-[var(--neutral-dark)]"
            />
            {onScanBarcode && (
              <button
                type="button"
                onClick={onScanBarcode}
                className="mr-1 p-1.5 bg-[var(--primary-deep)] rounded-lg text-white hover:opacity-90 transition-opacity flex-shrink-0"
                title="Scan barcode"
              >
                <Barcode size={20} />
              </button>
            )}
          </div>
          <button onClick={onClose} className="p-2 text-[var(--neutral-gray)]">
            <X size={24} />
          </button>
        </div>

        {/* Results or serving selector */}
        {selectedFood ? (
          // Serving selector
          <div className="flex-1 p-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-[var(--neutral-dark)]">{selectedFood.name}</h3>
              {selectedFood.brand && (
                <p className="text-sm text-[var(--neutral-gray)]">{selectedFood.brand}</p>
              )}
              <p className="text-sm text-[var(--neutral-gray)] mt-1">
                {selectedFood.serving_size} {selectedFood.serving_unit} per serving
              </p>
            </div>

            {/* Serving adjuster - large thumb-friendly buttons */}
            <div className="flex items-center justify-center gap-6 mb-6">
              <button
                onClick={() => handleServingChange(-0.25)}
                className="w-16 h-16 rounded-full bg-[var(--neutral-gray-light)] flex items-center justify-center active:bg-[rgba(184,169,232,0.2)] text-[var(--neutral-dark)]"
              >
                <Minus size={28} />
              </button>
              <div className="text-center">
                <div className="text-4xl font-bold text-[var(--neutral-dark)]">{servings}</div>
                <div className="text-sm text-[var(--neutral-gray)]">servings</div>
              </div>
              <button
                onClick={() => handleServingChange(0.25)}
                className="w-16 h-16 rounded-full bg-[var(--neutral-gray-light)] flex items-center justify-center active:bg-[rgba(184,169,232,0.2)] text-[var(--neutral-dark)]"
              >
                <Plus size={28} />
              </button>
            </div>

            {/* Calculated macros */}
            <div className="bg-[var(--neutral-gray-light)] rounded-xl p-4 mb-6">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-orange-500">
                    {Math.round(selectedFood.calories * servings)}
                  </div>
                  <div className="text-xs text-[var(--neutral-gray)]">cal</div>
                </div>
                <div>
                  <div className="text-xl font-semibold text-[var(--accent-coral)]">
                    {Math.round(selectedFood.protein * servings)}g
                  </div>
                  <div className="text-xs text-[var(--neutral-gray)]">protein</div>
                </div>
                <div>
                  <div className="text-xl font-semibold text-[var(--primary-deep)]">
                    {Math.round(selectedFood.carbs * servings)}g
                  </div>
                  <div className="text-xs text-[var(--neutral-gray)]">carbs</div>
                </div>
                <div>
                  <div className="text-xl font-semibold text-[var(--success)]">
                    {Math.round(selectedFood.fat * servings)}g
                  </div>
                  <div className="text-xs text-[var(--neutral-gray)]">fat</div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedFood(null)}
                className="flex-1 py-3 bg-[var(--neutral-gray-light)] rounded-xl font-medium text-[var(--neutral-dark)]"
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 bg-[var(--primary-deep)] text-white rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <Check size={20} />
                Add
              </button>
            </div>
          </div>
        ) : (
          // Search results
          <div className="flex-1 overflow-y-auto">
            {isLoading && results.length === 0 ? (
              <div className="p-4 space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-[var(--neutral-gray-light)] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="p-4 text-center text-[var(--accent-coral)]">
                {error}
              </div>
            ) : results.length === 0 && query.length >= 2 ? (
              <div className="p-4 text-center text-[var(--neutral-gray)]">
                No foods found for "{query}"
              </div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center text-[var(--neutral-gray)]">
                Start typing to search foods
              </div>
            ) : (
              <div className="divide-y divide-[rgba(184,169,232,0.1)]">
                {results.map((food, index) => (
                  <button
                    key={`${food.source}-${food.external_id}-${index}`}
                    onClick={() => handleSelectFood(food)}
                    className="w-full p-4 flex items-center gap-3 text-left hover:bg-[var(--neutral-gray-light)] active:bg-[rgba(184,169,232,0.15)]"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[var(--neutral-dark)] truncate">{food.name}</div>
                      {food.brand && (
                        <div className="text-sm text-[var(--neutral-gray)] truncate">{food.brand}</div>
                      )}
                      <div className="text-xs text-[var(--neutral-gray)]">
                        {food.serving_size}{food.serving_unit} • P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-semibold text-orange-500">{Math.round(food.calories)}</div>
                      <div className="text-xs text-[var(--neutral-gray)]">cal</div>
                    </div>
                  </button>
                ))}
                {/* FatSecret attribution - required for free tier */}
                <div className="p-3 text-center">
                  <FatSecretAttribution />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
