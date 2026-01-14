# 🎬 Video Generation — Quick Start Guide

## For Developers

### Import & Use

```typescript
import { generateVideo, getRemainingVideos, getUserCredits, getVideoTierInfo } from '@/services/videoService';

// Check tier capabilities
const tierInfo = getVideoTierInfo('hunter'); // → { monthlyLimit, engines, costPerVideo, ... }

// Generate video (e.g., in component handler)
const result = await generateVideo({
  imageUrl: 'https://example.com/image.png',
  prompt: 'Create an engaging product video',
  engine: 'sora2', // 'ltx2' | 'sora2' | 'veo3'
  userId: user.id,
  tier: user.tier,
});

console.log(result);
// {
//   videoUrl: "https://...",
//   engineUsed: "sora2",
//   costCredits: 5,
//   generatedAt: "2026-01-09T..."
// }
```

### Check User Status

```typescript
// Get remaining videos for this month
const remaining = await getRemainingVideos(userId, tier);

// Get current credits
const credits = await getUserCredits(userId);

// Get tier info
const { monthlyLimit, engines, costPerVideo } = getVideoTierInfo(tier);
```

---

## For Users

### Free Tier
- **Limit:** 5 videos/month
- **Engines:** LTX-2 only
- **Cost:** Free
- **Upgrade:** Click "Upgrade to Pro" to get 50/month

### Pro Tier
- **Limit:** 50 videos/month
- **Engines:** LTX-2 only
- **Cost:** Free
- **Upgrade:** Click "Upgrade to Hunter" for premium engines

### Hunter Tier
- **Limit:** Unlimited
- **Engines:** LTX-2 (1 credit) / Sora 2 (5 credits) / Veo 3 (5 credits)
- **Cost:** Credit-based
- **Credit Packs:** $19 (100), $79 (500), $139 (1000)

### Agency Tier
- **Limit:** Unlimited
- **Engines:** All (LTX-2, Sora 2, Veo 3)
- **Cost:** Included in subscription

---

## Tier Limits at a Glance

| Tier   | Videos/Month | Engines                  | Cost     |
|--------|--------------|--------------------------|----------|
| Free   | 5            | LTX-2                    | Free     |
| Pro    | 50           | LTX-2                    | Free     |
| Hunter | ∞            | LTX-2, Sora 2, Veo 3     | Credits  |
| Agency | ∞            | LTX-2, Sora 2, Veo 3     | Included |

---

## Engine Guide

### LTX-2 (Open-Source)
- **Quality:** Good (15 sec shorts)
- **Cost:** 1 credit (Hunter) / Free (Agency)
- **Best for:** Quick social media content
- **Output:** ~$0.04/sec

### Sora 2 Pro (OpenAI)
- **Quality:** Cinematic (physics-based)
- **Cost:** 5 credits (Hunter) / Free (Agency)
- **Best for:** High-quality product demos
- **License:** User owns output

### Veo 3 (Google)
- **Quality:** Superior physics & coherence
- **Cost:** 5 credits (Hunter) / Free (Agency)
- **Best for:** Complex motion scenarios
- **License:** User owns output

---

## How to Generate a Video

1. **Create a Campaign**
   - Go to Campaigns → Fill in goal → Execute

2. **Generate Images**
   - Wait for asset images to generate

3. **Enable Video Mode**
   - Check "Create video from this image"
   - See your monthly limit: X/Y

4. **Select Engine** (Hunter/Agency only)
   - Choose LTX-2, Sora 2, or Veo 3
   - See credit cost

5. **Generate**
   - Click "Generate Video"
   - Wait for completion

6. **View & Download**
   - See "Generated with: [Engine] — You own this content"
   - Download or schedule for posting

---

## FAQ

**Q: What if I run out of videos?**  
A: Upgrade your tier. Free → Pro (50/mo) → Hunter (unlimited + premium engines)

**Q: Can I use the same video on multiple platforms?**  
A: Yes! You own the content. Download and use anywhere.

**Q: What if video generation fails?**  
A: Credits aren't deducted on failure. Check error message & try again.

**Q: How do I buy credits?**  
A: Hunter tier only. Go to Settings → Video Credits → Choose package.

**Q: Do I own the generated videos?**  
A: Yes. All engines grant you output ownership.

---

## Troubleshooting

### "Monthly video limit reached"
- You've used all videos for this month
- **Solution:** Upgrade tier or wait until next month

### "Sora 2 Pro available for Hunter tier and above"
- Upgrade to Hunter tier to access premium engines
- **Solution:** Click "Upgrade" or select LTX-2 (free for all)

### "Insufficient credits"
- You don't have enough credits for that engine
- **Solution:** Buy a credit pack or use LTX-2 (1 credit)

### Video generation is slow
- Premium engines (Sora 2, Veo 3) take longer (~2-5 min)
- LTX-2 is faster (~30-60 sec)
- **Solution:** Check back in a few minutes

---

## Best Practices

✅ **Use LTX-2 for quick iterations**  
✅ **Save credits for final/promotional videos (Sora 2/Veo 3)**  
✅ **Use click-to-video overlay (Hunter+) for one-click generation**  
✅ **Download & backup important videos**  
✅ **Schedule multiple videos in advance**

---

**Need Help?** Contact support@coredna2.com  
**Docs:** See VIDEO_GENERATION_IMPLEMENTATION.md
