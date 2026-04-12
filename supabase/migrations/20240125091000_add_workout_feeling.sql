-- Add feeling rating to workout_logs for tracking how users felt during workouts
-- This will be used in weekly summaries and coaching feedback

-- Add feeling_rating column (1-5 scale: 1=struggled, 3=normal, 5=great)
alter table public.workout_logs
add column if not exists feeling_rating integer check (feeling_rating >= 1 and feeling_rating <= 5);

-- Add started_at and completed_at for accurate timing
alter table public.workout_logs
add column if not exists started_at timestamptz;

alter table public.workout_logs
add column if not exists completed_at timestamptz;

-- Comment for documentation
comment on column public.workout_logs.feeling_rating is 'User rating 1-5: 1=struggled, 2=tough, 3=normal, 4=good, 5=great';
comment on column public.workout_logs.started_at is 'When the user started the workout timer';
comment on column public.workout_logs.completed_at is 'When the user stopped the workout timer';
