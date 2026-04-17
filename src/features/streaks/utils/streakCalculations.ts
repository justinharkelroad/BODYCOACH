/**
 * Streak calculation utilities
 *
 * Pure functions for calculating streak status and updates.
 * No side effects or database operations.
 */

import type { StreakStatus } from '@/types/database';
import { getLocalDateString } from '@/lib/date';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastLogDate: string | null;
  streakStartDate: string | null;
  streakFrozenAt: string | null;
  freezesUsedThisWeek: number;
  freezeWeekStart: string | null;
  totalDaysLogged: number;
}

export interface StreakStatusResult {
  currentStreak: number;
  longestStreak: number;
  status: StreakStatus;
  canFreeze: boolean;
  freezesRemaining: number;
  totalDaysLogged: number;
  daysUntilStreakBreaks: number;
}

export interface StreakUpdateResult {
  newStreak: number;
  newLongest: number;
  isNewDay: boolean;
  newStreakStartDate: string | null;
}

/**
 * Get the start of day for a given date in local timezone
 */
function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Subtract days from a date
 */
function subDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

/**
 * Check if two dates are the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Get the start of the week (Sunday) for a given date
 */
function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  result.setDate(result.getDate() - day);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Format date as YYYY-MM-DD string in local timezone.
 */
export function formatDateString(date: Date): string {
  return getLocalDateString(date);
}

/**
 * Parse a date string (YYYY-MM-DD) to Date object
 */
function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Calculate current streak status based on stored data
 */
export function calculateStreakStatus(
  streak: StreakData,
  hasLoggedToday: boolean
): StreakStatusResult {
  const today = startOfDay(new Date());
  const yesterday = subDays(today, 1);
  const twoDaysAgo = subDays(today, 2);
  const lastLog = streak.lastLogDate ? startOfDay(parseDate(streak.lastLogDate)) : null;

  // Check if freeze was used yesterday
  const frozenAt = streak.streakFrozenAt
    ? startOfDay(new Date(streak.streakFrozenAt))
    : null;
  const isFrozenYesterday = frozenAt && isSameDay(frozenAt, yesterday);

  // Calculate freezes remaining this week
  const weekStart = startOfWeek(today);
  const freezeWeekStart = streak.freezeWeekStart
    ? startOfDay(parseDate(streak.freezeWeekStart))
    : null;
  const freezesThisWeek =
    freezeWeekStart && isSameDay(freezeWeekStart, weekStart)
      ? streak.freezesUsedThisWeek
      : 0;
  const freezesRemaining = Math.max(0, 1 - freezesThisWeek);

  // Case 1: Already logged today - streak is active
  if (hasLoggedToday) {
    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      status: 'active',
      canFreeze: false,
      freezesRemaining,
      totalDaysLogged: streak.totalDaysLogged,
      daysUntilStreakBreaks: 1, // Tomorrow if they don't log
    };
  }

  // Case 2: Logged yesterday - streak at risk but not broken
  if (lastLog && isSameDay(lastLog, yesterday)) {
    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      status: 'at_risk',
      canFreeze: freezesRemaining > 0,
      freezesRemaining,
      totalDaysLogged: streak.totalDaysLogged,
      daysUntilStreakBreaks: 0, // Today
    };
  }

  // Case 3: Streak is frozen (used freeze yesterday)
  if (isFrozenYesterday) {
    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      status: 'frozen',
      canFreeze: false,
      freezesRemaining,
      totalDaysLogged: streak.totalDaysLogged,
      daysUntilStreakBreaks: 0, // Log today to maintain
    };
  }

  // Case 4: Missed yesterday but logged two days ago - can still freeze
  if (lastLog && isSameDay(lastLog, twoDaysAgo) && freezesRemaining > 0) {
    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      status: 'at_risk',
      canFreeze: true,
      freezesRemaining,
      totalDaysLogged: streak.totalDaysLogged,
      daysUntilStreakBreaks: 0, // Must act today
    };
  }

  // Case 5: Streak is broken
  return {
    currentStreak: 0,
    longestStreak: streak.longestStreak,
    status: 'broken',
    canFreeze: false,
    freezesRemaining,
    totalDaysLogged: streak.totalDaysLogged,
    daysUntilStreakBreaks: -1, // Already broken
  };
}

/**
 * Calculate updated streak after logging food
 */
export function calculateStreakAfterLog(streak: StreakData): StreakUpdateResult {
  const today = startOfDay(new Date());
  const yesterday = subDays(today, 1);
  const lastLog = streak.lastLogDate
    ? startOfDay(parseDate(streak.lastLogDate))
    : null;

  const todayStr = formatDateString(today);

  // Already logged today - no change
  if (lastLog && isSameDay(lastLog, today)) {
    return {
      newStreak: streak.currentStreak,
      newLongest: streak.longestStreak,
      isNewDay: false,
      newStreakStartDate: streak.streakStartDate,
    };
  }

  // Check if streak was frozen yesterday (covers the missed day)
  const frozenAt = streak.streakFrozenAt
    ? startOfDay(new Date(streak.streakFrozenAt))
    : null;
  const wasFrozenYesterday = frozenAt && isSameDay(frozenAt, yesterday);

  let newStreak: number;
  let newStreakStartDate: string | null = streak.streakStartDate;

  // First ever log
  if (!lastLog) {
    newStreak = 1;
    newStreakStartDate = todayStr;
  }
  // Continuing streak (logged yesterday OR freeze covered yesterday)
  else if (isSameDay(lastLog, yesterday) || wasFrozenYesterday) {
    newStreak = streak.currentStreak + 1;
    // Keep existing streak start date
  }
  // Streak was broken - start fresh
  else {
    newStreak = 1;
    newStreakStartDate = todayStr;
  }

  return {
    newStreak,
    newLongest: Math.max(newStreak, streak.longestStreak),
    isNewDay: true,
    newStreakStartDate,
  };
}

/**
 * Get motivational message based on streak status
 */
export function getStreakMessage(status: StreakStatusResult): string {
  if (status.status === 'active') {
    if (status.currentStreak >= 100) {
      return 'Incredible dedication!';
    }
    if (status.currentStreak >= 30) {
      return 'A full month strong!';
    }
    if (status.currentStreak >= 14) {
      return 'Two weeks of consistency!';
    }
    if (status.currentStreak >= 7) {
      return 'One week down!';
    }
    if (status.currentStreak >= 3) {
      return 'Building momentum!';
    }
    return 'Keep it going!';
  }

  if (status.status === 'at_risk') {
    if (status.canFreeze) {
      return 'Log or freeze to save your streak!';
    }
    return 'Log something to save your streak!';
  }

  if (status.status === 'frozen') {
    return 'Your streak is safe for today';
  }

  // Broken
  if (status.longestStreak > 0) {
    return `Your best: ${status.longestStreak} days. Start fresh!`;
  }
  return 'Start your streak today!';
}
