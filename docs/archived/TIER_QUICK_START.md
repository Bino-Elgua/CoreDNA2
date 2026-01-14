# 4-Tier System - Quick Start Guide

## 🚀 5-Minute Setup

### 1. Apply Supabase Migration (2 min)
```sql
-- Copy contents from: supabase/migrations/04_add_tier_system.sql
-- Paste into Supabase SQL Editor → Run
-- Or use CLI: supabase db push
```

### 2. Add Routes (1 min)
```typescript
// In your router configuration
import { PricingPage } from './pages/PricingPage';

routes.push({
  path: '/pricing',
  element: <PricingPage />,
});
```

### 3. Integrate Extract Page (2 min)
```typescript
import { tierService } from '../services/tierService';

async function handleExtract() {
  // Check limit BEFORE
  if (!await tierService.checkExtractionLimit()) {
    window.location.href = '/pricing';
    return;
  }

  // ... extraction logic ...

  // Record AFTER success
  await tierService.recordExtraction();
}
```

## 📦 What's Included

| File | Purpose | Status |
|------|---------|--------|
| `src/constants/tiers.ts` | Tier definitions | ✅ Ready |
| `src/services/tierService.ts` | Tier logic | ✅ Ready |
| `src/pages/PricingPage.tsx` | Pricing UI | ✅ Ready |
| `src/components/UpgradeModal.tsx` | Upgrade flow | ✅ Ready |
| `src/components/Navigation.tsx` | Tier badge | ✅ Ready |
| `supabase/migrations/04_add_tier_system.sql` | DB schema | ✅ Ready |
| `types.ts` | Type updates | ✅ Ready |

## 🎯 Core Functions

### Get User Tier
```typescript
const info = await tierService.getUserTierInfo();
// Returns: { tier: 'free', extractionsThisMonth: 0, canExtract: true }
```

### Check Extraction Limit
```typescript
if (!await tierService.checkExtractionLimit()) {
  // User hit limit - redirect to /pricing
}
```

### Check Workflow Access
```typescript
if (!await tierService.checkWorkflowAccess('auto-post-scheduler')) {
  // User doesn't have this workflow
}
```

### Record an Extraction
```typescript
await tierService.recordExtraction(); // Increments counter
```

## 🔑 Key Features by Tier

### FREE ($0)
- 3 extractions/month
- 2 LLM providers
- Community support

### PRO ($49/mo)
- Unlimited extractions
- All 30+ LLM providers
- Email support

### HUNTER ($149/mo)
- Everything in Pro +
- Workflow editing
- Auto-post scheduler
- 3 team members

### AGENCY (Custom)
- Everything in Hunter +
- Unlimited team
- White-label
- Dedicated support

## 🧪 Local Testing

```bash
npm run dev

# Test as free user:
# - Do 3 extractions (works)
# - Try 4th (blocks + redirects)

# Test as pro user:
# - Do unlimited extractions

# Visit http://localhost:5173/pricing to see all tiers
```

## 🔧 Common Tasks

### Hide Feature for Free Tier
```typescript
const { tier } = await tierService.getUserTierInfo();
if (tier === 'free') {
  return <UpgradePrompt />;
}
return <Feature />;
```

### Show Tier Badge
```typescript
import { tierService } from '../services/tierService';

const { tier } = await tierService.getUserTierInfo();
const badge = tierService.getTierBadge(tier);
return <div>{badge}</div>;
```

### Gate a Workflow
```typescript
const canUse = await tierService.checkWorkflowAccess('lead-generation');
if (!canUse) {
  toast.error('This requires Pro tier');
  return;
}
// Execute workflow
```

## 📊 Database Schema

### user_settings table
```sql
-- New columns:
tier TEXT DEFAULT 'free' -- 'free', 'pro', 'hunter', 'agency'
usage JSONB -- { extractionsThisMonth: 0, lastResetDate: "2026-01-08" }
team_id UUID -- For Agency tier team support
role TEXT -- 'owner', 'admin', 'member'
```

### teams table (new)
```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY,
  name TEXT,
  owner_id UUID,
  tier TEXT,
  white_label_settings JSONB,
  created_at TIMESTAMP
);
```

## 🎨 UI Components

### Pricing Page
- 4 tier cards with features
- Comparison table
- "Most Popular" badge on Pro
- "Best Value" badge on Hunter

### Navigation
- Color-coded tier badge
- "Upgrade" button for free users

### Upgrade Modal
- Shows current vs target tier
- Displays pricing
- "Contact Sales" for Agency

## ⚠️ Important Notes

1. **Monthly Reset**: Counters reset automatically on 1st of month
2. **Free BYOK**: Free users can still add custom API keys
3. **No Downtime**: All users default to 'free' if tier not set
4. **RLS Secure**: Team data protected by Row Level Security policies

## 📞 Support Features

- **Free**: Community support (forums, docs)
- **Pro**: Email support (24-48hr response)
- **Hunter**: Priority email (12-24hr response)
- **Agency**: Dedicated account manager

## 💾 Backup & Recovery

If you need to reset:
```sql
-- Reset single user to free tier
UPDATE user_settings 
SET tier = 'free' 
WHERE user_id = 'user-id-here';

-- Reset all usage counters
UPDATE user_settings 
SET usage = '{"extractionsThisMonth": 0, "lastResetDate": "2026-01-08"}'::jsonb;
```

## ✅ Verification Checklist

After setup, verify:
- [ ] Migration applied (check Supabase)
- [ ] Routes added (can visit /pricing)
- [ ] tierService works (check console logs)
- [ ] Extract page blocks free tier at limit
- [ ] Navigation shows tier badge
- [ ] All tiers display correctly on pricing page

## 🚀 Next Steps

1. **Apply migration** → 2 min
2. **Add routes** → 1 min
3. **Integrate extract page** → 5 min
4. **Test locally** → 5 min
5. **Deploy to staging** → 10 min
6. **Final testing** → 10 min
7. **Deploy to production** → 5 min

**Total time: ~40 minutes**

## 📚 Full Documentation

For detailed integration examples, see:
- `TIER_INTEGRATION_EXAMPLES.md` - Code examples
- `TIER_SYSTEM_IMPLEMENTATION.md` - Complete guide
- `TIER_DEPLOYMENT_CHECKLIST.md` - Full checklist

## 🎯 Success Criteria

- ✅ All 4 tier cards display on `/pricing`
- ✅ Free users can do 3 extractions/month
- ✅ 4th extraction blocks and redirects
- ✅ Monthly counter resets automatically
- ✅ Tier badge shows in navigation
- ✅ Pro/Hunter tiers allow unlimited extractions
- ✅ Workflows gate by tier correctly
- ✅ No console errors

---

**Ready to deploy!** Start with the 5-minute setup above. 🚀
