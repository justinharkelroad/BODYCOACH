/**
 * AI Meal Suggestions Types
 * Used by both Web and Mobile platforms
 */

export interface MealSuggestionRequest {
  remainingCalories: number;
  remainingProtein: number;
  remainingCarbs: number;
  remainingFat: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  preferences?: {
    dietaryRestrictions?: string[];
    quickPrepOnly?: boolean;
    cuisinePreference?: string;
  };
}

export interface SuggestedMealItem {
  name: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealSuggestion {
  id: string;
  name: string;
  description: string;
  items: SuggestedMealItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  prepTime?: string;
  isRestaurant: boolean;
  restaurantName?: string;
}

export interface MealSuggestionsResponse {
  suggestions: MealSuggestion[];
  requestId: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
