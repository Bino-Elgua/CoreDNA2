# 🎬 Direct Video Generation Feature Design

**Status:** Design Phase  
**Scope:** Agent-generated videos directly from prompts during campaign creation (no image prerequisite)  
**Release Target:** Post-Phase 6

---

## Overview

Enable users to create videos directly from campaign prompts during the campaign generation workflow, bypassing the image-to-video conversion entirely. The agent generates a video asset instead of (or alongside) an image asset.

**Key Principles:**
- **Parallel Generation:** Image and video can be generated independently
- **Tier-Based:** Free/Pro limited to image→video; Hunter+ can generate video directly
- **Cost-Transparent:** Users see credits/limits before generation
- **Smart Routing:** Agent decides which assets to generate based on user tier & preferences

---

## Architecture

```
CampaignsPage (user tier + preferences)
    ↓
Campaign Creation Modal/Form
    ├─ Asset Type Selector (Image | Video | Both)
    ├─ Prompt Input (unified for all asset types)
    └─ Generation Options (engine, duration, style)
    ↓
Agent Processing (n8n Workflow)
    ├─ Route by asset type
    ├─ Image API call (if needed)
    └─ Video API call (direct prompt → video)
    ↓
videoService.ts (routing + credits)
    ├─ generateVideoFromPrompt() [NEW]
    └─ generateVideo() [EXISTING: image→video]
    ↓
API Handlers
    ├─ /api/generate-video [MODIFIED: support prompt mode]
    ├─ /api/generate-image [EXISTING]
    └─ /api/generate-campaign [EXISTING: orchestrates both]
```

---

## Phase 1: Campaign Creation UI Update

**File:** `components/CampaignForm.tsx` (new/modified)

### Asset Type Selection
```typescript
type AssetMode = 'image' | 'video' | 'both' | 'image-then-convert';

const CampaignForm = ({ userTier, onSubmit }) => {
  const [assetMode, setAssetMode] = useState<AssetMode>('both'); // default
  const [prompt, setPrompt] = useState('');
  const [videoEngine, setVideoEngine] = useState('ltx2');
  const [videoDuration, setVideoDuration] = useState(6); // seconds
  
  // Tier-based mode restrictions
  const allowedModes = {
    free: ['image', 'image-then-convert'],
    pro: ['image', 'image-then-convert'],
    hunter: ['image', 'video', 'both', 'image-then-convert'],
    agency: ['image', 'video', 'both', 'image-then-convert'],
  };

  return (
    <div className="campaign-form bg-white rounded-lg p-6 space-y-4">
      
      {/* Prompt Input */}
      <div>
        <label className="block text-sm font-medium mb-2">Campaign Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your campaign idea (used for all assets)"
          className="w-full border rounded-lg p-3 h-24"
        />
        <p className="text-xs text-gray-500 mt-1">One prompt, multiple assets</p>
      </div>

      {/* Asset Type Selector */}
      <div className="border rounded-lg p-4 bg-blue-50">
        <label className="block text-sm font-semibold mb-3">What to Generate</label>
        
        <div className="space-y-2">
          {/* Option 1: Image Only */}
          <label className="flex items-center gap-3 p-3 bg-white rounded border hover:border-blue-400 cursor-pointer">
            <input
              type="radio"
              name="assetMode"
              value="image"
              checked={assetMode === 'image'}
              onChange={(e) => setAssetMode(e.target.value as AssetMode)}
            />
            <div className="flex-1">
              <span className="font-medium">Image Only</span>
              <p className="text-xs text-gray-600">Fast static asset for social posts</p>
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Free</span>
          </label>

          {/* Option 2: Direct Video (Hunter+) */}
          {allowedModes[userTier].includes('video') && (
            <label className="flex items-center gap-3 p-3 bg-white rounded border hover:border-purple-400 cursor-pointer">
              <input
                type="radio"
                name="assetMode"
                value="video"
                checked={assetMode === 'video'}
                onChange={(e) => setAssetMode(e.target.value as AssetMode)}
              />
              <div className="flex-1">
                <span className="font-medium">✨ Direct Video (NEW)</span>
                <p className="text-xs text-gray-600">Agent creates video from prompt (no image needed)</p>
              </div>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                {userTier === 'agency' ? 'Included' : '1-5 credits'}
              </span>
            </label>
          )}

          {/* Option 3: Both (Hunter+) */}
          {allowedModes[userTier].includes('both') && (
            <label className="flex items-center gap-3 p-3 bg-white rounded border hover:border-indigo-400 cursor-pointer">
              <input
                type="radio"
                name="assetMode"
                value="both"
                checked={assetMode === 'both'}
                onChange={(e) => setAssetMode(e.target.value as AssetMode)}
              />
              <div className="flex-1">
                <span className="font-medium">⚡ Both Image + Video</span>
                <p className="text-xs text-gray-600">Get image AND video from one prompt</p>
              </div>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                {userTier === 'agency' ? 'Included' : '1-6 credits'}
              </span>
            </label>
          )}

          {/* Option 4: Image → Convert (All Tiers) */}
          <label className="flex items-center gap-3 p-3 bg-white rounded border hover:border-blue-400 cursor-pointer">
            <input
              type="radio"
              name="assetMode"
              value="image-then-convert"
              checked={assetMode === 'image-then-convert'}
              onChange={(e) => setAssetMode(e.target.value as AssetMode)}
            />
            <div className="flex-1">
              <span className="font-medium">Image → Video Conversion</span>
              <p className="text-xs text-gray-600">Generate image first, then convert to video</p>
            </div>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              {userTier === 'free' ? '5/mo' : userTier === 'pro' ? '50/mo' : 'Unlimited'}
            </span>
          </label>
        </div>
      </div>

      {/* Video Options (if video-capable mode) */}
      {['video', 'both'].includes(assetMode) && (
        <VideoGenerationOptions
          userTier={userTier}
          videoEngine={videoEngine}
          setVideoEngine={setVideoEngine}
          videoDuration={videoDuration}
          setVideoDuration={setVideoDuration}
        />
      )}

      {/* Cost Summary */}
      <CostSummary assetMode={assetMode} userTier={userTier} videoEngine={videoEngine} />

      {/* Submit */}
      <button
        onClick={() => onSubmit({ prompt, assetMode, videoEngine, videoDuration })}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
      >
        Generate {assetMode === 'both' ? 'Assets' : assetMode === 'video' ? 'Video' : 'Image'}
      </button>
    </div>
  );
};
```

---

## Phase 2: Video Generation Options Component

**File:** `components/VideoGenerationOptions.tsx` (new)

```typescript
interface VideoGenerationOptionsProps {
  userTier: 'free' | 'pro' | 'hunter' | 'agency';
  videoEngine: string;
  setVideoEngine: (engine: string) => void;
  videoDuration: number;
  setVideoDuration: (duration: number) => void;
}

export const VideoGenerationOptions = ({
  userTier,
  videoEngine,
  setVideoEngine,
  videoDuration,
  setVideoDuration,
}: VideoGenerationOptionsProps) => {
  const engineOptions = {
    hunter: [
      { id: 'ltx2', name: 'LTX-2 (Standard)', cost: 1, desc: 'Fast, good for shorts' },
      { id: 'sora2', name: 'Sora 2 Pro (Premium)', cost: 5, desc: 'Cinematic, realistic' },
      { id: 'veo3', name: 'Veo 3 (Premium)', cost: 5, desc: 'Google tech, detailed' },
    ],
    agency: [
      { id: 'ltx2', name: 'LTX-2 (Standard)', cost: 0, desc: 'Fast, good for shorts' },
      { id: 'sora2', name: 'Sora 2 Pro (Premium)', cost: 0, desc: 'Cinematic, realistic' },
      { id: 'veo3', name: 'Veo 3 (Premium)', cost: 0, desc: 'Google tech, detailed' },
    ],
  };

  const engines = engineOptions[userTier] || engineOptions.hunter;

  return (
    <div className="space-y-4 border-t pt-4">
      {/* Engine Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Video Engine</label>
        <div className="grid grid-cols-1 gap-2">
          {engines.map((engine) => (
            <label
              key={engine.id}
              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${
                videoEngine === engine.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="videoEngine"
                value={engine.id}
                checked={videoEngine === engine.id}
                onChange={(e) => setVideoEngine(e.target.value)}
              />
              <div className="flex-1">
                <p className="font-medium text-sm">{engine.name}</p>
                <p className="text-xs text-gray-600">{engine.desc}</p>
              </div>
              <span className="text-sm font-semibold text-blue-600 whitespace-nowrap">
                {engine.cost === 0 ? 'Included' : `${engine.cost} credit`}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Duration Slider */}
      <div>
        <label className="block text-sm font-medium mb-2">Video Duration</label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="3"
            max="30"
            value={videoDuration}
            onChange={(e) => setVideoDuration(parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm font-medium whitespace-nowrap">{videoDuration}s</span>
        </div>
        <p className="text-xs text-gray-600 mt-1">Longer videos use more credits</p>
      </div>

      {/* Style/Format Options */}
      <div>
        <label className="block text-sm font-medium mb-2">Video Style</label>
        <select className="w-full border rounded-lg p-2 text-sm">
          <option>Auto-detect from prompt</option>
          <option>Cinematic</option>
          <option>Social Media (16:9)</option>
          <option>Vertical (9:16)</option>
          <option>Square (1:1)</option>
          <option>Product Showcase</option>
          <option>Animated Text</option>
        </select>
      </div>
    </div>
  );
};
```

---

## Phase 3: Cost Summary Component

**File:** `components/CostSummary.tsx` (new/modified)

```typescript
const CostSummary = ({ assetMode, userTier, videoEngine }) => {
  const calculateCosts = () => {
    const costs: Record<string, { image: number; video: number; total: number }> = {
      image: { image: 0, video: 0, total: 0 },
      video: { image: 0, video: engineCosts[videoEngine] || 1, total: engineCosts[videoEngine] || 1 },
      both: {
        image: 0,
        video: engineCosts[videoEngine] || 1,
        total: (engineCosts[videoEngine] || 1),
      },
      'image-then-convert': { image: 0, video: 1, total: 1 },
    };
    return costs[assetMode] || costs.image;
  };

  const engineCosts = { ltx2: 1, sora2: 5, veo3: 5 };
  const costs = calculateCosts();

  return (
    <div className="border rounded-lg p-3 bg-gray-50">
      <p className="text-sm font-semibold mb-2">Cost Breakdown</p>
      <div className="space-y-1 text-sm">
        {costs.image > 0 && <div className="flex justify-between"><span>Image:</span><span>{costs.image === 0 ? 'Free' : `${costs.image} credit`}</span></div>}
        {costs.video > 0 && <div className="flex justify-between"><span>Video ({videoEngine}):</span><span>{costs.video === 0 ? 'Included' : `${costs.video} credit`}</span></div>}
        <div className="border-t pt-1 mt-1 flex justify-between font-semibold">
          <span>Total:</span>
          <span className={costs.total === 0 ? 'text-green-600' : 'text-blue-600'}>
            {costs.total === 0 ? 'Included in tier' : `${costs.total} credits`}
          </span>
        </div>
      </div>
    </div>
  );
};
```

---

## Phase 4: Backend Service Updates

**File:** `services/videoService.ts` (modified)

```typescript
interface VideoGenerationRequest {
  imageUrl?: string; // For image→video
  prompt: string; // For direct video
  engine: 'ltx2' | 'sora2' | 'veo3';
  userId: string;
  tier: 'free' | 'pro' | 'hunter' | 'agency';
  duration?: number; // For direct video
  style?: string; // For direct video
  mode: 'image-to-video' | 'direct-video'; // [NEW]
}

/**
 * [NEW] Generate video directly from prompt (no image prerequisite)
 * Supported tiers: hunter, agency
 */
export async function generateVideoFromPrompt(
  request: Omit<VideoGenerationRequest, 'imageUrl'> & { mode: 'direct-video' }
): Promise<VideoGenerationResponse> {
  const { prompt, engine, userId, tier, duration = 6, style = 'auto' } = request;

  // Tier check
  if (!['hunter', 'agency'].includes(tier)) {
    throw new Error(
      'Direct video generation available for Hunter tier and above. ' +
      'Free/Pro users can convert images to video instead.'
    );
  }

  // Monthly limit check (same as image→video)
  if (!(await canGenerateVideo(userId, tier))) {
    const limit = getTierVideoLimit(tier);
    throw new Error(`Monthly video limit reached (${limit} videos/month for ${tier} tier)`);
  }

  // Credit check for hunter tier
  let creditCost = 0;
  if (tier === 'hunter') {
    creditCost = getEngineCost(engine, duration);
    const userCredits = await getUserCredits(userId);
    if (userCredits < creditCost) {
      throw new Error(
        `Insufficient credits. ${engine} requires ${creditCost} credits, you have ${userCredits}`
      );
    }
  }

  try {
    // Route to appropriate API
    let videoUrl: string;
    let engineUsed: string;

    switch (engine) {
      case 'sora2':
        videoUrl = await callSora2TextToVideoAPI(prompt, { duration, style });
        engineUsed = 'Sora 2 Pro (OpenAI)';
        break;

      case 'veo3':
        videoUrl = await callVeo3TextToVideoAPI(prompt, { duration, style });
        engineUsed = 'Veo 3 (Google)';
        break;

      default: // ltx2
        videoUrl = await callLTX2TextToVideoAPI(prompt, { duration, style });
        engineUsed = 'LTX-2 (Open-Source)';
    }

    // Deduct credits if applicable
    if (creditCost > 0) {
      await deductCredits(userId, creditCost);
    }

    // Log generation
    await logVideoGeneration({
      userId,
      mode: 'direct-video',
      engine,
      creditsCost: creditCost,
      duration,
      prompt: prompt.substring(0, 100), // truncate for logging
    });

    // Increment monthly counter
    await incrementVideoCount(userId, tier);

    return {
      videoUrl,
      engineUsed,
      costCredits: creditCost,
      generatedAt: new Date().toISOString(),
      mode: 'direct-video',
      disclosure: {
        engine: engineUsed,
        ownership: 'You own this content',
      },
    };
  } catch (error) {
    console.error('Direct video generation failed:', error);
    throw error;
  }
}

/**
 * [MODIFIED] Handle both image→video AND direct video modes
 */
export async function generateVideo(
  request: VideoGenerationRequest
): Promise<VideoGenerationResponse> {
  if (request.mode === 'direct-video') {
    return generateVideoFromPrompt(request as any);
  }

  // Existing image→video logic
  return generateVideoFromImage(request);
}

/**
 * [NEW] Helper: Calculate credit cost based on engine + duration
 */
function getEngineCost(engine: string, duration: number = 6): number {
  const baseCosts = { ltx2: 1, sora2: 5, veo3: 5 };
  const baseCost = baseCosts[engine] || 1;
  
  // Longer videos cost more (rough estimate)
  const durationMultiplier = Math.ceil(duration / 6); // 6-12s = 2x, etc.
  
  return baseCost * durationMultiplier;
}

/**
 * [NEW] Placeholder: Call LTX-2 text-to-video API
 */
async function callLTX2TextToVideoAPI(
  prompt: string,
  options: { duration: number; style: string }
): Promise<string> {
  // TODO: Implement with Replicate or fal.ai
  // Example: POST to fal.ai text-to-video endpoint
  const response = await fetch('https://fal.run/ltx/text-to-video', {
    method: 'POST',
    headers: { 'Authorization': `Key ${process.env.FAL_API_KEY}` },
    body: JSON.stringify({
      prompt,
      duration: options.duration,
      style: options.style !== 'auto' ? options.style : undefined,
    }),
  });
  
  if (!response.ok) throw new Error(`LTX-2 API error: ${response.statusText}`);
  const data = await response.json();
  return data.video_url;
}

/**
 * [NEW] Placeholder: Call Sora 2 text-to-video API
 */
async function callSora2TextToVideoAPI(
  prompt: string,
  options: { duration: number; style: string }
): Promise<string> {
  // TODO: Implement with OpenAI Sora API
  const response = await fetch('https://api.openai.com/v1/videos/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sora-2-pro',
      prompt,
      duration: options.duration,
      quality: 'hd',
    }),
  });
  
  if (!response.ok) throw new Error(`Sora 2 API error: ${response.statusText}`);
  const data = await response.json();
  return data.data[0].url;
}

/**
 * [NEW] Placeholder: Call Veo 3 text-to-video API
 */
async function callVeo3TextToVideoAPI(
  prompt: string,
  options: { duration: number; style: string }
): Promise<string> {
  // TODO: Implement with Google Veo 3 API
  const response = await fetch('https://generativelanguage.googleapis.com/v1/text-to-video', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GOOGLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      duration: options.duration,
      quality: 'hd',
    }),
  });
  
  if (!response.ok) throw new Error(`Veo 3 API error: ${response.statusText}`);
  const data = await response.json();
  return data.video_url;
}
```

---

## Phase 5: API Endpoint Updates

**File:** `api/generate-video.ts` (modified)

```typescript
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const {
      imageUrl,      // For image→video
      prompt,        // For all modes
      engine = 'ltx2',
      userId,
      tier,
      mode = 'image-to-video', // [NEW]
      duration = 6,  // [NEW]
      style = 'auto', // [NEW]
    } = req.body;

    // Validate mode
    if (!['image-to-video', 'direct-video'].includes(mode)) {
      return res.status(400).json({ error: 'Invalid mode. Use "image-to-video" or "direct-video"' });
    }

    // Direct video requires prompt
    if (mode === 'direct-video' && !prompt) {
      return res.status(400).json({ error: 'Prompt is required for direct video generation' });
    }

    // Image→video requires image URL
    if (mode === 'image-to-video' && !imageUrl) {
      return res.status(400).json({ error: 'Image URL is required for image-to-video conversion' });
    }

    // Generate video
    const result = await generateVideo({
      imageUrl,
      prompt: prompt || 'Convert image to video',
      engine,
      userId,
      tier,
      mode: mode as 'image-to-video' | 'direct-video',
      duration,
      style,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    if (error.message.includes('tier')) {
      return res.status(403).json({ error: error.message });
    }
    if (error.message.includes('limit')) {
      return res.status(429).json({ error: error.message });
    }
    if (error.message.includes('credits')) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
}
```

---

## Phase 6: Campaign Page Integration

**File:** `pages/CampaignsPage.tsx` (modified)

```typescript
const CampaignsPage = () => {
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [generationInProgress, setGenerationInProgress] = useState(false);

  const handleCampaignGeneration = async ({
    prompt,
    assetMode,
    videoEngine,
    videoDuration,
  }) => {
    setGenerationInProgress(true);

    try {
      const assets = [];

      // Generate image if needed
      if (['image', 'both', 'image-then-convert'].includes(assetMode)) {
        const imageResult = await generateImage(prompt); // existing function
        assets.push({ type: 'image', url: imageResult.imageUrl, prompt });
      }

      // Generate video directly if needed
      if (['video', 'both'].includes(assetMode)) {
        const videoResult = await videoService.generateVideoFromPrompt({
          prompt,
          engine: videoEngine,
          userId: user.id,
          tier: user.tier,
          duration: videoDuration,
          mode: 'direct-video',
        });
        assets.push({ type: 'video', url: videoResult.videoUrl, prompt });
      }

      // Convert image to video if needed (only for existing images)
      if (assetMode === 'image-then-convert' && assets[0]?.type === 'image') {
        const videoResult = await videoService.generateVideo({
          imageUrl: assets[0].url,
          prompt,
          engine: videoEngine,
          userId: user.id,
          tier: user.tier,
          mode: 'image-to-video',
        });
        assets.push({ type: 'video', url: videoResult.videoUrl, prompt });
      }

      // Save campaign
      await saveCampaign({ prompt, assets, createdAt: new Date() });

      // Show success & reload
      toast.success(`Campaign created with ${assets.length} asset(s)`);
      setShowCampaignForm(false);
      refreshCampaigns();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setGenerationInProgress(false);
    }
  };

  return (
    <div>
      {/* Existing campaign list */}
      {/* ... */}

      {/* Campaign form modal */}
      {showCampaignForm && (
        <Modal onClose={() => setShowCampaignForm(false)}>
          <CampaignForm
            userTier={user.tier}
            onSubmit={handleCampaignGeneration}
            isLoading={generationInProgress}
          />
        </Modal>
      )}

      <button
        onClick={() => setShowCampaignForm(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-lg"
      >
        + New Campaign
      </button>
    </div>
  );
};
```

---

## Tier Access Matrix

| Feature | Free | Pro | Hunter | Agency |
|---------|------|-----|--------|--------|
| Image generation | ✅ | ✅ | ✅ | ✅ |
| Image→Video conversion | ✅ (5/mo) | ✅ (50/mo) | ✅ (unlimited) | ✅ (unlimited) |
| **Direct Video from Prompt** | ❌ | ❌ | ✅ (unlimited) | ✅ (unlimited) |
| LTX-2 engine | Free | Free | 1 credit | Free |
| Sora 2 Pro engine | ❌ | ❌ | 5 credits | Free |
| Veo 3 engine | ❌ | ❌ | 5 credits | Free |
| Video duration | N/A | N/A | 3-30s | 3-30s |
| Video style selection | N/A | N/A | ✅ | ✅ |

---

## Data Schema Updates

### Campaign Asset Object
```typescript
interface CampaignAsset {
  id: string;
  campaignId: string;
  type: 'image' | 'video';
  url: string;
  prompt: string;
  
  // Image metadata
  imageEngine?: string;
  
  // Video metadata
  videoEngine?: string;
  videoDuration?: number; // seconds
  videoStyle?: string;
  generationMode?: 'direct-video' | 'image-to-video'; // [NEW]
  
  creditsUsed: number;
  createdAt: Date;
  publishedAt?: Date;
  publishedTo?: string[]; // ['facebook', 'instagram', 'twitter']
}

interface Campaign {
  id: string;
  userId: string;
  prompt: string;
  assets: CampaignAsset[];
  status: 'draft' | 'scheduled' | 'published';
  createdAt: Date;
  updatedAt: Date;
}
```

### LocalStorage Keys
```javascript
// Video generation log (includes both modes)
localStorage.setItem(`video_gen_log_${userId}`, JSON.stringify([
  {
    timestamp: number,
    mode: 'direct-video' | 'image-to-video',
    engine: string,
    duration?: number,
    credits: number,
  },
  ...
]));
```

---

## User Experience Flow

### Free/Pro User (No Direct Video Access)
1. Click "New Campaign"
2. Write prompt
3. Select "Image Only" or "Image → Video Conversion"
4. Click "Generate Image"
5. (Optional) Click video overlay to convert to video
6. Asset added to campaign

### Hunter User (Direct Video Option)
1. Click "New Campaign"
2. Write prompt
3. **Select "Direct Video"** (new option)
4. Choose engine (LTX-2, Sora 2, Veo 3)
5. Set duration (3-30s)
6. See cost (1-5 credits)
7. Click "Generate Video"
8. Video asset created directly (no image prerequisite)

### Agency User (Everything Free)
1. Same as Hunter, but all engines cost 0 credits
2. All options unlimited

---

## Implementation Checklist

### Frontend
- [ ] Create `CampaignForm.tsx` with asset mode selector
- [ ] Create `VideoGenerationOptions.tsx` component
- [ ] Create/update `CostSummary.tsx` component
- [ ] Update `CampaignsPage.tsx` with new generation handler
- [ ] Update `AssetCard.tsx` to display `generationMode` badge
- [ ] Add "Direct Video" explanatory tooltips

### Backend Services
- [ ] Implement `generateVideoFromPrompt()` in `videoService.ts`
- [ ] Add `getEngineCost()` helper with duration scaling
- [ ] Implement `callLTX2TextToVideoAPI()`
- [ ] Implement `callSora2TextToVideoAPI()`
- [ ] Implement `callVeo3TextToVideoAPI()`

### API Endpoints
- [ ] Update `/api/generate-video` to handle `mode` parameter
- [ ] Add validation for direct-video vs image-to-video
- [ ] Add error responses for tier restrictions

### Testing
- [ ] Free/Pro users cannot access direct video (403 error)
- [ ] Hunter users can generate video with cost tracking
- [ ] Agency users generate video with no credit cost
- [ ] Duration scaling affects credit cost correctly
- [ ] Monthly limits enforced across both generation modes
- [ ] Prompts properly routed to correct text-to-video APIs

### Documentation
- [ ] Update README with new feature
- [ ] Add code examples to integration guide
- [ ] Update pricing page with direct video option
- [ ] Create troubleshooting guide

---

## Success Criteria

✅ Hunter+ can generate video directly from prompt  
✅ Free/Pro users see clear upgrade prompt  
✅ Cost breakdown transparent before generation  
✅ Both direct-video AND image-to-video modes coexist  
✅ No breaking changes to existing image→video flow  
✅ Duration affects credit cost fairly  
✅ Monthly limits apply to both generation modes  
✅ All 3 video engines supported with text-to-video APIs  

---

## Timeline & Next Steps

**Week 1:** Frontend components (Forms, Options, Cost display)  
**Week 2:** Service layer updates (videoService.ts, API integration)  
**Week 3:** API endpoint updates & testing  
**Week 4:** Real API integration (fal.ai, OpenAI, Google)  
**Week 5:** Documentation & launch  

---

**Design Status:** ✅ Complete  
**Ready for Development:** Yes  
**Estimated LOC:** ~800 (frontend) + ~400 (backend) = ~1,200 total

