// TDEE Calculator - Core calculation functions
// Based on Mifflin-St Jeor equation for BMR

export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
export type Goal = 'lose_fat' | 'maintain' | 'gain_muscle';
export type Aggressiveness = 'conservative' | 'moderate' | 'aggressive';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,      // Desk job, little/no exercise
  light: 1.375,        // Light exercise 1-2 days/week
  moderate: 1.55,      // Moderate exercise 3-5 days/week
  active: 1.725,       // Heavy exercise 6-7 days/week
  athlete: 1.9         // Athlete, 2x training/day
};

export interface MacroTargets {
  protein: number;  // grams
  carbs: number;    // grams
  fat: number;      // grams
  calories: number;
}

export interface UserProfile {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: Sex;
  activityLevel: ActivityLevel;
  goal: Goal;
  aggressiveness?: Aggressiveness;
  targetWeightLbs?: number; // Target weight for fat loss - used for protein calculation
  isBreastfeeding?: boolean;
  breastfeedingSessions?: number;
  postpartumWeeks?: number;
}

export interface CalculationResult {
  bmr: number;
  tdee: number;
  adjustedTdee: number;  // After breastfeeding adjustment
  targetCalories: number;
  macros: MacroTargets;
  deficit: number;       // Positive = deficit, negative = surplus
  weeklyChange: number;  // Estimated lbs per week
  warnings: string[];
}

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor equation
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: Sex
): number {
  const base = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
  return sex === 'male' ? base + 5 : base - 161;
}

/**
 * Calculate Total Daily Energy Expenditure
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
}

/**
 * Adjust TDEE for breastfeeding
 * Each nursing/pumping session burns ~25-50 calories
 * Conservative estimate: 40 cal per session
 */
export function adjustForBreastfeeding(
  tdee: number,
  isBreastfeeding: boolean,
  sessionsPerDay: number
): number {
  if (!isBreastfeeding) return tdee;
  const breastfeedingCalories = sessionsPerDay * 40;
  return tdee + breastfeedingCalories;
}

/**
 * Calculate target calories based on goal
 * Uses flat calorie adjustments (not percentages) to match standard TDEE calculators
 */
export function calculateTargetCalories(
  tdee: number,
  goal: Goal
): number {
  // Flat calorie adjustments
  const CUTTING_DEFICIT = 500;  // -500 cal for fat loss (~1 lb/week)
  const BULKING_SURPLUS = 500;  // +500 cal for muscle gain

  if (goal === 'lose_fat') {
    return tdee - CUTTING_DEFICIT;
  } else if (goal === 'gain_muscle') {
    return tdee + BULKING_SURPLUS;
  }
  return tdee; // maintain
}

/**
 * Calculate macro targets using percentage-based splits
 *
 * Split: 35% Protein / 30% Fat / 35% Carbs
 * Same split for all goals, different calorie targets
 */
export function calculateMacros(
  targetCalories: number
): MacroTargets {
  // Fixed percentage split for all goals
  const PROTEIN_PERCENT = 0.35;
  const FAT_PERCENT = 0.30;
  const CARBS_PERCENT = 0.35;

  // Calculate each macro - no rounding
  const proteinCalories = targetCalories * PROTEIN_PERCENT;
  const fatCalories = targetCalories * FAT_PERCENT;
  const carbCalories = targetCalories * CARBS_PERCENT;

  const protein = proteinCalories / 4;  // 4 cal per gram
  const fat = fatCalories / 9;          // 9 cal per gram
  const carbs = carbCalories / 4;       // 4 cal per gram

  return {
    protein,
    carbs,
    fat,
    calories: targetCalories
  };
}

/**
 * Complete nutrition target calculation
 */
export function calculateNutritionTargets(profile: UserProfile): CalculationResult {
  const warnings: string[] = [];

  // Step 1: Calculate BMR (no rounding)
  const bmr = calculateBMR(profile.weightKg, profile.heightCm, profile.age, profile.sex);

  // Step 2: Calculate TDEE (no rounding)
  const tdee = calculateTDEE(bmr, profile.activityLevel);

  // Step 3: Adjust for breastfeeding
  const adjustedTdee = adjustForBreastfeeding(
    tdee,
    profile.isBreastfeeding || false,
    profile.breastfeedingSessions || 0
  );

  // Step 4: Calculate target calories based on goal (no rounding)
  const targetCalories = calculateTargetCalories(adjustedTdee, profile.goal);

  // Step 5: Add warnings but don't modify values
  if (profile.isBreastfeeding && targetCalories < 1800) {
    warnings.push('Warning: Below 1,800 calories may affect milk supply.');
  }

  if (profile.postpartumWeeks && profile.postpartumWeeks < 6 && profile.goal === 'lose_fat') {
    warnings.push('Consider waiting until 6 weeks postpartum before actively cutting calories.');
  }

  // Add warning for very low calories but don't enforce minimum
  const suggestedMin = profile.sex === 'female' ? 1200 : 1500;
  if (targetCalories < suggestedMin) {
    warnings.push(`Warning: ${Math.round(targetCalories)} calories is below the commonly recommended minimum of ${suggestedMin}.`);
  }

  // Step 6: Calculate macros (35% protein / 30% fat / 35% carbs)
  const macros = calculateMacros(targetCalories);

  // Step 7: Calculate expected weekly change
  const deficit = adjustedTdee - targetCalories;
  const weeklyChange = (deficit * 7) / 3500; // 3500 cal = ~1 lb

  // Return exact values - let UI decide how to display
  return {
    bmr,
    tdee,
    adjustedTdee,
    targetCalories,
    macros,
    deficit,
    weeklyChange,
    warnings
  };
}

// Unit Conversion Helpers

/**
 * Convert pounds to kilograms
 * Using exact conversion: 1 lb = 0.45359237 kg
 */
export function lbsToKg(lbs: number): number {
  return lbs * 0.45359237;
}

/**
 * Convert kilograms to pounds
 * Using exact conversion: 1 kg = 2.20462262 lbs
 */
export function kgToLbs(kg: number): number {
  return kg * 2.20462262;
}

/**
 * Convert feet and inches to centimeters
 */
export function feetInchesToCm(feet: number, inches: number): number {
  const totalInches = (feet * 12) + inches;
  return totalInches * 2.54;
}

/**
 * Convert centimeters to feet and inches
 */
export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
