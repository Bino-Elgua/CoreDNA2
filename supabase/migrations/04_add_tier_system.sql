-- Update user_settings table to support 4 tiers
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free' 
CHECK (tier IN ('free', 'pro', 'hunter', 'agency'));

-- Add usage tracking
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS usage JSONB DEFAULT '{"extractionsThisMonth": 0, "lastResetDate": "2026-01-08"}'::jsonb;

-- Add team support
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id),
ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('owner', 'admin', 'member'));

-- Create teams table for Agency tier
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) NOT NULL,
  tier TEXT DEFAULT 'agency',
  white_label_settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Team members can view their team"
ON teams FOR SELECT
USING (
  id IN (
    SELECT team_id FROM user_settings WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Team owners can update their team"
ON teams FOR UPDATE
USING (owner_id = auth.uid());
