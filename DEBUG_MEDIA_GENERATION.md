# Debug: Media Generation Not Working

If campaigns aren't generating real images, it's most likely **no API keys configured**.

## Quick Check

### 1. Open Browser Console
Press `F12` → Console tab

### 2. Run Config Check
Paste this in the console:
```javascript
// Paste the entire content below and press Enter:
const status = (() => {
  const settings = JSON.parse(localStorage.getItem('core_dna_settings') || '{}');
  return {
    activeImageGen: settings.activeImageGen,
    imageProviders: settings.image ? Object.keys(settings.image) : [],
    imageKeysConfigured: settings.image ? Object.keys(settings.image).filter(k => settings.image[k]?.apiKey?.trim?.()) : [],
    activeLLM: settings.activeLLM,
    llmProviders: settings.llms ? Object.keys(settings.llms) : [],
    llmKeysConfigured: settings.llms ? Object.keys(settings.llms).filter(k => settings.llms[k]?.apiKey?.trim?.()) : []
  };
})();
console.table(status);
```

### 3. What You Should See
```
activeImageGen: dalle (or stability, flux, etc)
imageProviders: ["dalle", "stability", ...]
imageKeysConfigured: ["dalle"] ← Must have at least 1
activeLLM: openai (or any LLM)
llmProviders: ["openai", "claude", ...]
llmKeysConfigured: ["openai"] ← Must have at least 1
```

---

## If Images Aren't Generating

### Problem: No Active Image Provider
- **activeImageGen**: undefined or null
- **imageKeysConfigured**: empty array

**Fix**: Go to Settings → API Keys → Select an image provider and paste your API key

### Problem: Image Provider Has No Key
- **activeImageGen**: "dalle"
- **imageKeysConfigured**: [] (empty)

**Fix**: Go to Settings → API Keys → Find the provider and add API key

### Problem: No LLM Provider
- **llmKeysConfigured**: [] (empty)

**Fix**: Campaigns need an LLM to generate copy. Go to Settings → API Keys → Add any LLM (OpenAI, Anthropic, etc.)

---

## Recommended Setup (Free/Cheap)

### Image Generation (Pick One)
- **Stability AI** (pay-as-you-go, ~$0.50 per image)
  - Get key: https://platform.stability.ai
  - Free credits on signup
  
- **OpenAI DALL-E 3** (pay-as-you-go, ~$0.080 per image)
  - Get key: https://platform.openai.com/api-keys
  - Existing OpenAI account
  
- **Replicate Flux** (free tier available)
  - Get key: https://replicate.com/account/api-tokens
  - Free $50/month credit

### LLM (Pick One)
- **OpenAI** ($0.03-0.15 per campaign)
  - https://platform.openai.com/api-keys
  
- **Groq** (FREE but limited)
  - https://console.groq.com/keys
  - 1000 tokens/minute free tier
  
- **Anthropic Claude** (paid)
  - https://console.anthropic.com/

---

## Browser Console Output When Working

When you create a campaign with images properly configured, you should see logs like:

```
[generateAssetImages] Starting image generation for 8 stories
[generateImage] Starting image generation for: Create Instagram post...
[generateImage] Using provider: dalle, API key length: 48
[generateImage] Calling DALL-E 3
[generateDALLE3] ✓ Image generated
[generateImage] ✓ Success with dalle: https://oaidalleapiprodscus.blob.core.windows.net/...
[generateAssetImages] ✓ Generated image for US-001: https://oaidalleapiprodscus.blob.core.windows...
[generateAssetImages] Completed. Generated 5 images
```

If you see placeholders instead:
```
[generateImage] Falling back to placeholder
[generateImage] Returning placeholder: https://via.placeholder.com/1024x1024?text=...
```

Then an error happened. Check the full error log above it.

---

## Common Issues

### 1. "No settings found in localStorage"
- **Cause**: Haven't opened Settings page yet
- **Fix**: Go to Settings → API Keys, then refresh page

### 2. "Provider not configured" 
- **Cause**: API key is blank
- **Fix**: Paste your actual API key in Settings → Add Provider

### 3. "DALL-E API error: 401"
- **Cause**: Invalid or expired API key
- **Fix**: Get fresh key from https://platform.openai.com/api-keys

### 4. "Stability AI error: 401"
- **Cause**: Invalid Stability AI key
- **Fix**: Get fresh key from https://platform.stability.ai

### 5. "No LLM provider configured"
- **Cause**: Campaign PRD generation needs LLM
- **Fix**: Add any LLM in Settings (OpenAI, Groq, Claude, etc.)

---

## Testing Image Generation Directly

Paste this in the browser console to test image generation:

```javascript
// First, check config
const settings = JSON.parse(localStorage.getItem('core_dna_settings') || '{}');
console.log('Active image provider:', settings.activeImageGen);
console.log('Available image providers:', Object.keys(settings.image || {}));

// Then test generation (if configured)
if (settings.activeImageGen && settings.image?.[settings.activeImageGen]?.apiKey) {
  console.log('Provider is configured. Check network tab to see API call.');
} else {
  console.log('❌ No image provider configured. Go to Settings → API Keys');
}
```

---

## Still Not Working?

1. **Open DevTools**: F12 → Console
2. **Run**:
   ```javascript
   localStorage.getItem('core_dna_settings')
   ```
3. **Paste output in GitHub issue** - helps us debug!

---

## What Should Happen

1. User opens Campaign → "Generate PRD"
2. PRD form appears
3. User fills out and clicks "Generate PRD"
4. Progress shows: "Analyzing campaign brief..." → "Generating campaign asset images..." → "Generating image for: ..."
5. Each image is fetched from provider and stored
6. Final PRD shows user stories with real images attached
7. Campaign ready to deploy with full assets (copy + images + videos)

If you're not seeing real images, follow the steps above to diagnose.
