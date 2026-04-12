'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type {
  UserNutritionProfile,
  UserNutritionProfileInsert,
  UserNutritionProfileUpdate,
  NutritionGoalType,
} from '../types/nutrition.types';
import { calculateTargets, type NutritionTargets } from '../services/nutritionCalculator';

export interface UseNutritionProfileResult {
  profile: UserNutritionProfile | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (updates: UserNutritionProfileUpdate) => Promise<void>;
  createProfile: (data: Partial<UserNutritionProfileInsert>) => Promise<void>;
  recalculateTargets: (params: RecalculateParams) => NutritionTargets;
  refetch: () => Promise<void>;
}

interface RecalculateParams {
  weightLbs: number;
  heightIn: number;
  ageYears: number;
  isFemale: boolean;
  activityLevel: string;
  goalType: NutritionGoalType;
  isBreastfeeding?: boolean;
  breastfeedingSessionsPerDay?: number;
  postpartumWeeks?: number;
}

export function useNutritionProfile(): UseNutritionProfileResult {
  const [profile, setProfile] = useState<UserNutritionProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      // First try user_nutrition_profiles table
      const { data: nutritionProfile, error: nutritionError } = await supabase
        .from('user_nutrition_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (nutritionProfile && !nutritionError) {
        setProfile(nutritionProfile as UserNutritionProfile);
        return;
      }

      // Fallback to main profiles table (where onboarding saves targets)
      const { data: mainProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, goal, target_calories, target_protein, target_carbs, target_fat, is_breastfeeding, breastfeeding_sessions')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // Map main profile to nutrition profile format
      if (mainProfile) {
        const mappedProfile: UserNutritionProfile = {
          id: mainProfile.id,
          user_id: user.id,
          goal_type: mainProfile.goal as NutritionGoalType,
          target_calories: mainProfile.target_calories,
          target_protein: mainProfile.target_protein,
          target_carbs: mainProfile.target_carbs,
          target_fat: mainProfile.target_fat,
          is_breastfeeding: mainProfile.is_breastfeeding || false,
          breastfeeding_sessions_per_day: mainProfile.breastfeeding_sessions || 0,
          breastfeeding_calorie_add: (mainProfile.breastfeeding_sessions || 0) * 40,
          postpartum_weeks: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setProfile(mappedProfile);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error('Error fetching nutrition profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const createProfile = useCallback(
    async (data: Partial<UserNutritionProfileInsert>) => {
      setError(null);

      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Not authenticated');
        }

        const insert: UserNutritionProfileInsert = {
          user_id: user.id,
          goal_type: data.goal_type || null,
          target_calories: data.target_calories || null,
          target_protein: data.target_protein || null,
          target_carbs: data.target_carbs || null,
          target_fat: data.target_fat || null,
          is_breastfeeding: data.is_breastfeeding || false,
          breastfeeding_sessions_per_day: data.breastfeeding_sessions_per_day || 0,
          breastfeeding_calorie_add: data.breastfeeding_calorie_add || 0,
          postpartum_weeks: data.postpartum_weeks || null,
        };

        const { data: created, error: insertError } = await supabase
          .from('user_nutrition_profiles')
          .insert(insert)
          .select()
          .single();

        if (insertError) throw insertError;

        setProfile(created as UserNutritionProfile);
      } catch (err) {
        console.error('Error creating nutrition profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to create profile');
        throw err;
      }
    },
    []
  );

  const updateProfile = useCallback(
    async (updates: UserNutritionProfileUpdate) => {
      setError(null);

      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Not authenticated');
        }

        const { data: updated, error: updateError } = await supabase
          .from('user_nutrition_profiles')
          .update(updates)
          .eq('user_id', user.id)
          .select()
          .single();

        if (updateError) throw updateError;

        setProfile(updated as UserNutritionProfile);
      } catch (err) {
        console.error('Error updating nutrition profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to update profile');
        throw err;
      }
    },
    []
  );

  const recalculateTargets = useCallback((params: RecalculateParams): NutritionTargets => {
    return calculateTargets(params);
  }, []);

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    createProfile,
    recalculateTargets,
    refetch: fetchProfile,
  };
}

/**
 * Hook for just reading the profile (no mutations)
 */
export function useNutritionTargets() {
  const { profile, isLoading, error } = useNutritionProfile();

  return {
    targets: profile
      ? {
          calories: profile.target_calories || 0,
          protein: profile.target_protein || 0,
          carbs: profile.target_carbs || 0,
          fat: profile.target_fat || 0,
        }
      : null,
    isBreastfeeding: profile?.is_breastfeeding || false,
    breastfeedingAdd: profile?.breastfeeding_calorie_add || 0,
    isLoading,
    error,
  };
}
