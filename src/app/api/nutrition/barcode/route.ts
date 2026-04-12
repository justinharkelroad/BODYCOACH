// API route for barcode lookup
// Tries FatSecret first, then Open Food Facts, then USDA

import { NextRequest, NextResponse } from 'next/server';
import { searchFatSecretBarcode } from '@/features/nutrition/services/fatSecretApi';
import { lookupBarcode as lookupOFF } from '@/features/nutrition/services/openFoodFactsApi';
import { searchUSDAByBarcode } from '@/features/nutrition/services/usdaApi';
import type { NormalizedFood } from '@/features/nutrition/types/nutrition.types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const barcode = searchParams.get('barcode');

  if (!barcode) {
    return NextResponse.json({ error: 'Barcode is required' }, { status: 400 });
  }

  // Clean barcode
  const cleanBarcode = barcode.replace(/[^\d]/g, '');

  // 1. Try FatSecret first (90%+ hit rate for branded products)
  try {
    const fatSecretResult = await searchFatSecretBarcode(cleanBarcode);
    if (fatSecretResult) {
      return NextResponse.json({
        food: fatSecretResult,
        source: 'fatsecret',
        barcode: cleanBarcode,
      });
    }
  } catch (err) {
    console.error('FatSecret barcode error:', err);
  }

  // 2. Try Open Food Facts (good international coverage)
  try {
    const offResult = await lookupOFF(cleanBarcode);
    if (offResult) {
      return NextResponse.json({
        food: offResult,
        source: 'open_food_facts',
        barcode: cleanBarcode,
      });
    }
  } catch (err) {
    console.error('Open Food Facts barcode error:', err);
  }

  // 3. Try USDA Branded Foods as last resort
  try {
    const usdaResult = await searchUSDAByBarcode(cleanBarcode);
    if (usdaResult) {
      return NextResponse.json({
        food: usdaResult,
        source: 'usda',
        barcode: cleanBarcode,
      });
    }
  } catch (err) {
    console.error('USDA barcode error:', err);
  }

  // Not found
  return NextResponse.json({
    food: null,
    source: 'not_found',
    barcode: cleanBarcode,
  });
}
