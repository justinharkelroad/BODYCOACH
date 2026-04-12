'use client';

import { useState, useMemo } from 'react';
import { Plus, Barcode, Calendar, ChevronLeft, ChevronRight, UtensilsCrossed, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MacroBars, CalorieDisplay } from './MacroRings';
import { FoodLogList } from './FoodLogItem';
import { QuickActionsBar } from './QuickActionsBar';
import { FoodSearchModal } from './FoodSearchModal';
import { BarcodeScanner, BarcodeNotFoundModal } from './BarcodeScanner';
import { useNutritionProfile } from '../hooks/useNutritionProfile';
import { useFoodLog } from '../hooks/useFoodLog';
import { useFrequentFoods } from '../hooks/useFrequentFoods';
import { calculateDailyProgress } from '../services/nutritionCalculator';
import { cacheFood } from '../services/foodCacheService';
import type { FoodSearchResult, Food, NormalizedFood, MealSlot } from '../types/nutrition.types';
import { useFoodLogIntegration, useBarcodeScannedIntegration } from '@/features/streaks';
import { useMilestoneCelebration } from '@/features/milestones';
import { isFeatureEnabled } from '@/lib/featureFlags';
import { SuggestMealButton, MealSuggestionsModal } from '@/features/ai-suggestions';

interface NutritionDashboardProps {
  initialDate?: string;
}

export function NutritionDashboard({ initialDate }: NutritionDashboardProps) {
  // Date navigation
  const [selectedDate, setSelectedDate] = useState(() => {
    return initialDate || new Date().toISOString().split('T')[0];
  });

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  // Modal states
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [notFoundBarcode, setNotFoundBarcode] = useState<string | null>(null);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);

  // Data hooks
  const { profile, isLoading: profileLoading } = useNutritionProfile();
  const { logs, addLog, updateLog, deleteLog, getDailySummary, isLoading: logsLoading } = useFoodLog(selectedDate);
  const { quickActions, isLoading: quickActionsLoading } = useFrequentFoods();

  // Streak and milestone integration
  const { onFoodLogged } = useFoodLogIntegration();
  const { onBarcodeScanned } = useBarcodeScannedIntegration();
  const { queueCelebrations } = useMilestoneCelebration();

  // Calculate daily progress
  const dailyProgress = useMemo(() => {
    const summary = getDailySummary(selectedDate);
    const targets = {
      calories: profile?.target_calories || 2000,
      protein: profile?.target_protein || 150,
      carbs: profile?.target_carbs || 200,
      fat: profile?.target_fat || 65,
    };
    return calculateDailyProgress(
      {
        calories: summary.total_calories,
        protein: summary.total_protein,
        carbs: summary.total_carbs,
        fat: summary.total_fat,
      },
      targets
    );
  }, [getDailySummary, selectedDate, profile]);

  // Date navigation
  const navigateDate = (delta: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + delta);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) {
      return 'Today';
    }
    if (dateStr === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle food selection from search
  const handleSelectFood = async (food: FoodSearchResult, servings: number, mealSlot?: MealSlot) => {
    try {
      const cachedFood = await cacheFood(food);
      await addLog(cachedFood.id, servings, { mealSlot });

      // Update streaks and check milestones
      const { newMilestones } = await onFoodLogged();
      if (newMilestones.length > 0) {
        queueCelebrations(newMilestones);
      }
    } catch (error) {
      console.error('Error adding food:', error);
    }
  };

  // Handle quick log
  const handleQuickLog = async (food: Food, servings: number) => {
    try {
      await addLog(food.id, servings, { quickLogged: true });

      // Update streaks and check milestones
      const { newMilestones } = await onFoodLogged();
      if (newMilestones.length > 0) {
        queueCelebrations(newMilestones);
      }
    } catch (error) {
      console.error('Error quick logging:', error);
    }
  };

  // Handle barcode found
  const handleBarcodeFound = async (food: NormalizedFood) => {
    try {
      const cachedFood = await cacheFood(food);
      await addLog(cachedFood.id, 1);

      // Check for scan milestones
      const scanMilestones = await onBarcodeScanned();

      // Update streaks and check logging milestones
      const { newMilestones } = await onFoodLogged();
      const allNewMilestones = [...scanMilestones, ...newMilestones];

      if (allNewMilestones.length > 0) {
        queueCelebrations(allNewMilestones);
      }
    } catch (error) {
      console.error('Error adding scanned food:', error);
    }
  };

  // Handle barcode not found
  const handleBarcodeNotFound = (barcode: string) => {
    setNotFoundBarcode(barcode);
  };

  // Handle creating food manually with barcode
  const handleCreateFoodWithBarcode = (barcode: string) => {
    setNotFoundBarcode(null);
    console.log('Create food with barcode:', barcode);
  };

  const isLoading = profileLoading || logsLoading;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Date Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[var(--neutral-dark)]">
            Nutrition
          </h1>
          <p className="text-sm text-[var(--neutral-gray)] mt-1">
            Track your daily food intake
          </p>
        </div>

        {/* Date Picker */}
        <div className="flex items-center gap-2 bg-[var(--theme-surface)] rounded-xl border border-[rgba(184,169,232,0.1)] shadow-sm">
          <button
            onClick={() => navigateDate(-1)}
            className="p-2 text-[var(--neutral-gray)] hover:text-[var(--neutral-dark)] transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button className="flex items-center gap-2 px-3 py-2 font-medium text-[var(--neutral-dark)]">
            <Calendar className="h-4 w-4 text-[var(--primary-deep)]" />
            {formatDate(selectedDate)}
          </button>
          <button
            onClick={() => navigateDate(1)}
            disabled={isToday}
            className="p-2 text-[var(--neutral-gray)] hover:text-[var(--neutral-dark)] transition-colors disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Calories */}
        <Card className="col-span-2">
          <CardContent className="p-4 sm:p-6">
            {isLoading ? (
              <div className="h-24 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-[var(--primary-deep)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[rgba(255,149,0,0.1)] rounded-xl">
                  <Flame className="h-6 w-6 text-orange-500" />
                </div>
                <div className="flex-1">
                  <CalorieDisplay
                    current={dailyProgress.calories.current}
                    target={dailyProgress.calories.target}
                    breastfeedingAdd={profile?.breastfeeding_calorie_add}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Protein */}
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-semibold text-[var(--accent-coral)]">
                {Math.round(dailyProgress.protein.current)}g
              </p>
              <p className="text-xs text-[var(--neutral-gray)]">
                / {dailyProgress.protein.target}g protein
              </p>
              <div className="mt-2 h-1.5 bg-[var(--neutral-gray-light)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--accent-coral)] rounded-full transition-all"
                  style={{ width: `${Math.min(dailyProgress.protein.percentage, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Carbs */}
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-semibold text-[var(--primary-deep)]">
                {Math.round(dailyProgress.carbs.current)}g
              </p>
              <p className="text-xs text-[var(--neutral-gray)]">
                / {dailyProgress.carbs.target}g carbs
              </p>
              <div className="mt-2 h-1.5 bg-[var(--neutral-gray-light)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--primary-deep)] rounded-full transition-all"
                  style={{ width: `${Math.min(dailyProgress.carbs.percentage, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Add Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Quick Add</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <QuickActionsBar
            actions={quickActions}
            onQuickLog={handleQuickLog}
            onLongPress={() => setShowSearchModal(true)}
            onAddNew={() => setShowSearchModal(true)}
            isLoading={quickActionsLoading}
          />

          {/* AI Meal Suggestions Button */}
          {isFeatureEnabled('aiMealSuggestions') && (
            <SuggestMealButton
              remainingCalories={Math.max(0, dailyProgress.calories.target - dailyProgress.calories.current)}
              onClick={() => setShowSuggestionsModal(true)}
            />
          )}
        </CardContent>
      </Card>

      {/* Food Log */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              {isToday ? "Today's Food" : 'Food Log'}
            </CardTitle>
            <span className="text-sm text-[var(--neutral-gray)]">
              {logs.length} {logs.length === 1 ? 'item' : 'items'}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <FoodLogList
            logs={logs}
            onDelete={deleteLog}
            onUpdateServings={(logId, servings) => updateLog(logId, { servings })}
            emptyMessage={isToday ? "Start logging to track your nutrition" : "No foods logged this day"}
          />
        </CardContent>
      </Card>

      {/* Action Button */}
      <Button
        onClick={() => setShowSearchModal(true)}
        className="w-full sm:w-auto"
      >
        <Plus className="h-4 w-4 mr-2" />
        Search & Add Food
      </Button>

      {/* Modals */}
      <FoodSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelectFood={handleSelectFood}
        onScanBarcode={() => {
          setShowSearchModal(false);
          setShowBarcodeScanner(true);
        }}
      />

      <BarcodeScanner
        isOpen={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onFoodFound={handleBarcodeFound}
        onNotFound={handleBarcodeNotFound}
      />

      <BarcodeNotFoundModal
        isOpen={notFoundBarcode !== null}
        barcode={notFoundBarcode || ''}
        onClose={() => setNotFoundBarcode(null)}
        onCreateFood={handleCreateFoodWithBarcode}
      />

      {/* AI Meal Suggestions Modal */}
      {isFeatureEnabled('aiMealSuggestions') && (
        <MealSuggestionsModal
          isOpen={showSuggestionsModal}
          onClose={() => setShowSuggestionsModal(false)}
          remainingMacros={{
            calories: Math.max(0, dailyProgress.calories.target - dailyProgress.calories.current),
            protein: Math.max(0, dailyProgress.protein.target - dailyProgress.protein.current),
            carbs: Math.max(0, dailyProgress.carbs.target - dailyProgress.carbs.current),
            fat: Math.max(0, dailyProgress.fat.target - dailyProgress.fat.current),
          }}
          onMealLogged={() => {
            // Refetch logs after logging a meal
            // The useFoodLog hook will automatically update
          }}
        />
      )}
    </div>
  );
}
