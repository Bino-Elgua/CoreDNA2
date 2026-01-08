# Supabase Setup Guide for CoreDNA Settings

## Quick Setup (1 minute)

### 1. Create the Settings Table in Supabase

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the SQL below:

```sql
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE,
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Optional: Enable RLS for security (allows anonymous access for now)
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON user_settings FOR ALL USING (true) WITH CHECK (true);
```

6. Click **Run** (or Cmd+Enter)
7. Done! The table is created.

### 2. Verify Table Creation

In SQL Editor, run:
```sql
SELECT * FROM user_settings;
```

You should see the empty table structure.

### 3. Environment Variables

The `.env.local` file in the project root already has:
```
VITE_SUPABASE_URL=https://uoqsjdlqzhswznaoaehj.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_GRmPOqSshVGLGTv36N8u2A__g4jMnYv
```

If running locally, this is already configured.

## Testing

1. Start the dev server: `npm run dev`
2. Go to Settings page
3. Enter your API key for any provider
4. Click **Save Changes**
5. Check Supabase SQL Editor: `SELECT * FROM user_settings;`

You should see your settings saved as JSON in the `settings` column.

## Troubleshooting

### "PGRST116" Error
- Table doesn't exist yet
- **Solution**: Run the SQL above in Supabase SQL Editor

### "QuotaExceeded" on Settings Page
- Settings are now saved to Supabase, not localStorage
- If you still see this, clear browser localStorage: F12 → Application → Local Storage → Delete

### Settings Not Loading
- Check browser console (F12)
- Verify env vars in `.env.local`
- Check Supabase dashboard for the table

## Architecture

- **Frontend**: React settings page → Supabase service
- **Backend**: Supabase PostgreSQL stores `user_settings` table
- **Fallback**: If Supabase fails, falls back to localStorage (seamless)
- **Auth**: Uses `anonymous_user` for unauthenticated access (can add real auth later)
