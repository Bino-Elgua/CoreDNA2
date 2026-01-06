<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Core DNA v2 — AI Brand Intelligence Platform

Comprehensive AI-powered brand analysis, competitive intelligence, and sales acceleration platform with **Recursive Language Model (RLM)** support for infinite context processing.

**Live Demo:** https://ai.studio/apps/drive/1oK7GGLdvV3E15WgVsDL3I3M486CfJT2u

## Features

### Core Intelligence
- **Brand DNA Extraction** — Analyze websites and extract complete brand identity (mission, tone, visual DNA, personas)
- **Competitive Battle Mode** — Head-to-head strategic simulation with radar analytics and gap analysis
- **Lead Hunter** — Geo-targeted business discovery with gap analysis and social intelligence
- **Closer Agent** — AI-driven sales strategy with personalized outreach sequences, portfolio generation, and tiered pricing

### RLM (Recursive Language Model) — Pro/Hunter Only
Process unlimited context for:
- **Full Website Crawls** — Extract entire website content without token limits
- **Deep Competitive Analysis** — Analyze multiple competitors across unlimited dimensions
- **Extended Conversation History** — Maintain full context in multi-turn Closer Agent sequences
- **Unbounded Context Processing** — Handle complex, multi-step analyses that exceed standard context windows

Enable RLM in **Settings → RLM Mode** and configure:
- **Root Model** — Primary model for root-level analysis (e.g., Google Gemini)
- **Recursive Model** — Model for sub-task decomposition (e.g., OpenAI GPT-4)
- **Max Recursion Depth** — Number of recursion levels (1-10)
- **Context Window** — Max tokens per request (50k-1M)

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set LLM API keys in [.env.local](.env.local):
   ```
   GEMINI_API_KEY=your_gemini_key
   OPENAI_API_KEY=your_openai_key
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173 in your browser

## Multi-Provider LLM Support

Seamlessly switch between 40+ LLM providers:
- **Fast & Free:** Google Gemini, Groq, Ollama
- **Advanced:** OpenAI (GPT-4), Claude 3.5, Mistral
- **Specialized:** DeepSeek, Grok (xAI), Qwen, LLaMA 3
- **High-Performance:** SambaNova, Cerebras, Hyperbolic
- **Local:** Ollama, Custom OpenAI-compatible endpoints

## Architecture

| Component | Technology |
|-----------|------------|
| **Frontend** | React 19 + Vite + TypeScript + Tailwind CSS |
| **State Management** | React Context + LocalStorage |
| **AI Integration** | 40+ LLM providers + RLM wrapper |
| **Visualization** | Recharts (radar, bar charts) |
| **Animation** | Framer Motion |

## Tier-Based Access

| Feature | Free | Pro | Hunter |
|---------|------|-----|--------|
| Brand DNA Extraction | ✓ | ✓ | ✓ |
| Battle Mode | ✓ | ✓ | ✓ |
| Lead Hunter | Limited | ✓ | ✓ |
| Closer Agent | ✗ | ✓ | ✓ |
| **RLM Mode** | ✗ | **✓** | **✓** |
| Multi-Provider LLMs | 3 | Unlimited | Unlimited |
| White-Label | ✗ | ✓ | ✓ |

## API Endpoints (Backend Required)

For production, implement these endpoints:

```typescript
POST /api/rlm — RLM task processing
POST /api/extract-dna — Full brand analysis
POST /api/battle — Competitive simulation
POST /api/closer — Sales strategy generation
POST /api/leads — Geo-targeted discovery
```

## File Structure

```
src/
├── pages/              # Main app pages (Extract, Battle, Settings, etc.)
├── components/         # Reusable UI components
├── services/
│   ├── geminiService.ts    # LLM integration
│   └── rlmService.ts       # RLM wrapper for infinite context
├── contexts/           # React Context
├── hooks/              # Custom hooks
├── types.ts            # TypeScript interfaces
└── constants.ts        # Config & defaults
```

## No Breaking Changes

RLM is a **non-breaking enhancement**:
- All existing features work without RLM enabled
- Graceful fallback to standard LLM when RLM is disabled
- Settings-driven activation (Pro/Hunter tiers only)
- Independent of multi-provider support

---

Built for agencies, consultants, and sales teams who need deep brand and market intelligence at scale.
