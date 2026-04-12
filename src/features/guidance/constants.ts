/**
 * Phase 5: Visual Guidance GIFs - Constants
 *
 * GIF configurations for visual tutorials and contextual help.
 * GIFs should be hosted on a CDN for optimal loading performance.
 *
 * IMPORTANT: Replace placeholder URLs with actual CDN URLs once GIFs are created.
 * Each GIF should be <500KB for optimal mobile performance.
 */

import type { GuidanceGifsMap, PortionGuideItem } from './types';

/**
 * CDN base URL for guidance GIFs
 * TODO: Replace with actual CDN URL in production
 */
const CDN_BASE_URL = 'https://cdn.standardnutrition.com/guidance';

/**
 * All guidance GIFs configuration
 *
 * Usage locations:
 * - barcodeScanning: Onboarding, Search empty state
 * - foodSearch: Onboarding
 * - quickLog: Dashboard tooltip (first visit)
 * - portionProtein/Carbs/Fats: Food detail screen
 */
export const GUIDANCE_GIFS: GuidanceGifsMap = {
  barcodeScanning: {
    uri: `${CDN_BASE_URL}/barcode-scan.gif`,
    title: 'Scan any barcode',
    description: 'Point your camera at any food package to instantly look up nutrition info.',
    alt: 'Animation showing how to scan a barcode',
  },
  foodSearch: {
    uri: `${CDN_BASE_URL}/food-search.gif`,
    title: 'Search for foods',
    description: 'Type any food, brand, or restaurant name to find nutrition data.',
    alt: 'Animation showing how to search for foods',
  },
  quickLog: {
    uri: `${CDN_BASE_URL}/quick-log.gif`,
    title: 'Quick log favorites',
    description: 'Tap your frequent foods to log them instantly with one tap.',
    alt: 'Animation showing how to quick log foods',
  },
  portionProtein: {
    uri: `${CDN_BASE_URL}/portion-protein.gif`,
    title: 'Protein serving',
    description: 'A serving of protein is about the size of your palm.',
    alt: 'Animation showing palm-sized protein portion',
  },
  portionCarbs: {
    uri: `${CDN_BASE_URL}/portion-carbs.gif`,
    title: 'Carb serving',
    description: 'A serving of carbs is about the size of your fist.',
    alt: 'Animation showing fist-sized carb portion',
  },
  portionFats: {
    uri: `${CDN_BASE_URL}/portion-fats.gif`,
    title: 'Fat serving',
    description: 'A serving of fats is about the size of your thumb.',
    alt: 'Animation showing thumb-sized fat portion',
  },
};

/**
 * Portion guide items for the expandable card
 */
export const PORTION_GUIDE_ITEMS: PortionGuideItem[] = [
  {
    key: 'portionProtein',
    macro: 'protein',
    bodyPart: 'Palm',
    emoji: '🖐️',
  },
  {
    key: 'portionCarbs',
    macro: 'carbs',
    bodyPart: 'Fist',
    emoji: '✊',
  },
  {
    key: 'portionFats',
    macro: 'fats',
    bodyPart: 'Thumb',
    emoji: '👍',
  },
];

/**
 * Local storage key for onboarding progress
 */
export const ONBOARDING_PROGRESS_KEY = 'stdnutrition:onboarding-progress';

/**
 * Tips that should be shown during onboarding flow
 */
export const ONBOARDING_TIPS: Array<{ key: keyof typeof GUIDANCE_GIFS; order: number }> = [
  { key: 'barcodeScanning', order: 1 },
  { key: 'foodSearch', order: 2 },
];

/**
 * Tips that should be shown contextually on first feature use
 */
export const CONTEXTUAL_TIPS: Array<{ key: keyof typeof GUIDANCE_GIFS; feature: string }> = [
  { key: 'quickLog', feature: 'dashboard' },
  { key: 'portionProtein', feature: 'food-detail' },
  { key: 'portionCarbs', feature: 'food-detail' },
  { key: 'portionFats', feature: 'food-detail' },
];
