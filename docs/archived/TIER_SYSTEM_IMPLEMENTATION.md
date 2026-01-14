# 4-Tier System Implementation - CoreDNA2

## ✅ Phases Completed

### Phase 1: Tier Constants ✓
- **File**: `src/constants/tiers.ts`
- Contains all tier definitions (FREE/PRO/HUNTER/AGENCY)
- Helper functions: `hasFeatureAccess()`, `canExtract()`, `canUseWorkflow()`
- Price and description mappings

### Phase 2: Type Updates ✓
- **File**: `types.ts`
- Updated `UserProfile` interface to include `usage` and team support
- Added extraction tracking and monthly reset date

### Phase 3: Tier Service ✓
- **File**: `src/services/tierService.ts`
- `getUserTierInfo()` - Get user's tier and extraction count
- `checkExtractionLimit()` - Enforce monthly limits
- `checkWorkflowAccess()` - Gate workflows by tier
- `checkFeatureAccess()` - Generic feature gating
- `recordExtraction()` - Increment counter

### Phase 4: Extract Page Integration
- Add tier check before extraction:
```typescript
const canExtract = await tierService.checkExtractionLimit();
if (!canExtract) return; // User redirected to pricing

// ... existing extraction logic ...

await tierService.recordExtraction(); // Record after success
```

### Phase 5: Pricing Page ✓
- **File**: `src/pages/PricingPage.tsx`
- 4 tier cards with features/prices
- Comparison table with all features
- "Most Popular", "Best Value" badges

### Phase 6: Navigation Tier Badge ✓
- **File**: `src/components/Navigation.tsx`
- Shows color-coded tier badge
- Upgrade button for free tier
- Auto-loads user's tier

### Phase 7: Supabase Schema ✓
- **File**: `supabase/migrations/04_add_tier_system.sql`
- Adds `tier` column to `user_settings`
- Adds `usage` JSONB for monthly tracking
- Creates `teams` table for Agency tier
- Enables RLS policies

### Phase 8: Upgrade Modal ✓
- **File**: `src/components/UpgradeModal.tsx`
- Shows current vs target tier
- Displays pricing
- Custom messaging for Agency tier

## 🔧 Next Steps

### 1. Apply Supabase Migration
```bash
# In Supabase dashboard, run SQL from: supabase/migrations/04_add_tier_system.sql
# OR use Supabase CLI:
supabase db push
```

### 2. Update Existing Pages
Add tier checks to:
- **Extract Page**: Check before extraction
- **Workflow Pages**: Check workflow access
- **Feature Pages**: Use `hasFeatureAccess()` to hide/disable features

Example:
```typescript
import { tierService } from '../services/tierService';

async function onExtractClick() {
  if (!await tierService.checkExtractionLimit()) {
    // Show upgrade prompt and redirect
    window.location.href = '/pricing';
    return;
  }
  // ... extraction logic
  await tierService.recordExtraction();
}
```

### 3. Add Routes
```typescript
// In your router setup
import { PricingPage } from './pages/PricingPage';

routes.push({
  path: '/pricing',
  element: <PricingPage />,
});
```

### 4. Test Locally
```bash
npm run dev
```

Test as each tier:
- **Free**: Verify 3/3 extractions blocked, show upgrade prompt
- **Pro**: Unlimited extractions, all workflows, inference enabled
- **Hunter**: Everything + workflow editing, auto-post
- **Agency**: Everything + team management, white-label

### 5. Stripe Integration (Optional)
If adding automated billing, create:
- `api/stripe/checkout.ts` - Create checkout session
- `api/stripe/webhook.ts` - Handle subscription events

Env vars needed:
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_HUNTER_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 📊 Tier Comparison

| Feature | Free | Pro | Hunter | Agency |
|---------|------|-----|--------|--------|
| Price | $0 | $49/mo | $149/mo | Custom |
| Extractions | 3/mo | ∞ | ∞ | ∞ |
| LLM Providers | 2 | All 30+ | All 30+ | All 30+ |
| Image Providers | 1 | All 20+ | All 20+ | All 20+ |
| Voice Providers | 1 | All 15+ | All 15+ | All 15+ |
| Inference | — | ✓ | ✓ | ✓ |
| RLM | — | ✓ | ✓ | ✓ |
| Workflows | 0 | 4 | 4 | 5 |
| Workflow Editing | — | — | ✓ | ✓ |
| Auto-Post | — | — | ✓ | ✓ |
| Team Members | 1 | 1 | 3 | ∞ |
| White-Label | — | — | — | ✓ |
| Support | Community | Email | Email | Dedicated |

## 🧪 Validation Checklist

- [ ] Supabase migration applied
- [ ] `tierService` integrated into extract page
- [ ] PricingPage accessible at `/pricing`
- [ ] Navigation shows tier badge
- [ ] Free tier shows "3/3 extractions used" indicator
- [ ] Extraction limit blocks 4th attempt
- [ ] Monthly counter resets automatically
- [ ] Workflows gated by tier
- [ ] Features disabled gracefully for restricted tiers
- [ ] Stripe integration tested (if enabled)

## 📝 Notes

- Monthly counter resets on the 1st of each month
- Free tier users can still use BYOK (Bring Your Own Keys)
- RLM and Inference are Pro tier+ only
- Team features are Agency tier only
- Agency tier pricing requires contacting sales
- All tiers include 7-day free trial for paid plans

## 🚀 Production Deployment

1. Test thoroughly locally with `npm run dev`
2. Commit all changes with clear messages
3. Deploy to staging environment
4. Verify Supabase migrations applied
5. Test payment flow (if Stripe integrated)
6. Deploy to production: `npm run build && npm run preview`
