'use client';

import { useCallback, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { isFeatureEnabled } from '@/lib/featureFlags';
import { useUpdateStreakOnLog } from './useStreak';
import { useCheckMilestones } from '@/features/milestones';
import type { Milestone } from '@/features/milestones';

export interface UseFoodLogIntegrationResult {
  onFoodLogged: () => Promise<{
    streakUpdated: boolean;
    newStreak: number;
    newMilestones: Milestone[];
  }>;
  isProcessing: boolean;
}

/**
 * Integration hook to update streaks and check milestones after food logging
 *
 * Usage:
 * ```tsx
 * const { onFoodLogged, isProcessing } = useFoodLogIntegration();
 *
 * // In your food logging handler:
 * async function handleLogFood() {
 *   await addLog(foodId, servings);
 *   const { newMilestones } = await onFoodLogged();
 *   if (newMilestones.length > 0) {
 *     queueCelebrations(newMilestones);
 *   }
 * }
 * ```
 */
export function useFoodLogIntegration(): UseFoodLogIntegrationResult {
  const [isProcessing, setIsProcessing] = useState(false);
  const { updateStreak, isUpdating: isUpdatingStreak } = useUpdateStreakOnLog();
  const { checkAndAwardMilestones, isChecking } = useCheckMilestones();

  const onFoodLogged = useCallback(async () => {
    setIsProcessing(true);

    let streakResult = { newStreak: 0, newLongest: 0, isNewDay: false };
    let newMilestones: Milestone[] = [];

    try {
      // Skip if features are disabled
      const streaksEnabled = isFeatureEnabled('streaks');
      const milestonesEnabled = isFeatureEnabled('milestones');

      // Update streak if enabled
      if (streaksEnabled) {
        try {
          streakResult = await updateStreak();
        } catch (err) {
          console.error('Failed to update streak:', err);
        }
      }

      // Check for milestones if enabled
      if (milestonesEnabled) {
        try {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user) {
            // Get total food logs count
            const { count: totalLogs } = await supabase
              .from('food_logs')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.id);

            // Check for new milestones
            const checks = [
              { metricKey: 'total_logs', currentValue: totalLogs ?? 0 },
            ];

            // Add streak check if streak was updated
            if (streaksEnabled && streakResult.isNewDay) {
              checks.push({
                metricKey: 'current_streak',
                currentValue: streakResult.newStreak,
              });
            }

            newMilestones = await checkAndAwardMilestones(checks);
          }
        } catch (err) {
          console.error('Failed to check milestones:', err);
        }
      }

      return {
        streakUpdated: streakResult.isNewDay,
        newStreak: streakResult.newStreak,
        newMilestones,
      };
    } finally {
      setIsProcessing(false);
    }
  }, [updateStreak, checkAndAwardMilestones]);

  return {
    onFoodLogged,
    isProcessing: isProcessing || isUpdatingStreak || isChecking,
  };
}

/**
 * Hook to handle barcode scans for milestone tracking
 */
export function useBarcodeScannedIntegration() {
  const { checkAndAwardMilestones } = useCheckMilestones();

  const onBarcodeScanned = useCallback(async () => {
    if (!isFeatureEnabled('milestones')) return [];

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return [];

      // Get current scan count (we'd need to track this separately or count from food_logs)
      // For now, we'll check first_scan milestone
      const newMilestones = await checkAndAwardMilestones([
        { metricKey: 'first_scan', currentValue: 1 },
      ]);

      return newMilestones;
    } catch (err) {
      console.error('Failed to check scan milestones:', err);
      return [];
    }
  }, [checkAndAwardMilestones]);

  return { onBarcodeScanned };
}
