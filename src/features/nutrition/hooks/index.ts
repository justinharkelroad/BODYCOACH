// Nutrition module hooks

export { useFoodSearch, useInstantFoodSearch } from './useFoodSearch';
export { useBarcodeScanner, isValidBarcode, normalizeBarcode } from './useBarcodeScanner';
export { useNutritionProfile, useNutritionTargets } from './useNutritionProfile';
export { useFoodLog, useFoodLogRange } from './useFoodLog';
export { useFrequentFoods, useQuickActionsForMeal } from './useFrequentFoods';
export { useSavedMeals } from './useSavedMeals';

// Re-export types used by hooks
export type { UseFoodSearchResult, UseFoodSearchOptions } from './useFoodSearch';
export type { UseBarcodeScannerResult } from './useBarcodeScanner';
export type { UseNutritionProfileResult } from './useNutritionProfile';
export type { UseFoodLogResult } from './useFoodLog';
export type { UseFrequentFoodsResult } from './useFrequentFoods';
export type { UseSavedMealsResult } from './useSavedMeals';
