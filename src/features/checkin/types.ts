/**
 * Daily Check-in Types
 * Phase 2: Mood/Energy Check-in + Journal
 */

import type { CheckinLevel } from '@/types/database';

// Re-export for convenience
export type { CheckinLevel };

export interface CheckinOption {
  value: CheckinLevel;
  emoji: string;
  label: string;
}

/**
 * Energy level options (1-4 scale)
 */
export const ENERGY_OPTIONS: CheckinOption[] = [
  { value: 1, emoji: '😫', label: 'Exhausted' },
  { value: 2, emoji: '😐', label: 'Low' },
  { value: 3, emoji: '😊', label: 'Good' },
  { value: 4, emoji: '🔥', label: 'Energized' },
];

/**
 * Mood level options (1-4 scale)
 */
export const MOOD_OPTIONS: CheckinOption[] = [
  { value: 1, emoji: '😔', label: 'Down' },
  { value: 2, emoji: '😐', label: 'Neutral' },
  { value: 3, emoji: '🙂', label: 'Good' },
  { value: 4, emoji: '😄', label: 'Great' },
];

/**
 * Sleep quality options (1-4 scale)
 */
export const SLEEP_OPTIONS: CheckinOption[] = [
  { value: 1, emoji: '😴', label: 'Poor' },
  { value: 2, emoji: '😪', label: 'Fair' },
  { value: 3, emoji: '😌', label: 'Good' },
  { value: 4, emoji: '🌟', label: 'Great' },
];

/**
 * Form data for submitting a check-in
 */
export interface CheckinFormData {
  energyLevel: CheckinLevel | null;
  moodLevel: CheckinLevel | null;
  sleepQuality: CheckinLevel | null;
  notes: string;
}

/**
 * Check-in summary for history view
 */
export interface CheckinSummary {
  date: string;
  energyLevel: CheckinLevel | null;
  moodLevel: CheckinLevel | null;
  sleepQuality: CheckinLevel | null;
  hasNotes: boolean;
}

/**
 * Weekly averages for trend display
 */
export interface CheckinWeeklyAverages {
  energy: number | null;
  mood: number | null;
  sleep: number | null;
  daysWithCheckins: number;
}

/**
 * Helper to get option by value
 */
export function getEnergyOption(value: CheckinLevel | null): CheckinOption | undefined {
  if (!value) return undefined;
  return ENERGY_OPTIONS.find((o) => o.value === value);
}

export function getMoodOption(value: CheckinLevel | null): CheckinOption | undefined {
  if (!value) return undefined;
  return MOOD_OPTIONS.find((o) => o.value === value);
}

export function getSleepOption(value: CheckinLevel | null): CheckinOption | undefined {
  if (!value) return undefined;
  return SLEEP_OPTIONS.find((o) => o.value === value);
}
