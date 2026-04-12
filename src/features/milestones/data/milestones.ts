/**
 * Milestone definitions
 *
 * Non-weight focused achievements to encourage healthy habits
 * and consistent tracking without triggering unhealthy behaviors.
 */

import type { MilestoneCategory } from '@/types/database';

export type CelebrationType = 'popup' | 'confetti';

export interface Milestone {
  id: string;
  category: MilestoneCategory;
  name: string;
  description: string;
  icon: string;
  threshold: number;
  celebrationMessage: string;
  celebrationType: CelebrationType;
}

/**
 * Metric keys used for milestone progress tracking
 */
export type MilestoneMetricKey =
  | 'current_streak'
  | 'total_logs'
  | 'total_scans'
  | 'protein_days'
  | 'first_scan'
  | 'first_photo';

export const MILESTONES: Milestone[] = [
  // ===== STREAK MILESTONES =====
  {
    id: 'streak_3',
    category: 'streak',
    name: 'Getting Started',
    description: '3 day streak',
    icon: '🌱',
    threshold: 3,
    celebrationMessage: 'Three days in a row!',
    celebrationType: 'popup',
  },
  {
    id: 'streak_7',
    category: 'streak',
    name: 'Week Warrior',
    description: '7 day streak',
    icon: '🔥',
    threshold: 7,
    celebrationMessage: 'A whole week of showing up for yourself!',
    celebrationType: 'confetti',
  },
  {
    id: 'streak_14',
    category: 'streak',
    name: 'Fortnight Fighter',
    description: '14 day streak',
    icon: '💪',
    threshold: 14,
    celebrationMessage: 'Two weeks strong!',
    celebrationType: 'confetti',
  },
  {
    id: 'streak_30',
    category: 'streak',
    name: 'Monthly Master',
    description: '30 day streak',
    icon: '🏆',
    threshold: 30,
    celebrationMessage: 'An entire month of consistency!',
    celebrationType: 'confetti',
  },
  {
    id: 'streak_100',
    category: 'streak',
    name: 'Century Club',
    description: '100 day streak',
    icon: '👑',
    threshold: 100,
    celebrationMessage: "100 days of dedication. You're incredible!",
    celebrationType: 'confetti',
  },

  // ===== LOGGING MILESTONES =====
  {
    id: 'logs_10',
    category: 'logging',
    name: 'First Steps',
    description: 'Log 10 meals',
    icon: '📝',
    threshold: 10,
    celebrationMessage: 'Your first 10 meals logged!',
    celebrationType: 'popup',
  },
  {
    id: 'logs_50',
    category: 'logging',
    name: 'Building Habits',
    description: 'Log 50 meals',
    icon: '📊',
    threshold: 50,
    celebrationMessage: '50 meals tracked!',
    celebrationType: 'popup',
  },
  {
    id: 'logs_100',
    category: 'logging',
    name: 'Dedicated Logger',
    description: 'Log 100 meals',
    icon: '⭐',
    threshold: 100,
    celebrationMessage: "100 meals — you're building real awareness!",
    celebrationType: 'confetti',
  },
  {
    id: 'logs_500',
    category: 'logging',
    name: 'Logging Legend',
    description: 'Log 500 meals',
    icon: '🏅',
    threshold: 500,
    celebrationMessage: "500 meals! You're a tracking pro!",
    celebrationType: 'confetti',
  },
  {
    id: 'logs_1000',
    category: 'logging',
    name: 'Thousand Club',
    description: 'Log 1,000 meals',
    icon: '👑',
    threshold: 1000,
    celebrationMessage: '1,000 meals logged. Legendary!',
    celebrationType: 'confetti',
  },

  // ===== PROTEIN MILESTONES =====
  {
    id: 'protein_7',
    category: 'protein',
    name: 'Protein Starter',
    description: 'Hit protein goal 7 days',
    icon: '🥩',
    threshold: 7,
    celebrationMessage: 'A week of hitting your protein!',
    celebrationType: 'popup',
  },
  {
    id: 'protein_30',
    category: 'protein',
    name: 'Protein Pro',
    description: 'Hit protein goal 30 days',
    icon: '💪',
    threshold: 30,
    celebrationMessage: '30 days of protein wins!',
    celebrationType: 'confetti',
  },

  // ===== EXPLORATION MILESTONES =====
  {
    id: 'first_scan',
    category: 'exploration',
    name: 'Scanner',
    description: 'Scan your first barcode',
    icon: '📷',
    threshold: 1,
    celebrationMessage: 'Barcode scanning — so fast!',
    celebrationType: 'popup',
  },
  {
    id: 'scans_50',
    category: 'exploration',
    name: 'Quick Scanner',
    description: 'Scan 50 barcodes',
    icon: '⚡',
    threshold: 50,
    celebrationMessage: "50 scans! You're lightning fast!",
    celebrationType: 'popup',
  },
  {
    id: 'scans_100',
    category: 'exploration',
    name: 'Speed Demon',
    description: 'Scan 100 barcodes',
    icon: '🚀',
    threshold: 100,
    celebrationMessage: '100 barcodes scanned!',
    celebrationType: 'confetti',
  },
  {
    id: 'first_photo',
    category: 'exploration',
    name: 'Photographer',
    description: 'Log a meal with photo',
    icon: '📸',
    threshold: 1,
    celebrationMessage: 'Photo logging unlocked!',
    celebrationType: 'popup',
  },
];

/**
 * Get milestone by ID
 */
export function getMilestoneById(id: string): Milestone | undefined {
  return MILESTONES.find((m) => m.id === id);
}

/**
 * Get all milestones for a category
 */
export function getMilestonesByCategory(category: MilestoneCategory): Milestone[] {
  return MILESTONES.filter((m) => m.category === category);
}

/**
 * Get the next milestone for a given metric
 */
export function getNextMilestone(
  metricKey: MilestoneMetricKey,
  currentValue: number,
  earnedMilestoneIds: Set<string>
): Milestone | null {
  const relevantMilestones = MILESTONES.filter((m) => {
    if (earnedMilestoneIds.has(m.id)) return false;

    switch (metricKey) {
      case 'current_streak':
        return m.category === 'streak';
      case 'total_logs':
        return m.category === 'logging';
      case 'total_scans':
        return m.id.startsWith('scans_');
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

  // Sort by threshold and return the first unearned one
  const sorted = relevantMilestones.sort((a, b) => a.threshold - b.threshold);
  return sorted.find((m) => m.threshold > currentValue) ?? null;
}
