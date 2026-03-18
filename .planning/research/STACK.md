# Stack Research

**Domain:** Gaming community website — Minecraft server network with competitive features (elo ranking, Discord auth, leaderboards, user profiles, battle replays)
**Researched:** 2026-03-18
**Confidence:** HIGH (core stack verified via official docs and multiple sources)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.x (current stable) | Full-stack React framework | App Router + RSC gives server-rendered leaderboards and profiles for free; Turbopack default makes dev fast; single repo for frontend + API routes; Vercel deployment is zero-config |
| React | 19.x | UI library | Ships with Next.js 16; React Compiler is stable in 16 and auto-memoizes components — no manual useMemo/useCallback needed |
| TypeScript | 5.x | Type safety | Non-negotiable for a codebase with elo math, DB schemas, and OAuth — catches bugs before runtime |
| Tailwind CSS | 4.x (stable since Jan 22 2025) | Utility-first styling | CSS-first config with @theme; 5x faster full builds, 100x faster incremental — critical for vibrant, custom gaming aesthetic; no config file needed |
| shadcn/ui | latest (Tailwind v4 / React 19 compatible) | Accessible component primitives | Not a component library — you own the code. Copy-paste components into the project, customize freely. Full Tailwind v4 support as of Feb 2025. Leaderboard tables, profile cards, dialogs all available |
| Auth.js (NextAuth) | v5.x (beta.25+ stable enough for prod) | Discord OAuth login | Official Auth.js Discord provider; works with Next.js 16 App Router; database adapter for persisting sessions; the only auth approach worth using for Discord-exclusive login |

### Database & ORM

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| PostgreSQL (via Neon) | PostgreSQL 17 | Primary database | Relational model is correct for elo ratings — player table, match table, junction table with FK constraints. Neon provides serverless Postgres with Vercel-native integration, free tier (100 CU-hours/month, no credit card), and branching for safe migrations |
| Drizzle ORM | 0.45.x | Type-safe database access | Schema defined in TypeScript (no .prisma file, no codegen step). Tiny bundle (~90% smaller than Prisma), no native binary = no cold start issues on Vercel serverless functions. SQL-like query builder is easy to understand. Correct choice for a Vercel + Neon deployment |
| Drizzle Kit | 0.26.x | Schema migrations | Generates and runs SQL migrations from Drizzle schema; `drizzle-kit push` for development, `drizzle-kit migrate` for production |

### Animations & UI

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Motion (formerly Framer Motion) | 12.x | Page transitions, scroll animations, hover effects | Rebranded to `motion` package; import from `motion/react` not `framer-motion`. 30M+ downloads/month. Perfect for vibrant gaming aesthetic: card entrances, leaderboard row animations, hero parallax. Works with Tailwind v4 |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| TanStack Query | v5.x | Client-side data fetching with caching | Leaderboard polling (refetch every 30s), profile data, replay list — anywhere you need stale-while-revalidate or background sync on the client side |
| Zustand | 5.x | Lightweight global state | User session UI state (open/close modals, optimistic UI updates). NOT for server data — that's TanStack Query's job |
| `elo-rating` (npm) | 2.x | Elo calculation math | Pure JS Elo implementation. Used server-side in API routes when recording a battle result. Handles K-factor, expected score, rating update |
| `next-intl` | 3.x | i18n (even for single language) | PT-BR string management keeps text out of JSX; enables future language support without refactor. Use even for PT-BR-only to maintain clean separation of copy and code |
| Zod | 3.x | Schema validation | Validate API request bodies (battle results, profile updates) before touching DB. Pairs with `drizzle-zod` for DB schema → Zod schema generation |
| `@vercel/analytics` | latest | Web analytics | Free on Vercel; zero config; shows player traffic patterns without GDPR complexity for BR audience |
| Lucide React | latest | Icon set | Consistent icon library; tree-shakeable; used natively by shadcn/ui |
| `date-fns` | 3.x | Date formatting | Format match timestamps, profile join dates in PT-BR locale (`pt-BR` locale pack included) |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint + `eslint-config-next` | Code linting | Comes preconfigured with `create-next-app`; catches React RSC anti-patterns (using hooks in server components) |
| Prettier | Code formatting | Add `prettier-plugin-tailwindcss` to auto-sort class names — essential with Tailwind v4 |
| Husky + lint-staged | Pre-commit hooks | Run ESLint + Prettier on staged files only; prevents broken code from being committed |
| `drizzle-studio` | DB GUI | `npx drizzle-kit studio` — visual DB browser during development; inspect elo ratings, match history directly |
| Vercel CLI | Local preview + deployment | `vercel dev` mirrors production Edge/Node split locally |

---

## Installation

```bash
# Scaffold
npx create-next-app@latest craftpro-site --typescript --tailwind --app --src-dir --import-alias "@/*"

# Core auth
npm install next-auth@beta

# Database
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit

# UI & animation
npm install motion
npm install lucide-react date-fns zod

# State & data fetching
npm install @tanstack/react-query zustand

# Elo calculation
npm install elo-rating

# i18n
npm install next-intl

# Analytics
npm install @vercel/analytics

# Dev tools
npm install -D prettier prettier-plugin-tailwindcss husky lint-staged
npx shadcn@latest init
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Next.js 16 | Remix v3 | If you need fine-grained loader/action control and dislike RSC mental model; smaller community for gaming sites |
| Drizzle ORM | Prisma 7 | Prisma 7 removed the Rust engine and is now pure TypeScript — viable if team prefers schema-first `.prisma` file workflow and wants richer Prisma Studio GUI |
| Neon (serverless Postgres) | Supabase | Supabase adds real-time subscriptions out of the box (useful for live leaderboard updates). Use Supabase if live score updates are priority; Neon if you want simpler infra |
| Auth.js v5 | Lucia Auth | Lucia gives more control and is lighter. Use Lucia if Auth.js v5 beta stability is a concern, but Auth.js is the standard for Discord OAuth in Next.js ecosystem |
| Tailwind CSS v4 | Tailwind CSS v3 | Use v3 only if you need an existing component library that hasn't updated yet; no reason to use v3 for a greenfield project |
| Motion v12 | GSAP | GSAP is more powerful for complex timeline animations (e.g., full cinematic sequences). Overkill for this project; Motion covers all needed cases with less setup |
| Zustand | Jotai | Use Jotai if you have many independent fine-grained atoms (e.g., a complex form builder). For this gaming site, Zustand's single-store model is simpler |
| TanStack Query v5 | SWR | SWR is simpler but has fewer features. TanStack Query's devtools and background refetch control are worth it for leaderboard polling |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Redux / Redux Toolkit | Massive boilerplate for a site that doesn't need complex global state. The gaming site needs minimal client state — user session UI, modals | Zustand for global state, TanStack Query for server state |
| `framer-motion` (old package name) | Rebranded to `motion`. The `framer-motion` package still works but is not receiving new features — all development is in `motion` | `npm install motion`, import from `motion/react` |
| `next-auth` v4 | Version 4 is not compatible with Next.js 16 App Router patterns. Uses pages-based API routes under the hood | Auth.js v5 (`next-auth@beta`), which is the official Next.js App Router compatible version |
| MongoDB | Document store is wrong for elo ratings. You need relational integrity: a match cannot reference a non-existent player; elo history needs transactional updates | PostgreSQL via Neon |
| Supabase Auth | Redundant if using Auth.js for Discord OAuth. Two auth systems creates token confusion | Auth.js v5 handles all auth; Supabase only if replacing Neon as DB layer |
| `create-react-app` / Vite (standalone SPA) | SPA means no SSR — leaderboards and profiles lose SEO, first-paint is slower, and you lose server-side elo computation | Next.js 16 App Router |
| Chakra UI / MUI | Both carry large bundle sizes and impose opinionated design systems that fight against a custom vibrant Minecraft/Pokémon aesthetic | shadcn/ui (copy-paste, zero bundle overhead from unused components) + Tailwind v4 |
| Vercel Postgres (deprecated) | Vercel migrated all Vercel Postgres to Neon Q4 2024 — Q1 2025. The product no longer exists as a separate offering | Neon directly (via Vercel Marketplace or neon.tech) |

---

## Stack Patterns by Variant

**For server-rendered leaderboard pages (elo rankings, top 10):**
- Use Next.js RSC (async Server Components) to fetch from Neon DB directly at request time
- No client JS needed for the leaderboard render itself
- Revalidate with `revalidatePath` after a battle result is recorded

**For user profile pages:**
- Hybrid: Server Component fetches initial profile data; client island handles edit form with TanStack Query mutation
- Auth.js `auth()` server-side session check for protected routes

**For the elo update flow (core competitive feature):**
- Battle result submitted via Next.js Server Action (no separate API endpoint needed)
- Server Action: validate with Zod → compute new ratings with `elo-rating` → write both players' new ratings + match record to Postgres in a single DB transaction
- Drizzle's `db.transaction()` ensures atomic elo updates — no partial writes

**For animated hero section:**
- `motion` with `useScroll` + `useTransform` for parallax on the Minecraft/Pokémon background image
- Tailwind v4 for responsive layout; Motion for entrance animations on first render

**For Discord login:**
- Auth.js v5 DiscordProvider with database adapter (Neon via Drizzle adapter)
- Fetch Discord guild membership or roles in the `signIn` callback to assign server-specific ranks/permissions

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| next@16.x | react@19.x, react-dom@19.x | React 19 ships with Next.js 16; do not mix React 18 components expecting legacy behavior |
| next-auth@beta (v5) | next@14+, next@15, next@16 | v5 minimum is Next.js 14; confirmed working on Next.js 16 |
| tailwindcss@4.x | postcss@8.x | Tailwind v4 still uses PostCSS; `postcss.config.mjs` required |
| shadcn/ui (latest) | tailwindcss@4.x, react@19.x | shadcn updated for Tailwind v4 in Feb 2025; use `npx shadcn@latest` CLI |
| drizzle-orm@0.45.x | @neondatabase/serverless | Neon's serverless driver is the recommended Drizzle driver for Vercel Functions |
| motion@12.x | react@18+, react@19 | No breaking changes from framer-motion; supports React 19 concurrent features |
| @tanstack/react-query@5.x | react@18+, react@19 | v5 supports React 19 use() hook patterns and Next.js App Router streaming |

---

## Sources

- [Next.js 16 official blog](https://nextjs.org/blog/next-16) — Turbopack stable, React Compiler, Cache Components (HIGH confidence)
- [Next.js 16.1 release](https://nextjs.org/blog/next-16-1) — latest minor version details (HIGH confidence)
- [Tailwind CSS v4.0 announcement](https://tailwindcss.com/blog/tailwindcss-v4) — stable since Jan 22 2025, CSS-first config (HIGH confidence)
- [shadcn/ui Tailwind v4 docs](https://ui.shadcn.com/docs/tailwind-v4) — React 19 + Tailwind v4 compatible (HIGH confidence)
- [Auth.js Discord provider](https://authjs.dev/getting-started/providers/discord) — official Auth.js v5 Discord integration (HIGH confidence)
- [Auth.js v5 migration guide](https://authjs.dev/getting-started/migrating-to-v5) — App Router compatibility (HIGH confidence)
- [Drizzle ORM npm](https://www.npmjs.com/package/drizzle-orm) — version 0.45.1 current (HIGH confidence)
- [Neon plans & pricing](https://neon.com/docs/introduction/plans) — free tier details verified (HIGH confidence)
- [Motion (framer-motion) npm](https://www.npmjs.com/package/framer-motion) — v12.36.0 current, `motion/react` import (HIGH confidence)
- [TanStack Query SSR docs](https://tanstack.com/query/latest/docs/framework/react/guides/ssr) — App Router + RSC patterns (HIGH confidence)
- [Drizzle vs Prisma 2026 — makerkit.dev](https://makerkit.dev/blog/tutorials/drizzle-vs-prisma) — performance comparison (MEDIUM confidence, third-party)
- [Next.js 16 InfoQ coverage](https://www.infoq.com/news/2025/12/nextjs-16-release/) — Turbopack default, proxy.ts replaces middleware (MEDIUM confidence)

---

*Stack research for: CraftPro Brasil — Minecraft server network landing page with competitive features*
*Researched: 2026-03-18*
