'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { isFeatureEnabled } from '@/lib/featureFlags';
import { onFoodLogged } from '../utils/checkinEvents';
import { getLocalDateString } from '@/lib/date';

export interface UseShouldShowCheckinPromptResult {
  shouldShow: boolean;
  isLoading: boolean;
  hasLoggedToday: boolean;
  hasCheckedInToday: boolean;
  dismiss: () => void;
  refetch: () => Promise<void>;
}

/**
 * Hook to determine if the check-in prompt should be shown
 * Returns true if:
 * 1. User has logged at least one food item today
 * 2. User has NOT completed a check-in today
 * 3. Feature flag is enabled
 * 4. User hasn't dismissed it this session
 *
 * Automatically refreshes when food is logged via the dispatchFoodLoggedEvent() utility.
 */
export function useShouldShowCheckinPrompt(): UseShouldShowCheckinPromptResult {
  const [hasLoggedToday, setHasLoggedToday] = useState(false);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  const checkConditions = useCallback(async () => {
    // Early return if feature is disabled
    if (!isFeatureEnabled('moodCheckin')) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setHasLoggedToday(false);
        setHasCheckedInToday(false);
        setIsLoading(false);
        return;
      }

      const today = getLocalDateString();

      // Check if user has logged food today
      const { count: foodLogCount } = await supabase
        .from('food_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('log_date', today);

      setHasLoggedToday((foodLogCount ?? 0) > 0);

      // Check if user has checked in today
      const { count: checkinCount } = await supabase
        .from('daily_checkins')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('date', today);

      setHasCheckedInToday((checkinCount ?? 0) > 0);
    } catch (err) {
      console.error('Error checking prompt conditions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check conditions on mount
  useEffect(() => {
    checkConditions();
  }, [checkConditions]);

  // Listen for food logged events to auto-refresh
  useEffect(() => {
    // Only listen if feature is enabled and user hasn't dismissed
    if (!isFeatureEnabled('moodCheckin') || dismissed) {
      return;
    }

    const unsubscribe = onFoodLogged(() => {
      // Re-check conditions when food is logged
      checkConditions();
    });

    return unsubscribe;
  }, [checkConditions, dismissed]);

  // Dismiss for this session
  const dismiss = useCallback(() => {
    setDismissed(true);
  }, []);

  // Should show if: has logged food + hasn't checked in + not dismissed + feature enabled
  const shouldShow =
    isFeatureEnabled('moodCheckin') &&
    hasLoggedToday &&
    !hasCheckedInToday &&
    !dismissed &&
    !isLoading;

  return {
    shouldShow,
    isLoading,
    hasLoggedToday,
    hasCheckedInToday,
    dismiss,
    refetch: checkConditions,
  };
}
