// Phase 2: Daily Mood Check-in + Journal Notes

// Types
export type {
  CheckinLevel,
  CheckinOption,
  CheckinFormData,
  CheckinSummary,
  CheckinWeeklyAverages,
} from './types';

export {
  ENERGY_OPTIONS,
  MOOD_OPTIONS,
  SLEEP_OPTIONS,
  getEnergyOption,
  getMoodOption,
  getSleepOption,
} from './types';

// Hooks
export {
  useTodaysCheckin,
  useSubmitCheckin,
  useCheckinHistory,
  useShouldShowCheckinPrompt,
  type UseTodaysCheckinResult,
  type UseSubmitCheckinResult,
  type SubmitCheckinData,
  type UseCheckinHistoryResult,
  type UseShouldShowCheckinPromptResult,
} from './hooks';

// Components
export {
  EnergyMoodSelector,
  CheckinPrompt,
  CheckinHistory,
  FoodLogFeedback,
  DashboardCheckinSection,
} from './components';

// Utils - for integration with food logging
export { dispatchFoodLoggedEvent, onFoodLogged } from './utils';
