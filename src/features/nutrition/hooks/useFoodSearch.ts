'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { FoodSearchResult, NormalizedFood } from '../types/nutrition.types';
import { searchCachedFoods, cacheFoods } from '../services/foodCacheService';

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

/**
 * Search foods via API route (FatSecret + USDA fallback)
 */
async function searchFoodsApi(query: string, page = 0, pageSize = 20): Promise<NormalizedFood[]> {
  const params = new URLSearchParams({
    q: query,
    page: page.toString(),
    pageSize: pageSize.toString(),
  });

  const response = await fetch(`/api/nutrition/search?${params}`);

  if (!response.ok) {
    throw new Error(`Search failed: ${response.status}`);
  }

  const data = await response.json();
  return data.results || [];
}

export interface UseFoodSearchOptions {
  pageSize?: number;
  /** @deprecated Now uses unified API that includes FatSecret + USDA */
  includeUSDA?: boolean;
  debounceMs?: number;
}

export interface UseFoodSearchResult {
  query: string;
  setQuery: (query: string) => void;
  results: FoodSearchResult[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  clear: () => void;
}

export function useFoodSearch(options: UseFoodSearchOptions = {}): UseFoodSearchResult {
  const {
    pageSize = 25,
    debounceMs = DEBOUNCE_MS,
  } = options;

  const [query, setQueryState] = useState('');
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastQueryRef = useRef<string>('');

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const performSearch = useCallback(
    async (searchQuery: string, pageNumber: number, append = false) => {
      // Cancel any in-flight requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      if (searchQuery.length < MIN_QUERY_LENGTH) {
        setResults([]);
        setHasMore(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Search local cache first (instant results)
        const cachedResults = await searchCachedFoods(searchQuery, pageSize);

        // Show cached results immediately
        if (!append) {
          setResults(cachedResults);
        }

        // Search via API (FatSecret primary + USDA fallback)
        const apiResults = await searchFoodsApi(searchQuery, pageNumber - 1, pageSize);

        // Filter out foods we already have from cache
        const cachedIds = new Set(cachedResults.map(r => `${r.source}:${r.external_id}`));
        const newResults = apiResults.filter(
          r => !cachedIds.has(`${r.source}:${r.external_id}`)
        );

        // Cache the new results in background
        if (newResults.length > 0) {
          cacheFoods(newResults).catch(console.warn);
        }

        // Mark API results as not cached
        const apiWithFlag: FoodSearchResult[] = newResults.map(r => ({
          ...r,
          cached: false,
        }));

        if (append) {
          setResults(prev => [...prev, ...apiWithFlag]);
        } else {
          setResults([...cachedResults, ...apiWithFlag]);
        }

        setHasMore(newResults.length >= pageSize);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return; // Ignore aborted requests
        }
        console.error('Food search error:', err);
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize]
  );

  const setQuery = useCallback(
    (newQuery: string) => {
      setQueryState(newQuery);
      setPage(1);

      // Clear existing debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (newQuery.length < MIN_QUERY_LENGTH) {
        setResults([]);
        setHasMore(false);
        return;
      }

      // Debounce the search
      debounceRef.current = setTimeout(() => {
        lastQueryRef.current = newQuery;
        performSearch(newQuery, 1);
      }, debounceMs);
    },
    [performSearch, debounceMs]
  );

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    const nextPage = page + 1;
    setPage(nextPage);
    await performSearch(lastQueryRef.current, nextPage, true);
  }, [isLoading, hasMore, page, performSearch]);

  const clear = useCallback(() => {
    setQueryState('');
    setResults([]);
    setError(null);
    setHasMore(false);
    setPage(1);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    hasMore,
    loadMore,
    clear,
  };
}

/**
 * Hook for immediate search without debouncing
 * Useful for search-on-submit patterns
 */
export function useInstantFoodSearch() {
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string): Promise<FoodSearchResult[]> => {
    if (query.length < MIN_QUERY_LENGTH) {
      setResults([]);
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      // Search cache first
      const cachedResults = await searchCachedFoods(query, 10);

      // Then search via API (FatSecret primary + USDA fallback)
      const apiResults = await searchFoodsApi(query, 0, 15);

      // Merge and dedupe
      const cachedIds = new Set(cachedResults.map(r => `${r.source}:${r.external_id}`));
      const newResults = apiResults.filter(
        r => !cachedIds.has(`${r.source}:${r.external_id}`)
      );

      // Cache new results
      if (newResults.length > 0) {
        cacheFoods(newResults).catch(console.warn);
      }

      const allResults: FoodSearchResult[] = [
        ...cachedResults.map(r => ({ ...r, cached: true })),
        ...newResults.map(r => ({ ...r, cached: false })),
      ];

      setResults(allResults);
      return allResults;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Search failed';
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    isLoading,
    error,
    search,
    clear,
  };
}
