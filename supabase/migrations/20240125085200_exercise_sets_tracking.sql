-- Exercise Sets Tracking Migration
-- Adds per-set tracking and exercise history for PR detection

-- Exercise Sets table: stores individual set data for each exercise in a workout
create table public.exercise_sets (
  id uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid references public.workout_exercises(id) on delete cascade not null,
  set_number integer not null,
  reps_completed integer,
  weight_lbs numeric(6,2),
  is_warmup boolean default false,
  is_pr boolean default false,
  notes text,
  created_at timestamptz default now()
);

-- Exercise History table: tracks PRs and usage statistics per exercise per user
create table public.exercise_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  exercise_name text not null,
  max_weight_lbs numeric(6,2),
  max_reps integer,
  max_volume numeric(10,2), -- weight * reps for best single set
  last_performed_at timestamptz,
  total_times_performed integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint unique_user_exercise unique (user_id, exercise_name)
);

-- Create indexes for performance
create index idx_exercise_sets_workout_exercise on public.exercise_sets(workout_exercise_id);
create index idx_exercise_history_user on public.exercise_history(user_id);
create index idx_exercise_history_user_exercise on public.exercise_history(user_id, exercise_name);

-- Enable RLS
alter table public.exercise_sets enable row level security;
alter table public.exercise_history enable row level security;

-- RLS Policies for exercise_sets
-- Users can view their own exercise sets (via workout_exercises -> workout_logs)
create policy "Users can view their own exercise sets"
  on public.exercise_sets for select
  using (
    exists (
      select 1 from public.workout_exercises we
      join public.workout_logs wl on wl.id = we.workout_log_id
      where we.id = exercise_sets.workout_exercise_id
      and wl.user_id = auth.uid()
    )
  );

-- Users can insert their own exercise sets
create policy "Users can insert their own exercise sets"
  on public.exercise_sets for insert
  with check (
    exists (
      select 1 from public.workout_exercises we
      join public.workout_logs wl on wl.id = we.workout_log_id
      where we.id = exercise_sets.workout_exercise_id
      and wl.user_id = auth.uid()
    )
  );

-- Users can update their own exercise sets
create policy "Users can update their own exercise sets"
  on public.exercise_sets for update
  using (
    exists (
      select 1 from public.workout_exercises we
      join public.workout_logs wl on wl.id = we.workout_log_id
      where we.id = exercise_sets.workout_exercise_id
      and wl.user_id = auth.uid()
    )
  );

-- Users can delete their own exercise sets
create policy "Users can delete their own exercise sets"
  on public.exercise_sets for delete
  using (
    exists (
      select 1 from public.workout_exercises we
      join public.workout_logs wl on wl.id = we.workout_log_id
      where we.id = exercise_sets.workout_exercise_id
      and wl.user_id = auth.uid()
    )
  );

-- RLS Policies for exercise_history
-- Users can view their own exercise history
create policy "Users can view their own exercise history"
  on public.exercise_history for select
  using (user_id = auth.uid());

-- Users can insert their own exercise history
create policy "Users can insert their own exercise history"
  on public.exercise_history for insert
  with check (user_id = auth.uid());

-- Users can update their own exercise history
create policy "Users can update their own exercise history"
  on public.exercise_history for update
  using (user_id = auth.uid());

-- Users can delete their own exercise history
create policy "Users can delete their own exercise history"
  on public.exercise_history for delete
  using (user_id = auth.uid());

-- Function to update exercise_history when sets are logged
create or replace function public.update_exercise_history()
returns trigger as $$
declare
  v_user_id uuid;
  v_exercise_name text;
  v_current_max_weight numeric;
  v_current_max_reps integer;
  v_current_max_volume numeric;
begin
  -- Get the user_id and exercise_name from the workout chain
  select wl.user_id, we.exercise_name
  into v_user_id, v_exercise_name
  from public.workout_exercises we
  join public.workout_logs wl on wl.id = we.workout_log_id
  where we.id = NEW.workout_exercise_id;

  -- Calculate volume for this set
  v_current_max_volume := coalesce(NEW.weight_lbs, 0) * coalesce(NEW.reps_completed, 0);

  -- Upsert into exercise_history
  insert into public.exercise_history (
    user_id,
    exercise_name,
    max_weight_lbs,
    max_reps,
    max_volume,
    last_performed_at,
    total_times_performed,
    updated_at
  )
  values (
    v_user_id,
    v_exercise_name,
    NEW.weight_lbs,
    NEW.reps_completed,
    v_current_max_volume,
    now(),
    1,
    now()
  )
  on conflict (user_id, exercise_name)
  do update set
    max_weight_lbs = greatest(exercise_history.max_weight_lbs, excluded.max_weight_lbs),
    max_reps = greatest(exercise_history.max_reps, excluded.max_reps),
    max_volume = greatest(exercise_history.max_volume, excluded.max_volume),
    last_performed_at = excluded.last_performed_at,
    total_times_performed = exercise_history.total_times_performed + 1,
    updated_at = now();

  return NEW;
end;
$$ language plpgsql security definer;

-- Trigger to auto-update exercise history when a set is logged
create trigger trigger_update_exercise_history
  after insert on public.exercise_sets
  for each row
  execute function public.update_exercise_history();
