# Image Generation Failure Analysis

## Issues Found

### 1. **API Key Storage Mismatch** ⚠️ CRITICAL
**File:** `mediaGenerationService.ts` (line 65-71)

**Problem:** The function tries to read API keys from `settings.image[key]`, but `geminiService.ts` stores keys in structured format:
```typescript
// Where keys are actually stored (geminiService.ts):
settings.image?.[provider]?.apiKey   // ✓ Correct format
settings.llms?.[provider]?.apiKey    // For LLMs
settings.voice?.[provider]?.apiKey   // For voice

// But mediaGenerationService looks here:
settings.image[key]?.apiKey?.trim?.()  // Line 66 - tries to call trim on possibly undefined
```

**Fix:** Use consistent key retrieval like geminiService does:
```typescript
const apiKey = config.apiKey?.trim?.();  // Use optional chaining properly
// OR better:
const apiKey = (config as any).apiKey?.trim?.() ?? null;
```

---

### 2. **Silent Fallback to Placeholder** 🎭
**File:** `CampaignsPage.tsx` (lines 169-193)

**Problem:** When image generation fails, the code silently falls back to placeholder without showing user WHY it failed.

```typescript
// Line 183-189: Error is caught but asset continues without image
catch (imgErr: any) {
    console.error('[CampaignsPage] Image generation failed for asset:', asset.id);
    // ... logs error but returns asset WITHOUT image - no user feedback
    return { ...asset, isGeneratingImage: false };  // No imageUrl!
}
```

**Result:** Users see assets with missing images but no error message in the UI (only in console).

**Fix:** Add proper error handling:
```typescript
catch (imgErr: any) {
    console.error('[CampaignsPage] Image generation failed:', imgErr?.message);
    setDebugError(`⚠️ Image generation failed for ${asset.id}: ${imgErr?.message}`);
    return { ...asset, imageUrl: null, generationError: imgErr?.message };
}
```

---

### 3. **No Check if Image Provider is Configured BEFORE Generation**
**File:** `CampaignsPage.tsx` (line 179)

**Problem:** Campaign generation starts without verifying that an image provider has API keys configured.

```typescript
// Line 168: Sets loading message
setLoadingMsg('Generating visual assets...');

// Line 179: Calls generateImage without checking if provider exists
const result = await generateImage(asset.imagePrompt, { ... });
```

**Fix:** Add pre-flight check before starting generation:
```typescript
// In handleGenerate(), BEFORE generating assets
try {
    getActiveImageProvider();  // Will throw if not configured
} catch (e) {
    setDebugError(`⚠️ No image provider configured. Go to Settings → API Keys to add DALL-E, Stability AI, or another provider.`);
    return;
}
```

---

### 4. **Settings Structure May Be Wrong After Save**
**File:** `SettingsPage.tsx` (not shown, but referenced)

**Problem:** If Settings page stores keys differently than expected, `getActiveImageProvider()` won't find them.

**Check:** Verify in browser DevTools:
```javascript
// Run in console:
JSON.parse(localStorage.getItem('core_dna_settings'))
// Should show:
{
  image: {
    dalle: { apiKey: "sk-...", enabled: true },
    stability: { apiKey: "sk-...", enabled: true }
  }
}
```

If structure is different (e.g., nested differently), that's the issue.

---

## Root Causes (Ranked by Likelihood)

1. **No image provider API key configured in Settings** (80% likely)
   - User hasn't saved API keys in Settings page
   - Solution: Go to Settings → API Keys, add DALL-E/Stability/Flux API key

2. **API key is saved but in wrong format** (15% likely)
   - Settings page stores keys in different structure than mediaGenerationService expects
   - Solution: Check localStorage structure in browser DevTools

3. **Code bug in key retrieval** (5% likely)
   - mediaGenerationService has typo accessing settings object
   - Solution: Fix the optional chaining chain (lines 65-71)

---

## Testing Checklist

### ✓ Step 1: Verify Settings Structure
```javascript
// In browser console:
const settings = JSON.parse(localStorage.getItem('core_dna_settings') || '{}');
console.log('Image providers:', settings.image);
console.log('Active provider:', settings.activeImageGen);
```

**Expected output:**
```javascript
{
  dalle: { apiKey: "sk-proj-...", enabled: true },
  stability: { apiKey: "sk-...", enabled: true }
}
// Active provider: 'dalle'
```

### ✓ Step 2: Test Image Generation Directly
```javascript
// In browser console:
import { generateImage } from './services/mediaGenerationService';
await generateImage("a beautiful sunset", { style: "modern" });
```

### ✓ Step 3: Check Console Logs
When generating campaign, look for:
- `[getActiveImageProvider]` logs showing which provider is selected
- `[generateImage]` logs showing API call being made
- Any error messages like "No image generation provider configured"

---

## Recommended Fixes (In Order)

### Immediate (5 min)
1. **Add pre-flight check** in CampaignsPage.tsx before image generation
2. **Show user-facing error** when image generation fails
3. **Log full settings object** to help users debug

### Short-term (30 min)
1. Fix optional chaining in mediaGenerationService (line 66)
2. Add validation that API keys are non-empty strings
3. Add unit tests for getActiveImageProvider()

### Long-term (1-2 hours)
1. Add Settings → Test Connection button to verify API keys work
2. Show image provider status in CampaignsPage before generating
3. Add retry logic with exponential backoff for API failures
