// Nutrition module types for BODYCOACH

export type NutritionGoalType = 'lose_fat' | 'maintain' | 'gain_muscle';
export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type FoodSource = 'fatsecret' | 'usda' | 'open_food_facts' | 'user_created';

// User's nutrition profile and targets
export interface UserNutritionProfile {
  id: string;
  user_id: string;
  goal_type: NutritionGoalType | null;
  target_calories: number | null;
  target_protein: number | null;
  target_carbs: number | null;
  target_fat: number | null;
  is_breastfeeding: boolean;
  breastfeeding_sessions_per_day: number;
  breastfeeding_calorie_add: number;
  postpartum_weeks: number | null;
  created_at: string;
  updated_at: string;
}

// Food item (from cache or user-created)
export interface Food {
  id: string;
  source: FoodSource;
  external_id: string | null;
  barcode: string | null;
  name: string;
  brand: string | null;
  serving_size: number | null;
  serving_unit: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
  sugar: number | null;
  sodium: number | null;
  is_verified: boolean;
  created_by: string | null;
  cached_at: string;
  created_at: string;
}

// Food log entry
export interface FoodLog {
  id: string;
  user_id: string;
  food_id: string;
  logged_at: string;
  log_date: string;
  meal_slot: MealSlot | null;
  servings: number;
  calories_logged: number | null;
  protein_logged: number | null;
  carbs_logged: number | null;
  fat_logged: number | null;
  quick_logged: boolean;
  photo_url: string | null;
  notes: string | null;
  is_planned: boolean;
  felt_good: boolean | null; // Phase 2: User feedback on how meal made them feel
  created_at: string;
  // Joined data
  food?: Food;
}

// Saved meal (collection of foods)
export interface SavedMeal {
  id: string;
  user_id: string;
  name: string;
  is_favorite: boolean;
  use_count: number;
  last_used_at: string | null;
  total_calories: number | null;
  total_protein: number | null;
  total_carbs: number | null;
  total_fat: number | null;
  created_at: string;
  // Joined data
  items?: SavedMealItem[];
}

// Item within a saved meal
export interface SavedMealItem {
  id: string;
  saved_meal_id: string;
  food_id: string;
  servings: number;
  // Joined data
  food?: Food;
}

// Frequently logged food (for quick actions)
export interface FrequentFood {
  id: string;
  user_id: string;
  food_id: string;
  log_count: number;
  last_logged_at: string;
  typical_meal_slot: MealSlot | null;
  typical_time_of_day: string | null;
  // Joined data
  food?: Food;
}

// Daily nutrition summary
export interface DailyNutritionSummary {
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
  meals: FoodLog[];
}

// Macro status for progress indicators
export type MacroStatus = 'under' | 'on_target' | 'over';

export interface MacroProgress {
  current: number;
  target: number;
  percentage: number;
  status: MacroStatus;
}

export interface DailyMacroProgress {
  calories: MacroProgress;
  protein: MacroProgress;
  carbs: MacroProgress;
  fat: MacroProgress;
}

// API response types for external food databases

// USDA FoodData Central
export interface USDAFoodNutrient {
  nutrientId: number;
  nutrientName: string;
  nutrientNumber: string;
  unitName: string;
  value: number;
}

export interface USDAFood {
  fdcId: number;
  description: string;
  dataType: string;
  brandOwner?: string;
  brandName?: string;
  ingredients?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  foodNutrients: USDAFoodNutrient[];
}

export interface USDASearchResponse {
  totalHits: number;
  currentPage: number;
  totalPages: number;
  foods: USDAFood[];
}

// Open Food Facts
export interface OFFNutriments {
  'energy-kcal_100g'?: number;
  'energy-kcal_serving'?: number;
  proteins_100g?: number;
  proteins_serving?: number;
  carbohydrates_100g?: number;
  carbohydrates_serving?: number;
  fat_100g?: number;
  fat_serving?: number;
  fiber_100g?: number;
  sugars_100g?: number;
  sodium_100g?: number;
  salt_100g?: number;
}

export interface OFFProduct {
  code: string;
  product_name?: string;
  product_name_en?: string;
  brands?: string;
  serving_size?: string;
  serving_quantity?: number;
  nutriments?: OFFNutriments;
  image_url?: string;
  image_front_url?: string;
}

export interface OFFResponse {
  status: number;
  status_verbose: string;
  product?: OFFProduct;
}

// Normalized food result from any source
export interface NormalizedFood {
  source: FoodSource;
  external_id: string;
  barcode?: string;
  name: string;
  brand?: string;
  serving_size: number;
  serving_unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

// Search result with relevance info
export interface FoodSearchResult extends NormalizedFood {
  cached?: boolean;
  matchScore?: number;
}

// Barcode scan result
export interface BarcodeScanResult {
  barcode: string;
  food: NormalizedFood | null;
  source: 'cache' | 'fatsecret' | 'open_food_facts' | 'usda' | 'not_found';
}

// FatSecret API types
export interface FatSecretToken {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export interface FatSecretFood {
  food_id: string;
  food_name: string;
  brand_name?: string;
  food_type: 'Brand' | 'Generic';
  food_description: string;
  food_url: string;
}

export interface FatSecretSearchResult {
  foods?: {
    food?: FatSecretFood | FatSecretFood[];
    max_results: string;
    page_number: string;
    total_results: string;
  };
}

export interface FatSecretServing {
  serving_id: string;
  serving_description: string;
  metric_serving_amount?: string;
  metric_serving_unit?: string;
  calories: string;
  carbohydrate: string;
  protein: string;
  fat: string;
  saturated_fat?: string;
  fiber?: string;
  sugar?: string;
  sodium?: string;
}

export interface FatSecretFoodDetail {
  food_id: string;
  food_name: string;
  brand_name?: string;
  food_type: string;
  servings: {
    serving: FatSecretServing | FatSecretServing[];
  };
}

// Quick log action
export interface QuickLogAction {
  food: Food;
  typicalServings: number;
  mealSlot: MealSlot | null;
  frequency: number;
}

// Insert/Update types for Supabase
export type UserNutritionProfileInsert = Omit<UserNutritionProfile, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type UserNutritionProfileUpdate = Partial<Omit<UserNutritionProfile, 'id' | 'user_id' | 'created_at'>>;

export type FoodInsert = Omit<Food, 'id' | 'created_at' | 'cached_at'> & {
  id?: string;
  created_at?: string;
  cached_at?: string;
};

export type FoodLogInsert = Omit<FoodLog, 'id' | 'created_at' | 'food' | 'felt_good'> & {
  id?: string;
  created_at?: string;
  felt_good?: boolean | null;
};

export type FoodLogUpdate = Partial<Omit<FoodLog, 'id' | 'user_id' | 'created_at' | 'food'>>;

export type SavedMealInsert = Omit<SavedMeal, 'id' | 'created_at' | 'items' | 'total_calories' | 'total_protein' | 'total_carbs' | 'total_fat'> & {
  id?: string;
  created_at?: string;
};

export type SavedMealItemInsert = Omit<SavedMealItem, 'id' | 'food'> & {
  id?: string;
};
