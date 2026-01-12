# AI Router - Clean Category-Split Architecture

## Overview

Clean, modular AI operations router that separates concerns by media type:
- **Text Generation** (LLMs only)
- **Image Generation** (images only)
- **Video Generation** (video only)

No cross-over. No monolithic services. Clean adapters for each provider.

## Quick Usage

```typescript
import { generateText, generateImage, generateVideo } from '@/services/ai/router';

// Generate text using active LLM from settings
const text = await generateText('Write a headline');

// Generate image using active image provider
const image = await generateImage('Blue mountain landscape', { style: 'oil painting' });

// Generate video (optional - returns null if no provider)
const video = await generateVideo('Sunset over ocean', { duration: 5 });
```

## Architecture

### 1. Settings Service (`settingsService.ts`)

Centralized API key retrieval by category:

```typescript
import { getApiKey, getActiveProvider } from '@/services/ai/settingsService';

// Get API key for a provider
const key = getApiKey('llms', 'openai');

// Get active provider for a category
const provider = getActiveProvider('image');
```

**Categories:**
- `llms` - Language models (LLM providers)
- `image` - Image generation
- `video` - Video generation
- `voice` - Text-to-speech
- `workflows` - Workflow automation

### 2. Adapters (`adapters/`)

Individual provider implementations - no giant switches:

```
adapters/
├── gemini.ts              # Google Gemini
├── openai.ts              # OpenAI (GPT-4o)
├── claude.ts              # Anthropic Claude
├── openaiCompatible.ts    # Mistral, Groq, DeepSeek, etc.
└── other.ts               # Qwen, Cohere
```

Each adapter:
- Gets API key from settings automatically
- Has one exported function: `call[Provider](prompt, model?)`
- Throws clear errors if key missing
- No fallbacks or mocks

### 3. Routers

Three category-specific routers that delegate to adapters:

#### Text Router (`textRouter.ts`)

```typescript
export async function generateText(
  prompt: string,
  provider?: string,  // Optional override
  model?: string      // Optional override
): Promise<string>
```

**Supported Providers:**
- Gemini, Google
- OpenAI
- Anthropic, Claude
- Mistral, Groq, DeepSeek, xAI, OpenRouter, Together, Perplexity (OpenAI-compatible)
- Qwen
- Cohere

#### Image Router (`imageRouter.ts`)

```typescript
export async function generateImage(
  prompt: string,
  options?: {
    size?: string;
    style?: string;
    quality?: number;
    negativePrompt?: string;
  }
): Promise<ImageGenerationResult>
```

**Supported Providers:**
- DALL-E (dalle, openai_dalle_next)
- Ideogram
- Flux (fal_flux, black_forest_labs)
- Midjourney
- Stability AI (stability, sd3)

#### Video Router (`videoRouter.ts`)

```typescript
export async function generateVideo(
  prompt: string,
  options?: {
    duration?: number;
    fps?: number;
    resolution?: string;
  }
): Promise<VideoGenerationResult | null>
```

**Supported Providers:**
- Runway
- Luma
- Pika
- Kling

Returns `null` if no provider configured (optional feature).

### 4. Main Router (`router.ts`)

Clean public API:

```typescript
export { generateText } from './textRouter';
export { generateImage } from './imageRouter';
export { generateVideo } from './videoRouter';
export { getActiveProvider, getApiKey, hasProvider } from './settingsService';
```

## Error Handling

All errors are clear and actionable:

```typescript
try {
  const text = await generateText('Hello');
} catch (error) {
  // Error: No API key for openai in llms. Go to Settings → API Keys to add one.
}
```

Video generation gracefully returns `null` instead of throwing (optional feature):

```typescript
const video = await generateVideo('Scene'); // null if no provider
if (video) {
  // Use video URL
} else {
  // Skip video, continue with other assets
}
```

## Settings Structure

API keys are stored in `localStorage['core_dna_settings']`:

```json
{
  "activeLLM": "openai",
  "activeImageGen": "dalle",
  "activeVideo": "runway",
  
  "llms": {
    "openai": { "apiKey": "sk-..." },
    "mistral": { "apiKey": "..."},
    "anthropic": { "apiKey": "..."}
  },
  
  "image": {
    "dalle": { "apiKey": "sk-..." },
    "ideogram": { "apiKey": "..." }
  },
  
  "video": {
    "runway": { "apiKey": "..." },
    "luma": { "apiKey": "..." }
  }
}
```

## Provider Override

Text generation supports provider override:

```typescript
// Use specific provider instead of active
const text = await generateText(prompt, 'mistral', 'mistral-large');
```

Image and video routers always use active provider (pull from settings).

## Migration from Old Code

### Old Way
```typescript
import { geminiService } from '@/services/geminiService';
const response = await geminiService.generate('openai', prompt);
```

### New Way
```typescript
import { generateText } from '@/services/ai/router';
const response = await generateText(prompt, 'openai'); // or just generateText(prompt)
```

## Adding a New Provider

1. **Create adapter** in `adapters/newProvider.ts`:
```typescript
export async function callNewProvider(prompt: string, model?: string): Promise<string> {
  const apiKey = getApiKey('llms', 'newprovider');
  // Call API
  return response;
}
```

2. **Add to router** in `textRouter.ts`:
```typescript
case 'newprovider':
  return await callNewProvider(prompt, model);
```

3. **Done** - Settings auto-detects new provider

## Testing

Test with a real URL:

```bash
npm run dev
# Create campaign → watch console for:
# [generateText] Using provider: openai
# [generateText] ✓ Generated text
# [generateImage] Using provider: dalle  
# [generateImage] ✓ Generated image from dalle
```

## Performance Notes

- No mocks or stubs - real API calls only
- No fallbacks between providers - errors are clear
- Video generation is optional (returns null, doesn't block)
- Adapters are minimal (no retry logic yet, but can add)

## Future Enhancements

- [ ] Streaming for text generation
- [ ] Retry logic with exponential backoff
- [ ] Token counting for LLMs
- [ ] Image upscaling/refinement
- [ ] Video polling (some providers use async jobs)
- [ ] Cost tracking per provider
