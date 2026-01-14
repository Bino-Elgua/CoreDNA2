# Supabase Edge Functions Setup

This project uses Supabase Edge Functions to proxy API calls from the frontend to provider APIs. This solves CORS issues and keeps API keys secure.

## Setup Steps

### 1. Install Supabase CLI
```bash
npm install -g supabase
```

### 2. Initialize Supabase (if not already done)
```bash
supabase init
```

### 3. Link to your Supabase project
```bash
supabase link --project-ref your-project-ref
```

Get your project ref from [app.supabase.com](https://app.supabase.com)

### 4. Configure environment variables

Create `.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Create `.env.supabase`:
```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-...
GOOGLE_API_KEY=...
GROQ_API_KEY=...
DEEPSEEK_API_KEY=...
MISTRAL_API_KEY=...
ELEVENLABS_API_KEY=...
# ... add all provider keys
```

### 5. Deploy Edge Functions
```bash
# Deploy all functions
supabase functions deploy llm
supabase functions deploy image
supabase functions deploy voice
supabase functions deploy video
```

Or deploy all at once:
```bash
supabase functions deploy
```

### 6. Set secrets in production
```bash
supabase secrets set --env-file .env.supabase
```

### 7. Test locally
```bash
supabase start
npm run dev
```

Visit `http://localhost:3000` and test the API calls.

## File Structure

```
supabase/
├── config.json                 # Project config
├── functions/
│   ├── llm/index.ts           # LLM calls (OpenAI, Claude, Groq, etc)
│   ├── image/index.ts         # Image generation (DALL-E, Flux, SD3, etc)
│   ├── voice/index.ts         # TTS (ElevenLabs, PlayHT, Google, etc)
│   └── video/index.ts         # Video generation (Runway, Luma, etc)
└── migrations/
```

## How It Works

1. **Frontend** → calls `callEdgeFunction('llm', { provider, model, messages })`
2. **Supabase Client** → invokes `/functions/llm` via HTTP
3. **Edge Function** → routes to correct provider API with API key
4. **Provider API** → returns response
5. **Edge Function** → returns response to frontend
6. **Frontend** → displays result

## Adding a New Provider

Edit the relevant edge function and add a case:

```typescript
// supabase/functions/llm/index.ts
switch (provider.toLowerCase()) {
  case "newprovider":
    response = await callNewProvider(apiKey, model, messages, temperature, maxTokens);
    break;
}

async function callNewProvider(...) {
  const response = await fetch("https://api.newprovider.com/chat", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ /* ... */ })
  });
  // ... handle response
}
```

## Troubleshooting

### Functions not deploying
```bash
supabase functions deploy --no-verify-jwt
```

### CORS errors in browser
Make sure each edge function returns proper CORS headers:
```typescript
"Access-Control-Allow-Origin": "*"
"Access-Control-Allow-Methods": "POST, OPTIONS"
"Access-Control-Allow-Headers": "Content-Type"
```

### 401 Unauthorized (API key not found)
Check that secrets are set:
```bash
supabase secrets list
```

### Timeout errors
Some providers (like video generation) are slow. Increase function timeout in `supabase/config.json` or handle polling client-side.

## Security Notes

- API keys stored in Supabase secrets, never exposed to frontend
- Edge functions have default rate limiting
- Enable Row Level Security (RLS) for database tables
- Use JWT verification for authenticated endpoints

## Cost Considerations

- Supabase has generous free tier (500K invocations/month)
- Each AI provider call = 1-10 invocations depending on complexity
- For high volume, consider Supabase Pro ($25/month)
