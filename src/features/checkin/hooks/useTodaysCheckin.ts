'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { DailyCheckin } from '@/types/database';

export interface UseTodaysCheckinResult {
  checkin: DailyCheckin | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Helper to format date as YYYY-MM-DD
 */
function formatDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Hook to get today's check-in if it exists
 */
export function useTodaysCheckin(): UseTodaysCheckinResult {
  const [checkin, setCheckin] = useState<DailyCheckin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodaysCheckin = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setCheckin(null);
        setIsLoading(false);
        return;
      }

      const today = formatDateString(new Date());

      const { data, error: queryError } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      // PGRST116 = not found, which is okay
      if (queryError && queryError.code !== 'PGRST116') {
        throw queryError;
      }

      setCheckin(data as DailyCheckin | null);
    } catch (err) {
      console.error('Error fetching today\'s check-in:', err);
      setError(err instanceof Error ? err.message : 'Failed to load check-in');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodaysCheckin();
  }, [fetchTodaysCheckin]);

  return {
    checkin,
    isLoading,
    error,
    refetch: fetchTodaysCheckin,
  };
}
