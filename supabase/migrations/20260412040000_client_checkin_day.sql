-- Add per-client check-in day preference
-- 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
-- NULL means no scheduled day (manual only)

ALTER TABLE public.coach_clients ADD COLUMN IF NOT EXISTS checkin_day smallint;
