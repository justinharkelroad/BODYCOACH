-- Migration: Daily Check-ins
-- Phase 2: Daily Mood/Energy Check-in + Journal Notes

-- Daily check-ins table for mood, energy, and sleep tracking
CREATE TABLE daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,

  -- Levels: 1=Low/Bad, 2=Below Average, 3=Good, 4=Great/Energized
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 4),
  mood_level INTEGER CHECK (mood_level BETWEEN 1 AND 4),
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 4),

  -- Optional journal note
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One check-in per user per day
  UNIQUE(user_id, date)
);

-- Indexes for quick lookups
CREATE INDEX idx_daily_checkins_user_id ON daily_checkins(user_id);
CREATE INDEX idx_daily_checkins_user_date ON daily_checkins(user_id, date);
CREATE INDEX idx_daily_checkins_date ON daily_checkins(date);

-- =====================
-- Row Level Security
-- =====================

ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checkins"
  ON daily_checkins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkins"
  ON daily_checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checkins"
  ON daily_checkins FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own checkins"
  ON daily_checkins FOR DELETE
  USING (auth.uid() = user_id);

-- =====================
-- Triggers
-- =====================

-- Auto-update updated_at
CREATE TRIGGER update_daily_checkins_updated_at
  BEFORE UPDATE ON daily_checkins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
