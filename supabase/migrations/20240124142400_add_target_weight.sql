-- Add target_weight_lbs column to profiles for goal tracking
alter table public.profiles
  add column if not exists target_weight_lbs decimal(5,1);
