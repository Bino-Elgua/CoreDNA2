# CoreDNA Video Generation Setup Guide

## Overview

CoreDNA now supports 22+ video generation providers across 4 categories, enabling cinematic-quality video creation for all user tiers.

**Setup Location:** Settings → 🎬 Video Generation

## Provider Categories

### 1. Premium / Top-Tier (Hunter+ Recommended)
Best-in-class realism, physics accuracy, and narrative coherence for high-production content.

| Provider | Tier | Cost | Best For |
|----------|------|------|----------|
| **OpenAI Sora 2** | Hunter | $0.10-0.50/sec | Emotional storytelling, brand films |
| **Google Veo 3** | Hunter | $0.20-0.40/sec | Professional vertical videos, shorts |

### 2. Affordable / Open-Source (Free/Pro Friendly)
Fast, cost-effective options perfect for social media and iterative content creation.

| Provider | Tier | Cost | Best For |
|----------|------|------|----------|
| **Lightricks LTX-2** ⭐ | Free | $0.04-0.16/sec | Social shorts (recommended start) |
| **Replicate** | Free | Pay-per-use | Multi-model access |
| **fal.ai** | Free | Pay-per-use | Easy integration, LTX-2 hosting |
| **Runway Gen-4** | Pro | Credit-based | Creative control, motion brush |
| **Kling AI 2.6** | Pro | Via 3rd-party | Character-driven shorts |
| **Luma Dream Machine** | Pro | Via fal.ai | Image-to-video conversion |
| **Wan 2.6** | Free | Via platforms | Efficient MoE generation |
| **HunyuanVideo** | Free | Emerging | Enterprise options |
| **Mochi** | Free | Via fal.ai/Fireworks | Cinematic 13B+ params |
| **Seedance 1.5** | Pro | Via platforms | Product demos, UGC style |
| **Pika Labs 2.2** | Pro | API access | Quick iterations, effects |
| **Hailuo 2.3** | Pro | Via 3rd-party | Fast dreamy visuals |
| **Pixverse** | Free | API access | Budget-friendly |
| **Higgsfield** | Pro | Emerging | Cinematic camera moves |

### 3. Avatar / Talking-Head (Explainer & Spokesperson)
Professional avatars for business communication, training, and explainer videos.

| Provider | Tier | Cost | Best For |
|----------|------|------|----------|
| **HeyGen** | Pro | REST API | Professional avatars, multilingual |
| **Synthesia** | Pro | REST API | Enterprise video production |
| **DeepBrain AI** | Pro | REST API | Hyper-realistic avatars |
| **Colossyan** | Pro | REST API | Training & education videos |

### 4. Multi-Model Hosting Platforms
One API key → access to multiple video generation models with load balancing.

| Provider | Tier | Cost | Best For |
|----------|------|------|----------|
| **Replicate** | Free | Pay-per-use | Hosts LTX-2, Luma, Runway, Kling |
| **fal.ai** | Free | Pay-per-use | Easy integration, multiple models |
| **Fireworks.ai** | Free | Fast inference | Speed-optimized, Veo proxies |
| **WaveSpeedAI** | Pro | Scaling | Load balancing, aggregation |

---

## Integration Roadmap

### Phase 1: Foundation (Free/Pro Tiers)
**Start here.** Build core video generation with accessible, cost-effective options.

```
Providers: Replicate, fal.ai → LTX-2
Cost: ~$0.04-0.16/sec
Use Case: Social media shorts, quick content creation
Tiers: Free → Pro
```

**Recommended Setup:**
1. Get API key from **fal.ai** (https://fal.ai/dashboard)
2. Add to Settings → Video Generation
3. Select as active provider
4. Start generating 60-second social shorts

### Phase 2: Premium (Hunter+ Tiers)
**Add cinematic quality.** Upgrade to top-tier models for emotional storytelling.

```
Providers: Sora 2, Veo 3
Cost: $0.10-0.50/sec
Use Case: Brand films, commercial content, high-production videos
Tiers: Hunter → Agency
```

**Setup:**
1. Get API key from **OpenAI** (https://platform.openai.com/api-keys)
2. Add second key for **Google Vertex AI** (https://cloud.google.com/vertex-ai)
3. Create tier-based defaults (Pro → LTX-2, Hunter → Sora 2)
4. Use for campaign hero videos

### Phase 3: Avatar (Pro+ Tiers)
**Add speaking characters.** Enable professional avatar and explainer videos.

```
Providers: HeyGen, Synthesia
Cost: Per-minute or credit-based
Use Case: Avatar explainers, spokesperson videos, training content
Tiers: Pro → Agency
```

**Setup:**
1. Get API key from **HeyGen** (https://www.heygen.com/api)
2. Or **Synthesia** (https://www.synthesia.io/api)
3. Configure for business use cases
4. Use alongside video generation for mixed-media content

### Phase 4: Scaling (All Tiers)
**Optimize performance.** Use multi-host platforms for failover and load balancing.

```
Providers: Fireworks.ai, WaveSpeedAI
Cost: Varies by model
Use Case: Load balancing, failover, scaling across regions
Tiers: All tiers
```

**Setup:**
1. Add Fireworks.ai or WaveSpeedAI as backup
2. Configure fallback logic in video generation service
3. Automatic routing to fastest/cheapest available model
4. Monitor costs and performance per provider

---

## Getting Started (5 minutes)

### Step 1: Choose Your Entry Point
- **Budget & Social:** Start with **fal.ai** + LTX-2
- **Premium:** Start with **Sora 2** (if Hunter tier)
- **Avatar Videos:** Start with **HeyGen**
- **Multi-Model:** Start with **Replicate**

### Step 2: Get API Key
Visit the provider's dashboard and generate an API key.

### Step 3: Add to CoreDNA
1. Go to **Settings → 🎬 Video Generation**
2. Click your chosen provider
3. Paste API key
4. Click "Get API Access" for documentation

### Step 4: Test Generation
Create a sample campaign with a short video asset to verify setup.

---

## API Integration Details

### Video Provider Configuration

```typescript
interface VideoProvider {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  category: 'premium' | 'affordable' | 'avatar' | 'platform';
  tier: 'free' | 'pro' | 'hunter' | 'agency';
  apiType: 'rest' | 'webhook' | 'sdk' | 'hosted';
  description: string;           // What it does
  costEstimate: string;          // Price range
  maxDuration: string;           // Max video length
  outputFormat: string;          // Resolution/format
  strengths: string[];           // Key features
  useCase: string;               // Recommended use
  models: string[];              // Available models
}
```

### Tier Access Control

```typescript
const TIER_ACCESS = {
  'free': ['ltx2', 'replicate', 'fal', ...],
  'pro': ['runway', 'kling', 'luma', 'heygen', ...],
  'hunter': ['sora2', 'veo3', ...],
  'agency': ['all']
};
```

### Storage

API keys are stored locally in browser localStorage:
- **Key:** `videoProviderKeys` (JSON object)
- **Security:** Never sent to CoreDNA servers
- **Backup:** Export/import at Settings → Video Generation → Backup & Restore

---

## Provider Comparison Matrix

### By Speed
1. **Fireworks.ai** - Fastest inference
2. **fal.ai** - Fast, reliable
3. **Replicate** - Standard
4. **Direct APIs** (Sora 2, Veo 3) - Slowest but best quality

### By Cost
1. **Free Tier** - LTX-2, Wan, HunyuanVideo, Mochi
2. **Cheapest (pay-per-use)** - LTX-2 ($0.04-0.16/sec)
3. **Mid-range** - Runway, Kling, Pika (credit-based)
4. **Premium** - Sora 2 ($0.10-0.50/sec), Veo 3 ($0.20-0.40/sec)

### By Quality
1. **Best Realism** - Sora 2, Veo 3
2. **Best Motion** - Runway, Kling, Luma
3. **Best Avatar** - HeyGen, Synthesia
4. **Best Value** - LTX-2, Replicate

### By Use Case
- **Social Shorts:** LTX-2, Pika, Pixverse
- **Product Demo:** Seedance, Runway
- **Character Video:** Kling, Luma
- **Explainer:** HeyGen, Synthesia
- **Brand Film:** Sora 2, Veo 3
- **Quick Iteration:** Pika, Hailuo
- **Budget Conscious:** LTX-2, Replicate, fal.ai

---

## Tier Recommendations

### Free Tier Users
**Provider:** fal.ai + LTX-2  
**Use Case:** Social media shorts, quick content  
**Budget:** ~$0.04-0.16 per 60-second video  
**Workflow:** Text → 4K video in seconds  

### Pro Tier Users
**Primary:** Runway or Kling  
**Secondary:** LTX-2 (fallback)  
**Budget:** $20-50/month  
**Workflow:** Creative control + batch generation  

### Hunter Tier Users
**Primary:** Sora 2 or Veo 3  
**Secondary:** Runway (editing), Luma (image-to-video)  
**Budget:** $100-500/month  
**Workflow:** Premium cinema quality + multi-model options  

### Agency Tier Users
**Multi-provider stack:**
- Sora 2 / Veo 3 (hero content)
- HeyGen (avatars)
- Kling (characters)
- LTX-2 (fallback/social)
- WaveSpeedAI (load balancing)

**Budget:** Custom per project  
**Workflow:** Full production suite with load balancing  

---

## Configuration Files

### Constants: `src/constants/videoProviders.ts`
- All 22+ providers with metadata
- Category/tier grouping
- Integration roadmap phases

### Component: `components/VideoProvidersSection.tsx`
- Settings UI for provider configuration
- API key management (add/edit/delete)
- Backup/restore functionality
- Provider details and documentation links

### Types: `types.ts`
- `VideoProviderId` - All provider IDs
- `VideoProvider` interface
- `GlobalSettings.activeVideo` - Active provider
- `GlobalSettings.video` - Provider configs

---

## Troubleshooting

### API Key Invalid
- Verify key format matches provider requirements
- Check key hasn't been revoked in provider dashboard
- Some providers (e.g., Replicate) require full API token, not partial key

### Rate Limiting
- Most providers throttle requests by plan
- Use multi-provider setup (Fireworks, WaveSpeedAI) for load balancing
- Cache results when possible

### Generation Timeouts
- Check max duration for provider (varies 60-300 seconds)
- LTX-2/Pika: max 60 seconds
- Avatar providers: max 300 seconds
- Reduce video length if timeout occurs

### Quality Issues
- LTX-2: Great for fast, good-quality shorts
- Runway: Better for creative control
- Sora 2: Best for cinematic realism
- Luma: Best for image-to-video conversion

---

## Next Steps

1. **Immediate:** Add fal.ai key, test LTX-2 generation
2. **Week 1:** Add Runway for creative control
3. **Week 2:** Add Sora 2 (Hunter tier)
4. **Week 4:** Add HeyGen for avatar videos
5. **Ongoing:** Monitor costs and performance per provider

---

## Support & Documentation

- **fal.ai:** https://fal.ai/dashboard
- **Replicate:** https://replicate.com/api
- **OpenAI Sora:** https://platform.openai.com/docs
- **Google Veo:** https://cloud.google.com/vertex-ai
- **HeyGen:** https://www.heygen.com/api
- **Runway:** https://www.runwayml.com/

---

**Last Updated:** January 2026  
**Version:** 1.0  
**Status:** Production Ready
