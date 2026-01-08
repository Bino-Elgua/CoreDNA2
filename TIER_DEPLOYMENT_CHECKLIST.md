# 4-Tier System Deployment Checklist

## ✅ Code Implementation (8/8 Phases Complete)

- [x] **Phase 1**: Tier constants & helpers (`src/constants/tiers.ts`)
- [x] **Phase 2**: Type definitions updated (`types.ts`)
- [x] **Phase 3**: TierService created (`src/services/tierService.ts`)
- [x] **Phase 4**: Extract page integration guide provided
- [x] **Phase 5**: Pricing page component (`src/pages/PricingPage.tsx`)
- [x] **Phase 6**: Navigation tier badge (`src/components/Navigation.tsx`)
- [x] **Phase 7**: Supabase migrations (`supabase/migrations/04_add_tier_system.sql`)
- [x] **Phase 8**: Upgrade modal component (`src/components/UpgradeModal.tsx`)

## 📋 Pre-Launch Tasks

### Database Setup
- [ ] Run Supabase migration: `supabase/migrations/04_add_tier_system.sql`
  - Adds `tier` column to `user_settings`
  - Adds `usage` tracking (JSONB)
  - Creates `teams` table for Agency tier
  - Enables RLS policies
- [ ] Verify in Supabase dashboard that columns exist
- [ ] Test manual query: `SELECT tier, usage FROM user_settings LIMIT 1`

### Route Configuration
- [ ] Add `/pricing` route pointing to `PricingPage.tsx`
- [ ] Add `/upgrade` route (if needed)
- [ ] Add `/contact` route for Agency tier (or link to external form)

### Integration Points
- [ ] Integrate `tierService.checkExtractionLimit()` into extract page
  - Check BEFORE extraction
  - Record AFTER successful extraction
- [ ] Add tier checks to each workflow page
- [ ] Gate features using `hasFeatureAccess()` or `checkFeatureAccess()`
- [ ] Add tier badge to navigation
- [ ] Show extraction counter for free tier users

### Component Verification
- [ ] PricingPage displays all 4 tiers correctly
- [ ] UpgradeModal shows proper pricing
- [ ] Navigation shows tier badge with correct colors
- [ ] All imports resolve without errors

## 🧪 Local Testing (npm run dev)

### Free Tier Testing
- [ ] User can do 1st, 2nd, 3rd extractions
- [ ] 4th extraction attempt shows upgrade prompt
- [ ] Extraction counter displays "3 / 3 used"
- [ ] Redirect to `/pricing` happens after 2 seconds
- [ ] BYOK works (can add custom keys)
- [ ] Only 2 LLM providers available
- [ ] Only 1 image provider available
- [ ] Only 1 voice provider available
- [ ] No workflows accessible
- [ ] RLM feature disabled
- [ ] Inference disabled

### Pro Tier Testing
- [ ] Unlimited extractions allowed
- [ ] All 30+ LLM providers available
- [ ] All 20+ image providers available
- [ ] All 15+ voice providers available
- [ ] All 4 workflows accessible
- [ ] RLM enabled
- [ ] Inference enabled
- [ ] Website builder in full mode
- [ ] Auto-post disabled (not available)
- [ ] Workflow editing disabled (not available)
- [ ] Max 1 team member

### Hunter Tier Testing
- [ ] Unlimited extractions
- [ ] Workflow editing enabled
- [ ] Auto-post scheduler enabled
- [ ] Blog section enabled in website builder
- [ ] Up to 3 team members
- [ ] All features from Pro tier
- [ ] Sonic Agent in "live" mode

### Agency Tier Testing
- [ ] Unlimited extractions
- [ ] Unlimited team members
- [ ] White-label branding option
- [ ] Bulk extraction available
- [ ] All features from Hunter tier
- [ ] Custom pricing shown ("Contact Sales")

### Monthly Reset Testing
- [ ] Manually update `lastResetDate` to last month in Supabase
- [ ] Free user extraction counter resets to 0
- [ ] Counter increments again after reset

## 🔐 Security Checklist

- [ ] Tier validation happens on backend (via tierService)
- [ ] RLS policies prevent unauthorized team access
- [ ] `user_settings.tier` cannot be directly modified by user
- [ ] Usage tracking stored in `usage` JSONB (trusted source)
- [ ] No sensitive data exposed in tier constants
- [ ] Rate limiting should still apply (separate from tier limits)

## 📊 Data Integrity

- [ ] Supabase migration creates columns with proper constraints
- [ ] Tier enum check: `('free', 'pro', 'hunter', 'agency')`
- [ ] Usage JSONB has `extractionsThisMonth` and `lastResetDate`
- [ ] Teams table has proper foreign keys
- [ ] Cascade delete policies reviewed (optional)

## 🎨 UI/UX Verification

- [ ] Pricing page displays clearly on mobile/tablet/desktop
- [ ] Tier cards are visually distinct
- [ ] Color scheme matches brand (blue primary)
- [ ] Badges ("Most Popular", "Best Value") render correctly
- [ ] Comparison table is scrollable on mobile
- [ ] CTA buttons are clickable and styled correctly
- [ ] Navigation tier badge visible in all pages
- [ ] Upgrade prompts are non-intrusive

## 📱 Responsiveness

- [ ] Pricing page responsive at 320px (mobile)
- [ ] Pricing page responsive at 768px (tablet)
- [ ] Pricing page responsive at 1920px (desktop)
- [ ] Comparison table scrollable on mobile
- [ ] Modal centered and readable on all screen sizes

## 🚀 Staging Deployment

- [ ] Deploy to staging environment
- [ ] Run full test suite again on staging
- [ ] Verify Supabase migrations applied in staging
- [ ] Test with real auth flow (not just mock users)
- [ ] Check error handling (network failures, etc.)

## 📊 Analytics (Optional)

- [ ] Track tier conversions (free → pro/hunter)
- [ ] Monitor extraction usage by tier
- [ ] Track which workflows are most used per tier
- [ ] Monitor upgrade modal interactions

## 🔔 Notifications (Optional)

- [ ] Free users getting close to limit (2/3 extractions)
- [ ] Pro/Hunter users about to enter renewal period
- [ ] Agency tier users about team member limits

## 📚 Documentation

- [ ] TIER_SYSTEM_IMPLEMENTATION.md created ✓
- [ ] TIER_INTEGRATION_EXAMPLES.md created ✓
- [ ] README updated with tier information
- [ ] API docs updated if applicable
- [ ] Team notified of tier system launch

## 💳 Billing (If Stripe Integrated)

- [ ] Stripe products created for Pro ($49/mo) and Hunter ($149/mo)
- [ ] Webhook endpoint configured (`/api/stripe/webhook`)
- [ ] Checkout session redirects correctly
- [ ] Successful payment updates user tier
- [ ] Failed payment shows error message
- [ ] Subscription cancellation downgrades to free
- [ ] 7-day free trial configured in Stripe

## 🔗 Links & Resources

- [ ] Pricing page link in navbar
- [ ] Pricing page link in footer
- [ ] Help docs link to tier comparison
- [ ] FAQ mentions tier features
- [ ] Contact form for Agency tier inquiries

## ✋ Final Sign-Off

- [ ] All 8 phases complete
- [ ] Local testing passed (all 4 tiers)
- [ ] Staging deployed and verified
- [ ] No console errors or warnings
- [ ] Database migrations applied
- [ ] Routes configured
- [ ] Ready for production deployment

## 🚀 Production Deployment Steps

```bash
# 1. Backup production database
# (managed by Supabase automatically)

# 2. Apply migrations
supabase db push --remote

# 3. Build and deploy
npm run build
npm run preview  # Test build locally

# 4. Deploy to production (Vercel or your host)
vercel deploy --prod

# 5. Monitor for errors
# - Check error logs
# - Verify /pricing page loads
# - Test extraction with free user
# - Monitor database performance
```

## 📞 Rollback Plan

If issues occur after production deployment:

1. Revert migrations (keep data):
   ```sql
   DROP COLUMN tier FROM user_settings;
   DROP COLUMN usage FROM user_settings;
   DROP TABLE teams;
   ```

2. Revert code:
   ```bash
   git revert <commit-hash>
   npm run build && vercel deploy --prod
   ```

3. All users default to 'free' tier until resolved

## 📈 Post-Launch Monitoring

- [ ] Monitor /pricing page load times
- [ ] Track tier signups (Pro/Hunter/Agency)
- [ ] Monitor extraction usage patterns
- [ ] Check for database query errors
- [ ] Verify monthly reset function works
- [ ] Review user feedback on tier system
- [ ] Collect conversion metrics

---

**Status**: Ready for deployment ✅

**Last Updated**: 2026-01-08

**Next Phase**: Begin integration into extract page and other features
