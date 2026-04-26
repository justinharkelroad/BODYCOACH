// Database types for BODYCOACH
// These types mirror the Supabase schema

export type GoalType = 'lose_fat' | 'maintain' | 'gain_muscle';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
export type Sex = 'male' | 'female';
export type Aggressiveness = 'conservative' | 'moderate' | 'aggressive';
export type CoachType = 'nutrition' | 'workout';
export type UserRole = 'client' | 'coach';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  goal: GoalType;
  activity_level: ActivityLevel;
  birth_date: string | null;
  gender: string | null;
  sex: Sex | null;
  age: number | null;
  height_in: number | null;
  target_weight_lbs: number | null;
  timezone: string;
  onboarding_completed: boolean;
  welcome_completed: boolean;
  notification_preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  // TDEE Calculator fields
  bmr: number | null;
  tdee: number | null;
  adjusted_tdee: number | null;
  target_calories: number | null;
  target_protein: number | null;
  target_carbs: number | null;
  target_fat: number | null;
  deficit_surplus: number | null;
  expected_weekly_change: number | null;
  aggressiveness: Aggressiveness | null;
  is_breastfeeding: boolean;
  breastfeeding_sessions: number | null;
  postpartum_weeks: number | null;
  calculation_date: string | null;
  input_weight_kg: number | null;
  input_height_cm: number | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface CoachClient {
  id: string;
  coach_id: string;
  client_id: string;
  status: 'active' | 'removed';
  created_at: string;
}

export interface BodyStat {
  id: string;
  user_id: string;
  recorded_at: string;
  weight_lbs: number | null;
  body_fat_pct: number | null;
  chest_in: number | null;
  waist_in: number | null;
  hips_in: number | null;
  left_arm_in: number | null;
  right_arm_in: number | null;
  left_thigh_in: number | null;
  right_thigh_in: number | null;
  notes: string | null;
  created_at: string;
}

export interface ProgressPhoto {
  id: string;
  user_id: string;
  photo_url: string;
  photo_type: 'front' | 'side' | 'back';
  taken_at: string;
  ai_analysis: Record<string, unknown> | null;
  notes: string | null;
  created_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  description: string | null;
  body_part: string;
  equipment: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  video_url: string | null;
  muscles_primary: string[];
  muscles_secondary: string[];
  created_at: string;
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  workout_date: string;
  name: string | null;
  duration_minutes: number | null;
  notes: string | null;
  ai_generated: boolean;
  created_at: string;
}

export interface WorkoutExercise {
  id: string;
  workout_log_id: string;
  exercise_id: string | null;
  exercise_name: string;
  sets: number | null;
  reps: number | null;
  weight_lbs: number | null;
  duration_seconds: number | null;
  notes: string | null;
  order_index: number;
}

export interface WorkoutTemplate {
  id: string;
  user_id: string;
  name: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutTemplateExercise {
  id: string;
  template_id: string;
  exercise_name: string;
  sets: number | null;
  reps: number | null;
  target_weight_lbs: number | null;
  duration_seconds: number | null;
  notes: string | null;
  order_index: number;
}

export interface CoachConversation {
  id: string;
  user_id: string;
  coach_type: CoachType;
  created_at: string;
  updated_at: string;
}

export interface CoachMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface CheckIn {
  id: string;
  user_id: string;
  check_in_type: 'daily_weight' | 'weekly_progress' | 'photo_reminder';
  scheduled_for: string;
  completed_at: string | null;
  skipped: boolean;
  responses: Record<string, unknown> | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  channel: 'email' | 'sms' | 'push';
  notification_type: string;
  subject: string | null;
  body: string;
  metadata: Record<string, unknown> | null;
  scheduled_for: string;
  sent_at: string | null;
  failed_at: string | null;
  error_message: string | null;
  created_at: string;
}

export interface Commitment {
  id: string;
  user_id: string;
  commitment_type: 'workout' | 'weigh_in' | 'photo' | 'nutrition';
  description: string;
  frequency: 'daily' | 'weekly' | 'custom' | null;
  days_of_week: number[] | null;
  time_of_day: string | null;
  active: boolean;
  created_at: string;
}

// =====================
// Streak Types
// =====================

export type StreakStatus = 'active' | 'at_risk' | 'frozen' | 'broken';

export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_log_date: string | null;
  streak_start_date: string | null;
  streak_frozen_at: string | null;
  freezes_used_this_week: number;
  freeze_week_start: string | null;
  total_days_logged: number;
  created_at: string;
  updated_at: string;
}

// =====================
// Milestone Types
// =====================

export type MilestoneCategory =
  | 'streak'
  | 'logging'
  | 'protein'
  | 'consistency'
  | 'exploration';

export interface UserMilestone {
  id: string;
  user_id: string;
  milestone_id: string;
  unlocked_at: string;
  seen: boolean;
}

export interface UserMilestoneProgress {
  id: string;
  user_id: string;
  metric_key: string;
  metric_value: number;
  updated_at: string;
}

// =====================
// Daily Check-in Types (Phase 2)
// =====================

export type CheckinLevel = 1 | 2 | 3 | 4;

export type StressLevel = 1 | 2 | 3 | 4 | 5;

export interface DailyCheckin {
  id: string;
  user_id: string;
  date: string;
  energy_level: CheckinLevel | null;
  mood_level: CheckinLevel | null;
  sleep_quality: CheckinLevel | null;
  sleep_hours: number | null;
  water_oz: number | null;
  stress_level: StressLevel | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoachNote {
  id: string;
  coach_id: string;
  client_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ClientMacroPlan {
  id: string;
  coach_id: string;
  client_id: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Database schema type for Supabase client
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      body_stats: {
        Row: BodyStat;
        Insert: Omit<BodyStat, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<BodyStat, 'id' | 'user_id' | 'created_at'>>;
      };
      progress_photos: {
        Row: ProgressPhoto;
        Insert: Omit<ProgressPhoto, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<ProgressPhoto, 'id' | 'user_id' | 'created_at'>>;
      };
      exercises: {
        Row: Exercise;
        Insert: Omit<Exercise, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Exercise, 'id' | 'created_at'>>;
      };
      workout_logs: {
        Row: WorkoutLog;
        Insert: Omit<WorkoutLog, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<WorkoutLog, 'id' | 'user_id' | 'created_at'>>;
      };
      workout_exercises: {
        Row: WorkoutExercise;
        Insert: Omit<WorkoutExercise, 'id'> & { id?: string };
        Update: Partial<Omit<WorkoutExercise, 'id' | 'workout_log_id'>>;
      };
      workout_templates: {
        Row: WorkoutTemplate;
        Insert: Omit<WorkoutTemplate, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<WorkoutTemplate, 'id' | 'user_id' | 'created_at'>>;
      };
      workout_template_exercises: {
        Row: WorkoutTemplateExercise;
        Insert: Omit<WorkoutTemplateExercise, 'id'> & { id?: string };
        Update: Partial<Omit<WorkoutTemplateExercise, 'id' | 'template_id'>>;
      };
      coach_conversations: {
        Row: CoachConversation;
        Insert: Omit<CoachConversation, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<CoachConversation, 'id' | 'user_id' | 'created_at'>>;
      };
      coach_messages: {
        Row: CoachMessage;
        Insert: Omit<CoachMessage, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<CoachMessage, 'id' | 'conversation_id' | 'created_at'>>;
      };
      check_ins: {
        Row: CheckIn;
        Insert: Omit<CheckIn, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<CheckIn, 'id' | 'user_id' | 'created_at'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Notification, 'id' | 'user_id' | 'created_at'>>;
      };
      commitments: {
        Row: Commitment;
        Insert: Omit<Commitment, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Commitment, 'id' | 'user_id' | 'created_at'>>;
      };
      user_streaks: {
        Row: UserStreak;
        Insert: Omit<UserStreak, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<UserStreak, 'id' | 'user_id' | 'created_at'>>;
      };
      user_milestones: {
        Row: UserMilestone;
        Insert: Omit<UserMilestone, 'id' | 'unlocked_at'> & {
          id?: string;
          unlocked_at?: string;
        };
        Update: Partial<Omit<UserMilestone, 'id' | 'user_id' | 'milestone_id'>>;
      };
      user_milestone_progress: {
        Row: UserMilestoneProgress;
        Insert: Omit<UserMilestoneProgress, 'id' | 'updated_at'> & {
          id?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<UserMilestoneProgress, 'id' | 'user_id'>>;
      };
      daily_checkins: {
        Row: DailyCheckin;
        Insert: Omit<DailyCheckin, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<DailyCheckin, 'id' | 'user_id' | 'created_at'>>;
      };
      coach_clients: {
        Row: CoachClient;
        Insert: Omit<CoachClient, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<CoachClient, 'id' | 'coach_id' | 'client_id' | 'created_at'>>;
      };
    };
  };
}
