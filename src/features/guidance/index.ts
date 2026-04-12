/**
 * Phase 5: Visual Guidance GIFs
 *
 * Provides visual tutorials and contextual help throughout the app.
 * Includes GIF components, onboarding progress tracking, and portion guides.
 */

// Types
export * from './types';

// Constants
export * from './constants';

// Hooks
export { useOnboardingProgress } from './hooks/useOnboardingProgress';

// Components
export { GuidanceGif } from './components/GuidanceGif';
export { ContextualTooltip } from './components/ContextualTooltip';
export { PortionGuideCard } from './components/PortionGuideCard';
export { GuidanceTooltipWrapper } from './components/GuidanceTooltipWrapper';
