-- Migration: Add custom_food_name column to food_logs
-- Allows quick logging without requiring a food_id reference

-- Add the custom_food_name column
ALTER TABLE food_logs ADD COLUMN IF NOT EXISTS custom_food_name TEXT;

-- Make food_id nullable for quick logs (was NOT NULL)
ALTER TABLE food_logs ALTER COLUMN food_id DROP NOT NULL;

-- Add check constraint: must have either food_id or custom_food_name
ALTER TABLE food_logs ADD CONSTRAINT food_logs_has_food_reference
  CHECK (food_id IS NOT NULL OR custom_food_name IS NOT NULL);
