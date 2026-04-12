/**
 * Phase 3: Adaptive Daily Targets - Calculation Utilities (Web)
 */

import type {
  TrendStatus,
  MacroTrend,
  AISuggestion,
  AdaptiveTargets,
  DailyNutritionSummary,
} from '../types';

// ============================================================================
// TREND STATUS CALCULATION
// ============================================================================

/**
 * Determine trend status based on percentage of target
 * @param percentage - Current value as percentage of target (0-100+)
 * @returns Trend status
 */
export function getTrendStatus(percentage: number): TrendStatus {
  if (percentage < 85) return 'below';
  if (percentage > 115) return 'above';
  return 'on_track';
}

/**
 * Get display label for trend status
 */
export function getTrendLabel(status: TrendStatus): string {
  switch (status) {
    case 'on_track':
      return 'On Track';
    case 'above':
      return 'Above';
    case 'below':
      return 'Below';
  }
}

/**
 * Get icon for trend status
 */
export function getTrendIcon(status: TrendStatus): string {
  switch (status) {
    case 'on_track':
      return 'check';
    case 'above':
      return 'arrow-up';
    case 'below':
      return 'arrow-down';
  }
}

// ============================================================================
// MACRO TREND CALCULATION
// ============================================================================

/**
 * Calculate macro trend from current value, target, and historical data
 */
export function calculateMacroTrend(
  current: number,
  target: number,
  yesterday: number | null,
  weekData: number[]
): MacroTrend {
  const percentageOfTarget = target > 0 ? Math.round((current / target) * 100) : 0;
  const weekAverage =
    weekData.length > 0
      ? Math.round(weekData.reduce((sum, val) => sum + val, 0) / weekData.length)
      : null;

  return {
    current,
    target,
    yesterday,
    weekAverage,
    trend: getTrendStatus(percentageOfTarget),
    percentageOfTarget,
    remaining: Math.max(0, target - current),
  };
}

// ============================================================================
// AI SUGGESTION GENERATION
// ============================================================================

interface SuggestionContext {
  calories: MacroTrend;
  protein: MacroTrend;
  carbs: MacroTrend;
  fat: MacroTrend;
  daysLoggedThisWeek: number;
  hasLoggedToday: boolean;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
}

/**
 * Generate contextual AI suggestion based on current nutrition state
 */
export function generateSuggestion(context: SuggestionContext): AISuggestion | null {
  const { calories, protein, carbs, fat, daysLoggedThisWeek, hasLoggedToday, timeOfDay } = context;

  // Priority 1: Celebrate consistency
  if (daysLoggedThisWeek >= 5 && protein.weekAverage && protein.weekAverage >= protein.target * 0.9) {
    return {
      type: 'encouragement',
      icon: '🏆',
      message: `Amazing! You've hit your protein goal ${daysLoggedThisWeek} days this week. Keep that momentum!`,
    };
  }

  // Priority 2: Warn about severe under-eating
  if (
    calories.weekAverage &&
    calories.weekAverage < calories.target * 0.7 &&
    daysLoggedThisWeek >= 3
  ) {
    return {
      type: 'warning',
      icon: '⚠️',
      message: `Your average intake is ${Math.round((calories.weekAverage / calories.target) * 100)}% of your target. Eating too little can slow your metabolism.`,
    };
  }

  // Priority 3: Evening protein reminder
  if (
    timeOfDay === 'evening' &&
    hasLoggedToday &&
    protein.percentageOfTarget < 70 &&
    protein.remaining > 30
  ) {
    return {
      type: 'tip',
      icon: '🥩',
      message: `You need ${protein.remaining}g more protein today. Try Greek yogurt, cottage cheese, or a protein shake.`,
      action: {
        label: 'Log Food',
        href: '/nutrition',
      },
    };
  }

  // Priority 4: Midday check-in
  if (timeOfDay === 'afternoon' && hasLoggedToday && calories.percentageOfTarget < 40) {
    return {
      type: 'tip',
      icon: '🍽️',
      message: `You're at ${calories.percentageOfTarget}% of your calories. Don't forget to log lunch!`,
      action: {
        label: 'Log Lunch',
        href: '/nutrition',
      },
    };
  }

  // Priority 5: Week consistency encouragement
  if (daysLoggedThisWeek >= 3 && daysLoggedThisWeek < 5) {
    return {
      type: 'encouragement',
      icon: '🔥',
      message: `${daysLoggedThisWeek} days logged this week! ${5 - daysLoggedThisWeek} more to hit your weekly goal.`,
    };
  }

  // Priority 6: Protein week average low
  if (protein.weekAverage && protein.weekAverage < protein.target * 0.75 && daysLoggedThisWeek >= 3) {
    return {
      type: 'tip',
      icon: '💪',
      message: `Your protein average is ${Math.round((protein.weekAverage / protein.target) * 100)}% of target. Try adding protein to each meal.`,
    };
  }

  // Priority 7: Morning motivation
  if (timeOfDay === 'morning' && !hasLoggedToday) {
    return {
      type: 'tip',
      icon: '☀️',
      message: `Good morning! Start your day right by logging breakfast.`,
      action: {
        label: 'Log Breakfast',
        href: '/nutrition',
      },
    };
  }

  return null;
}

/**
 * Get current time of day
 */
export function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

// ============================================================================
// MAIN CALCULATION FUNCTION
// ============================================================================

interface CalculateAdaptiveTargetsParams {
  /** Today's current totals */
  todayCurrent: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  /** User's target values */
  userTargets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  /** Yesterday's summary (null if no data) */
  yesterday: DailyNutritionSummary | null;
  /** Last 7 days of summaries (excluding today) */
  weekSummaries: DailyNutritionSummary[];
}

/**
 * Calculate complete adaptive targets with trends and suggestion
 */
export function calculateAdaptiveTargets(
  params: CalculateAdaptiveTargetsParams
): AdaptiveTargets {
  const { todayCurrent, userTargets, yesterday, weekSummaries } = params;

  // Extract week data for each macro
  const weekCalories = weekSummaries.map((s) => s.actual_calories);
  const weekProtein = weekSummaries.map((s) => s.actual_protein);
  const weekCarbs = weekSummaries.map((s) => s.actual_carbs);
  const weekFat = weekSummaries.map((s) => s.actual_fat);

  // Calculate trends for each macro
  const calories = calculateMacroTrend(
    todayCurrent.calories,
    userTargets.calories,
    yesterday?.actual_calories ?? null,
    weekCalories
  );

  const protein = calculateMacroTrend(
    todayCurrent.protein,
    userTargets.protein,
    yesterday?.actual_protein ?? null,
    weekProtein
  );

  const carbs = calculateMacroTrend(
    todayCurrent.carbs,
    userTargets.carbs,
    yesterday?.actual_carbs ?? null,
    weekCarbs
  );

  const fat = calculateMacroTrend(
    todayCurrent.fat,
    userTargets.fat,
    yesterday?.actual_fat ?? null,
    weekFat
  );

  const hasLoggedToday = todayCurrent.calories > 0;
  const daysLoggedThisWeek = weekSummaries.filter((s) => s.logs_count > 0).length + (hasLoggedToday ? 1 : 0);

  // Generate suggestion
  const suggestion = generateSuggestion({
    calories,
    protein,
    carbs,
    fat,
    daysLoggedThisWeek,
    hasLoggedToday,
    timeOfDay: getTimeOfDay(),
  });

  return {
    calories,
    protein,
    carbs,
    fat,
    suggestion,
    daysLoggedThisWeek,
    hasLoggedToday,
  };
}
