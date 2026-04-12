-- Migration: Add TDEE Calculator fields to profiles
-- Stores calculated nutrition targets and input parameters for recalculation

-- Add TDEE calculator fields to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS sex TEXT DEFAULT 'female',
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS bmr INTEGER,
ADD COLUMN IF NOT EXISTS tdee INTEGER,
ADD COLUMN IF NOT EXISTS adjusted_tdee INTEGER,
ADD COLUMN IF NOT EXISTS target_calories INTEGER,
ADD COLUMN IF NOT EXISTS target_protein INTEGER,
ADD COLUMN IF NOT EXISTS target_carbs INTEGER,
ADD COLUMN IF NOT EXISTS target_fat INTEGER,
ADD COLUMN IF NOT EXISTS deficit_surplus INTEGER,
ADD COLUMN IF NOT EXISTS expected_weekly_change DECIMAL,
ADD COLUMN IF NOT EXISTS aggressiveness TEXT DEFAULT 'moderate',
ADD COLUMN IF NOT EXISTS is_breastfeeding BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS breastfeeding_sessions INTEGER,
ADD COLUMN IF NOT EXISTS postpartum_weeks INTEGER,
ADD COLUMN IF NOT EXISTS calculation_date TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS input_weight_kg DECIMAL,
ADD COLUMN IF NOT EXISTS input_height_cm DECIMAL;

-- Update goal enum to match TDEE calculator
-- Note: Using text instead of enum for flexibility
-- Values: 'lose_fat' | 'maintain' | 'gain_muscle'
-- Map existing values:
--   'lose_weight' -> 'lose_fat'
--   'gain_muscle' -> 'gain_muscle'
--   'gain_weight' -> 'gain_muscle'

-- Update existing profiles to use new goal values
UPDATE public.profiles
SET goal = 'lose_fat'
WHERE goal::text = 'lose_weight';

UPDATE public.profiles
SET goal = 'gain_muscle'
WHERE goal::text = 'gain_weight';

-- Comment on new columns
COMMENT ON COLUMN public.profiles.sex IS 'User biological sex for BMR calculation';
COMMENT ON COLUMN public.profiles.age IS 'User age in years';
COMMENT ON COLUMN public.profiles.bmr IS 'Calculated Basal Metabolic Rate';
COMMENT ON COLUMN public.profiles.tdee IS 'Total Daily Energy Expenditure';
COMMENT ON COLUMN public.profiles.adjusted_tdee IS 'TDEE adjusted for breastfeeding';
COMMENT ON COLUMN public.profiles.target_calories IS 'Daily calorie target';
COMMENT ON COLUMN public.profiles.target_protein IS 'Daily protein target in grams';
COMMENT ON COLUMN public.profiles.target_carbs IS 'Daily carbs target in grams';
COMMENT ON COLUMN public.profiles.target_fat IS 'Daily fat target in grams';
COMMENT ON COLUMN public.profiles.aggressiveness IS 'Deficit/surplus intensity: conservative, moderate, aggressive';
COMMENT ON COLUMN public.profiles.is_breastfeeding IS 'Whether user is currently breastfeeding';
COMMENT ON COLUMN public.profiles.breastfeeding_sessions IS 'Number of nursing/pumping sessions per day';
COMMENT ON COLUMN public.profiles.postpartum_weeks IS 'Weeks since giving birth';
COMMENT ON COLUMN public.profiles.calculation_date IS 'When TDEE was last calculated';
COMMENT ON COLUMN public.profiles.input_weight_kg IS 'Weight used for TDEE calculation (for recalc detection)';
COMMENT ON COLUMN public.profiles.input_height_cm IS 'Height used for TDEE calculation';
