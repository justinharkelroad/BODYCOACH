// USDA FoodData Central API Service
// API Documentation: https://fdc.nal.usda.gov/api-guide/

import type { USDAFood, USDASearchResponse, NormalizedFood } from '../types/nutrition.types';

const USDA_API_BASE = 'https://api.nal.usda.gov/fdc/v1';

// Nutrient IDs in USDA database
const NUTRIENT_IDS = {
  ENERGY: 1008,      // Energy (kcal)
  PROTEIN: 1003,     // Protein
  CARBS: 1005,       // Carbohydrates
  FAT: 1004,         // Total lipid (fat)
  FIBER: 1079,       // Fiber, total dietary
  SUGAR: 2000,       // Sugars, total
  SODIUM: 1093,      // Sodium
} as const;

function getApiKey(): string {
  const key = process.env.NEXT_PUBLIC_USDA_API_KEY || process.env.USDA_API_KEY;
  if (!key) {
    throw new Error('USDA API key not configured. Set NEXT_PUBLIC_USDA_API_KEY or USDA_API_KEY.');
  }
  return key;
}

/**
 * Extract nutrient value from USDA food item
 */
function getNutrient(food: USDAFood, nutrientId: number): number {
  const nutrient = food.foodNutrients?.find(n => n.nutrientId === nutrientId);
  return nutrient?.value || 0;
}

/**
 * Normalize USDA food to common format
 */
function normalizeUSDAFood(food: USDAFood): NormalizedFood {
  return {
    source: 'usda',
    external_id: food.fdcId.toString(),
    name: food.description,
    brand: food.brandOwner || food.brandName || undefined,
    serving_size: food.servingSize || 100,
    serving_unit: food.servingSizeUnit || 'g',
    calories: getNutrient(food, NUTRIENT_IDS.ENERGY),
    protein: getNutrient(food, NUTRIENT_IDS.PROTEIN),
    carbs: getNutrient(food, NUTRIENT_IDS.CARBS),
    fat: getNutrient(food, NUTRIENT_IDS.FAT),
    fiber: getNutrient(food, NUTRIENT_IDS.FIBER),
    sugar: getNutrient(food, NUTRIENT_IDS.SUGAR),
    sodium: getNutrient(food, NUTRIENT_IDS.SODIUM),
  };
}

export interface USDASearchOptions {
  pageSize?: number;
  pageNumber?: number;
  dataTypes?: ('Foundation' | 'SR Legacy' | 'Branded' | 'Survey (FNDDS)')[];
  sortBy?: 'dataType.keyword' | 'lowercaseDescription.keyword' | 'fdcId' | 'publishedDate';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Search USDA FoodData Central for foods
 */
export async function searchUSDA(
  query: string,
  options: USDASearchOptions = {}
): Promise<NormalizedFood[]> {
  const {
    pageSize = 25,
    pageNumber = 1,
    dataTypes = ['Foundation', 'SR Legacy', 'Branded'],
    sortBy = 'dataType.keyword',
    sortOrder = 'asc',
  } = options;

  const apiKey = getApiKey();
  const dataTypeParam = dataTypes.join(',');

  const url = new URL(`${USDA_API_BASE}/foods/search`);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('query', query);
  url.searchParams.set('pageSize', pageSize.toString());
  url.searchParams.set('pageNumber', pageNumber.toString());
  url.searchParams.set('dataType', dataTypeParam);
  url.searchParams.set('sortBy', sortBy);
  url.searchParams.set('sortOrder', sortOrder);

  const response = await fetch(url.toString());

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('USDA API rate limit exceeded. Please try again later.');
    }
    throw new Error(`USDA API error: ${response.status} ${response.statusText}`);
  }

  const data: USDASearchResponse = await response.json();

  return data.foods.map(normalizeUSDAFood);
}

/**
 * Get a specific food by FDC ID
 */
export async function getFoodByFdcId(fdcId: string | number): Promise<NormalizedFood | null> {
  const apiKey = getApiKey();

  const url = `${USDA_API_BASE}/food/${fdcId}?api_key=${apiKey}`;
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`USDA API error: ${response.status} ${response.statusText}`);
  }

  const food: USDAFood = await response.json();
  return normalizeUSDAFood(food);
}

/**
 * Search USDA Branded Foods by UPC barcode
 * Returns the first matching branded food
 */
export async function searchUSDAByBarcode(barcode: string): Promise<NormalizedFood | null> {
  const apiKey = getApiKey();

  // Search branded foods with exact barcode/GTIN match
  const url = new URL(`${USDA_API_BASE}/foods/search`);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('query', barcode);
  url.searchParams.set('dataType', 'Branded');
  url.searchParams.set('pageSize', '1');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`USDA API error: ${response.status} ${response.statusText}`);
  }

  const data: USDASearchResponse = await response.json();

  if (data.foods.length === 0) {
    return null;
  }

  const food = normalizeUSDAFood(data.foods[0]);
  food.barcode = barcode;
  return food;
}

/**
 * Get multiple foods by FDC IDs (batch request)
 */
export async function getFoodsByFdcIds(fdcIds: (string | number)[]): Promise<NormalizedFood[]> {
  if (fdcIds.length === 0) return [];

  const apiKey = getApiKey();

  const url = `${USDA_API_BASE}/foods?api_key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fdcIds: fdcIds.map(id => Number(id)),
    }),
  });

  if (!response.ok) {
    throw new Error(`USDA API error: ${response.status} ${response.statusText}`);
  }

  const foods: USDAFood[] = await response.json();
  return foods.map(normalizeUSDAFood);
}
