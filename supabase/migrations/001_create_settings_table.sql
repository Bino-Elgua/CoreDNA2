-- Create user_settings table for storing user configuration
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE,
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read/write their own settings
CREATE POLICY "Users can access their own settings"
    ON user_settings
    FOR ALL
    USING (user_id = current_user_id() OR user_id = 'anonymous_user')
    WITH CHECK (user_id = current_user_id() OR user_id = 'anonymous_user');

-- Create policy for anonymous access (fallback)
CREATE POLICY "Allow anonymous access"
    ON user_settings
    FOR ALL
    USING (true)
    WITH CHECK (true);
