-- Migration: Milestones
-- Adds milestone tracking and celebrations for gamification

-- User milestones (unlocked achievements)
CREATE TABLE user_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  milestone_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  seen BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, milestone_id)
);

-- User milestone progress (metric tracking)
CREATE TABLE user_milestone_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  metric_key TEXT NOT NULL,  -- 'total_logs', 'total_scans', 'protein_days', etc.
  metric_value INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, metric_key)
);

-- Indexes
CREATE INDEX idx_user_milestones_user ON user_milestones(user_id);
CREATE INDEX idx_user_milestones_unseen ON user_milestones(user_id, seen) WHERE seen = FALSE;
CREATE INDEX idx_milestone_progress_user ON user_milestone_progress(user_id);
CREATE INDEX idx_milestone_progress_lookup ON user_milestone_progress(user_id, metric_key);

-- =====================
-- Row Level Security
-- =====================

ALTER TABLE user_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_milestone_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own milestones"
  ON user_milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones"
  ON user_milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own milestones"
  ON user_milestones FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own progress"
  ON user_milestone_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_milestone_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_milestone_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================
-- Triggers
-- =====================

-- Auto-update updated_at for progress
CREATE TRIGGER update_milestone_progress_updated_at
  BEFORE UPDATE ON user_milestone_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
