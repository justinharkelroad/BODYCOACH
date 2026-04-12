-- Migration: Fix daily summaries trigger
-- Fixes: 1) profiles join using wrong column 2) Add SECURITY DEFINER for auth.users access

-- Drop and recreate the trigger function with fixes
CREATE OR REPLACE FUNCTION recalculate_daily_summary()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_log_date DATE;
  v_target_calories INTEGER;
  v_target_protein INTEGER;
  v_target_carbs INTEGER;
  v_target_fat INTEGER;
  v_actual_calories INTEGER;
  v_actual_protein INTEGER;
  v_actual_carbs INTEGER;
  v_actual_fat INTEGER;
  v_logs_count INTEGER;
BEGIN
  -- Determine which user/date to recalculate
  IF TG_OP = 'DELETE' THEN
    v_user_id := OLD.user_id;
    v_log_date := OLD.log_date;
  ELSE
    v_user_id := NEW.user_id;
    v_log_date := NEW.log_date;
  END IF;

  -- Get user's nutrition targets
  -- FIXED: profiles.id = user_id (not profiles.user_id)
  SELECT
    COALESCE(unp.target_calories, p.target_calories, 2000),
    COALESCE(unp.target_protein, p.target_protein, 150),
    COALESCE(unp.target_carbs, p.target_carbs, 200),
    COALESCE(unp.target_fat, p.target_fat, 65)
  INTO v_target_calories, v_target_protein, v_target_carbs, v_target_fat
  FROM (SELECT v_user_id AS id) u
  LEFT JOIN user_nutrition_profiles unp ON unp.user_id = u.id
  LEFT JOIN profiles p ON p.id = u.id;

  -- Aggregate food logs for the date
  SELECT
    COALESCE(SUM(calories_logged), 0)::INTEGER,
    COALESCE(SUM(protein_logged), 0)::INTEGER,
    COALESCE(SUM(carbs_logged), 0)::INTEGER,
    COALESCE(SUM(fat_logged), 0)::INTEGER,
    COUNT(*)::INTEGER
  INTO v_actual_calories, v_actual_protein, v_actual_carbs, v_actual_fat, v_logs_count
  FROM food_logs
  WHERE user_id = v_user_id AND log_date = v_log_date;

  -- Upsert into daily_nutrition_summaries
  INSERT INTO daily_nutrition_summaries (
    user_id,
    date,
    target_calories,
    target_protein,
    target_carbs,
    target_fat,
    actual_calories,
    actual_protein,
    actual_carbs,
    actual_fat,
    calories_percentage,
    protein_percentage,
    carbs_percentage,
    fat_percentage,
    logs_count,
    updated_at
  ) VALUES (
    v_user_id,
    v_log_date,
    v_target_calories,
    v_target_protein,
    v_target_carbs,
    v_target_fat,
    v_actual_calories,
    v_actual_protein,
    v_actual_carbs,
    v_actual_fat,
    CASE WHEN v_target_calories > 0 THEN ROUND((v_actual_calories::DECIMAL / v_target_calories) * 100, 2) ELSE 0 END,
    CASE WHEN v_target_protein > 0 THEN ROUND((v_actual_protein::DECIMAL / v_target_protein) * 100, 2) ELSE 0 END,
    CASE WHEN v_target_carbs > 0 THEN ROUND((v_actual_carbs::DECIMAL / v_target_carbs) * 100, 2) ELSE 0 END,
    CASE WHEN v_target_fat > 0 THEN ROUND((v_actual_fat::DECIMAL / v_target_fat) * 100, 2) ELSE 0 END,
    v_logs_count,
    NOW()
  )
  ON CONFLICT (user_id, date) DO UPDATE SET
    target_calories = EXCLUDED.target_calories,
    target_protein = EXCLUDED.target_protein,
    target_carbs = EXCLUDED.target_carbs,
    target_fat = EXCLUDED.target_fat,
    actual_calories = EXCLUDED.actual_calories,
    actual_protein = EXCLUDED.actual_protein,
    actual_carbs = EXCLUDED.actual_carbs,
    actual_fat = EXCLUDED.actual_fat,
    calories_percentage = EXCLUDED.calories_percentage,
    protein_percentage = EXCLUDED.protein_percentage,
    carbs_percentage = EXCLUDED.carbs_percentage,
    fat_percentage = EXCLUDED.fat_percentage,
    logs_count = EXCLUDED.logs_count,
    updated_at = NOW();

  -- Handle UPDATE that changes date - recalculate old date too
  IF TG_OP = 'UPDATE' AND OLD.log_date != NEW.log_date THEN
    -- Recalculate the old date's summary
    SELECT
      COALESCE(SUM(calories_logged), 0)::INTEGER,
      COALESCE(SUM(protein_logged), 0)::INTEGER,
      COALESCE(SUM(carbs_logged), 0)::INTEGER,
      COALESCE(SUM(fat_logged), 0)::INTEGER,
      COUNT(*)::INTEGER
    INTO v_actual_calories, v_actual_protein, v_actual_carbs, v_actual_fat, v_logs_count
    FROM food_logs
    WHERE user_id = OLD.user_id AND log_date = OLD.log_date;

    IF v_logs_count = 0 THEN
      -- No more logs for old date, delete the summary
      DELETE FROM daily_nutrition_summaries
      WHERE user_id = OLD.user_id AND date = OLD.log_date;
    ELSE
      -- Update old date's summary
      UPDATE daily_nutrition_summaries SET
        actual_calories = v_actual_calories,
        actual_protein = v_actual_protein,
        actual_carbs = v_actual_carbs,
        actual_fat = v_actual_fat,
        calories_percentage = CASE WHEN target_calories > 0 THEN ROUND((v_actual_calories::DECIMAL / target_calories) * 100, 2) ELSE 0 END,
        protein_percentage = CASE WHEN target_protein > 0 THEN ROUND((v_actual_protein::DECIMAL / target_protein) * 100, 2) ELSE 0 END,
        carbs_percentage = CASE WHEN target_carbs > 0 THEN ROUND((v_actual_carbs::DECIMAL / target_carbs) * 100, 2) ELSE 0 END,
        fat_percentage = CASE WHEN target_fat > 0 THEN ROUND((v_actual_fat::DECIMAL / target_fat) * 100, 2) ELSE 0 END,
        logs_count = v_logs_count,
        updated_at = NOW()
      WHERE user_id = OLD.user_id AND date = OLD.log_date;
    END IF;
  END IF;

  -- Clean up empty summaries on DELETE
  IF TG_OP = 'DELETE' AND v_logs_count = 0 THEN
    DELETE FROM daily_nutrition_summaries
    WHERE user_id = v_user_id AND date = v_log_date;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Update helper function to also use SECURITY DEFINER
CREATE OR REPLACE FUNCTION get_week_nutrition_summaries(p_user_id UUID, p_end_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  date DATE,
  actual_calories INTEGER,
  actual_protein INTEGER,
  actual_carbs INTEGER,
  actual_fat INTEGER,
  target_calories INTEGER,
  target_protein INTEGER,
  target_carbs INTEGER,
  target_fat INTEGER,
  calories_percentage DECIMAL(5,2),
  protein_percentage DECIMAL(5,2),
  carbs_percentage DECIMAL(5,2),
  fat_percentage DECIMAL(5,2),
  logs_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dns.date,
    dns.actual_calories,
    dns.actual_protein,
    dns.actual_carbs,
    dns.actual_fat,
    dns.target_calories,
    dns.target_protein,
    dns.target_carbs,
    dns.target_fat,
    dns.calories_percentage,
    dns.protein_percentage,
    dns.carbs_percentage,
    dns.fat_percentage,
    dns.logs_count
  FROM daily_nutrition_summaries dns
  WHERE dns.user_id = p_user_id
    AND dns.date BETWEEN p_end_date - INTERVAL '6 days' AND p_end_date
  ORDER BY dns.date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
