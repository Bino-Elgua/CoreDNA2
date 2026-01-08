# Tier System Integration Examples

## Example 1: Extract Page Integration

```typescript
import { useState, useEffect } from 'react';
import { tierService } from '../services/tierService';
import type { Tier } from '../constants/tiers';

function ExtractPage() {
  const [tierInfo, setTierInfo] = useState({ tier: 'free', extractionsThisMonth: 0, canExtract: true });
  const [isExtracting, setIsExtracting] = useState(false);

  useEffect(() => {
    tierService.getUserTierInfo().then(setTierInfo);
  }, []);

  async function handleExtract() {
    setIsExtracting(true);

    try {
      // Check extraction limit BEFORE processing
      const canExtract = await tierService.checkExtractionLimit();
      if (!canExtract) {
        // User will be redirected to pricing
        return;
      }

      // ... existing extraction logic ...

      // Record extraction AFTER success
      await tierService.recordExtraction();
      // Refresh tier info
      const newInfo = await tierService.getUserTierInfo();
      setTierInfo(newInfo);
    } catch (error) {
      console.error('Extraction error:', error);
    } finally {
      setIsExtracting(false);
    }
  }

  return (
    <div className="extract-page">
      {/* Usage indicator for free tier */}
      {tierInfo.tier === 'free' && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-blue-900">
              {tierInfo.extractionsThisMonth} / 3 extractions used this month
            </span>

            <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(tierInfo.extractionsThisMonth / 3) * 100}%` }}
              />
            </div>

            {!tierInfo.canExtract && (
              <a href="/pricing" className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-nowrap">
                Upgrade →
              </a>
            )}
          </div>
        </div>
      )}

      {/* Rest of extract page */}
    </div>
  );
}
```

## Example 2: Workflow Gating

```typescript
import { tierService } from '../services/tierService';

async function executeWorkflow(workflowId: string) {
  const hasAccess = await tierService.checkWorkflowAccess(workflowId);
  
  if (!hasAccess) {
    toast.error(`This workflow requires Pro tier or higher`);
    setTimeout(() => {
      window.location.href = '/pricing';
    }, 2000);
    return;
  }

  // Execute workflow
}
```

## Example 3: Feature Gating

```typescript
import { tierService } from '../services/tierService';

function WebsiteBuilderPage() {
  const [hasWebsiteBuilder, setHasWebsiteBuilder] = useState(false);

  useEffect(() => {
    tierService.checkFeatureAccess('websiteBuilder').then(hasAccess => {
      setHasWebsiteBuilder(hasAccess);
    });
  }, []);

  if (!hasWebsiteBuilder) {
    return (
      <div className="p-8 text-center">
        <h2>Website Builder Coming Soon</h2>
        <p>Upgrade to Pro to unlock the website builder</p>
        <a href="/pricing" className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg">
          View Plans
        </a>
      </div>
    );
  }

  return (
    // Full website builder UI
  );
}
```

## Example 4: Navigation Component

```typescript
import { useEffect, useState } from 'react';
import { tierService } from '../services/tierService';
import type { Tier } from '../constants/tiers';

function Navigation() {
  const [userTier, setUserTier] = useState<Tier>('free');

  useEffect(() => {
    tierService.getUserTierInfo().then(info => setUserTier(info.tier));
  }, []);

  const tierColors = {
    free: 'bg-gray-100 text-gray-700',
    pro: 'bg-blue-100 text-blue-700',
    hunter: 'bg-purple-100 text-purple-700',
    agency: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <nav className="flex items-center justify-between p-4">
      {/* Existing nav items */}

      <div className="flex items-center gap-3">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tierColors[userTier]}`}>
          {userTier.toUpperCase()}
        </span>

        {userTier === 'free' && (
          <a href="/pricing" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
            Upgrade
          </a>
        )}
      </div>
    </nav>
  );
}
```

## Example 5: Conditional UI Rendering

```typescript
import { TIER_LIMITS } from '../constants/tiers';
import { tierService } from '../services/tierService';

function HunterFeatures() {
  const [tierInfo, setTierInfo] = useState(null);

  useEffect(() => {
    tierService.getUserTierInfo().then(setTierInfo);
  }, []);

  const canAutoPost = tierInfo && TIER_LIMITS[tierInfo.tier].autoPost;
  const canEditWorkflows = tierInfo && TIER_LIMITS[tierInfo.tier].workflowEditing;

  return (
    <div>
      {canAutoPost && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <h3>Auto-Post Scheduler Available</h3>
          <p>Schedule your posts to publish automatically</p>
        </div>
      )}

      {!canAutoPost && (
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg opacity-50">
          <h3>Auto-Post Scheduler (Hunter+ only)</h3>
          <p>Upgrade to unlock automatic posting</p>
          <a href="/pricing" className="mt-2 inline-block text-blue-600 font-semibold">
            View Hunter Plan →
          </a>
        </div>
      )}
    </div>
  );
}
```

## Example 6: Toast Notifications

```typescript
import { tierService } from '../services/tierService';
import { toast } from './toast-service'; // or your toast library

async function handleExtraction() {
  try {
    const tierInfo = await tierService.getUserTierInfo();
    
    if (!tierInfo.canExtract) {
      const limit = TIER_LIMITS[tierInfo.tier].extractionsPerMonth;
      toast.warning(
        `⏳ Monthly limit reached (${limit} extractions on ${tierInfo.tier.toUpperCase()} tier). Upgrade to Pro for unlimited extractions.`,
        { duration: 5000 }
      );
      
      setTimeout(() => {
        window.location.href = '/pricing';
      }, 2000);
      return;
    }

    // Perform extraction
    await extractBrandDNA(url);
    await tierService.recordExtraction();
    
    toast.success('✅ Brand DNA extracted successfully!');
  } catch (error) {
    toast.error('❌ Extraction failed');
  }
}
```

## Example 7: Tier-Based Component Props

```typescript
import { TIER_LIMITS } from '../constants/tiers';

interface FeatureProps {
  tier: Tier;
  children: React.ReactNode;
}

function TierGate({ tier, children }: FeatureProps) {
  const isHunterOnly = true; // determine dynamically

  if (isHunterOnly && !TIER_LIMITS[tier].workflowEditing) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">
          This feature requires <strong>Hunter tier or higher</strong>
        </p>
        <a href="/pricing" className="mt-2 inline-block text-yellow-600 font-semibold underline">
          View Plans
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
```

## Testing Tier System Locally

```bash
# 1. Start dev server
npm run dev

# 2. Create test users with different tiers:
# - Free user: tier = 'free', extractionsThisMonth = 0
# - Pro user: tier = 'pro', extractionsPerMonth = unlimited
# - Hunter user: tier = 'hunter', workflowEditing = true
# - Agency user: tier = 'agency', teamMembers = unlimited

# 3. Test free tier extraction limit
# - Do 3 extractions (should work)
# - Try 4th extraction (should block + redirect to /pricing)

# 4. Verify monthly reset
# - Change lastResetDate in Supabase to last month
# - User should be able to extract again

# 5. Test feature gating
# - Free user accessing Hunter features should see "Coming Soon"
# - Pro user should see all features
```

## Common Patterns

### Pattern 1: Check Before Action
```typescript
if (!await tierService.checkExtractionLimit()) return;
// ... perform action
await tierService.recordExtraction();
```

### Pattern 2: Graceful Degradation
```typescript
const hasFeature = await tierService.checkFeatureAccess('inference');
return hasFeature ? <FullFeature /> : <BasicFeature />;
```

### Pattern 3: Inline Tier Display
```typescript
const info = await tierService.getUserTierInfo();
return <TierBadge tier={info.tier} />;
```

### Pattern 4: Redirect on Limit
```typescript
if (!canExtract) {
  setTimeout(() => {
    window.location.href = '/pricing';
  }, 2000);
  return;
}
```
