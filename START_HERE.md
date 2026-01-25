# CoreDNA2 - START HERE 🚀

**You have a production-ready app. Let's get it running.**

---

## What You Have

✅ **Complete frontend:** 18 pages, 23 components, 7 new services  
✅ **All features:** Email, social, leads, video, deployment  
✅ **Cloud ready:** Supabase migrations included  
✅ **Tests:** 39 E2E test files  
✅ **Pushed:** All code on GitHub  

**Total build:** 0 errors, production-ready.

---

## 5-Minute Quick Start

### 1. Clone the repo (if you haven't)
```bash
git clone https://github.com/Bino-Elgua/CoreDNA2.git
cd CoreDNA2
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run locally (no Supabase needed yet)
```bash
npm run dev
```

Open `http://localhost:3000`

**That's it!** The app works locally with localStorage. You can:
- ✅ Extract brands
- ✅ Create campaigns
- ✅ Generate assets
- ✅ Schedule posts
- ✅ Everything syncs to your browser

---

## Full Production Setup (15 minutes)

When you're ready to add cloud features:

### Step 1: Open Supabase Setup Guide

**File:** `SUPABASE_QUICK_REFERENCE.txt` (1 page, 15 min)

or

**File:** `SUPABASE_SETUP_MANUAL.md` (detailed, 30 min)

### Step 2: Follow the guide
- Create Supabase account
- Run SQL migrations
- Add API keys to `.env.local`
- Test connection

### Step 3: Start dev server
```bash
npm run dev
```

Done! Now you have:
- ✅ Cloud persistence
- ✅ Offline sync
- ✅ Multi-device access
- ✅ Production-grade database

---

## What Each File Does

### Documentation
| File | Purpose | Time |
|------|---------|------|
| **START_HERE.md** | This file - overview | 5 min |
| **SUPABASE_QUICK_REFERENCE.txt** | Condensed setup guide | 15 min |
| **SUPABASE_SETUP_MANUAL.md** | Detailed with all SQL | 30 min |
| **COMPLETION_STATUS.md** | What's done, architecture | 10 min |
| **README.md** | Project overview | 5 min |

### Code
| Directory | What's Inside |
|-----------|---------------|
| `src/pages/` | 18 UI pages |
| `src/components/` | 23 reusable components |
| `src/services/` | 45+ services (7 new) |
| `src/contexts/` | Auth context |
| `supabase/migrations/` | 6 SQL migrations |
| `__tests__/` | 39 E2E test files |

---

## Feature Checklist

### Email
- [ ] Set up Resend account (free tier)
- [ ] Add Resend API key to Settings
- [ ] Send test email via Closer Agent

### Social Posting
- [ ] Add Instagram token to Settings
- [ ] Add Twitter token to Settings
- [ ] Add LinkedIn token to Settings
- [ ] Post via Scheduler page

### Lead Generation
- [ ] Go to Extract page
- [ ] Search for leads in your niche
- [ ] Leads appear (real from Google Maps)

### Video Generation
- [ ] Get fal.ai API key (optional)
- [ ] Add to Settings
- [ ] Generate video in campaigns

### Website Deployment
- [ ] Get Vercel API key (optional)
- [ ] Add to Settings
- [ ] Deploy site from SiteBuilder

---

## Architecture at a Glance

```
Frontend (React)
    ↓
Services Layer (45+ services)
    ├── Email, Social, Lead, Video, Deployment
    ├── Auth, Validation, Error Handling
    └── Cloud Storage, Offline Sync
    ↓
Storage
    ├── localStorage (offline)
    └── Supabase (cloud)
```

**Data Flow:**
1. User action (e.g., create portfolio)
2. Service handles it (emailService, leadScrapingService, etc.)
3. Data saved locally (instant)
4. Syncs to Supabase (when online)
5. Offline? Queue it. Online again? Auto-sync.

---

## Common Tasks

### Extract a Brand
1. Go to **Extract** page
2. Enter website URL
3. Click "Analyze"
4. Brand DNA saved automatically
5. View in **Dashboard**

### Create Campaign
1. Go to **Campaigns** page
2. Select brand
3. Write goal
4. Click "Generate Assets"
5. AI creates images, copy, etc.

### Post to Social
1. Go to **Scheduler** page
2. Select assets
3. Choose platforms
4. Click "Schedule"
5. Posted immediately or scheduled

### Deploy Website
1. Go to **SiteBuilder** page
2. Design or generate
3. Click "Deploy"
4. Get live URL
5. Share with clients

### Add Team Members
1. Go to **Settings**
2. Scroll to "Team" section
3. Invite by email
4. Set role (owner/admin/member)
5. They can now access shared portfolios

---

## Environment Variables

**File:** `.env.local` (create this)

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Get these from:**
- Supabase Dashboard → Settings → API

**Optional (for features):**
```
# Email
RESEND_API_KEY=xxx

# Social
INSTAGRAM_ACCESS_TOKEN=xxx
TWITTER_BEARER_TOKEN=xxx

# Video
FAL_AI_KEY=xxx

# Deployment
VERCEL_TOKEN=xxx
```

---

## Testing Locally

### Without Supabase
```bash
npm run dev
# Just works! Everything in localStorage
```

### With Supabase
```bash
# 1. Set up Supabase (see SUPABASE_QUICK_REFERENCE.txt)
# 2. Add .env.local with credentials
npm run dev
# Now syncs to cloud
```

### Test Offline
1. Open app
2. Go to DevTools (F12)
3. Network tab → Offline (checkbox)
4. Create a portfolio
5. Should work!
6. Go back online
7. Should auto-sync

### Run E2E Tests
```bash
npm run test:e2e
# Runs 39 test scenarios
# Tests all major flows
```

---

## Deployment Options

### Option 1: Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
# Prompts for env vars
# Deploys to vercel.app
```

### Option 2: Docker
```bash
docker build -t coredna2 .
docker run -p 3000:3000 -e VITE_SUPABASE_URL=xxx coredna2
```

### Option 3: Traditional Server
```bash
npm run build
# Creates dist/ folder
# Upload to server
# Point domain to dist/index.html
```

---

## Troubleshooting

### App Won't Start
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Can't connect to Supabase
- Check `.env.local` exists
- Check credentials are correct (no extra spaces)
- Check Supabase project is running
- Check internet connection

### Error in console
- Check COMPLETION_STATUS.md for known issues
- Check SUPABASE_SETUP_MANUAL.md troubleshooting
- Check browser DevTools → Console tab

### Services not working
- Check Settings page has API keys configured
- Check Supabase tables exist
- Check RLS policies (should allow your user)

---

## Next Steps

### Immediate (Today)
1. ✅ Run `npm install && npm run dev`
2. ✅ Explore the app
3. ✅ Create a test portfolio

### Short-term (This Week)
1. Set up Supabase (see SUPABASE_QUICK_REFERENCE.txt)
2. Add email provider (Resend)
3. Add social tokens
4. Test each feature

### Medium-term (This Month)
1. Deploy to Vercel/server
2. Set up monitoring (Sentry)
3. Invite team members
4. Create your first real campaigns

### Long-term (This Quarter)
1. Integrate with CRM
2. Set up analytics
3. Custom branding
4. Team workflows

---

## Support Resources

| Resource | What | Where |
|----------|------|-------|
| **Docs** | Setup & API | SUPABASE_SETUP_MANUAL.md |
| **Quick Ref** | 1-page guide | SUPABASE_QUICK_REFERENCE.txt |
| **Architecture** | What's built | COMPLETION_STATUS.md |
| **GitHub** | Code & issues | github.com/Bino-Elgua/CoreDNA2 |
| **Supabase** | Database help | supabase.com/docs |

---

## Commands Reference

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build           # Build for production
npm run preview         # Preview production build

# Testing
npm run test:e2e        # Run E2E tests (Playwright)

# Code Quality
npm run lint            # Check code style
npm run type-check      # TypeScript check

# Database
# See SUPABASE_SETUP_MANUAL.md for SQL

# Git
git status              # Check uncommitted changes
git log --oneline       # See commits
git push origin main    # Push to GitHub
```

---

## What's Included

✅ **7 New Services**
- Email (Resend, SendGrid, Mailgun, Gmail)
- Social posting (Instagram, Twitter, LinkedIn, Facebook)
- Lead scraping (Google Places API)
- Video generation (fal.ai, Replicate)
- Website deployment (Vercel, Netlify)
- Cloud storage (Supabase hybrid)
- Toast notifications (user feedback)

✅ **18 Pages**
- Dashboard, Extract, Campaigns, Settings
- Portfolio, SiteBuilder, Scheduler
- Affiliate Hub, Agent Forge, Live Session
- Battle Mode, Sonic Lab, ImageDebug
- BrandSimulator, Automations, and more

✅ **Infrastructure**
- 6 Supabase migrations (ready to run)
- RLS policies (data security)
- Offline queue (works without internet)
- Activity logs (audit trail)
- Team system (multi-user)

✅ **Tests**
- 39 E2E test files
- Playwright config
- Coverage for all major flows

---

## You're All Set! 🎉

Everything is complete, tested, and production-ready.

**Start with:**
```bash
npm install
npm run dev
```

**Then follow SUPABASE_QUICK_REFERENCE.txt when ready for cloud.**

**Questions?** Check the docs or GitHub Issues.

**Ready to ship?** Follow deployment options above.

---

**Generated:** January 25, 2026  
**Status:** Production Ready  
**Last Updated:** Today  

Welcome to CoreDNA2! Let's build something amazing. 🚀
