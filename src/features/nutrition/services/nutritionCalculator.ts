// Nutrition Calculator Service
// Handles macro calculations, targets, and breastfeeding adjustments

import type {
  UserNutritionProfile,
  NutritionGoalType,
  DailyMacroProgress,
  MacroProgress,
  MacroStatus,
} from '../types/nutrition.types';

// Constants for calorie calculations
const BREASTFEEDING_CALORIES_PER_SESSION = 35; // Average of 25-50 range
const MIN_SAFE_CALORIES_BREASTFEEDING = 1500;
const POSTPARTUM_SAFE_DEFICIT_WEEK = 6; // Weeks before safe to diet

// Macro ratios by goal type (protein/carbs/fat as percentages)
const MACRO_RATIOS: Record<NutritionGoalType, { protein: number; carbs: number; fat: number }> = {
  lose_fat: { protein: 0.35, carbs: 0.35, fat: 0.30 },
  maintain: { protein: 0.25, carbs: 0.45, fat: 0.30 },
  gain_muscle: { protein: 0.30, carbs: 0.45, fat: 0.25 },
};

// Calorie adjustments by goal
const CALORIE_ADJUSTMENTS: Record<NutritionGoalType, number> = {
  lose_fat: -500, // Deficit
  maintain: 0,
  gain_muscle: 300, // Surplus
};

interface BMRParams {
  weightLbs: number;
  heightIn: number;
  ageYears: number;
  isFemale: boolean;
}

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor equation
 */
export function calculateBMR({ weightLbs, heightIn, ageYears, isFemale }: BMRParams): number {
  // Convert to metric
  const weightKg = weightLbs * 0.453592;
  const heightCm = heightIn * 2.54;

  // Mifflin-St Jeor equation
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;

  return isFemale ? bmr - 161 : bmr + 5;
}

// Activity multipliers
const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

interface TDEEParams extends BMRParams {
  activityLevel: string;
}

/**
 * Calculate Total Daily Energy Expenditure
 */
export function calculateTDEE(params: TDEEParams): number {
  const bmr = calculateBMR(params);
  const multiplier = ACTIVITY_MULTIPLIERS[params.activityLevel] || ACTIVITY_MULTIPLIERS.moderate;
  return Math.round(bmr * multiplier);
}

interface TargetParams extends TDEEParams {
  goalType: NutritionGoalType;
  isBreastfeeding?: boolean;
  breastfeedingSessionsPerDay?: number;
  postpartumWeeks?: number;
}

export interface NutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  breastfeedingAdd: number;
  warnings: string[];
}

/**
 * Calculate nutrition targets based on user profile and goals
 */
export function calculateTargets(params: TargetParams): NutritionTargets {
  const warnings: string[] = [];

  // Calculate base TDEE
  let targetCalories = calculateTDEE(params);

  // Apply goal adjustment
  targetCalories += CALORIE_ADJUSTMENTS[params.goalType];

  // Calculate breastfeeding calorie addition
  let breastfeedingAdd = 0;
  if (params.isBreastfeeding && params.breastfeedingSessionsPerDay) {
    breastfeedingAdd = params.breastfeedingSessionsPerDay * BREASTFEEDING_CALORIES_PER_SESSION;
    targetCalories += breastfeedingAdd;
  }

  // Safety checks for postpartum/breastfeeding
  if (params.postpartumWeeks !== undefined && params.postpartumWeeks < POSTPARTUM_SAFE_DEFICIT_WEEK) {
    warnings.push(
      `You're ${params.postpartumWeeks} weeks postpartum. Most healthcare providers recommend waiting until 6+ weeks before creating a calorie deficit.`
    );
  }

  if (params.isBreastfeeding && targetCalories < MIN_SAFE_CALORIES_BREASTFEEDING) {
    warnings.push(
      `Intake below ${MIN_SAFE_CALORIES_BREASTFEEDING} calories may affect milk supply. Your target has been adjusted to the minimum safe level.`
    );
    targetCalories = MIN_SAFE_CALORIES_BREASTFEEDING;
  }

  // Calculate macros based on goal ratios
  const ratios = MACRO_RATIOS[params.goalType];

  // Protein: 4 cal/g, Carbs: 4 cal/g, Fat: 9 cal/g
  const proteinCalories = targetCalories * ratios.protein;
  const carbsCalories = targetCalories * ratios.carbs;
  const fatCalories = targetCalories * ratios.fat;

  return {
    calories: Math.round(targetCalories),
    protein: Math.round(proteinCalories / 4),
    carbs: Math.round(carbsCalories / 4),
    fat: Math.round(fatCalories / 9),
    breastfeedingAdd,
    warnings,
  };
}

/**
 * Determine macro status based on percentage of target
 */
function getMacroStatus(percentage: number): MacroStatus {
  if (percentage < 80) return 'under';
  if (percentage > 120) return 'over';
  return 'on_target';
}

/**
 * Calculate daily macro progress
 */
export function calculateDailyProgress(
  consumed: { calories: number; protein: number; carbs: number; fat: number },
  targets: { calories: number; protein: number; carbs: number; fat: number }
): DailyMacroProgress {
  const calculateProgress = (current: number, target: number): MacroProgress => {
    const percentage = target > 0 ? (current / target) * 100 : 0;
    return {
      current,
      target,
      percentage: Math.round(percentage),
      status: getMacroStatus(percentage),
    };
  };

  return {
    calories: calculateProgress(consumed.calories, targets.calories),
    protein: calculateProgress(consumed.protein, targets.protein),
    carbs: calculateProgress(consumed.carbs, targets.carbs),
    fat: calculateProgress(consumed.fat, targets.fat),
  };
}

/**
 * Calculate macros for a food at given serving amount
 */
export function calculateFoodMacros(
  food: { calories: number | null; protein: number | null; carbs: number | null; fat: number | null },
  servings: number
): { calories: number; protein: number; carbs: number; fat: number } {
  return {
    calories: Math.round((food.calories || 0) * servings),
    protein: Math.round((food.protein || 0) * servings * 10) / 10,
    carbs: Math.round((food.carbs || 0) * servings * 10) / 10,
    fat: Math.round((food.fat || 0) * servings * 10) / 10,
  };
}

/**
 * Format calorie display with breastfeeding breakdown
 */
export function formatCalorieTarget(profile: UserNutritionProfile): string {
  if (profile.is_breastfeeding && profile.breastfeeding_calorie_add > 0) {
    const baseCalories = (profile.target_calories || 0) - profile.breastfeeding_calorie_add;
    return `Base: ${baseCalories} + Nursing: ${profile.breastfeeding_calorie_add} = ${profile.target_calories} cal`;
  }
  return `${profile.target_calories || 0} cal`;
}

/**
 * Get time-appropriate meal slot suggestion
 */
export function getSuggestedMealSlot(): string | null {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 10) return 'breakfast';
  if (hour >= 11 && hour < 14) return 'lunch';
  if (hour >= 17 && hour < 20) return 'dinner';
  if (hour >= 14 && hour < 17) return 'snack';
  if (hour >= 20 && hour < 23) return 'snack';

  return null;
}

/**
 * Check if meal is within typical time window
 */
export function isTypicalMealTime(mealSlot: string): boolean {
  const hour = new Date().getHours();

  switch (mealSlot) {
    case 'breakfast':
      return hour >= 6 && hour < 11;
    case 'lunch':
      return hour >= 11 && hour < 15;
    case 'dinner':
      return hour >= 17 && hour < 21;
    case 'snack':
      return true; // Snacks are always appropriate
    default:
      return true;
  }
}
