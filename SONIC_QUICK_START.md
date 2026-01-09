# Sonic Co-Pilot: 30-Minute Quick Start

## ✅ Pre-Flight Checklist (5 min)

- [ ] You have Hunter tier account (for testing)
- [ ] CoreDNA2 dev server running (`npm run dev`)
- [ ] Supabase account access
- [ ] Chrome or Edge browser

---

## 🚀 Step 1: Database Setup (5 min)

### Create sonic_logs Table

1. Go to **Supabase Dashboard** → Your Project
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy-paste entire contents of `SONIC_SETUP.sql`:
```sql
CREATE TABLE IF NOT EXISTS sonic_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE sonic_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sonic logs"
ON sonic_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sonic logs"
ON sonic_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_sonic_logs_user_id ON sonic_logs(user_id);
CREATE INDEX idx_sonic_logs_timestamp ON sonic_logs(timestamp DESC);
```

5. Click **Run** (blue button)
6. Should see: ✅ Success

---

## 🎯 Step 2: Verify Service Dependencies (3 min)

These services must exist in CoreDNA2. Check files:

- [ ] `src/services/tierService.ts` - ✅ Should exist
- [ ] `src/services/n8nService.ts` - ✅ Should exist
- [ ] `src/services/geminiService.ts` - ✅ Should exist
- [ ] `src/services/toastService.ts` - ✅ Should exist
- [ ] `src/services/supabase.ts` - ✅ Should exist

**If any are missing:**
```typescript
// Create minimal stub
export const tierService = {
  async checkFeatureAccess(feature: string) { return true; },
  async checkWorkflowAccess(name: string) { return true; },
  async getUserTierInfo() { 
    return { tier: 'hunter', extractionsThisMonth: 5 }; 
  },
  async recordExtraction() {},
  async checkExtractionLimit() { return true; }
};
```

---

## 🧪 Step 3: Test in Browser (5 min)

1. **Start dev server**: `npm run dev`
2. **Login** with Hunter tier account
3. **Look for** 🎙️ icon in bottom-right corner
4. **Click** the orb → Chat panel opens

Expected result:
```
┌──────────────────────┐
│ Sonic Co-Pilot       │
│ Ready to assist      │
├──────────────────────┤
│                      │
│ Say "Sonic, help"    │
│ or type command      │
│                      │
├──────────────────────┤
│ [Type here...] [Send]│
└──────────────────────┘
```

---

## 🎤 Step 4: Test Voice (Chrome/Edge only) (5 min)

1. **Make sure** you're in Chrome or Edge
2. **Click** green mic button (top-right of orb)
3. **Say**: "Sonic, help"
4. **You should hear** a response

Expected response:
```
Sonic: "Sonic Co-Pilot Commands:

🧬 Brand Extraction
  Extract [URL] — Extract brand DNA
  
🚀 Campaign Generation
  Launch campaign — Generate assets
  
🌐 Website Builder
  Build website — Deploy site
  
... (etc)"
```

---

## 💬 Step 5: Test Commands (7 min)

### Test 1: Help Command
```
You:   "Help"
Sonic: [Lists all commands]
✅ Pass
```

### Test 2: Show Stats
```
You:   "Show stats"
Sonic: "Current Tier: HUNTER
        Extractions: X
        Available Commands: 7"
✅ Pass
```

### Test 3: Extract Brand (requires geminiService)
```
You:   "Extract apple.com"
Sonic: "Brand DNA extracted from apple.com..."
✅ Pass (or "Failed to extract" = geminiService missing)
```

### Test 4: Chat Input
```
You:   Type "Extract google.com" + press Send
Sonic: [Responds in chat]
✅ Pass
```

---

## 🔐 Step 6: Verify Security (3 min)

### Check Tier Enforcement
1. **Logout** from Hunter account
2. **Login** with Free or Pro account
3. **Look** for 🎙️ orb → Should NOT be visible
4. ✅ Orb hidden for Free/Pro = Good

### Check Audit Logs
1. **Go to** Supabase SQL Editor
2. **Run query**:
```sql
SELECT action, metadata, timestamp 
FROM sonic_logs 
WHERE user_id = auth.uid()
ORDER BY timestamp DESC
LIMIT 10;
```

3. **Should see** recent commands logged
4. ✅ Commands in table = Good

---

## 📋 Complete Checklist

When all tests pass:

- [ ] sonic_logs table created
- [ ] Supabase RLS policies enabled
- [ ] Orb visible for Hunter tier
- [ ] Orb hidden for Free/Pro tiers
- [ ] Chat works (all browsers)
- [ ] Voice works (Chrome/Edge)
- [ ] "Help" command responds
- [ ] "Show stats" command responds
- [ ] Commands logged to Supabase
- [ ] No browser console errors
- [ ] Notifications display (toast)
- [ ] Can close/reopen chat panel

---

## 🎉 You're Ready!

Sonic Co-Pilot is now live on CoreDNA2.

### Next Steps:
1. Test with team members
2. Gather feedback for 48 hours
3. Deploy to production
4. Enable for all Hunter users
5. Monitor adoption metrics

### Monitoring:
```sql
-- Daily active users
SELECT COUNT(DISTINCT user_id) 
FROM sonic_logs 
WHERE timestamp > NOW() - INTERVAL '1 day';

-- Most popular commands
SELECT metadata->>'intent' as command, COUNT(*) 
FROM sonic_logs 
GROUP BY metadata->>'intent'
ORDER BY COUNT(*) DESC;

-- Success rate
SELECT 
  action,
  COUNT(*) as total
FROM sonic_logs
WHERE action IN ('command_executed', 'command_error')
GROUP BY action;
```

---

## 🆘 Troubleshooting

### Orb Not Showing
- [ ] Logged in with Hunter tier?
- [ ] Page refreshed?
- [ ] Check browser console for errors
- [ ] sonicCoPilot.initialize() returning false?

### Voice Not Working
- [ ] Using Chrome/Edge?
- [ ] Microphone permissions granted?
- [ ] Check console: `console.log('Voice support:', 'SpeechRecognition' in window)`
- [ ] Try chat mode instead (always works)

### Commands Returning Errors
- [ ] Check if tierService exists
- [ ] Check if geminiService exists
- [ ] Check if n8nService exists
- [ ] Look at browser console for actual error

### Commands Not Logging
- [ ] Supabase table created?
- [ ] RLS policies enabled?
- [ ] User authenticated?
- [ ] Check Supabase for errors

---

## 📞 Support

Need help?
1. **Check logs**: `SONIC_IMPLEMENTATION_GUIDE.md`
2. **Check privacy**: `SONIC_PRIVACY_COMPLIANCE.md`
3. **Review code**: `src/services/sonicCoPilot.ts`
4. **Supabase docs**: https://supabase.com/docs

---

**Total time: ~30 minutes ⏱️**

**Result: Enterprise-grade voice agent 🎙️**
