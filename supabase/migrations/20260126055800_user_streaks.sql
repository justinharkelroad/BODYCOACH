-- Migration: User Streaks
-- Adds logging streak tracking for gamification

-- User streaks table
CREATE TABLE user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Core streak data
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_log_date DATE,
  streak_start_date DATE,

  -- Freeze feature (1 per week)
  streak_frozen_at TIMESTAMPTZ,           -- NULL if not frozen
  freezes_used_this_week INTEGER DEFAULT 0,
  freeze_week_start DATE,                  -- For resetting weekly freeze count

  -- Stats
  total_days_logged INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Index for quick lookups
CREATE INDEX idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX idx_user_streaks_last_log ON user_streaks(last_log_date);

-- =====================
-- Row Level Security
-- =====================

ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streaks"
  ON user_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks"
  ON user_streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks"
  ON user_streaks FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================
-- Triggers
-- =====================

-- Auto-update updated_at
CREATE TRIGGER update_user_streaks_updated_at
  BEFORE UPDATE ON user_streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
