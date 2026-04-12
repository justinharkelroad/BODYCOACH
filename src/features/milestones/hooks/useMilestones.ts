'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { UserMilestone } from '@/types/database';
import {
  MILESTONES,
  getMilestoneById,
  type Milestone,
} from '../data/milestones';
import {
  getUnseenMilestones,
  markMilestoneSeen,
} from '../utils/milestoneChecker';

export interface UseMilestonesResult {
  earnedMilestones: Milestone[];
  unlockedCount: number;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for accessing user's earned milestones
 */
export function useMilestones(): UseMilestonesResult {
  const [earnedMilestones, setEarnedMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMilestones = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setEarnedMilestones([]);
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('user_milestones')
        .select('milestone_id, unlocked_at')
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false });

      if (fetchError) throw fetchError;

      const milestones = (data ?? [])
        .map((row) => getMilestoneById(row.milestone_id))
        .filter((m): m is Milestone => m !== undefined);

      setEarnedMilestones(milestones);
    } catch (err) {
      console.error('Error fetching milestones:', err);
      setError(err instanceof Error ? err.message : 'Failed to load milestones');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  return {
    earnedMilestones,
    unlockedCount: earnedMilestones.length,
    totalCount: MILESTONES.length,
    isLoading,
    error,
    refetch: fetchMilestones,
  };
}

export interface UseMilestoneCelebrationResult {
  currentCelebration: Milestone | null;
  celebrationQueue: Milestone[];
  dismissCelebration: () => Promise<void>;
  queueCelebrations: (milestones: Milestone[]) => void;
  isLoading: boolean;
}

/**
 * Hook for managing milestone celebrations
 * Shows one celebration at a time and queues others
 */
export function useMilestoneCelebration(): UseMilestoneCelebrationResult {
  const [queue, setQueue] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const initialLoadDone = useRef(false);

  // Load any unseen milestones on mount
  useEffect(() => {
    async function loadUnseen() {
      if (initialLoadDone.current) return;
      initialLoadDone.current = true;

      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setIsLoading(false);
          return;
        }

        setUserId(user.id);
        const unseen = await getUnseenMilestones(user.id);
        setQueue(unseen);
      } catch (err) {
        console.error('Error loading unseen milestones:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadUnseen();
  }, []);

  const dismissCelebration = useCallback(async () => {
    if (!userId || queue.length === 0) return;

    const current = queue[0];

    try {
      await markMilestoneSeen(userId, current.id);
      setQueue((prev) => prev.slice(1));
    } catch (err) {
      console.error('Error dismissing celebration:', err);
      // Still remove from queue even if DB update fails
      setQueue((prev) => prev.slice(1));
    }
  }, [userId, queue]);

  const queueCelebrations = useCallback((milestones: Milestone[]) => {
    if (milestones.length === 0) return;
    setQueue((prev) => [...prev, ...milestones]);
  }, []);

  return {
    currentCelebration: queue[0] ?? null,
    celebrationQueue: queue,
    dismissCelebration,
    queueCelebrations,
    isLoading,
  };
}

export interface UseCheckMilestonesResult {
  checkAndAwardMilestones: (
    checks: { metricKey: string; currentValue: number }[]
  ) => Promise<Milestone[]>;
  isChecking: boolean;
}

/**
 * Hook to check and award milestones after actions
 */
export function useCheckMilestones(): UseCheckMilestonesResult {
  const [isChecking, setIsChecking] = useState(false);

  const checkAndAwardMilestones = useCallback(
    async (
      checks: { metricKey: string; currentValue: number }[]
    ): Promise<Milestone[]> => {
      setIsChecking(true);

      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return [];

        // Get already earned milestones
        const { data: earned } = await supabase
          .from('user_milestones')
          .select('milestone_id')
          .eq('user_id', user.id);

        const earnedIds = new Set(earned?.map((e) => e.milestone_id) ?? []);
        const newMilestones: Milestone[] = [];

        for (const check of checks) {
          const relevantMilestones = MILESTONES.filter((m) => {
            switch (check.metricKey) {
              case 'current_streak':
                return m.category === 'streak';
              case 'total_logs':
                return m.category === 'logging';
              case 'total_scans':
                return m.id === 'first_scan' || m.id.startsWith('scans_');
              case 'protein_days':
                return m.category === 'protein';
              case 'first_scan':
                return m.id === 'first_scan';
              case 'first_photo':
                return m.id === 'first_photo';
              default:
                return false;
            }
          });

          for (const milestone of relevantMilestones) {
            if (earnedIds.has(milestone.id)) continue;

            if (check.currentValue >= milestone.threshold) {
              const { error } = await supabase.from('user_milestones').insert({
                user_id: user.id,
                milestone_id: milestone.id,
                seen: false,
              });

              if (!error) {
                newMilestones.push(milestone);
                earnedIds.add(milestone.id);
              }
            }
          }
        }

        return newMilestones;
      } finally {
        setIsChecking(false);
      }
    },
    []
  );

  return {
    checkAndAwardMilestones,
    isChecking,
  };
}
