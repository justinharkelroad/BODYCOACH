-- Migration: Nutrition Module
-- Adds comprehensive nutrition/macro tracking for BODYCOACH

-- Helper function for auto-updating updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- User nutrition settings and goals
CREATE TABLE user_nutrition_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_type TEXT CHECK (goal_type IN ('lose_fat', 'maintain', 'gain_muscle')),
  target_calories INTEGER,
  target_protein INTEGER,  -- grams
  target_carbs INTEGER,    -- grams
  target_fat INTEGER,      -- grams
  is_breastfeeding BOOLEAN DEFAULT FALSE,
  breastfeeding_sessions_per_day INTEGER DEFAULT 0, -- 0-12
  breastfeeding_calorie_add INTEGER DEFAULT 0, -- auto-calculated: sessions * 25-50 cal
  postpartum_weeks INTEGER, -- weeks since delivery, affects safe deficit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Food database (cached from APIs + user-created)
CREATE TABLE foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT CHECK (source IN ('usda', 'open_food_facts', 'user_created')) NOT NULL,
  external_id TEXT, -- fdc_id or OFF barcode
  barcode TEXT,
  name TEXT NOT NULL,
  brand TEXT,
  serving_size DECIMAL,
  serving_unit TEXT,
  calories DECIMAL,
  protein DECIMAL,
  carbs DECIMAL,
  fat DECIMAL,
  fiber DECIMAL,
  sugar DECIMAL,
  sodium DECIMAL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  cached_at TIMESTAMPTZ DEFAULT NOW(), -- for TTL/LRU cache eviction
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source, external_id)
);

-- Indexes for efficient lookups
CREATE INDEX idx_foods_barcode ON foods(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX idx_foods_name_search ON foods USING gin(to_tsvector('english', name));
CREATE INDEX idx_foods_source_external ON foods(source, external_id);
CREATE INDEX idx_foods_cached_at ON foods(cached_at); -- for cache eviction

-- Food log entries
CREATE TABLE food_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  food_id UUID REFERENCES foods(id) NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  log_date DATE DEFAULT CURRENT_DATE, -- for easier daily queries
  meal_slot TEXT CHECK (meal_slot IS NULL OR meal_slot IN ('breakfast', 'lunch', 'dinner', 'snack')),
  servings DECIMAL DEFAULT 1,
  calories_logged DECIMAL,
  protein_logged DECIMAL,
  carbs_logged DECIMAL,
  fat_logged DECIMAL,
  quick_logged BOOLEAN DEFAULT FALSE, -- true if logged via shortcut
  photo_url TEXT,
  notes TEXT,
  is_planned BOOLEAN DEFAULT FALSE, -- for pre-logged/future meals
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for food logs
CREATE INDEX idx_food_logs_user_date ON food_logs(user_id, log_date);
CREATE INDEX idx_food_logs_user_logged_at ON food_logs(user_id, logged_at);
CREATE INDEX idx_food_logs_planned ON food_logs(user_id, is_planned) WHERE is_planned = TRUE;

-- Saved meals (combinations for one-tap logging)
CREATE TABLE saved_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  use_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  -- Cached totals for quick display
  total_calories DECIMAL,
  total_protein DECIMAL,
  total_carbs DECIMAL,
  total_fat DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_saved_meals_user ON saved_meals(user_id);
CREATE INDEX idx_saved_meals_favorites ON saved_meals(user_id, is_favorite) WHERE is_favorite = TRUE;

-- Foods within saved meals
CREATE TABLE saved_meal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saved_meal_id UUID REFERENCES saved_meals(id) ON DELETE CASCADE NOT NULL,
  food_id UUID REFERENCES foods(id) NOT NULL,
  servings DECIMAL DEFAULT 1
);

CREATE INDEX idx_saved_meal_items_meal ON saved_meal_items(saved_meal_id);

-- Frequently logged foods (auto-tracked for quick actions)
CREATE TABLE frequent_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  food_id UUID REFERENCES foods(id) NOT NULL,
  log_count INTEGER DEFAULT 1,
  last_logged_at TIMESTAMPTZ DEFAULT NOW(),
  typical_meal_slot TEXT, -- when they usually eat this
  typical_time_of_day TIME, -- approximate time
  UNIQUE(user_id, food_id)
);

CREATE INDEX idx_frequent_foods_user ON frequent_foods(user_id);
CREATE INDEX idx_frequent_foods_count ON frequent_foods(user_id, log_count DESC);

-- =====================
-- Row Level Security
-- =====================

ALTER TABLE user_nutrition_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_meal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE frequent_foods ENABLE ROW LEVEL SECURITY;

-- User nutrition profiles: users can only access their own
CREATE POLICY "Users can view own nutrition profile"
  ON user_nutrition_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition profile"
  ON user_nutrition_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition profile"
  ON user_nutrition_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Foods: All authenticated users can read cached foods, users can create their own
CREATE POLICY "Authenticated users can view all foods"
  ON foods FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert foods"
  ON foods FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own created foods"
  ON foods FOR UPDATE
  USING (created_by = auth.uid() OR source != 'user_created');

-- Food logs: users can only access their own
CREATE POLICY "Users can view own food logs"
  ON food_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food logs"
  ON food_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food logs"
  ON food_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own food logs"
  ON food_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Saved meals: users can only access their own
CREATE POLICY "Users can view own saved meals"
  ON saved_meals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved meals"
  ON saved_meals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved meals"
  ON saved_meals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved meals"
  ON saved_meals FOR DELETE
  USING (auth.uid() = user_id);

-- Saved meal items: access through saved_meals ownership
CREATE POLICY "Users can view own saved meal items"
  ON saved_meal_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM saved_meals
    WHERE saved_meals.id = saved_meal_items.saved_meal_id
    AND saved_meals.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own saved meal items"
  ON saved_meal_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM saved_meals
    WHERE saved_meals.id = saved_meal_items.saved_meal_id
    AND saved_meals.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own saved meal items"
  ON saved_meal_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM saved_meals
    WHERE saved_meals.id = saved_meal_items.saved_meal_id
    AND saved_meals.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own saved meal items"
  ON saved_meal_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM saved_meals
    WHERE saved_meals.id = saved_meal_items.saved_meal_id
    AND saved_meals.user_id = auth.uid()
  ));

-- Frequent foods: users can only access their own
CREATE POLICY "Users can view own frequent foods"
  ON frequent_foods FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own frequent foods"
  ON frequent_foods FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own frequent foods"
  ON frequent_foods FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own frequent foods"
  ON frequent_foods FOR DELETE
  USING (auth.uid() = user_id);

-- =====================
-- Triggers
-- =====================

-- Auto-update updated_at for nutrition profiles
CREATE TRIGGER update_user_nutrition_profiles_updated_at
  BEFORE UPDATE ON user_nutrition_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update frequent foods on food log insert
CREATE OR REPLACE FUNCTION update_frequent_foods()
RETURNS TRIGGER AS $$
BEGIN
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

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_food_log_insert
  AFTER INSERT ON food_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_frequent_foods();

-- Function to update saved meal totals when items change
CREATE OR REPLACE FUNCTION update_saved_meal_totals()
RETURNS TRIGGER AS $$
DECLARE
  meal_id UUID;
BEGIN
  -- Get the meal_id from either NEW or OLD depending on operation
  meal_id := COALESCE(NEW.saved_meal_id, OLD.saved_meal_id);

  UPDATE saved_meals
  SET
    total_calories = (
      SELECT COALESCE(SUM(f.calories * smi.servings), 0)
      FROM saved_meal_items smi
      JOIN foods f ON f.id = smi.food_id
      WHERE smi.saved_meal_id = meal_id
    ),
    total_protein = (
      SELECT COALESCE(SUM(f.protein * smi.servings), 0)
      FROM saved_meal_items smi
      JOIN foods f ON f.id = smi.food_id
      WHERE smi.saved_meal_id = meal_id
    ),
    total_carbs = (
      SELECT COALESCE(SUM(f.carbs * smi.servings), 0)
      FROM saved_meal_items smi
      JOIN foods f ON f.id = smi.food_id
      WHERE smi.saved_meal_id = meal_id
    ),
    total_fat = (
      SELECT COALESCE(SUM(f.fat * smi.servings), 0)
      FROM saved_meal_items smi
      JOIN foods f ON f.id = smi.food_id
      WHERE smi.saved_meal_id = meal_id
    )
  WHERE id = meal_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_saved_meal_item_change
  AFTER INSERT OR UPDATE OR DELETE ON saved_meal_items
  FOR EACH ROW
  EXECUTE FUNCTION update_saved_meal_totals();
