// API route for food search
// Searches FatSecret (primary), then USDA as fallback

import { NextRequest, NextResponse } from 'next/server';
import { searchFatSecret } from '@/features/nutrition/services/fatSecretApi';
import { searchUSDA } from '@/features/nutrition/services/usdaApi';
import type { NormalizedFood } from '@/features/nutrition/types/nutrition.types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '0', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

  if (!query || query.length < 2) {
    return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
  }

  const results: NormalizedFood[] = [];
  const errors: string[] = [];

  // 1. Search FatSecret (PRIMARY - has restaurants!)
  try {
    const fatSecretResults = await searchFatSecret(query, { pageSize, page });
    results.push(...fatSecretResults);
  } catch (err) {
    console.error('FatSecret search error:', err);
    errors.push('FatSecret search failed');
  }

  // 2. If not enough results, supplement with USDA
  if (results.length < 10) {
    try {
      const usdaResults = await searchUSDA(query, {
        pageSize: pageSize - results.length,
        pageNumber: page + 1, // USDA uses 1-based pagination
      });

      // Filter out duplicates by name similarity
      const existingNames = new Set(
        results.map(r => r.name.toLowerCase().replace(/[^a-z0-9]/g, ''))
      );

      const newResults = usdaResults.filter(r => {
        const normalizedName = r.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        return !existingNames.has(normalizedName);
      });

      results.push(...newResults);
    } catch (err) {
      console.error('USDA search error:', err);
      errors.push('USDA search failed');
    }
  }

  return NextResponse.json({
    results,
    query,
    page,
    count: results.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}
