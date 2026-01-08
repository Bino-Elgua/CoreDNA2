# Architecture Overview

**High-level system design for CoreDNA platform.**

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Client Browser                         │
│         (React 19 + TypeScript + Tailwind CSS)          │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS
                       │
                       ↓
┌─────────────────────────────────────────────────────────┐
│               Vercel Edge Network                       │
│      (Static hosting + CDN + Edge functions)            │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
┌──────────────┐ ┌─────────────┐ ┌──────────────┐
│  Supabase    │ │    n8n      │ │  70+ APIs    │
│  (Database)  │ │  (Workflows)│ │ (AI Providers)
│              │ │             │ │              │
└──────────────┘ └─────────────┘ └──────────────┘
```

---

## Technology Stack

### Frontend

- **React 19** — UI framework
- **TypeScript** — Type safety
- **Vite** — Build tool
- **Tailwind CSS** — Styling
- **Framer Motion** — Animations
- **Recharts** — Data visualization

### Backend

- **Supabase** — PostgreSQL database + Auth + RLS
- **n8n** — Workflow automation engine
- **70+ providers** — Multi-provider support

### AI Integration

- **RLM** — Recursive Language Model for infinite context
- **4 optimization techniques** — Inference Engine
- **70+ providers** — Multi-provider support

### Deployment

- **Vercel** — Hosting + edge functions

---

## Security Architecture

### Authentication

- Supabase Auth (magic link + OAuth)
- JWT tokens for API requests
- Row-level security (RLS) on all tables

### Data Isolation

- Each user can only access their own data
- RLS policies enforce `user_id = auth.uid()`
- Team data isolated by `team_id`

### API Key Management

- User API keys stored in localStorage (BYOK)
- CoreDNA keys stored in Vercel env vars
- Never exposed in client bundle

---

## Data Flow

### Brand DNA Extraction

1. User enters URL in ExtractPage
2. Frontend calls geminiService.extract()
3. Service fetches website content
4. AI analyzes content (Gemini/GPT-4)
5. Structured data returned to frontend
6. Data saved to Supabase (brands table)
7. UI displays results

### Tier Enforcement

1. User attempts action (e.g., extraction)
2. tierService.checkLimit() queries Supabase
3. Check user's tier + current month usage
4. If limit reached → show upgrade modal
5. If allowed → increment usage counter
6. Proceed with action

---

## Deployment Architecture

### Environments

- **Development** — localhost:5173
- **Staging** — staging.coredna.ai (Vercel preview)
- **Production** — app.coredna.ai (Vercel production)

### CI/CD Pipeline

1. Push to GitHub
2. Vercel automatically builds
3. Run tests (when implemented)
4. Deploy to preview URL
5. Manual promotion to production

Production deploys via CI/CD only. Requires approval.

### Deploy to Production

```bash
npm run build

# Manual deploys require approval
vercel deploy --prod  # Requires access token
```

---

## Monitoring & Observability

- **Uptime:** status.coredna.ai (Uptime Robot)
- **Errors:** Sentry (error tracking)
- **Analytics:** PostHog (product analytics)
- **Logs:** Vercel logs + Supabase logs

---

## Database Schema (High-Level)

Key tables:

- `users` — User profiles and settings
- `teams` — Team management
- `brands` — Brand DNA extraction results
- `usage` — Monthly usage tracking for tier enforcement
- `subscriptions` — User subscription tiers

All tables use RLS for data isolation.

---

## API Integration Points

### Supabase

- Real-time database updates
- Authentication
- Row-level security enforcement
- File storage (if applicable)

### n8n

- Workflow automation
- Multi-step processes
- Integration orchestration

### AI Providers

- Gemini API
- OpenAI API
- Other LLM providers via abstraction layer

---

## Scalability Considerations

- Vercel auto-scales with traffic
- Supabase handles concurrent connections
- Edge functions for low-latency operations
- CDN caches static assets globally
- Database indexes optimize query performance

---

## Future Enhancements

- Enhanced caching strategies
- Service workers for offline support
- Progressive Web App (PWA) capabilities
- Real-time collaboration features
- Advanced analytics dashboard

---

## Documentation Links

- [Development Guide](./DEVELOPMENT.md)
- [Security Protocols](./SECURITY.md)
- Full API Reference: https://api.coredna.ai/docs
