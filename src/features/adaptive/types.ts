/**
 * Phase 3: Adaptive Daily Targets - Type Definitions (Web)
 */

// ============================================================================
// TREND STATUS
// ============================================================================

export type TrendStatus = 'above' | 'below' | 'on_track';

// ============================================================================
// DATABASE TYPES
// ============================================================================

export interface DailyNutritionSummary {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD

  // Targets
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;

  // Actuals
  actual_calories: number;
  actual_protein: number;
  actual_carbs: number;
  actual_fat: number;

  // Percentages
  calories_percentage: number;
  protein_percentage: number;
  carbs_percentage: number;
  fat_percentage: number;

  // Metadata
  logs_count: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// MACRO TREND
// ============================================================================

export interface MacroTrend {
  /** Current value for today */
  current: number;
  /** User's target for this macro */
  target: number;
  /** Yesterday's actual value (null if no data) */
  yesterday: number | null;
  /** Average of last 7 days (null if insufficient data) */
  weekAverage: number | null;
  /** Trend status based on percentage of target */
  trend: TrendStatus;
  /** Current percentage of target (0-100+) */
  percentageOfTarget: number;
  /** Remaining to hit target */
  remaining: number;
}

// ============================================================================
// AI SUGGESTION
// ============================================================================

export type SuggestionType = 'tip' | 'encouragement' | 'warning';

export interface AISuggestion {
  type: SuggestionType;
  message: string;
  icon: string;
  /** Optional action button */
  action?: {
    label: string;
    href: string;
  };
}

// ============================================================================
// ADAPTIVE TARGETS (Main Interface)
// ============================================================================

export interface AdaptiveTargets {
  /** Calorie trend data */
  calories: MacroTrend;
  /** Protein trend data */
  protein: MacroTrend;
  /** Carbs trend data */
  carbs: MacroTrend;
  /** Fat trend data */
  fat: MacroTrend;
  /** AI-generated suggestion (null if none applicable) */
  suggestion: AISuggestion | null;
  /** Number of days with data in the past week */
  daysLoggedThisWeek: number;
  /** Whether user has logged today */
  hasLoggedToday: boolean;
}

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================

export interface UseAdaptiveTargetsReturn {
  data: AdaptiveTargets | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseDailySummaryReturn {
  data: DailyNutritionSummary | null;
  isLoading: boolean;
  error: string | null;
}

export interface UseWeekSummariesReturn {
  data: DailyNutritionSummary[];
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface AdaptiveMacroCardProps {
  /** Label for the macro (e.g., "Protein", "Calories") */
  label: string;
  /** Unit to display (e.g., "g", "cal") */
  unit: string;
  /** Macro trend data */
  trend: MacroTrend;
  /** Color for the progress bar/accent */
  color: string;
  /** Optional click handler */
  onClick?: () => void;
}

export interface TrendBadgeProps {
  /** Trend status */
  status: TrendStatus;
  /** Size variant */
  size?: 'sm' | 'md';
}

export interface AISuggestionBannerProps {
  /** Suggestion data */
  suggestion: AISuggestion;
  /** Dismiss handler */
  onDismiss?: () => void;
}
