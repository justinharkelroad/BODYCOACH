'use client';

/**
 * Phase 5: Visual Guidance GIFs - Wrapper Component
 *
 * Handles feature flag check and onboarding progress automatically.
 * Use this component to add contextual tooltips to features.
 */

import { useState, useEffect } from 'react';
import { isFeatureEnabled } from '@/lib/featureFlags';
import { useOnboardingProgress } from '../hooks/useOnboardingProgress';
import { ContextualTooltip } from './ContextualTooltip';
import type { GuidanceGifKey } from '../types';

interface GuidanceTooltipWrapperProps {
  /** Which guidance GIF to show */
  gifKey: GuidanceGifKey;
  /** Content to render (the feature being wrapped) */
  children: React.ReactNode;
  /** Optional delay before showing tooltip (ms) */
  delay?: number;
  /** Optional custom title */
  title?: string;
  /** Optional custom description */
  description?: string;
}

/**
 * Wrapper that shows a contextual tooltip on first feature use
 *
 * @example
 * ```tsx
 * <GuidanceTooltipWrapper gifKey="quickLog">
 *   <QuickLogSection />
 * </GuidanceTooltipWrapper>
 * ```
 */
export function GuidanceTooltipWrapper({
  gifKey,
  children,
  delay = 500,
  title,
  description,
}: GuidanceTooltipWrapperProps) {
  const { hasSeenTip, markTipSeen, isLoading } = useOnboardingProgress();
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Don't show if feature is disabled or still loading
    if (!isFeatureEnabled('guidanceGifs') || isLoading) {
      return;
    }

    // Don't show if already seen
    if (hasSeenTip(gifKey)) {
      return;
    }

    // Show tooltip after delay
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [gifKey, hasSeenTip, isLoading, delay]);

  const handleDismiss = () => {
    setShowTooltip(false);
    markTipSeen(gifKey);
  };

  return (
    <>
      {children}
      <ContextualTooltip
        gifKey={gifKey}
        visible={showTooltip}
        onDismiss={handleDismiss}
        title={title}
        description={description}
      />
    </>
  );
}
