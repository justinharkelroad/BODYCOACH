'use client';

import { useState, useCallback, useRef } from 'react';
import type { NormalizedFood, BarcodeScanResult } from '../types/nutrition.types';
import { getCachedFoodByBarcode, cacheFood } from '../services/foodCacheService';

/**
 * Look up barcode via API route (FatSecret -> Open Food Facts -> USDA)
 */
async function lookupBarcodeApi(barcode: string): Promise<{ food: NormalizedFood | null; source: string }> {
  const response = await fetch(`/api/nutrition/barcode?barcode=${encodeURIComponent(barcode)}`);

  if (!response.ok) {
    throw new Error(`Barcode lookup failed: ${response.status}`);
  }

  return response.json();
}

export interface UseBarcodeScannerResult {
  isScanning: boolean;
  isLoading: boolean;
  result: BarcodeScanResult | null;
  error: string | null;
  startScanning: () => void;
  stopScanning: () => void;
  processBarcode: (barcode: string) => Promise<BarcodeScanResult>;
  reset: () => void;
}

export function useBarcodeScanner(): UseBarcodeScannerResult {
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BarcodeScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lastBarcodeRef = useRef<string | null>(null);
  const processingRef = useRef(false);

  const startScanning = useCallback(() => {
    setIsScanning(true);
    setResult(null);
    setError(null);
    lastBarcodeRef.current = null;
  }, []);

  const stopScanning = useCallback(() => {
    setIsScanning(false);
  }, []);

  const processBarcode = useCallback(async (barcode: string): Promise<BarcodeScanResult> => {
    // Prevent duplicate processing of same barcode
    if (processingRef.current || barcode === lastBarcodeRef.current) {
      return result || { barcode, food: null, source: 'not_found' };
    }

    processingRef.current = true;
    lastBarcodeRef.current = barcode;
    setIsLoading(true);
    setError(null);

    try {
      // 1. Check local cache first (instant)
      const cachedFood = await getCachedFoodByBarcode(barcode);
      if (cachedFood) {
        const scanResult: BarcodeScanResult = {
          barcode,
          food: {
            source: cachedFood.source,
            external_id: cachedFood.external_id || cachedFood.id,
            barcode: cachedFood.barcode || undefined,
            name: cachedFood.name,
            brand: cachedFood.brand || undefined,
            serving_size: cachedFood.serving_size || 100,
            serving_unit: cachedFood.serving_unit || 'g',
            calories: cachedFood.calories || 0,
            protein: cachedFood.protein || 0,
            carbs: cachedFood.carbs || 0,
            fat: cachedFood.fat || 0,
            fiber: cachedFood.fiber || undefined,
            sugar: cachedFood.sugar || undefined,
            sodium: cachedFood.sodium || undefined,
          },
          source: 'cache',
        };
        setResult(scanResult);
        setIsScanning(false);
        return scanResult;
      }

      // 2. Use API route (FatSecret -> Open Food Facts -> USDA)
      const apiResult = await lookupBarcodeApi(barcode);

      if (apiResult.food) {
        // Cache the result
        await cacheFood(apiResult.food);

        const scanResult: BarcodeScanResult = {
          barcode,
          food: apiResult.food,
          source: apiResult.source as BarcodeScanResult['source'],
        };
        setResult(scanResult);
        setIsScanning(false);
        return scanResult;
      }

      // Not found in any database
      const scanResult: BarcodeScanResult = {
        barcode,
        food: null,
        source: 'not_found',
      };
      setResult(scanResult);
      setIsScanning(false);
      return scanResult;
    } catch (err) {
      console.error('Barcode lookup error:', err);
      const message = err instanceof Error ? err.message : 'Failed to look up barcode';
      setError(message);

      const errorResult: BarcodeScanResult = {
        barcode,
        food: null,
        source: 'not_found',
      };
      setResult(errorResult);
      return errorResult;
    } finally {
      setIsLoading(false);
      processingRef.current = false;
    }
  }, [result]);

  const reset = useCallback(() => {
    setIsScanning(false);
    setIsLoading(false);
    setResult(null);
    setError(null);
    lastBarcodeRef.current = null;
    processingRef.current = false;
  }, []);

  return {
    isScanning,
    isLoading,
    result,
    error,
    startScanning,
    stopScanning,
    processBarcode,
    reset,
  };
}

/**
 * Validate barcode format
 * Supports EAN-13, EAN-8, UPC-A, UPC-E
 */
export function isValidBarcode(barcode: string): boolean {
  // Remove any whitespace
  const cleaned = barcode.replace(/\s/g, '');

  // Check if it's all digits
  if (!/^\d+$/.test(cleaned)) {
    return false;
  }

  // Check valid lengths
  const validLengths = [8, 12, 13, 14]; // EAN-8, UPC-A, EAN-13, GTIN-14
  if (!validLengths.includes(cleaned.length)) {
    return false;
  }

  return true;
}

/**
 * Normalize barcode to standard format
 */
export function normalizeBarcode(barcode: string): string {
  // Remove whitespace and non-digits
  let cleaned = barcode.replace(/[^\d]/g, '');

  // Pad UPC-A to EAN-13 if needed (add leading 0)
  if (cleaned.length === 12) {
    cleaned = '0' + cleaned;
  }

  return cleaned;
}
