<div align="center">

# 🧬 CoreDNA

## Enterprise AI Brand Intelligence Platform

**Extract your brand's essence. Generate unlimited assets.**

**AI-powered brand analysis, campaign generation, and marketing automation.**

> ⚠️ **PRIVATE REPOSITORY**  
> This repository is confidential and restricted to authorized CoreDNA team members only.

</div>

---

## 🔒 Access Policy

**Authorized Personnel Only:**

- CoreDNA engineering team
- Approved contractors (under NDA)
- Executive stakeholders

**Unauthorized access is prohibited.**

If you need access: Contact engineering@coredna.ai

---

## 🚀 Platform Overview

CoreDNA is an enterprise SaaS platform for brand intelligence and sales automation.

**Live Platform:** https://app.coredna.ai  
**Documentation:** https://docs.coredna.ai  
**Status:** https://status.coredna.ai

### Core Features

- **Brand Extraction** — AI-powered brand DNA analysis from any website
- **Campaign Generation** — Automated marketing asset creation
- **Website Builder** — Instant site generation and deployment
- **Sonic Co-Pilot** — Voice-activated AI assistant (Hunter+ tier)
- **Workflow Automation** — n8n-powered automation engine
- **Team Collaboration** — Multi-user workspace management

### Technology Stack

- React 19 + TypeScript + Vite
- Supabase (PostgreSQL)
- n8n automation engine
- Web Speech API (voice recognition)
- 70+ AI provider integrations

### Subscription Tiers

- **Free** — $0 (3 extractions/month)
- **Pro** — $49/mo (Unlimited, all providers)
- **Hunter** — $149/mo (Pro + automation + Sonic Co-Pilot voice)
- **Agency** — Custom (White-label, unlimited team, advanced features)

---

## 🛠️ Development Setup

**For authorized team members only.**

### Prerequisites

- Node.js 18+
- Supabase CLI
- Valid `.env.local` (get from team lead)

### Quick Start

```bash
# 1. Clone repository
git clone git@github.com:yourusername/CoreDNA.git

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local

# 4. Start development server
npm run dev
```

**Development:** http://localhost:5173

### Environment Variables

Required in `.env.local`:

- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase public key
- `VITE_GEMINI_API_KEY` — Google Gemini API key (optional for dev)
- `VITE_OPENAI_API_KEY` — OpenAI API key (optional for dev)

Get production keys from 1Password vault: "CoreDNA Production Keys"

---

## 📚 Documentation

**Internal (Team Only):**

- [Development Guide](./docs/internal/DEVELOPMENT.md)
- [Architecture Overview](./docs/internal/ARCHITECTURE.md)
- [Security Protocols](./docs/internal/SECURITY.md)
- [Sonic Co-Pilot Setup](./README_SONIC.md) — Voice agent implementation guide

**External (Public):**

- User Documentation: https://docs.coredna.ai
- API Reference: https://api.coredna.ai/docs
- Status Page: https://status.coredna.ai

---

## 👥 Team Contacts

**Engineering:**
- Lead: engineering@coredna.ai
- DevOps: devops@coredna.ai

**Product & Support:**
- Product: product@coredna.ai
- Support: support@coredna.ai

**Slack:** `#engineering` (internal team)

**Security Issue?** Contact security@coredna.ai immediately.

---

## 📜 Legal Notice

```
Unauthorized access, use, or distribution is prohibited.

This software is proprietary and confidential.

Copyright © 2026 CoreDNA, Inc. All Rights Reserved.
```

---

## 📋 Quick Commands

```bash
npm run dev          # Run dev server
npm run build        # Production build
npm run preview      # Preview built version
npm test             # Run tests (when added)
```

---

**For licensing inquiries:** legal@coredna.ai
