-- BODYCOACH Initial Schema
-- Run this migration in your Supabase SQL editor

-- ============================================
-- ENUMS
-- ============================================

create type goal_type as enum ('gain_muscle', 'lose_weight', 'gain_weight');
create type activity_level as enum ('sedentary', 'light', 'moderate', 'active', 'very_active');

-- ============================================
-- TABLES
-- ============================================

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  goal goal_type not null default 'gain_muscle',
  activity_level activity_level default 'moderate',
  birth_date date,
  gender text,
  height_in numeric,
  timezone text default 'UTC',
  onboarding_completed boolean default false,
  notification_preferences jsonb default '{"email": true, "sms": false, "push": true}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Body Stats (weight, measurements over time) - Imperial units
create table public.body_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  recorded_at date not null default current_date,
  weight_lbs numeric,
  body_fat_pct numeric,
  chest_in numeric,
  waist_in numeric,
  hips_in numeric,
  left_arm_in numeric,
  right_arm_in numeric,
  left_thigh_in numeric,
  right_thigh_in numeric,
  notes text,
  created_at timestamptz default now(),
  unique(user_id, recorded_at)
);

-- Progress Photos
create table public.progress_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  photo_url text not null,
  photo_type text default 'front',
  taken_at date not null default current_date,
  ai_analysis jsonb,
  notes text,
  created_at timestamptz default now()
);

-- Exercise Library
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  body_part text not null,
  equipment text[],
  difficulty text default 'intermediate',
  instructions text[],
  video_url text,
  muscles_primary text[],
  muscles_secondary text[],
  created_at timestamptz default now()
);

-- Workout Logs
create table public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  workout_date date not null default current_date,
  name text,
  duration_minutes integer,
  notes text,
  ai_generated boolean default false,
  created_at timestamptz default now()
);

-- Workout Exercises (junction table)
create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_log_id uuid references public.workout_logs(id) on delete cascade not null,
  exercise_id uuid references public.exercises(id) on delete set null,
  exercise_name text not null,
  sets integer,
  reps integer,
  weight_lbs numeric,
  duration_seconds integer,
  notes text,
  order_index integer not null default 0
);

-- Coach Conversations
create table public.coach_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  coach_type text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Coach Messages
create table public.coach_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.coach_conversations(id) on delete cascade not null,
  role text not null,
  content text not null,
  created_at timestamptz default now()
);

-- Scheduled Check-ins
create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  check_in_type text not null,
  scheduled_for timestamptz not null,
  completed_at timestamptz,
  skipped boolean default false,
  responses jsonb,
  created_at timestamptz default now()
);

-- Notification Queue
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  channel text not null,
  notification_type text not null,
  subject text,
  body text not null,
  metadata jsonb,
  scheduled_for timestamptz not null default now(),
  sent_at timestamptz,
  failed_at timestamptz,
  error_message text,
  created_at timestamptz default now()
);

-- User Commitments
create table public.commitments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  commitment_type text not null,
  description text not null,
  frequency text,
  days_of_week integer[],
  time_of_day time,
  active boolean default true,
  created_at timestamptz default now()
);

-- ============================================
-- INDEXES
-- ============================================

create index idx_body_stats_user_date on public.body_stats(user_id, recorded_at desc);
create index idx_progress_photos_user_date on public.progress_photos(user_id, taken_at desc);
create index idx_workout_logs_user_date on public.workout_logs(user_id, workout_date desc);
create index idx_coach_conversations_user on public.coach_conversations(user_id);
create index idx_coach_messages_conversation on public.coach_messages(conversation_id);
create index idx_check_ins_user_scheduled on public.check_ins(user_id, scheduled_for);
create index idx_notifications_scheduled on public.notifications(scheduled_for) where sent_at is null;
create index idx_exercises_body_part on public.exercises(body_part);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.body_stats enable row level security;
alter table public.progress_photos enable row level security;
alter table public.exercises enable row level security;
alter table public.workout_logs enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.coach_conversations enable row level security;
alter table public.coach_messages enable row level security;
alter table public.check_ins enable row level security;
alter table public.notifications enable row level security;
alter table public.commitments enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Body Stats policies
create policy "Users can view own stats"
  on public.body_stats for select
  using (auth.uid() = user_id);

create policy "Users can insert own stats"
  on public.body_stats for insert
  with check (auth.uid() = user_id);

create policy "Users can update own stats"
  on public.body_stats for update
  using (auth.uid() = user_id);

create policy "Users can delete own stats"
  on public.body_stats for delete
  using (auth.uid() = user_id);

-- Progress Photos policies
create policy "Users can view own photos"
  on public.progress_photos for select
  using (auth.uid() = user_id);

create policy "Users can insert own photos"
  on public.progress_photos for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own photos"
  on public.progress_photos for delete
  using (auth.uid() = user_id);

-- Exercises - public read access
create policy "Anyone can view exercises"
  on public.exercises for select
  using (true);

-- Workout Logs policies
create policy "Users can view own workouts"
  on public.workout_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own workouts"
  on public.workout_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own workouts"
  on public.workout_logs for update
  using (auth.uid() = user_id);

create policy "Users can delete own workouts"
  on public.workout_logs for delete
  using (auth.uid() = user_id);

-- Workout Exercises policies (via workout_logs ownership)
create policy "Users can view own workout exercises"
  on public.workout_exercises for select
  using (
    exists (
      select 1 from public.workout_logs
      where workout_logs.id = workout_exercises.workout_log_id
      and workout_logs.user_id = auth.uid()
    )
  );

create policy "Users can insert own workout exercises"
  on public.workout_exercises for insert
  with check (
    exists (
      select 1 from public.workout_logs
      where workout_logs.id = workout_exercises.workout_log_id
      and workout_logs.user_id = auth.uid()
    )
  );

create policy "Users can update own workout exercises"
  on public.workout_exercises for update
  using (
    exists (
      select 1 from public.workout_logs
      where workout_logs.id = workout_exercises.workout_log_id
      and workout_logs.user_id = auth.uid()
    )
  );

create policy "Users can delete own workout exercises"
  on public.workout_exercises for delete
  using (
    exists (
      select 1 from public.workout_logs
      where workout_logs.id = workout_exercises.workout_log_id
      and workout_logs.user_id = auth.uid()
    )
  );

-- Coach Conversations policies
create policy "Users can view own conversations"
  on public.coach_conversations for select
  using (auth.uid() = user_id);

create policy "Users can insert own conversations"
  on public.coach_conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own conversations"
  on public.coach_conversations for update
  using (auth.uid() = user_id);

-- Coach Messages policies (via conversation ownership)
create policy "Users can view own messages"
  on public.coach_messages for select
  using (
    exists (
      select 1 from public.coach_conversations
      where coach_conversations.id = coach_messages.conversation_id
      and coach_conversations.user_id = auth.uid()
    )
  );

create policy "Users can insert own messages"
  on public.coach_messages for insert
  with check (
    exists (
      select 1 from public.coach_conversations
      where coach_conversations.id = coach_messages.conversation_id
      and coach_conversations.user_id = auth.uid()
    )
  );

-- Check-ins policies
create policy "Users can view own check-ins"
  on public.check_ins for select
  using (auth.uid() = user_id);

create policy "Users can insert own check-ins"
  on public.check_ins for insert
  with check (auth.uid() = user_id);

create policy "Users can update own check-ins"
  on public.check_ins for update
  using (auth.uid() = user_id);

-- Notifications policies
create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- Commitments policies
create policy "Users can view own commitments"
  on public.commitments for select
  using (auth.uid() = user_id);

create policy "Users can insert own commitments"
  on public.commitments for insert
  with check (auth.uid() = user_id);

create policy "Users can update own commitments"
  on public.commitments for update
  using (auth.uid() = user_id);

create policy "Users can delete own commitments"
  on public.commitments for delete
  using (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

create trigger update_coach_conversations_updated_at
  before update on public.coach_conversations
  for each row execute procedure public.update_updated_at();

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Create storage bucket for progress photos
insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false);

-- Storage policies for progress photos
create policy "Users can upload own photos"
  on storage.objects for insert
  with check (
    bucket_id = 'progress-photos' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view own photos"
  on storage.objects for select
  using (
    bucket_id = 'progress-photos' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own photos"
  on storage.objects for delete
  using (
    bucket_id = 'progress-photos' and
    auth.uid()::text = (storage.foldername(name))[1]
  );
