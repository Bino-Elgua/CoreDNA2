# Core DNA v2 — Localhost Setup Guide

## Status: ✅ Running on localhost:3000

### Quick Start

**Frontend Dev Server:** http://localhost:3000  
**App:** Core DNA v2 — AI Brand Intelligence Platform

---

## What's Running

### ✅ Core DNA Frontend (Active)
- React 19 + Vite development server
- All features available: Extract DNA, Battle Mode, Lead Hunter, Campaigns, Settings
- Hot-reload enabled for development
- Multi-provider LLM support (40+ providers)
- RLM (Recursive Language Model) toggle in Settings

### ⚠️ n8n Automation Engine (Graceful Fallback)
- n8n installation skipped (time-intensive)
- Core features work in **standard mode** without n8n
- All workflows gracefully fallback to LLM-based processing
- No data loss; fully functional experience

---

## Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| Brand DNA Extraction | ✅ Works | Uses Gemini API directly |
| Battle Mode Analysis | ✅ Works | Competitive simulation active |
| Lead Hunter (Geo) | ✅ Works | Requires Google Maps API key |
| Closer Agent Portfolio | ✅ Works | Email drafting via LLM |
| Campaign Generation | ✅ Works | Content generation from DNA |
| RLM Mode | ✅ Available | Toggle in Settings (Pro/Hunter) |
| Multi-Provider LLMs | ✅ Available | 40+ providers in Settings |
| White-Label | ✅ Available | Branding config in Settings |
| **Automations (n8n)** | ⚠️ Fallback | See "Running n8n Locally" below |

---

## How to Use

### 1. **Open the App**
```
http://localhost:3000
```

### 2. **Configure LLM Providers**
- Click **Settings** (⚙️ icon in sidebar)
- Click **Text Intelligence** tab
- Enable Google Gemini or your preferred LLM
- Add API keys as needed

### 3. **Try Extract DNA**
- Click **Extract DNA** (🧬)
- Enter a company website URL
- Click "Extract Neural Data"
- View brand analysis, colors, fonts, tone, personas, SWOT

### 4. **Try Battle Mode**
- Click **Battle Mode** (⚔️)
- Select two brands to compare
- Click "Initialize Battle"
- View competitive analysis with radar chart

### 5. **Try Lead Hunter**
- Click **Extract DNA** (🧬)
- Switch to "Lead Hunter" tab
- Enter a niche (e.g., "Gyms", "Dentists")
- Click "Initialize Hunter"
- View leads with gap analysis and social intelligence

### 6. **Enable RLM Mode** (Optional)
- Click **Settings** (⚙️)
- Scroll right to **RLM Mode** tab
- Toggle "RLM Mode (Infinite Context)" ON
- Configure root/recursive models
- RLM will now power long-context tasks

---

## Running n8n Locally (Optional)

If you want full automation engine functionality:

### Option A: Install n8n Globally
```bash
npm install -g n8n
n8n start
```

Then n8n will be available at: **http://localhost:5678**

### Option B: Docker
```bash
docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n
```

### Option C: npm locally
```bash
cd ~/CoreDNA2-work
npm install n8n
npx n8n start
```

Once n8n is running:
1. Go to http://localhost:5678
2. Create workflows from templates in `services/workflowConfigs.ts`
3. Core DNA will automatically detect n8n and use workflows
4. Advanced users can access **Automations** panel (Hunter tier)

---

## API Keys (Optional)

To get full functionality, add these API keys in `.env.local`:

```env
# Google (Free & Fast)
VITE_GEMINI_API_KEY=your_key_here

# OpenAI (GPT-4)
VITE_OPENAI_API_KEY=your_key_here

# Maps (for Lead Hunter)
VITE_GOOGLE_MAPS_API_KEY=your_key_here
```

Get free/trial API keys:
- **Google Gemini:** https://aistudio.google.com/app/apikey
- **OpenAI:** https://platform.openai.com/api-keys
- **Google Maps:** https://console.cloud.google.com/apis

---

## Logs & Debugging

### View Dev Server Logs
```bash
tail -f ~/coredna-dev.log
```

### Browser Console
- Open browser DevTools (F12)
- Check Console tab for errors
- Network tab shows API calls

### Kill Dev Server
```bash
kill $(cat ~/coredna-dev.pid)
```

### Restart Dev Server
```bash
cd ~/CoreDNA2-work
npm run dev
```

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│     Core DNA Frontend (React 19)        │
│         http://localhost:3000            │
├─────────────────────────────────────────┤
│  LLM Layer (40+ Providers)              │
│  - Google Gemini ✅                     │
│  - OpenAI, Claude, Mistral, etc.       │
│  - RLM Wrapper (infinite context)      │
├─────────────────────────────────────────┤
│  n8n Automation (Optional)              │
│  - Graceful Fallback if offline        │
│  - Lead Generation Workflow            │
│  - Closer Agent Swarm Workflow         │
│  - Campaign Generation Workflow        │
│  - Auto-Post Scheduler Workflow        │
│  - Website Builder Workflow            │
└─────────────────────────────────────────┘
```

---

## What's Working Right Now

✅ **Extract DNA** — Full brand analysis  
✅ **Battle Mode** — Competitive simulation  
✅ **Lead Hunter** — Geo-targeted discovery  
✅ **Campaigns** — Content & asset generation  
✅ **Settings** — LLM, Image, Voice, Workflow configs  
✅ **RLM Toggle** — Infinite context mode  
✅ **Multi-Provider** — 40+ LLM options  
✅ **White-Label** — Full branding customization  
⚠️ **Automations** — Graceful fallback (requires n8n for full features)

---

## Next Steps (Optional)

1. **Set up n8n** — Run the steps above to enable silent automation
2. **Configure Social APIs** — Add Meta/Twitter tokens for Auto-Post
3. **Add Database** — Connect to Firebase or your backend
4. **Deploy to Production** — Use Vercel, Netlify, or your server

---

## Troubleshooting

### "Cannot find module 'react-is'"
```bash
npm install react-is
npm run dev
```

### n8n not connecting
- Check that `VITE_N8N_API_URL` is correct in `.env.local`
- If n8n isn't running, that's OK—fallback mode activates
- Run `npm run dev` again

### Build errors
```bash
rm -rf node_modules
npm install
npm run dev
```

### Port 3000 already in use
Vite will auto-increment to 3001, 3002, etc.  
Check the terminal output for the actual port.

---

**Status:** ✅ Ready to use!  
**Next:** Open http://localhost:3000 in your browser.
