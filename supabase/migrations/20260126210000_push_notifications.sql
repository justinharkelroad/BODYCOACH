-- Add push notification token support to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS push_token TEXT,
ADD COLUMN IF NOT EXISTS push_token_updated_at TIMESTAMPTZ;

-- Create index for faster push token lookups
CREATE INDEX IF NOT EXISTS idx_profiles_push_token ON profiles(push_token) WHERE push_token IS NOT NULL;

-- Add comment
COMMENT ON COLUMN profiles.push_token IS 'Expo push notification token for the user device';
COMMENT ON COLUMN profiles.push_token_updated_at IS 'When the push token was last updated';
