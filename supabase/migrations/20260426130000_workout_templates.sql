-- User-owned reusable workout templates
-- Templates capture a workout's name + exercise list (with target sets/reps/weight)
-- so users can pre-fill /workouts/new with a saved plan.

create table public.workout_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.workout_template_exercises (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references public.workout_templates(id) on delete cascade not null,
  exercise_name text not null,
  sets integer,
  reps integer,
  target_weight_lbs numeric,
  duration_seconds integer,
  notes text,
  order_index integer not null default 0
);

create index idx_workout_templates_user on public.workout_templates(user_id, updated_at desc);
create index idx_workout_template_exercises_template on public.workout_template_exercises(template_id, order_index);

alter table public.workout_templates enable row level security;
alter table public.workout_template_exercises enable row level security;

-- workout_templates: owner-only
create policy "Users can view own templates"
  on public.workout_templates for select
  using (auth.uid() = user_id);

create policy "Users can insert own templates"
  on public.workout_templates for insert
  with check (auth.uid() = user_id);

create policy "Users can update own templates"
  on public.workout_templates for update
  using (auth.uid() = user_id);

create policy "Users can delete own templates"
  on public.workout_templates for delete
  using (auth.uid() = user_id);

-- workout_template_exercises: scoped via parent template ownership
create policy "Users can view own template exercises"
  on public.workout_template_exercises for select
  using (
    exists (
      select 1 from public.workout_templates t
      where t.id = workout_template_exercises.template_id
        and t.user_id = auth.uid()
    )
  );

create policy "Users can insert own template exercises"
  on public.workout_template_exercises for insert
  with check (
    exists (
      select 1 from public.workout_templates t
      where t.id = workout_template_exercises.template_id
        and t.user_id = auth.uid()
    )
  );

create policy "Users can update own template exercises"
  on public.workout_template_exercises for update
  using (
    exists (
      select 1 from public.workout_templates t
      where t.id = workout_template_exercises.template_id
        and t.user_id = auth.uid()
    )
  );

create policy "Users can delete own template exercises"
  on public.workout_template_exercises for delete
  using (
    exists (
      select 1 from public.workout_templates t
      where t.id = workout_template_exercises.template_id
        and t.user_id = auth.uid()
    )
  );
