// Nutrition module services

export {
  searchFatSecret,
  getFatSecretFoodDetail,
  searchFatSecretBarcode,
  autocompleteFatSecret,
} from './fatSecretApi';

export {
  searchUSDA,
  getFoodByFdcId,
  searchUSDAByBarcode,
  getFoodsByFdcIds,
} from './usdaApi';

export {
  lookupBarcode,
  searchOFF,
  getProductImageUrl,
} from './openFoodFactsApi';

export {
  getCachedFood,
  getCachedFoodByBarcode,
  cacheFood,
  cacheFoods,
  searchCachedFoods,
  getUserCreatedFoods,
  createUserFood,
  updateUserFood,
  evictStaleCache,
  getFoodById,
} from './foodCacheService';

export {
  calculateBMR,
  calculateTDEE,
  calculateTargets,
  calculateDailyProgress,
  calculateFoodMacros,
  formatCalorieTarget,
  getSuggestedMealSlot,
  isTypicalMealTime,
} from './nutritionCalculator';

export type { USDASearchOptions } from './usdaApi';
export type { FatSecretSearchOptions } from './fatSecretApi';
export type { NutritionTargets } from './nutritionCalculator';
