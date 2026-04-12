// Test endpoint to verify FatSecret API integration
// GET /api/nutrition/test?q=McDonalds

import { NextRequest, NextResponse } from 'next/server';
import { searchFatSecret, searchFatSecretBarcode } from '@/features/nutrition/services/fatSecretApi';
import { createClientForApi } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClientForApi(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const isTestEndpointEnabled = process.env.BODYCOACH_ENABLE_FATSECRET_TEST === 'true' || process.env.NODE_ENV !== 'production';
  if (!isTestEndpointEnabled) {
    return NextResponse.json({ error: 'Test endpoint is disabled' }, { status: 404 });
  }

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || "McDonald's Big Mac";
  const barcode = searchParams.get('barcode');

  const results: {
    query?: string;
    barcode?: string;
    searchResults?: unknown;
    barcodeResult?: unknown;
    error?: string;
  } = {};

  // Test search
  if (!barcode) {
    try {
      results.query = query;
      results.searchResults = await searchFatSecret(query, { pageSize: 5 });
    } catch (err) {
      results.error = err instanceof Error ? err.message : 'Search failed';
    }
  }

  // Test barcode lookup
  if (barcode) {
    try {
      results.barcode = barcode;
      results.barcodeResult = await searchFatSecretBarcode(barcode);
    } catch (err) {
      results.error = err instanceof Error ? err.message : 'Barcode lookup failed';
    }
  }

  return NextResponse.json(results, { status: results.error ? 500 : 200 });
}
