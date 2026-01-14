# BYOK Quick Reference Guide

## Using GeminiService in Your Code

```typescript
import { geminiService } from '../services/geminiService';

// Generate content with any provider
const response = await geminiService.generate('openai', 'Your prompt here', {
  temperature: 0.7,
  maxTokens: 2048,
  model: 'gpt-4o' // optional, uses default if not specified
});

// Check if provider is configured
if (geminiService.hasProvider('claude')) {
  // Use Claude
}

// Get list of all configured providers
const providers = geminiService.getConfiguredProviders();
console.log('Available:', providers); // ['gemini', 'openai', 'claude']
```

## Provider Routing Examples

```typescript
// LLM Providers
await geminiService.generate('gemini', prompt);  // Google Gemini
await geminiService.generate('openai', prompt);  // OpenAI
await geminiService.generate('claude', prompt);  // Anthropic Claude
await geminiService.generate('groq', prompt);    // Groq (free)
await geminiService.generate('ollama', prompt);  // Local Ollama

// Image Generators
await geminiService.generate('dalle', 'Fluffy cat', { type: 'image' });
await geminiService.generate('stability', 'Mountain landscape');

// Voice/TTS
await geminiService.generate('elevenlabs', 'Hello world', { type: 'voice' });

// Automation (webhooks)
await geminiService.generate('n8n', { action: 'trigger', data: {...} });
```

## LocalStorage Keys Format

```json
// localStorage['apiKeys']
{
  "gemini": "AIza...",
  "openai": "sk-...",
  "claude": "sk-ant-...",
  "elevenlabs": "...",
  "n8n": "https://n8n.example.com/webhook/..."
}

// Control flags
localStorage['apiPromptDismissed'] = 'true'
```

## UI Integration

### Show API Key Prompt (First-Run)
Already integrated in App.tsx, shows automatically if:
- No keys configured in localStorage
- User hasn't dismissed it yet

### Add Settings Tab for Keys
Already added to SettingsPage.tsx:
```
Settings → API Keys (BYOK) 🔑
```

### Using in Components
```tsx
import { ApiKeysSection } from '../components/ApiKeysSection';

// Just render the component
export function MySettings() {
  return (
    <div>
      <h1>Manage Your API Keys</h1>
      <ApiKeysSection />
    </div>
  );
}
```

## Error Handling

```typescript
try {
  const result = await geminiService.generate('openai', prompt);
} catch (error) {
  // Errors include:
  // - "Provider openai not configured" → User hasn't added key
  // - "openai API error: invalid_api_key" → Key is invalid
  // - Network errors from actual provider
  
  if (error.message.includes('not configured')) {
    // Redirect to settings
    window.location.href = '/settings?tab=api-keys';
  }
}
```

## Developer Checklist

- [ ] Import `{ geminiService }` from services
- [ ] Call `geminiService.generate(provider, prompt, options)`
- [ ] Handle errors gracefully
- [ ] Check `hasProvider()` before using in UI
- [ ] Consider fallback to recommended provider (Gemini)
- [ ] Add loader state while waiting for response
- [ ] Toast notifications for success/error

## Common Patterns

### Detect Available Providers
```typescript
const llmOptions = [
  { label: 'OpenAI', value: 'openai', available: geminiService.hasProvider('openai') },
  { label: 'Claude', value: 'claude', available: geminiService.hasProvider('claude') },
  { label: 'Gemini', value: 'gemini', available: geminiService.hasProvider('gemini') }
];

// Filter to show only configured
const available = llmOptions.filter(o => o.available);
```

### Fallback Chain
```typescript
const providers = ['openai', 'claude', 'gemini'];
let provider;

for (const p of providers) {
  if (geminiService.hasProvider(p)) {
    provider = p;
    break;
  }
}

if (provider) {
  const result = await geminiService.generate(provider, prompt);
} else {
  // No providers configured, show error
}
```

### With Loading State
```tsx
const [loading, setLoading] = useState(false);

const handleGenerate = async () => {
  setLoading(true);
  try {
    const result = await geminiService.generate('openai', prompt);
    setResult(result);
  } catch (error) {
    toastService.showToast(error.message, 'error');
  } finally {
    setLoading(false);
  }
};
```

## Security Reminders

✅ **Safe**: Reading from localStorage
✅ **Safe**: Passing keys to geminiService
✅ **Safe**: Keys auto-deleted if user clears
❌ **Unsafe**: Logging keys to console
❌ **Unsafe**: Sending keys to backend
❌ **Unsafe**: Storing in .env files

## Provider IDs Quick Lookup

**LLM**: `gemini`, `openai`, `claude`, `mistral`, `xai`, `deepseek`, `groq`, `qwen`, `cohere`, `perplexity`, `ollama`, `together`, `openrouter`

**Image**: `dalle`, `stability`, `imagen`, `fal`, `midjourney`, `leonardo`, `replicate`

**Voice**: `elevenlabs`, `playht`, `openai_tts`, `cartesia`, `deepgram`, `polly`

**Automation**: `n8n`, `zapier`, `make`, `activepieces`, `pipedream`, `relay`

## Debugging

Enable debug logging in browser console:
```javascript
// Check stored keys
JSON.parse(localStorage.getItem('apiKeys'))

// Check if prompt was dismissed
localStorage.getItem('apiPromptDismissed')

// Test geminiService
const { geminiService } = await import('./services/geminiService.ts');
geminiService.getConfiguredProviders()
geminiService.hasProvider('openai')
```

## Migrating Existing Code

**Before (hardcoded key):**
```typescript
const response = await fetch(OPENAI_ENDPOINT, {
  headers: { 'Authorization': `Bearer ${process.env.OPENAI_KEY}` }
});
```

**After (BYOK):**
```typescript
const response = await geminiService.generate('openai', prompt);
```

That's it! GeminiService handles everything internally.
