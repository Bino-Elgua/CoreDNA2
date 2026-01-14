# 📁 Video Generation System — File Index

## Core Implementation Files

### 1. **services/videoService.ts** ⭐ Main Service
```
Location: CoreDNA2-work/services/videoService.ts
Lines: 356
Purpose: Multi-engine video generation with tier-based access & credit system

Key Exports:
  • generateVideo(request) → VideoGenerationResponse
  • canGenerateVideo(userId, tier) → boolean
  • getRemainingVideos(userId, tier) → number
  • getUserCredits(userId) → number
  • logVideoGeneration(data) → void
  • getVideoTierInfo(tier) → TierInfo

Types:
  • VideoEngine = 'ltx2' | 'sora2' | 'veo3'
  • VideoGenerationRequest
  • VideoGenerationResponse
```

### 2. **api/generate-video.ts** ⭐ Backend Handler
```
Location: CoreDNA2-work/api/generate-video.ts
Lines: 58
Purpose: API endpoint for video generation requests

Endpoint: POST /api/generate-video
Request: { imageUrl, prompt, engine, userId, tier }
Response: { success, videoUrl, engineUsed, costCredits, disclosure }

Status Codes:
  • 200: Success
  • 400: Bad request / tier restriction / API error
  • 405: Method not allowed
  • 429: Monthly limit exceeded
```

### 3. **components/AssetCard.tsx** ⭐ UI Component
```
Location: CoreDNA2-work/components/AssetCard.tsx
Lines: +150 (modified)
Purpose: Campaign asset display with integrated video generation

Phases Implemented:
  • Phase 1: Video generation toggle (checkbox)
  • Phase 2: Premium engine selector (dropdown)
  • Phase 3: Click-to-video overlay (▶️ button)
  • Phase 6: Legal disclosure badge

New State:
  • generateVideoMode: boolean
  • selectedEngine: 'ltx2' | 'sora2' | 'veo3'
  • isGeneratingVideo: boolean
  • videoCount: number
  • tierLimit: number
  • credits: number

Props:
  • user?: UserProfile (added)
```

### 4. **components/VideoPricingSection.tsx** ⭐ Phase 5
```
Location: CoreDNA2-work/components/VideoPricingSection.tsx
Lines: 155
Purpose: Display pricing, tier comparison, credit packages, legal info

Props:
  • userTier: 'free' | 'pro' | 'hunter' | 'agency'
  • onUpgrade?: (targetTier) => void

Features:
  • Tier comparison table
  • Engine cost breakdown
  • Credit pack options (Hunter)
  • Legal disclosures & licensing info
```

---

## Integration Files (Modified)

### 5. **pages/CampaignsPage.tsx**
```
Location: CoreDNA2-work/pages/CampaignsPage.tsx
Changes: +13 lines

Modifications:
  • Import UserProfile type
  • Add userProfile state
  • Load user profile from localStorage
  • Pass user prop to AssetCard

Code Added:
  useEffect(() => {
    const storedUser = localStorage.getItem('core_dna_user_profile');
    if (storedUser) {
      setUserProfile(JSON.parse(storedUser));
    }
  }, []);

  // In AssetCard: user={userProfile}
```

### 6. **types.ts**
```
Location: CoreDNA2-work/types.ts
Changes: Already complete (no changes needed)

Relevant Types:
  • UserProfile: { id, tier: 'free' | 'pro' | 'hunter' | 'agency', ... }
  • CampaignAsset: { videoUrl?, isGeneratingVideo?, ... }
```

---

## Documentation Files

### 7. **VIDEO_GENERATION_IMPLEMENTATION.md** 📖 Complete Guide
```
Location: CoreDNA2-work/VIDEO_GENERATION_IMPLEMENTATION.md
Purpose: Comprehensive implementation documentation

Sections:
  • Overview & architecture
  • All 6 phases with code examples
  • Service methods reference
  • Storage schema
  • Integration checklist
  • Error handling guide
  • Example flows
  • Legal disclosures

Read this for: Full technical details
```

### 8. **VIDEO_GENERATION_QUICK_START.md** 📖 User Guide
```
Location: CoreDNA2-work/VIDEO_GENERATION_QUICK_START.md
Purpose: Quick reference for developers & users

Sections:
  • Developer import examples
  • Tier limits at a glance
  • Engine guide
  • How to generate a video
  • FAQ & troubleshooting
  • Best practices

Read this for: Quick answers & getting started
```

### 9. **VIDEO_GENERATION_SUMMARY.txt** 📖 Implementation Summary
```
Location: CoreDNA2-work/VIDEO_GENERATION_SUMMARY.txt
Purpose: Overview of all changes by phase

Sections:
  • All 6 phases listed
  • Integration points
  • Storage schema
  • Files created/modified
  • Testing checklist
  • Next steps

Read this for: High-level overview of changes
```

### 10. **VIDEO_GENERATION_FILE_INDEX.md** 📖 This File
```
Location: CoreDNA2-work/VIDEO_GENERATION_FILE_INDEX.md
Purpose: Directory of all video generation files

Sections:
  • Core implementation files
  • Integration files
  • Documentation
  • Directory tree
```

---

## Directory Structure

```
CoreDNA2-work/
├── api/
│   └── generate-video.ts          [NEW] Backend video generation handler
├── components/
│   ├── AssetCard.tsx              [MODIFIED] +150 lines (Phases 1-3, 6)
│   └── VideoPricingSection.tsx     [NEW] Phase 5: Pricing & legal
├── pages/
│   └── CampaignsPage.tsx           [MODIFIED] +13 lines (load user profile)
├── services/
│   └── videoService.ts            [NEW] Core video generation logic
├── types.ts                         [UNCHANGED] Already has UserProfile
├── VIDEO_GENERATION_IMPLEMENTATION.md   [NEW] Complete tech docs
├── VIDEO_GENERATION_QUICK_START.md      [NEW] User/dev guide
├── VIDEO_GENERATION_SUMMARY.txt         [NEW] Overview of changes
└── VIDEO_GENERATION_FILE_INDEX.md       [NEW] This file
```

---

## Import Paths

### From Components
```typescript
// AssetCard.tsx
import { generateVideo, getRemainingVideos, getUserCredits } from '@/services/videoService';
import { generateVideo } from '../services/videoService'; // if using relative path

// CampaignsPage.tsx
import { UserProfile } from '../types';

// VideoPricingSection.tsx
import { motion } from 'framer-motion';
```

### From Services
```typescript
// videoService.ts
export async function generateVideo(request: VideoGenerationRequest)
export async function canGenerateVideo(userId, tier)
export async function getRemainingVideos(userId, tier)
export async function getUserCredits(userId)
export function getVideoTierInfo(tier)
```

---

## Dependencies

### New External (None)
- All code uses existing CoreDNA2 dependencies

### Uses Existing
- `react` - Component framework
- `framer-motion` - Animations (VideoPricingSection)
- `typescript` - Type safety
- `localStorage` - Storage (browser)

---

## Code Statistics

### Lines Added by File
| File | Type | Lines | Purpose |
|------|------|-------|---------|
| services/videoService.ts | New | 356 | Core service logic |
| api/generate-video.ts | New | 58 | Backend handler |
| components/VideoPricingSection.tsx | New | 155 | Phase 5 UI |
| components/AssetCard.tsx | Modified | +150 | Phases 1-3, 6 |
| pages/CampaignsPage.tsx | Modified | +13 | User loading |
| Documentation | New | 800+ | Tech docs |
| **TOTAL** | | **1,532+** | Complete system |

---

## Next Steps for Backend Integration

### 1. Real API Implementation
Replace mock functions in `services/videoService.ts`:

```typescript
// Currently mock:
async function callLTX2API(imageUrl, prompt) → mock video URL

// Replace with:
async function callLTX2API(imageUrl, prompt) → Replicate/fal.ai API call
async function callSora2API(imageUrl, prompt) → OpenAI API call
async function callVeo3API(imageUrl, prompt) → Google API call
```

### 2. Database Schema
Create tables for:
- `user_credits` (userId, balance, updated_at)
- `video_generation_log` (id, userId, engine, credits, timestamp)
- `monthly_usage` (userId, month, count, tier)

### 3. Backend Endpoint
Deploy `/api/generate-video` handler (already in `api/generate-video.ts`)

### 4. Authentication
Add user ID validation in API handler:
```typescript
const user = await authenticateUser(req);
if (!user) return res.status(401).json({ error: 'Unauthorized' });
```

### 5. Async Processing (Optional)
For long-running videos:
- Queue system (BullMQ/Bull)
- Webhooks for completion
- Progress tracking API

---

## Version Control

```
Version: 1.0
Date: Jan 9, 2026
Status: ✅ Complete & Ready for Backend Integration

Changes Summary:
  • 2 new service/API files (videoService.ts, generate-video.ts)
  • 1 new pricing component (VideoPricingSection.tsx)
  • 2 modified existing files (+163 lines total)
  • 4 comprehensive documentation files
```

---

## Testing Checklist

- [ ] AssetCard renders video UI for all tiers
- [ ] videoService methods return correct types
- [ ] Monthly limits enforced correctly
- [ ] Credit deduction works for Hunter tier
- [ ] API endpoint responds with correct status codes
- [ ] Pricing component displays all tiers
- [ ] Legal badges show after generation
- [ ] localStorage persists user profile & credits

---

## Support & Questions

For detailed implementation questions:
- **Tech docs:** VIDEO_GENERATION_IMPLEMENTATION.md
- **Quick answers:** VIDEO_GENERATION_QUICK_START.md
- **Code reference:** Read inline JSDoc comments in videoService.ts

---

**Last Updated:** Jan 9, 2026  
**Status:** ✅ Complete Implementation  
**Ready for:** Backend API integration & testing
