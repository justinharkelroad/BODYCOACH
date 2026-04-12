-- Add welcome_completed column to profiles table
-- Gates the post-onboarding educational walkthrough
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS welcome_completed boolean NOT NULL DEFAULT false;
