'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { DailyCheckin, CheckinLevel } from '@/types/database';
import { getLocalDateString } from '@/lib/date';

export interface SubmitCheckinData {
  energyLevel?: CheckinLevel | null;
  moodLevel?: CheckinLevel | null;
  sleepQuality?: CheckinLevel | null;
  notes?: string | null;
}

export interface UseSubmitCheckinResult {
  submitCheckin: (data: SubmitCheckinData) => Promise<DailyCheckin>;
  isSubmitting: boolean;
  error: string | null;
}

/**
 * Hook to submit (upsert) a daily check-in
 * Will create a new check-in or update existing one for today
 */
export function useSubmitCheckin(): UseSubmitCheckinResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitCheckin = useCallback(async (data: SubmitCheckinData): Promise<DailyCheckin> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const today = getLocalDateString();

      // Check if a check-in already exists for today
      const { data: existing } = await supabase
        .from('daily_checkins')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      let result: DailyCheckin;

      if (existing) {
        // Update existing check-in
        const { data: updated, error: updateError } = await supabase
          .from('daily_checkins')
          .update({
            energy_level: data.energyLevel,
            mood_level: data.moodLevel,
            sleep_quality: data.sleepQuality,
            notes: data.notes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (updateError) throw updateError;
        result = updated as DailyCheckin;
      } else {
        // Insert new check-in
        const { data: inserted, error: insertError } = await supabase
          .from('daily_checkins')
          .insert({
            user_id: user.id,
            date: today,
            energy_level: data.energyLevel,
            mood_level: data.moodLevel,
            sleep_quality: data.sleepQuality,
            notes: data.notes,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        result = inserted as DailyCheckin;
      }

      return result;
    } catch (err) {
      console.error('Error submitting check-in:', err);
      const message = err instanceof Error ? err.message : 'Failed to save check-in';
      setError(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    submitCheckin,
    isSubmitting,
    error,
  };
}
