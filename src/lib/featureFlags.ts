/**
 * Feature flags for phased feature rollout
 *
 * Set to true to enable features during development.
 * In production, these could be connected to a remote config service.
 */

export const FEATURE_FLAGS = {
  // ===== Phase 1 =====
  streaks: true,
  milestones: true,

  // ===== Phase 2 =====
  moodCheckin: true,
  journalNotes: true,

  // ===== Phase 3 =====
  adaptiveTargets: true,

  // ===== Phase 4 =====
  aiMealSuggestions: true,

  // ===== Phase 5 =====
  guidanceGifs: true, // Enabled for development
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return FEATURE_FLAGS[flag];
}

/**
 * Higher-order component pattern for feature flags
 * Usage: {isFeatureEnabled('streaks') && <StreakCard />}
 */
export function withFeatureFlag<T>(
  flag: FeatureFlag,
  component: T
): T | null {
  return isFeatureEnabled(flag) ? component : null;
}
