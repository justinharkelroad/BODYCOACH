-- Migration: Add Food Log Feedback
-- Phase 2: Adds notes and felt_good columns for food log feedback

-- Add notes column if it doesn't exist
-- (The food_logs table already has notes TEXT from the nutrition_module migration,
-- but we'll ensure felt_good exists for thumbs up/down feedback)

-- Add felt_good boolean for quick feedback on meals
ALTER TABLE food_logs ADD COLUMN IF NOT EXISTS felt_good BOOLEAN;

-- Comment for clarity
COMMENT ON COLUMN food_logs.felt_good IS 'User feedback: true = felt good after eating, false = did not feel good, null = no feedback given';
