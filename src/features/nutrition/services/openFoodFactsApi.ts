// Open Food Facts API Service
// API Documentation: https://world.openfoodfacts.org/data

import type { OFFResponse, NormalizedFood } from '../types/nutrition.types';

const OFF_API_BASE = 'https://world.openfoodfacts.org/api/v2';

// User-Agent required by Open Food Facts API
const USER_AGENT = process.env.NEXT_PUBLIC_OFF_USER_AGENT || 'StandardNutrition/1.0 (nutrition-tracking-app)';

/**
 * Normalize barcode format
 * iOS returns UPC-A as EAN-13 with leading zero - strip if needed
 */
function normalizeBarcode(barcode: string): string[] {
  const codes = [barcode];

  // If 13-digit barcode starts with 0, try 12-digit UPC-A format
  if (barcode.length === 13 && barcode.startsWith('0')) {
    codes.push(barcode.substring(1));
  }

  // If 12-digit UPC-A, try with leading zero as EAN-13
  if (barcode.length === 12) {
    codes.unshift('0' + barcode);
  }

  return codes;
}

/**
 * Parse serving size string to numeric value
 * e.g., "30g" -> 30, "1 cup (240ml)" -> 240
 */
function parseServingSize(servingSize?: string, servingQuantity?: number): number {
  if (servingQuantity && servingQuantity > 0) {
    return servingQuantity;
  }

  if (!servingSize) return 100;

  // Try to extract numeric value
  const match = servingSize.match(/(\d+(?:\.\d+)?)/);
  if (match) {
    return parseFloat(match[1]);
  }

  return 100;
}

/**
 * Normalize Open Food Facts product to common format
 */
function normalizeOFFProduct(product: NonNullable<OFFResponse['product']>, barcode: string): NormalizedFood {
  const nutriments = product.nutriments || {};

  // Prefer per-100g values for consistency
  const calories = nutriments['energy-kcal_100g'] || 0;
  const protein = nutriments.proteins_100g || 0;
  const carbs = nutriments.carbohydrates_100g || 0;
  const fat = nutriments.fat_100g || 0;
  const fiber = nutriments.fiber_100g;
  const sugar = nutriments.sugars_100g;
  // OFF stores sodium in mg, we want mg
  const sodium = nutriments.sodium_100g ? nutriments.sodium_100g * 1000 : undefined;

  return {
    source: 'open_food_facts',
    external_id: barcode,
    barcode,
    name: product.product_name || product.product_name_en || 'Unknown Product',
    brand: product.brands || undefined,
    serving_size: parseServingSize(product.serving_size, product.serving_quantity),
    serving_unit: product.serving_quantity ? 'serving' : 'g',
    calories,
    protein,
    carbs,
    fat,
    fiber,
    sugar,
    sodium,
  };
}

/**
 * Look up a product by barcode from Open Food Facts
 */
export async function lookupBarcode(barcode: string): Promise<NormalizedFood | null> {
  const barcodesToTry = normalizeBarcode(barcode);

  for (const code of barcodesToTry) {
    try {
      const response = await fetch(`${OFF_API_BASE}/product/${code}.json`, {
        headers: {
          'User-Agent': USER_AGENT,
        },
      });

      if (!response.ok) {
        if (response.status === 404) continue;
        console.warn(`OFF API error for ${code}: ${response.status}`);
        continue;
      }

      const data: OFFResponse = await response.json();

      if (data.status === 1 && data.product) {
        return normalizeOFFProduct(data.product, code);
      }
    } catch (error) {
      console.warn(`Error looking up barcode ${code}:`, error);
    }
  }

  return null;
}

/**
 * Search Open Food Facts products by name
 * Note: OFF search is slower than USDA, use as fallback
 */
export async function searchOFF(
  query: string,
  pageSize = 20
): Promise<NormalizedFood[]> {
  const url = new URL(`${OFF_API_BASE}/search`);
  url.searchParams.set('search_terms', query);
  url.searchParams.set('page_size', pageSize.toString());
  url.searchParams.set('json', '1');
  // Only get products with nutrition data
  url.searchParams.set('fields', 'code,product_name,product_name_en,brands,serving_size,serving_quantity,nutriments');

  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error(`OFF API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.products || !Array.isArray(data.products)) {
    return [];
  }

  return data.products
    .filter((p: OFFResponse['product']) => p && p.product_name)
    .map((p: NonNullable<OFFResponse['product']>) => normalizeOFFProduct(p, p.code));
}

/**
 * Get product image URL if available
 */
export function getProductImageUrl(product: OFFResponse['product']): string | null {
  if (!product) return null;
  return product.image_front_url || product.image_url || null;
}
