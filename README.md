# CoreDNA2 - Brand AI Marketing Platform

## Quick Start

```bash
npm install
npm run dev
```

Server runs on **http://localhost:3000**

---

## Features

- **Brand DNA Extraction** - Analyze any website, extract brand identity (colors, fonts, tone, messaging)
- **Campaign Generation** - Create multi-channel marketing assets (social, email, ads, videos)
- **Lead Hunter** - Find local businesses + auto-generate sales copy
- **Site Builder** - Generate full websites from brand DNA
- **Advanced Inference** - Speculative decoding, self-consistency, skeleton of thought
- **RLM** - Recursive language model for deep analysis
- **70+ AI Providers** - BYOK (Bring Your Own Keys) model for LLM, image, video, voice

---

## Architecture

```
App.tsx (Error Boundary + Auth)
  ├─ Pages (14 main pages: Dashboard, Extract, Campaigns, etc.)
  ├─ Services (40+ AI services: LLM routing, image gen, scraping, etc.)
  ├─ Components (Reusable UI components)
  └─ Types (TypeScript interfaces)
```

**Data Flow**:
```
User Input → Service Layer → Provider APIs → Results → localStorage
```

---

## Configuration

### API Keys (Required)

Go to **Settings** page to add API keys:
- **LLM** (50+): OpenAI, Claude, Gemini, Mistral, Groq, DeepSeek, etc.
- **Image** (20+): DALL-E, Stability, Flux, Midjourney, Leonardo, etc.
- **Video** (20+): Sora, Runway, Kling, Luma, HeyGen, etc.
- **Voice** (15+): ElevenLabs, PlayHT, OpenAI TTS, etc.
- **Workflows** (10+): N8N, Zapier, Make, LangChain, etc.

Keys stored **locally only** (never sent to CoreDNA servers).

### Environment Variables

Optional (in `.env.local`):
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_OLLAMA_ENDPOINT=http://localhost:11434
```

---

## Key Files

### Pages
- **ExtractPage** - Brand DNA extraction + lead hunting
- **CampaignsPage** - Campaign asset generation
- **DashboardPage** - Overview + analytics
- **SettingsPage** - API key configuration
- **SiteBuilderPage** - Website generation
- **BattleModePage** - A/B testing brands
- **AgentForgePage** - Custom AI agents
- **SonicLabPage** - Audio branding
- **SchedulerPage** - Campaign scheduling

### Core Services
- **geminiService.ts** - LLM provider routing
- **enhancedExtractionService.ts** - Brand DNA extraction
- **mediaGenerationService.ts** - Image/video generation
- **rlmService.ts** - Recursive language model
- **settingsService.ts** - Configuration management
- **workflowService.ts** - N8N/Zapier integration

### Infrastructure
- **contexts/AuthContext.tsx** - User authentication
- **services/ai/router.ts** - AI provider routing
- **services/supabaseClient.ts** - Supabase integration

---

## Deployment

### Build
```bash
npm run build
```

Outputs to `dist/` directory.

### Preview
```bash
npm run preview
```

### Deploy Options
- **Vercel**: Push to GitHub, auto-deploy
- **Firebase**: `firebase deploy`
- **Netlify**: Connect GitHub, auto-deploy

---

## Development

### Add New Provider

1. Add to `types.ts` (LLMProviderId, ImageProviderId, etc.)
2. Add endpoint config in service (geminiService.ts, etc.)
3. Implement adapter in `services/ai/adapters/`
4. Update provider list in SettingsPage

### Add New Page

1. Create `pages/MyPage.tsx`
2. Import in `App.tsx` with React.lazy()
3. Add route in Router
4. Add to navigation menu

### Modify Brand DNA

Edit `types.ts` BrandDNA interface, then update:
- `services/geminiService.ts` (LLM prompt)
- `pages/ExtractPage.tsx` (display)
- `pages/CampaignsPage.tsx` (usage)

---

## Data Storage

### localStorage Keys
- `core_dna_user` - User profile
- `core_dna_settings` - API keys + config
- `core_dna_profiles` - Extracted brand profiles
- `SavedCampaigns` - Generated campaigns

### Supabase (Optional)
- `user_settings` table - Sync across devices

### Auto-Cleanup
- If quota exceeded, auto-clears old profiles
- Preserves settings and recent data

---

## Tier System

| Tier | Features |
|------|----------|
| Free | 1 extraction/month, basic generation |
| Pro | 10 extractions/month, image gen |
| Hunter | Unlimited, RLM, advanced inference, lead hunter |
| Agency | Everything + white-label + team mgmt |

**Demo user**: Agency tier (full access for testing)

---

## Troubleshooting

### "No API key configured"
→ Go to Settings, add LLM + image provider keys

### "Website scraping failed"
→ App falls back to LLM-only analysis (no scraping needed)

### "Video generation timeout"
→ Normal for slow providers (Sora, Runway)
→ Asset marked "pending", check later

### "Settings not saving"
→ Check browser localStorage quota
→ Check browser console for errors

---

## Performance Notes

- **DNA Extraction**: 5-30s (depends on website size + LLM)
- **Campaign Generation**: 10-60s (depends on asset count + providers)
- **Image Generation**: 10-60s per image (depends on provider)
- **Video Generation**: 30s-5min per video (depends on provider)

**Optimization Tips**:
- Use Speculative Decoding (2-3x faster LLM)
- Use Hive Mode for parallel asset generation
- Use local LLM (Ollama) for fast iterations
- Configure faster providers (Groq, DeepSeek)

---

## Files Structure

```
CoreDNA2-work/
├─ src/                      # Aliases: $lib/ = src/lib/
│  ├─ components/            # Reusable UI components
│  ├─ hooks/                 # Custom React hooks
│  ├─ lib/                   # Utilities, helpers
│  ├─ pages/                 # Page components
│  ├─ services/              # Business logic
│  └─ types/                 # TypeScript types
├─ pages/                    # Root level pages (Vite)
├─ services/                 # Root level services
├─ components/               # Root level components
├─ contexts/                 # Context providers
├─ hooks/                    # Root level hooks
├─ docs/                     # Documentation
│  ├─ archived/              # Old implementation docs
│  ├─ internal/              # Internal docs
│  └─ legal/                 # Legal/privacy docs
├─ App.tsx                   # Root component
├─ index.tsx                 # Entry point
├─ types.ts                  # Global types
├─ constants.ts              # Global constants
├─ package.json              # Dependencies
├─ vite.config.ts            # Vite config
├─ tsconfig.json             # TypeScript config
├─ tailwind.config.js        # Tailwind CSS config
├─ postcss.config.js         # PostCSS config
├─ svelte.config.js          # Vite plugin config
└─ .gitignore                # Git ignore rules
```

---

## Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS + CSS Variables
- **State**: React Context + localStorage
- **Database**: Supabase (optional)
- **AI**: 70+ providers (BYOK)
- **Build**: Vite
- **Language**: TypeScript (strict mode)

---

## Browser Support

- Chrome/Edge: Latest
- Firefox: Latest
- Safari: Latest
- Mobile: Full support (responsive)

---

## Security

- ✅ API keys stored locally only (never sent to CoreDNA backend)
- ✅ Requests go directly to provider APIs
- ✅ No tracking or analytics
- ✅ User data stays on device

---

## Contributing

See `docs/DEVELOPMENT.md` for contribution guidelines.

---

## License

Proprietary - See `docs/legal/` for details.

---

## Support

- **Documentation**: See `docs/` folder
- **Issues**: GitHub Issues
- **Email**: support@coredna.ai

---

## Roadmap

- [ ] Add test suite
- [ ] Improve CORS handling
- [ ] Add backend API
- [ ] Expand accessibility
- [ ] Team collaboration features
- [ ] Advanced analytics
- [ ] Custom integrations
- [ ] Mobile app

---

**Last Updated**: January 14, 2025
**Version**: 1.0.0
**Status**: Production Ready ✅
