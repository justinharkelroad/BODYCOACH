/**
 * Phase 5: Visual Guidance GIFs - Type Definitions
 *
 * Types for the guidance GIF system that provides visual tutorials
 * and contextual help throughout the app.
 */

/**
 * Available guidance GIF keys
 */
export type GuidanceGifKey =
  | 'barcodeScanning'
  | 'foodSearch'
  | 'quickLog'
  | 'portionProtein'
  | 'portionCarbs'
  | 'portionFats';

/**
 * Configuration for a single guidance GIF
 */
export interface GuidanceGifConfig {
  /** CDN URL for the GIF */
  uri: string;
  /** Short title describing the tip */
  title: string;
  /** Longer description/instruction */
  description: string;
  /** Alternative text for accessibility */
  alt?: string;
}

/**
 * Map of all guidance GIFs by key
 */
export type GuidanceGifsMap = Record<GuidanceGifKey, GuidanceGifConfig>;

/**
 * Onboarding progress state stored in local storage
 */
export interface OnboardingProgress {
  /** Map of tip keys to whether they've been seen */
  seenTips: Record<string, boolean>;
  /** Timestamp of when progress was last updated */
  lastUpdated: string;
}

/**
 * Return type for useOnboardingProgress hook
 */
export interface UseOnboardingProgressReturn {
  /** Check if a specific tip has been seen */
  hasSeenTip: (key: GuidanceGifKey) => boolean;
  /** Mark a tip as seen */
  markTipSeen: (key: GuidanceGifKey) => void;
  /** Reset all progress (for testing/debugging) */
  resetProgress: () => void;
  /** Whether the progress is still loading from storage */
  isLoading: boolean;
}

/**
 * Props for the ContextualTooltip component
 */
export interface ContextualTooltipProps {
  /** Which guidance GIF to show */
  gifKey: GuidanceGifKey;
  /** Whether the tooltip is visible */
  visible: boolean;
  /** Callback when tooltip is dismissed */
  onDismiss: () => void;
  /** Optional custom title (overrides default) */
  title?: string;
  /** Optional custom description (overrides default) */
  description?: string;
}

/**
 * Props for the GuidanceGif component
 */
export interface GuidanceGifProps {
  /** Which guidance GIF to show */
  gifKey: GuidanceGifKey;
  /** Optional width (defaults to 100%) */
  width?: number | string;
  /** Optional height (defaults to auto) */
  height?: number | string;
  /** Whether to show the caption */
  showCaption?: boolean;
  /** Optional additional CSS class */
  className?: string;
}

/**
 * Props for the PortionGuideCard component
 */
export interface PortionGuideCardProps {
  /** Whether the card is expanded by default */
  defaultExpanded?: boolean;
  /** Optional additional CSS class */
  className?: string;
}

/**
 * Portion guide item for the expandable card
 */
export interface PortionGuideItem {
  key: GuidanceGifKey;
  macro: 'protein' | 'carbs' | 'fats';
  bodyPart: string;
  emoji: string;
}
