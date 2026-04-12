-- Keep onboarding_completed=true (skip the quiz) but restore welcome_completed=false
-- so new signups must go through the welcome info slides before accessing the app

ALTER TABLE public.profiles ALTER COLUMN welcome_completed SET DEFAULT false;
