-- Create sonic_logs table for audit trail
CREATE TABLE IF NOT EXISTS sonic_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE sonic_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own logs
CREATE POLICY "Users can view their own sonic logs"
ON sonic_logs FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own logs
CREATE POLICY "Users can insert their own sonic logs"
ON sonic_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_sonic_logs_user_id ON sonic_logs(user_id);
CREATE INDEX idx_sonic_logs_timestamp ON sonic_logs(timestamp DESC);
