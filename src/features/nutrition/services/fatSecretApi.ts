// FatSecret API Service
// API Documentation: https://platform.fatsecret.com/api/
// OAuth 2.0 Client Credentials flow

import type {
  FatSecretToken,
  FatSecretFood,
  FatSecretSearchResult,
  FatSecretFoodDetail,
  FatSecretServing,
  NormalizedFood,
} from '../types/nutrition.types';

// Token cache for OAuth 2.0
let cachedToken: FatSecretToken | null = null;
let tokenExpiry: number = 0;

/**
 * Get FatSecret OAuth 2.0 access token
 * Uses client credentials flow with token caching
 */
async function getFatSecretToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < tokenExpiry - 60000) {
    return cachedToken.access_token;
  }

  const clientId = process.env.FATSECRET_CLIENT_ID;
  const clientSecret = process.env.FATSECRET_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('FatSecret credentials not configured. Set FATSECRET_CLIENT_ID and FATSECRET_CLIENT_SECRET.');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch('https://oauth.fatsecret.com/connect/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=basic',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`FatSecret auth failed: ${response.status} - ${errorText}`);
  }

  cachedToken = await response.json();
  tokenExpiry = Date.now() + (cachedToken!.expires_in * 1000);

  return cachedToken!.access_token;
}

/**
 * Make an authenticated request to FatSecret API
 */
async function fatSecretRequest<T>(params: URLSearchParams): Promise<T> {
  const token = await getFatSecretToken();

  const response = await fetch(
    `https://platform.fatsecret.com/rest/server.api?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`FatSecret API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Parse nutrition values from FatSecret food description string
 * Format: "Per 1 serving - Calories: 300kcal | Fat: 13.00g | Carbs: 35.00g | Protein: 12.00g"
 */
function parseDescription(desc: string): { calories: number; fat: number; carbs: number; protein: number } {
  const parseNum = (pattern: RegExp): number => {
    const match = desc.match(pattern);
    return match ? parseFloat(match[1]) : 0;
  };

  return {
    calories: parseNum(/Calories:\s*([\d.]+)/i),
    fat: parseNum(/Fat:\s*([\d.]+)/i),
    carbs: parseNum(/Carbs:\s*([\d.]+)/i),
    protein: parseNum(/Protein:\s*([\d.]+)/i),
  };
}

/**
 * Normalize FatSecret food (from search) to common format
 */
function normalizeFatSecretSearchFood(food: FatSecretFood): NormalizedFood {
  const macros = parseDescription(food.food_description || '');

  return {
    source: 'fatsecret',
    external_id: food.food_id,
    name: food.food_name,
    brand: food.brand_name || undefined,
    serving_size: 1,
    serving_unit: 'serving',
    calories: macros.calories,
    protein: macros.protein,
    carbs: macros.carbs,
    fat: macros.fat,
  };
}

/**
 * Normalize FatSecret food detail (with full nutrition) to common format
 */
function normalizeFatSecretDetail(food: FatSecretFoodDetail): NormalizedFood {
  const servings = food.servings?.serving;
  const serving: FatSecretServing | undefined = Array.isArray(servings) ? servings[0] : servings;

  if (!serving) {
    return {
      source: 'fatsecret',
      external_id: food.food_id,
      name: food.food_name,
      brand: food.brand_name || undefined,
      serving_size: 1,
      serving_unit: 'serving',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };
  }

  return {
    source: 'fatsecret',
    external_id: food.food_id,
    name: food.food_name,
    brand: food.brand_name || undefined,
    serving_size: serving.metric_serving_amount ? parseFloat(serving.metric_serving_amount) : 1,
    serving_unit: serving.metric_serving_unit || 'serving',
    calories: parseFloat(serving.calories) || 0,
    protein: parseFloat(serving.protein) || 0,
    carbs: parseFloat(serving.carbohydrate) || 0,
    fat: parseFloat(serving.fat) || 0,
    fiber: serving.fiber ? parseFloat(serving.fiber) : undefined,
    sugar: serving.sugar ? parseFloat(serving.sugar) : undefined,
    sodium: serving.sodium ? parseFloat(serving.sodium) : undefined,
  };
}

export interface FatSecretSearchOptions {
  pageSize?: number;
  page?: number;
}

/**
 * Search FatSecret for foods
 * Returns branded foods (restaurants, grocery items) and generic foods
 */
export async function searchFatSecret(
  query: string,
  options: FatSecretSearchOptions = {}
): Promise<NormalizedFood[]> {
  const { pageSize = 20, page = 0 } = options;

  const params = new URLSearchParams({
    method: 'foods.search',
    search_expression: query,
    format: 'json',
    max_results: pageSize.toString(),
    page_number: page.toString(),
  });

  const data = await fatSecretRequest<FatSecretSearchResult>(params);

  // API returns single object if 1 result, array if multiple
  if (!data.foods?.food) return [];

  const foods = Array.isArray(data.foods.food) ? data.foods.food : [data.foods.food];
  return foods.map(normalizeFatSecretSearchFood);
}

/**
 * Get detailed nutrition info for a specific food by ID
 */
export async function getFatSecretFoodDetail(foodId: string): Promise<NormalizedFood | null> {
  const params = new URLSearchParams({
    method: 'food.get.v4',
    food_id: foodId,
    format: 'json',
  });

  try {
    const data = await fatSecretRequest<{ food: FatSecretFoodDetail }>(params);
    return normalizeFatSecretDetail(data.food);
  } catch {
    return null;
  }
}

/**
 * Look up food by barcode using FatSecret
 * Returns food detail if found, null otherwise
 */
export async function searchFatSecretBarcode(barcode: string): Promise<NormalizedFood | null> {
  const params = new URLSearchParams({
    method: 'food.find_id_for_barcode',
    barcode: barcode,
    format: 'json',
  });

  try {
    const data = await fatSecretRequest<{ food_id?: { value: string } }>(params);

    if (data.food_id?.value) {
      const detail = await getFatSecretFoodDetail(data.food_id.value);
      if (detail) {
        return { ...detail, barcode };
      }
    }
  } catch {
    // Barcode not found
  }

  return null;
}

/**
 * Get autocomplete suggestions for food search
 */
export async function autocompleteFatSecret(query: string): Promise<string[]> {
  const params = new URLSearchParams({
    method: 'foods.autocomplete',
    expression: query,
    format: 'json',
    max_results: '10',
  });

  try {
    const data = await fatSecretRequest<{ suggestions?: { suggestion?: string | string[] } }>(params);

    if (!data.suggestions?.suggestion) return [];

    const suggestions = data.suggestions.suggestion;
    return Array.isArray(suggestions) ? suggestions : [suggestions];
  } catch {
    return [];
  }
}
