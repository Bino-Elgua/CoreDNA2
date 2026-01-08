# Development Guide

**Internal documentation for CoreDNA engineering team.**

---

## Project Structure

```
src/
├── pages/          # Main application pages
├── components/     # Reusable UI components
├── services/       # Business logic and API integrations
├── contexts/       # React contexts
├── hooks/          # Custom React hooks
├── types.ts        # TypeScript type definitions
└── constants/      # Configuration constants
```

---

## Code Style

- **Imports:** ESM only (`import`). Use `$lib/` alias for internal modules.
- **Naming:** camelCase for vars/functions, PascalCase for components/classes.
- **Types:** Full TypeScript; no `any`. Interfaces for data objects, type unions for discriminated scenarios.
- **React:** Functional components (no class components). Extract reusable logic into hooks.
- **Components:** Keep under 300 lines, follow existing patterns in codebase.
- **Errors:** Try-catch with descriptive messages. Fallback gracefully (return empty state, not throw).
- **Formatting:** Tailwind + CSS variables. Dark theme: `bg-black`, `text-white`, red accents (`text-red-500`).

---

## Development Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Commit with conventional commits: `git commit -m "feat: add feature"`
4. Push and create PR: `git push origin feature/your-feature`
5. Get 2 approvals, then merge

---

## Git Workflow

**Branch naming:**

- `feature/` — New features
- `fix/` — Bug fixes
- `hotfix/` — Critical production fixes
- `refactor/` — Code improvements
- `docs/` — Documentation only

**Commit messages:**

Follow conventional commits:

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation
- `style:` — Formatting
- `refactor:` — Code restructuring
- `test:` — Tests
- `chore:` — Maintenance

---

## Testing Locally

```bash
npm run dev         # Run dev server
npm test            # Run tests (when added)
npm run build       # Build for production
npm run preview     # Preview production build
```

---

## Common Issues

**Port already in use:**

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

**Supabase connection error:**

- Check `.env.local` has correct `VITE_SUPABASE_URL`
- Verify Supabase project is running
- Check internet connection

**Build errors:**

```bash
# Clear cache and rebuild
rm -rf node_modules dist .vite
npm install
npm run build
```

---

## Environment Variables

Required in `.env.local`:

- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase public key
- `VITE_GEMINI_API_KEY` — Google Gemini API key (optional for dev)
- `VITE_OPENAI_API_KEY` — OpenAI API key (optional for dev)

Get production keys from 1Password vault: "CoreDNA Production Keys"

---

## Architecture Overview

The application follows a layered architecture:

**Presentation Layer (React Components)**
- Pages: Route-specific components
- Components: Reusable UI elements
- Hooks: Custom logic and state management

**Business Layer (Services)**
- API clients (Supabase, AI providers)
- Domain logic and data transformations
- Authentication and authorization

**Data Layer (Supabase)**
- PostgreSQL database
- Real-time subscriptions
- Row-level security (RLS)

---

## Testing Strategy

Currently no tests defined. Use `npm run dev` + browser console for validation.

Future test structure:
- Unit tests for services and utilities
- Integration tests for API calls
- E2E tests for critical user flows

---

## Performance Guidelines

- Code split by route where possible
- Lazy load heavy components
- Memoize expensive computations
- Avoid prop drilling; use contexts when appropriate
- Use `useCallback` for event handlers passed to children
- Monitor bundle size with `npm run build`

---

## Accessibility

- Use semantic HTML elements
- Provide alt text for images
- Ensure keyboard navigation
- Maintain sufficient color contrast
- Use ARIA labels where necessary

---

## Need Help?

- **Engineering Lead:** engineering@coredna.ai
- **Slack:** `#engineering`
- **Security Issue:** security@coredna.ai
