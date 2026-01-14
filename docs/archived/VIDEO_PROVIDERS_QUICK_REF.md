# Video Providers - Quick Reference

## 22 Providers at a Glance

### 🎬 Premium (Hunter+) - Cinematic Quality
```
Sora 2    → $0.10-0.50/sec  | Best realism, physics, narrative
Veo 3     → $0.20-0.40/sec  | Professional vertical videos
```

### 🎨 Affordable (Free/Pro) - Fast & Budget-Friendly
```
LTX-2 ⭐  → $0.04-0.16/sec  | Default choice, 4K/50fps, audio-synced
Runway    → Credit-based      | Motion brush, editing controls, lip-sync
Kling     → Via 3rd-party     | Realistic human motion, longer clips
Luma      → Via fal.ai        | Image-to-video, photorealistic
Wan       → Via platforms     | Efficient MoE, good motion
HunyuanVideo → Emerging       | Enterprise options, Tencent
Mochi     → Via fal.ai        | Cinematic 13B+, customizable
Seedance  → Via platforms     | Product demos, UGC style
Pika      → API access        | Quick iterations, fun effects
Hailuo    → Via 3rd-party     | Fast dreamy visuals, budget
Pixverse  → API access        | Budget-friendly, easy integration
Higgsfield → Emerging         | Cinematic camera moves
```

### 👤 Avatar (Pro+) - Speaking Characters
```
HeyGen    → REST API          | Professional avatars, multilingual
Synthesia → REST API          | Enterprise, 4K ready
DeepBrain → REST API          | Hyper-realistic, training-focused
Colossyan → REST API          | Training & education videos
```

### 🌐 Multi-Model Platforms (Free/Pro) - One Key, Many Models
```
Replicate  → Pay-per-use      | LTX-2, Luma, Runway, Kling variants
fal.ai     → Pay-per-use      | Easy integration, multiple models
Fireworks  → Fast inference   | Speed-optimized, Veo proxies
WaveSpeedAI → Scaling         | Load balancing, aggregation
```

---

## Pick Your Starting Point

### 🚀 Just Starting (Free Tier)
**Provider:** fal.ai + LTX-2  
**Setup:** 5 minutes  
**Cost:** $0.04-0.16 per 60-sec video  
**Link:** https://fal.ai/dashboard

### 💼 Growing (Pro Tier)
**Primary:** Runway  
**Backup:** LTX-2  
**Cost:** $20-50/month  
**Links:**
- Runway: https://www.runwayml.com/
- fal.ai: https://fal.ai/dashboard

### 🎥 Premium (Hunter Tier)
**Primary:** Sora 2 or Veo 3  
**Secondary:** Runway (creative), Luma (image-to-video)  
**Cost:** $100-500/month  
**Links:**
- Sora 2: https://platform.openai.com/api-keys
- Veo 3: https://cloud.google.com/vertex-ai
- Runway: https://www.runwayml.com/

### 🏢 Enterprise (Agency Tier)
**Stack:** Sora 2 + Veo 3 + HeyGen + Kling + WaveSpeedAI  
**Cost:** Custom per project  
**Contact:** Direct sales

---

## Code Integration Quick Start

### Import Providers
```typescript
import { 
  ALL_VIDEO_PROVIDERS,
  getProviderById,
  getProvidersByCategory,
  getProvidersByTier,
  INTEGRATION_ROADMAP
} from '$lib/constants/videoProviders';
```

### Get Provider Info
```typescript
// By ID
const ltx2 = getProviderById('ltx2');
console.log(ltx2?.costEstimate);  // "$0.04–0.16/sec"

// By category
const premium = getProvidersByCategory('premium');

// By tier
const proProviders = getProvidersByTier('pro');
```

### Use in Settings
```typescript
import { VideoProvidersSection } from './components/VideoProvidersSection';

export function SettingsPage() {
  return (
    <div>
      <VideoProvidersSection />
    </div>
  );
}
```

### Store API Keys
```typescript
// Keys stored in localStorage as JSON
localStorage.setItem('videoProviderKeys', JSON.stringify({
  fal: 'your-key-here',
  replicate: 'your-key-here',
  sora2: 'your-key-here'
}));

// Retrieve
const keys = JSON.parse(localStorage.getItem('videoProviderKeys') || '{}');
```

---

## Provider Selection Flowchart

```
Need video generation?
│
├─ Budget: Free
│  └─ fal.ai + LTX-2 ⭐
│
├─ Need creative control?
│  └─ Runway Gen-4
│
├─ Need avatar/speaking?
│  └─ HeyGen or Synthesia
│
├─ Need best quality?
│  └─ Sora 2 (Hunter+) or Veo 3
│
├─ Need multi-model fallback?
│  └─ Replicate or Fireworks
│
└─ Need scaling/load-balancing?
   └─ WaveSpeedAI
```

---

## Cost Comparison (per 60-second video)

```
Cheapest to Most Expensive:

1. LTX-2           $0.04-0.16    (audio-synced social shorts)
2. Pixverse        $0.05-0.15    (budget-friendly)
3. Pika            $0.10-0.20    (creative effects)
4. Runway          $0.15-0.30    (creative control)
5. Kling           $0.20-0.40    (realistic motion)
6. Luma            $0.25-0.50    (photorealistic)
7. Sora 2          $0.10-0.50    (best quality)
8. Veo 3           $0.20-0.40    (professional grade)
9. HeyGen          $0.30-1.00    (avatar, per minute)
10. Synthesia      $0.40-1.20    (enterprise avatar)
```

---

## Quality Ranking

```
🥇 Gold (Best Realism)
├─ Sora 2      → Emotional storytelling, narrative
├─ Veo 3       → Professional vertical, motion
└─ Runway      → Creative control, editing

🥈 Silver (Good Quality)
├─ Kling       → Realistic human motion
├─ Luma        → Image-to-video, photorealistic
└─ Mochi       → Cinematic, 13B+

🥉 Bronze (Good Value)
├─ LTX-2       → 4K, audio-sync, budget
├─ Pika        → Quick iterations
└─ Seedance    → Product demos
```

---

## Speed Ranking

```
⚡ Fastest
├─ Fireworks    → 10-15 seconds
├─ fal.ai       → 15-20 seconds
└─ Replicate    → 20-30 seconds

🔄 Medium
├─ LTX-2        → 30-45 seconds
├─ Runway       → 45-60 seconds
└─ Pika         → 60+ seconds

🐢 Slowest (But Best Quality)
├─ Sora 2       → 60-90 seconds
└─ Veo 3        → 60-90 seconds
```

---

## Settings Navigation

```
⚙️ Settings
└─ 🔑 API Keys
   ├─ 🔧 All Providers
   │  ├─ LLMs (Google Gemini, OpenAI, etc.)
   │  ├─ Images (DALL-E, Stability, etc.)
   │  ├─ Voice (ElevenLabs, PlayHT, etc.)
   │  └─ Automation (n8n, Zapier, etc.)
   │
   └─ 🎬 Video Generation  ← NEW
      ├─ Premium (Sora 2, Veo 3)
      ├─ Affordable (LTX-2, Runway, Kling, etc.)
      ├─ Avatar (HeyGen, Synthesia, etc.)
      └─ Platforms (Replicate, fal.ai, Fireworks, etc.)
```

---

## Common Use Cases → Provider

```
Social Media Shorts         → LTX-2, Pika, Pixverse
Campaign/Product Demo       → Runway, Seedance, Kling
Explainer Video            → HeyGen, Synthesia
Brand Film                 → Sora 2, Veo 3
Image to Video             → Luma, LTX-2
Avatar/Character           → HeyGen, DeepBrain
Quick Iteration            → Pika, Hailuo
Enterprise/Training        → Synthesia, DeepBrain
Budget Conscious           → LTX-2, Replicate
Best Quality Fallback      → Sora 2, Veo 3
Fast Inference             → Fireworks, fal.ai
Load Balancing             → WaveSpeedAI
```

---

## Files to Know

```
components/
├─ VideoProvidersSection.tsx    ← UI for settings
├─ ApiKeysSection.tsx           ← Now includes Video tab
└─ ...

src/constants/
└─ videoProviders.ts            ← All provider data & helpers

docs/
├─ VIDEO_GENERATION_SETUP.md    ← Full guide
└─ VIDEO_PROVIDERS_QUICK_REF.md ← This file

types.ts                         ← VideoProviderId type
```

---

## Integration Roadmap Phases

| Phase | Providers | Cost | Use Case |
|-------|-----------|------|----------|
| **1** | fal.ai, LTX-2 | $0.04-0.16/sec | Social shorts (free-pro) |
| **2** | Sora 2, Veo 3 | $0.10-0.50/sec | Cinema quality (hunter+) |
| **3** | HeyGen, Synthesia | Per-minute | Avatar videos (pro+) |
| **4** | Fireworks, WaveSpeedAI | Varies | Load balancing (all) |

---

## CLI/API Snippets

### List all providers
```bash
curl https://api-docs.coredna.ai/v1/video/providers
```

### Get provider details
```bash
curl https://api-docs.coredna.ai/v1/video/providers/ltx2
```

### Save API key
```bash
POST /api/v1/video/keys
{
  "provider": "fal",
  "apiKey": "your-key-here"
}
```

---

## Troubleshooting Matrix

| Problem | Provider | Solution |
|---------|----------|----------|
| Timeout | Long video | Reduce to 60 sec, use LTX-2 |
| Rate limit | High volume | Add Fireworks, fal.ai backup |
| Cost | Budget | Switch to LTX-2, Pixverse |
| Quality | Low realism | Upgrade to Sora 2, Veo 3 |
| Avatar needed | Video-only | Add HeyGen, Synthesia |
| Slow inference | Time critical | Use Fireworks.ai |
| No fallback | Single provider | Add WaveSpeedAI, Replicate |

---

## Key Takeaways

✅ **22 providers** across 4 categories  
✅ **Free to premium** options for every budget  
✅ **4-phase rollout** from foundation to scaling  
✅ **BYOK** (Bring Your Own Keys) security model  
✅ **Tier-based access** (Free → Agency)  
✅ **Flexible** - mix & match providers per need  
✅ **Well-documented** - guides included  
✅ **Type-safe** - full TypeScript support  

---

**Want to get started?** → Visit Settings → 🎬 Video Generation

**Questions?** → See VIDEO_GENERATION_SETUP.md

**Developers?** → Check src/constants/videoProviders.ts

---

Last Updated: January 2026
