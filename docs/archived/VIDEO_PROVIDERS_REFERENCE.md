# 🎬 CoreDNA Video Generation Providers — Complete Reference

**Status:** January 2026 — 22 Providers Mapped  
**Updated:** Current market analysis  
**Scope:** All text-to-video & image-to-video APIs

---

## Quick Start — Recommended Integration Order

### Phase 1: Foundation (Start Here)
1. **LTX-2** (Free/Pro) — Replicate or fal.ai
   - Fast, cheap, native audio sync
   - $0.04–0.16/sec

2. **Luma Dream Machine** (Free/Pro) — fal.ai
   - Photorealistic image-to-video
   - $0.10–0.20/sec

### Phase 2: Premium Upgrade (Hunter+)
3. **Sora 2** (Hunter+) — OpenAI official API
   - Best-in-class realism & narrative
   - $0.10–0.50/sec, limited access

4. **Veo 3** (Hunter+) — Google Vertex AI
   - Superior motion & physics
   - $0.20–0.40/sec

5. **Runway Gen-4** (Hunter+) — Official API
   - Professional vertical videos
   - Motion brush, editing controls
   - Credit-based pricing

### Phase 3: Scaling & Specialization
6. **Kling 2.6** — Runway API
   - Precise creative control
   - Motion brush, lip-sync

7. **HeyGen** (Future) — Avatar/explainer videos
   - Professional avatars, multilingual

---

## Premium / Top-Tier APIs (Hunter+ Recommended)

### 1. OpenAI — Sora 2
**Use Case:** High-production shorts, emotional storytelling  
**API:** Official OpenAI API (limited access, apply for beta)  
**Cost:** ~$0.10–0.50/sec  
**Strengths:**
- Best-in-class realism, physics, coherence
- Narrative understanding (strong prompt following)
- Variable quality modes (quality, speed, coherence)
- 1080p output, 60fps capable

**Limitations:**
- Limited API access (request beta access)
- Higher cost per generation
- Longer generation times (30–60 seconds typical)

**Integration:** `https://api.openai.com/v1/videos/generations`

---

### 2. Google — Veo 3 / Veo 3.1
**Use Case:** Cinematic shorts, emotional storytelling  
**API:** Vertex AI / Gemini API  
**Cost:** ~$0.20–0.40/sec  
**Strengths:**
- Superior motion, multi-scene capability
- Native audio integration
- Best-in-class visual coherence
- Realistic physics simulation

**Limitations:**
- Emerging API (Vertex AI required)
- Requires Google Cloud setup
- Higher latency (40–90 seconds)

**Integration:** `https://us-central1-aiplatform.googleapis.com/v1/projects/{PROJECT_ID}/locations/us-central1/publishers/google/models/veo-3:predict`

---

### 3. Runway — Gen-4 / Gen-3 Turbo
**Use Case:** Professional-grade vertical videos  
**API:** Official Runway API (credit-based)  
**Cost:** ~10–25 credits/generation (varies by length/quality)  
**Strengths:**
- Motion brush for precise camera control
- Advanced editing controls
- Lip-sync capability
- Multi-scene orchestration
- Native audio generation

**Limitations:**
- Credit system (no per-second pricing)
- Requires Runway account + API key
- Async processing (polling required)

**Integration:** `https://api.runwayml.com/v1/image_to_video` or `text_to_video`

---

### 4. Kling AI — Kling 2.6 / 2.0
**Use Case:** Precise creative control  
**API:** Official Runway API (credit-based)  
**Cost:** ~5–15 credits/generation  
**Strengths:**
- Motion brush for editing
- Advanced editing controls
- Lip-sync for talking heads
- 10-second native capability
- Chinese model (excellent for Asia market)

**Limitations:**
- Requires Runway partnership
- Credit-based (no hourly rates)
- Limited to 10-second outputs

**Integration:** Via Runway API: `https://api.runwayml.com/v1/kling_video`

---

## Affordable / Open-Source APIs (Free/Pro Friendly)

### 5. Luma AI — Dream Machine (Ray 3)
**Use Case:** Stunning visuals from static campaign images  
**API:** Replicate / fal.ai hosting  
**Cost:** ~$0.10–0.20/sec or ~$0.50 per generation (fal.ai)  
**Strengths:**
- Photorealistic image-to-video conversion
- Clean, professional output
- Works great for product showcase
- Fast iterations

**Limitations:**
- Image-to-video only (no text-to-video)
- No official text-to-video API yet
- 5-second limit per generation

**Integration (fal.ai):**
```bash
curl -X POST https://api.fal.ai/v1/luma_dream_machine \
  -H "Authorization: Key YOUR_FAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://...",
    "prompt": "A cinematic pan across the landscape"
  }'
```

---

### 6. Lightricks — LTX-2 (Open-source)
**Use Case:** Default for social shorts — RECOMMENDED STARTING POINT  
**API:** Replicate / fal.ai / Together.ai (~$0.04–0.16/sec)  
**Cost:** Cheapest option, ~$0.04–0.08/sec  
**Strengths:**
- Native synced audio + video
- Fast image-to-video conversion
- 4K/50fps capable
- Community-friendly license
- Excellent for shorts (<15 seconds)

**Limitations:**
- Lower visual quality vs. premium APIs
- Best for fast iterations
- Not ideal for cinematic content

**Integration (fal.ai):**
```bash
curl -X POST https://api.fal.ai/v1/ltx_text_to_video \
  -H "Authorization: Key YOUR_FAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A person dancing in a sunlit room",
    "duration": 8
  }'
```

---

## Open-Source & Community APIs (Mid-Tier)

### 7. WAN 2.6 / 2.2 (Open-source)
**Use Case:** Good motion, MoE efficiency  
**API:** fal.ai / Together.ai  
**Cost:** ~$0.08–0.12/sec  
**Strengths:**
- Mixture-of-Experts architecture
- Good motion quality
- Efficient inference
- Open-source (commercial use OK)

---

### 8. HunyuanVideo (Tencent open-source)
**Use Case:** Cinematic quality, budget-friendly  
**API:** Replicate / Together.ai  
**Cost:** ~$0.12–0.20/sec  
**Strengths:**
- 13B+ parameters (cinematic quality)
- Good coherence
- Open-source from Tencent
- 5-second native, extendable

---

### 9. Mochi (Genmo open-source)
**Use Case:** Customizable stylization  
**API:** Modal / Hugging Face Spaces  
**Cost:** ~$0.10–0.18/sec (via platforms)  
**Strengths:**
- Strong stylization control
- Customizable parameters
- 10-second outputs
- Good for branded content

---

### 10. Seedance 1.5 Pro
**Use Case:** Product demos, clean UGC style  
**API:** Available via platforms  
**Cost:** ~$0.08–0.15/sec  
**Strengths:**
- Clean, professional UGC style
- Product-focused (great for campaigns)
- Fast generation
- Good for vertical videos

---

### 11. Hailuo 2.3 (MiniMax)
**Use Case:** Fast dreamy visuals  
**API:** Third-party hosts (WaveSpeedAI, Replicate)  
**Cost:** ~$0.05–0.10/sec  
**Strengths:**
- Dreamy, artistic aesthetic
- Fast generation (10–20 seconds)
- Budget-friendly
- Good for creative shorts

---

### 12. Pika Labs — Pika 2.2
**Use Case:** Quick iterations, fun effects  
**API:** Official access via pika.art  
**Cost:** Credit-based, ~$1–3 per video  
**Strengths:**
- Quick iterations
- Fun effects & stylization
- Good for TikTok-style content
- Easy-to-use API

---

### 13. Pixverse
**Use Case:** Budget-friendly, clean output  
**API:** Supported  
**Cost:** ~$0.06–0.12/sec  
**Strengths:**
- Budget-friendly
- Clean, professional output
- Good motion
- Supports image-to-video

---

### 14. Higgsfield
**Use Case:** Cinematic camera moves  
**API:** Emerging (fal.ai)  
**Cost:** ~$0.10–0.18/sec  
**Strengths:**
- Cinematic camera movements
- Multi-scene capability
- Professional quality
- Good for storytelling

---

## Avatar / Talking-Head APIs (Explainer & Spokesperson Videos)

### 15. HeyGen
**Use Case:** Professional avatars, multilingual explainers  
**API:** Full REST API  
**Cost:** ~$0.10–0.30 per avatar video  
**Strengths:**
- Professional avatars
- Multilingual support (100+ languages)
- Lip-sync from text
- Enterprise-ready

**Integration:** `https://api.heygen.com/v1/video_generate`

---

### 16. Synthesia
**Use Case:** Enterprise avatars, script-to-video  
**API:** Robust developer API  
**Cost:** ~$0.15–0.50 per video  
**Strengths:**
- Enterprise-grade avatars
- Script-to-video (auto speech synthesis)
- Multilingual
- Professional quality

**Integration:** `https://api.synthesia.io/v1/videos`

---

### 17. DeepBrain AI
**Use Case:** Hyper-realistic avatars  
**API:** Available  
**Cost:** ~$0.15–0.40 per video  
**Strengths:**
- Hyper-realistic avatars
- Natural gestures
- Good lip-sync
- Multiple avatar styles

---

### 18. Colossyan
**Use Case:** Training-focused avatars  
**API:** Supported  
**Cost:** ~$0.10–0.25 per video  
**Strengths:**
- Training video avatars
- Easy content creation
- Good for corporate videos
- Multiple languages

---

## Multi-Model Hosting Platforms (One API Key → Many Models)

### 19. Replicate
**Hosts:** LTX-2, Luma, Runway, Kling variants, open models  
**API:** `https://api.replicate.com/v1/predictions`  
**Cost:** Pay-per-use (varies by model)  
**Strengths:**
- One API key for 100+ models
- Easy model switching
- Webhook support for async processing
- Good for rapid experimentation

**Supported Models:**
- LTX-2 (text-to-video)
- Luma Dream Machine (image-to-video)
- Runway Gen-4 (via wrapper)
- Kling variants
- Open-source models

---

### 20. fal.ai
**Hosts:** LTX-2, Luma, Runway, Kling variants, open models  
**API:** `https://api.fal.ai/v1/{model_id}`  
**Cost:** Pay-per-use (varies by model)  
**Strengths:**
- Fast inference servers (CDN-backed)
- Great for scaling
- Easy integration
- Good uptime

**Supported Models:**
- LTX-2 (text & image-to-video)
- Luma Dream Machine
- Runway proxies
- Kling proxies
- 50+ open-source models

---

### 21. Fireworks.ai / Together.ai
**Hosts:** LTX-2, Veo proxies, open-source models  
**API:** `https://api.fireworks.ai/inference/v1/{model}`  
**Cost:** Pay-per-use, competitive pricing  
**Strengths:**
- Fast inference for LTX-2, Veo proxies
- Great for speed
- Open + premium model access
- Good scalability

**Supported Models:**
- LTX-2 (fast inference)
- Veo 3 proxies
- Open-source models
- Custom fine-tuned models

---

### 22. WaveSpeedAI / Runware
**Hosts:** Kling, Seedance, WAN, etc.  
**API:** Aggregated access to multiple providers  
**Cost:** Varies by model  
**Strengths:**
- Aggregated access to niche models
- Good for scaling
- Load balancing across providers
- Enterprise support

---

## Provider Comparison Matrix

| Provider | Type | Cost | Speed | Quality | Audio | Tier |
|----------|------|------|-------|---------|-------|------|
| **LTX-2** | Text-to-Video | $0.04–0.08 | ⚡⚡⚡ Fast | ⭐⭐⭐ Good | ✅ Native | Free/Pro |
| **Luma Dream** | Image-to-Video | $0.10–0.20 | ⚡⚡ Med | ⭐⭐⭐⭐ Excellent | ❌ No | Free/Pro |
| **Sora 2** | Text-to-Video | $0.10–0.50 | ⚡ Slow | ⭐⭐⭐⭐⭐ Best | ✅ Yes | Hunter+ |
| **Veo 3** | Text-to-Video | $0.20–0.40 | ⚡⚡ Med | ⭐⭐⭐⭐⭐ Best | ✅ Yes | Hunter+ |
| **Runway Gen-4** | Text/Image | Credits | ⚡⚡ Med | ⭐⭐⭐⭐ Excellent | ✅ Yes | Hunter+ |
| **Kling 2.6** | Text/Image | Credits | ⚡⚡ Med | ⭐⭐⭐⭐ Excellent | ✅ Yes | Hunter+ |
| **HeyGen** | Avatar | $0.10–0.30 | ⚡ Slow | ⭐⭐⭐⭐ Excellent | ✅ Auto | Hunter+ |
| **Synthesia** | Avatar | $0.15–0.50 | ⚡ Slow | ⭐⭐⭐⭐ Excellent | ✅ Auto | Hunter+ |

---

## API Authentication Pattern

### Replicate
```bash
curl -X POST https://api.replicate.com/v1/predictions \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "version": "hash_or_model_id",
    "input": { "prompt": "..." }
  }'
```

### fal.ai
```bash
curl -X POST https://api.fal.ai/v1/ltx_text_to_video \
  -H "Authorization: Key YOUR_FAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "prompt": "..." }'
```

### OpenAI (Sora 2)
```bash
curl -X POST https://api.openai.com/v1/videos/generations \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "sora-2",
    "prompt": "..."
  }'
```

### Google (Veo 3)
```bash
curl -X POST https://us-central1-aiplatform.googleapis.com/v1/projects/$PROJECT_ID/locations/us-central1/publishers/google/models/veo-3:predict \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  -d '{ "instances": [{ "prompt": "..." }] }'
```

### Runway
```bash
curl -X POST https://api.runwayml.com/v1/image_to_video \
  -H "Authorization: Bearer $RUNWAY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "...",
    "prompt": "..."
  }'
```

---

## Integration Priority & Roadmap

### ✅ Phase 1: ASAP (Week 1–2)
- [x] LTX-2 via fal.ai
- [x] Luma Dream Machine via fal.ai
- Cost: ~$50–100/month for 1,000 videos

### 🚀 Phase 2: Next Month
- [ ] Sora 2 (after beta access)
- [ ] Veo 3 (Vertex AI setup)
- [ ] Runway Gen-4
- Cost: ~$200–500/month additional

### 🔮 Phase 3: Future
- [ ] HeyGen for avatars
- [ ] Synthesia for enterprise
- [ ] Load balancing across providers

---

## Cost Estimation (Monthly)

### Free/Pro (1,000 users, 100 videos/month)
**LTX-2 + Luma:**
- LTX-2: 50 videos × $0.05 = $2.50
- Luma: 50 videos × $0.15 = $7.50
- **Total: ~$10/month** (cheap!)

### Hunter (100 users, 500 videos/month)
**LTX-2 + Luma + Sora:**
- LTX-2: 200 × $0.06 = $12
- Luma: 150 × $0.15 = $22.50
- Sora 2: 150 × $0.25 = $37.50
- **Total: ~$72/month** (still affordable)

### Agency (10 users, unlimited)
**All engines, load-balanced:**
- Monthly budget: ~$500–1,000
- **Cost per video: $0.20–0.50**
- Depends on mix of premium vs. budget engines

---

## Recommended Config for CoreDNA

```typescript
interface VideoProviderConfig {
  // Free/Pro (Budget)
  free: {
    engines: ['ltx2'],
    primary: 'ltx2',
    fallback: 'luma',
    maxDuration: 15,
  },
  pro: {
    engines: ['ltx2', 'luma'],
    primary: 'ltx2',
    fallback: 'luma',
    maxDuration: 20,
  },
  // Hunter+ (Premium)
  hunter: {
    engines: ['ltx2', 'luma', 'sora2', 'veo3', 'runway'],
    primary: 'sora2', // Sora by default
    fallback: 'veo3', // Fallback to Veo
    maxDuration: 60,
    creditSystem: true,
  },
  // Agency (Enterprise)
  agency: {
    engines: ['ltx2', 'luma', 'sora2', 'veo3', 'runway', 'kling', 'heygen'],
    primary: 'sora2',
    fallback: 'veo3',
    maxDuration: 120,
    creditSystem: false, // Included
    loadBalancing: true,
  },
}
```

---

## Next Steps

1. **Get API Keys:**
   - [ ] fal.ai (LTX-2 + Luma hosting)
   - [ ] OpenAI (Sora 2 beta access request)
   - [ ] Google Cloud (Veo 3 + Vertex AI)
   - [ ] Runway (official API)

2. **Implement Adapters:**
   - [ ] `adapters/ltx2.ts`
   - [ ] `adapters/luma.ts`
   - [ ] `adapters/sora2.ts`
   - [ ] `adapters/veo3.ts`
   - [ ] `adapters/runway.ts`

3. **Test & Deploy:**
   - [ ] Unit tests for each adapter
   - [ ] Integration tests
   - [ ] Load testing
   - [ ] Cost monitoring

---

**Status:** Reference Complete  
**Ready for Integration:** Yes  
**Cost Estimate:** $10–1,000/month depending on tier  
**ROI:** High (low cost, high value)

