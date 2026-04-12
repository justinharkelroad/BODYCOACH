/**
 * Milestone checking and awarding utilities
 */

import { createClient } from '@/lib/supabase/client';
import { MILESTONES, type Milestone, type MilestoneMetricKey } from '../data/milestones';

export interface MilestoneCheck {
  metricKey: MilestoneMetricKey;
  currentValue: number;
}

export interface MilestoneCheckResult {
  newMilestones: Milestone[];
}

/**
 * Check if user has earned any new milestones based on current metrics
 * Call after food logs, scans, etc.
 */
export async function checkForNewMilestones(
  userId: string,
  checks: MilestoneCheck[]
): Promise<MilestoneCheckResult> {
  const supabase = createClient();

  // Get user's already-earned milestones
  const { data: earned } = await supabase
    .from('user_milestones')
    .select('milestone_id')
    .eq('user_id', userId);

  const earnedIds = new Set(earned?.map((e) => e.milestone_id) ?? []);
  const newMilestones: Milestone[] = [];

  for (const check of checks) {
    // Find milestones that match this metric
    const relevantMilestones = getRelevantMilestones(check.metricKey);

    for (const milestone of relevantMilestones) {
      // Skip if already earned
      if (earnedIds.has(milestone.id)) continue;

      // Check if threshold met
      if (check.currentValue >= milestone.threshold) {
        // Award milestone
        const { error } = await supabase.from('user_milestones').insert({
          user_id: userId,
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

  return { newMilestones };
}

/**
 * Get milestones relevant to a specific metric key
 */
function getRelevantMilestones(metricKey: MilestoneMetricKey): Milestone[] {
  return MILESTONES.filter((m) => {
    switch (metricKey) {
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
}

/**
 * Mark a milestone as seen (dismiss celebration)
 */
export async function markMilestoneSeen(
  userId: string,
  milestoneId: string
): Promise<void> {
  const supabase = createClient();

  await supabase
    .from('user_milestones')
    .update({ seen: true })
    .eq('user_id', userId)
    .eq('milestone_id', milestoneId);
}

/**
 * Get all unseen milestones for a user
 */
export async function getUnseenMilestones(userId: string): Promise<Milestone[]> {
  const supabase = createClient();

  const { data } = await supabase
    .from('user_milestones')
    .select('milestone_id')
    .eq('user_id', userId)
    .eq('seen', false)
    .order('unlocked_at', { ascending: true });

  if (!data || data.length === 0) return [];

  return data
    .map((row) => MILESTONES.find((m) => m.id === row.milestone_id))
    .filter((m): m is Milestone => m !== undefined);
}

/**
 * Update a milestone progress metric
 */
export async function updateMilestoneProgress(
  userId: string,
  metricKey: MilestoneMetricKey,
  value: number
): Promise<void> {
  const supabase = createClient();

  await supabase.from('user_milestone_progress').upsert(
    {
      user_id: userId,
      metric_key: metricKey,
      metric_value: value,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'user_id,metric_key',
    }
  );
}

/**
 * Increment a milestone progress metric by 1
 */
export async function incrementMilestoneProgress(
  userId: string,
  metricKey: MilestoneMetricKey
): Promise<number> {
  const supabase = createClient();

  // Get current value
  const { data: current } = await supabase
    .from('user_milestone_progress')
    .select('metric_value')
    .eq('user_id', userId)
    .eq('metric_key', metricKey)
    .single();

  const newValue = (current?.metric_value ?? 0) + 1;

  await supabase.from('user_milestone_progress').upsert(
    {
      user_id: userId,
      metric_key: metricKey,
      metric_value: newValue,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'user_id,metric_key',
    }
  );

  return newValue;
}

/**
 * Get current progress for a metric
 */
export async function getMilestoneProgress(
  userId: string,
  metricKey: MilestoneMetricKey
): Promise<number> {
  const supabase = createClient();

  const { data } = await supabase
    .from('user_milestone_progress')
    .select('metric_value')
    .eq('user_id', userId)
    .eq('metric_key', metricKey)
    .single();

  return data?.metric_value ?? 0;
}
