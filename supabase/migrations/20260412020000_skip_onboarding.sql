-- Skip onboarding for all users — coach handles client setup
-- New signups get onboarding_completed and welcome_completed set to true by default

-- Update default values for new profiles
ALTER TABLE public.profiles ALTER COLUMN onboarding_completed SET DEFAULT true;
ALTER TABLE public.profiles ALTER COLUMN welcome_completed SET DEFAULT true;

-- Mark all existing users as onboarded so they aren't stuck
UPDATE public.profiles SET onboarding_completed = true, welcome_completed = true
WHERE onboarding_completed = false OR welcome_completed = false;
