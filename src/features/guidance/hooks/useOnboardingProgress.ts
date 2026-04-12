'use client';

/**
 * Phase 5: Visual Guidance GIFs - Onboarding Progress Hook
 *
 * Tracks which guidance tips the user has seen, persisted to localStorage.
 * This enables showing contextual tooltips only on first feature use.
 */

import { useState, useEffect, useCallback } from 'react';
import type { GuidanceGifKey, OnboardingProgress, UseOnboardingProgressReturn } from '../types';
import { ONBOARDING_PROGRESS_KEY } from '../constants';

/**
 * Default empty progress state
 */
const DEFAULT_PROGRESS: OnboardingProgress = {
  seenTips: {},
  lastUpdated: new Date().toISOString(),
};

/**
 * Hook to track onboarding progress for guidance tips
 *
 * @example
 * ```tsx
 * const { hasSeenTip, markTipSeen, isLoading } = useOnboardingProgress();
 *
 * // Show tooltip only if not seen before
 * if (!hasSeenTip('quickLog')) {
 *   return <ContextualTooltip gifKey="quickLog" onDismiss={() => markTipSeen('quickLog')} />;
 * }
 * ```
 */
export function useOnboardingProgress(): UseOnboardingProgressReturn {
  const [progress, setProgress] = useState<OnboardingProgress>(DEFAULT_PROGRESS);
  const [isLoading, setIsLoading] = useState(true);

  // Load progress from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ONBOARDING_PROGRESS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as OnboardingProgress;
        setProgress(parsed);
      }
    } catch (error) {
      console.error('Failed to load onboarding progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Save progress to localStorage
   */
  const saveProgress = useCallback((newProgress: OnboardingProgress) => {
    try {
      localStorage.setItem(ONBOARDING_PROGRESS_KEY, JSON.stringify(newProgress));
    } catch (error) {
      console.error('Failed to save onboarding progress:', error);
    }
  }, []);

  /**
   * Check if a specific tip has been seen
   */
  const hasSeenTip = useCallback(
    (key: GuidanceGifKey): boolean => {
      return progress.seenTips[key] === true;
    },
    [progress.seenTips]
  );

  /**
   * Mark a tip as seen
   */
  const markTipSeen = useCallback(
    (key: GuidanceGifKey) => {
      setProgress((prev) => {
        const newProgress: OnboardingProgress = {
          seenTips: {
            ...prev.seenTips,
            [key]: true,
          },
          lastUpdated: new Date().toISOString(),
        };
        saveProgress(newProgress);
        return newProgress;
      });
    },
    [saveProgress]
  );

  /**
   * Reset all progress (useful for testing/debugging)
   */
  const resetProgress = useCallback(() => {
    const newProgress = { ...DEFAULT_PROGRESS, lastUpdated: new Date().toISOString() };
    setProgress(newProgress);
    saveProgress(newProgress);
  }, [saveProgress]);

  return {
    hasSeenTip,
    markTipSeen,
    resetProgress,
    isLoading,
  };
}
