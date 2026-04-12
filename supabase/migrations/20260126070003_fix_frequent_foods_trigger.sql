-- Migration: Fix frequent_foods trigger to handle NULL food_id
-- Skip inserting into frequent_foods when food_id is NULL (quick logs)

CREATE OR REPLACE FUNCTION update_frequent_foods()
RETURNS TRIGGER AS $$
BEGIN
  -- Only track frequent foods when we have an actual food_id
  -- Skip for quick logs that only have custom_food_name
  IF NEW.food_id IS NOT NULL THEN
    INSERT INTO frequent_foods (user_id, food_id, log_count, last_logged_at, typical_meal_slot, typical_time_of_day)
    VALUES (
      NEW.user_id,
      NEW.food_id,
      1,
      NEW.logged_at,
      NEW.meal_slot,
      NEW.logged_at::TIME
    )
    ON CONFLICT (user_id, food_id)
    DO UPDATE SET
      log_count = frequent_foods.log_count + 1,
      last_logged_at = NEW.logged_at,
      typical_meal_slot = COALESCE(NEW.meal_slot, frequent_foods.typical_meal_slot),
      typical_time_of_day = NEW.logged_at::TIME;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
