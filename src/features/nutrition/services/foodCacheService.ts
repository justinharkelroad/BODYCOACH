// Food Cache Service
// Handles local caching of foods from external APIs

import { createClient } from '@/lib/supabase/client';
import type { Food, FoodInsert, NormalizedFood, FoodSearchResult } from '../types/nutrition.types';

const CACHE_TTL_DAYS = 30;

/**
 * Convert NormalizedFood to database insert format
 */
function toFoodInsert(food: NormalizedFood): FoodInsert {
  return {
    source: food.source,
    external_id: food.external_id,
    barcode: food.barcode || null,
    name: food.name,
    brand: food.brand || null,
    serving_size: food.serving_size,
    serving_unit: food.serving_unit,
    calories: food.calories,
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
    fiber: food.fiber || null,
    sugar: food.sugar || null,
    sodium: food.sodium || null,
    is_verified: false,
    created_by: null,
  };
}

/**
 * Convert database Food to NormalizedFood
 */
function toNormalizedFood(food: Food): NormalizedFood {
  return {
    source: food.source,
    external_id: food.external_id || food.id,
    barcode: food.barcode || undefined,
    name: food.name,
    brand: food.brand || undefined,
    serving_size: food.serving_size || 100,
    serving_unit: food.serving_unit || 'g',
    calories: food.calories || 0,
    protein: food.protein || 0,
    carbs: food.carbs || 0,
    fat: food.fat || 0,
    fiber: food.fiber || undefined,
    sugar: food.sugar || undefined,
    sodium: food.sodium || undefined,
  };
}

/**
 * Get a food from cache by source and external ID
 */
export async function getCachedFood(
  source: string,
  externalId: string
): Promise<Food | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .eq('source', source)
    .eq('external_id', externalId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Food;
}

/**
 * Get a food from cache by barcode
 */
export async function getCachedFoodByBarcode(barcode: string): Promise<Food | null> {
  const supabase = createClient();

  // Try both original and normalized barcodes
  const barcodesToCheck = [barcode];
  if (barcode.length === 13 && barcode.startsWith('0')) {
    barcodesToCheck.push(barcode.substring(1));
  }
  if (barcode.length === 12) {
    barcodesToCheck.unshift('0' + barcode);
  }

  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .in('barcode', barcodesToCheck)
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Food;
}

/**
 * Cache a food from an external API
 * Uses upsert to handle conflicts
 */
export async function cacheFood(food: NormalizedFood): Promise<Food> {
  const supabase = createClient();

  const insert = toFoodInsert(food);

  const { data, error } = await supabase
    .from('foods')
    .upsert(insert, {
      onConflict: 'source,external_id',
      ignoreDuplicates: false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to cache food: ${error.message}`);
  }

  return data as Food;
}

/**
 * Cache multiple foods at once
 */
export async function cacheFoods(foods: NormalizedFood[]): Promise<Food[]> {
  if (foods.length === 0) return [];

  const supabase = createClient();

  const inserts = foods.map(toFoodInsert);

  const { data, error } = await supabase
    .from('foods')
    .upsert(inserts, {
      onConflict: 'source,external_id',
      ignoreDuplicates: false,
    })
    .select();

  if (error) {
    throw new Error(`Failed to cache foods: ${error.message}`);
  }

  return (data as Food[]) || [];
}

/**
 * Search cached foods by name
 * Uses full-text search for better results
 */
export async function searchCachedFoods(
  query: string,
  limit = 20
): Promise<FoodSearchResult[]> {
  const supabase = createClient();

  // Use Postgres full-text search
  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .textSearch('name', query, {
      type: 'websearch',
      config: 'english',
    })
    .limit(limit);

  if (error) {
    console.warn('Full-text search failed, falling back to ILIKE:', error.message);

    // Fallback to ILIKE search
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('foods')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(limit);

    if (fallbackError) {
      throw new Error(`Failed to search cached foods: ${fallbackError.message}`);
    }

    return (fallbackData || []).map((food: Food) => ({
      ...toNormalizedFood(food),
      cached: true,
    }));
  }

  return (data || []).map((food: Food) => ({
    ...toNormalizedFood(food),
    cached: true,
  }));
}

/**
 * Get user-created foods
 */
export async function getUserCreatedFoods(
  userId: string,
  limit = 50
): Promise<Food[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .eq('source', 'user_created')
    .eq('created_by', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to get user foods: ${error.message}`);
  }

  return (data as Food[]) || [];
}

/**
 * Create a user-defined food
 */
export async function createUserFood(
  userId: string,
  food: Omit<NormalizedFood, 'source' | 'external_id'>
): Promise<Food> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('foods')
    .insert({
      source: 'user_created',
      external_id: crypto.randomUUID(), // Generate unique ID for user foods
      name: food.name,
      brand: food.brand || null,
      barcode: food.barcode || null,
      serving_size: food.serving_size,
      serving_unit: food.serving_unit,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber || null,
      sugar: food.sugar || null,
      sodium: food.sodium || null,
      is_verified: false,
      created_by: userId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create user food: ${error.message}`);
  }

  return data as Food;
}

/**
 * Update a user-created food
 */
export async function updateUserFood(
  foodId: string,
  updates: Partial<NormalizedFood>
): Promise<Food> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('foods')
    .update({
      name: updates.name,
      brand: updates.brand,
      barcode: updates.barcode,
      serving_size: updates.serving_size,
      serving_unit: updates.serving_unit,
      calories: updates.calories,
      protein: updates.protein,
      carbs: updates.carbs,
      fat: updates.fat,
      fiber: updates.fiber,
      sugar: updates.sugar,
      sodium: updates.sodium,
    })
    .eq('id', foodId)
    .eq('source', 'user_created')
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update user food: ${error.message}`);
  }

  return data as Food;
}

/**
 * Delete stale cached foods (older than TTL)
 * Run periodically to manage cache size
 */
export async function evictStaleCache(): Promise<number> {
  const supabase = createClient();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - CACHE_TTL_DAYS);

  const { data, error } = await supabase
    .from('foods')
    .delete()
    .lt('cached_at', cutoffDate.toISOString())
    .neq('source', 'user_created') // Never delete user-created foods
    .select('id');

  if (error) {
    console.error('Failed to evict stale cache:', error.message);
    return 0;
  }

  return data?.length || 0;
}

/**
 * Get food by ID
 */
export async function getFoodById(foodId: string): Promise<Food | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .eq('id', foodId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Food;
}
