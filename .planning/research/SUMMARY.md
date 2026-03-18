# Project Research Summary

**Project:** CraftPro Brasil — Minecraft Server Network Community Website
**Domain:** Gaming community hub / Minecraft + Pokémon competitive network
**Researched:** 2026-03-18
**Confidence:** HIGH (stack + architecture), MEDIUM (features + pitfalls)

## Executive Summary

CraftPro Brasil is a gaming community website for a Brazilian Minecraft server network that fuses ATM modpack gameplay with competitive Pokémon battles (via PixelmonShowdown). The correct approach is a Next.js 16 App Router monolith deployed on Vercel with PostgreSQL (Neon), Drizzle ORM, Auth.js v5 (Discord OAuth), and Tailwind v4 — this stack provides server-rendered leaderboards and profiles out of the box, zero-config deployment, and a vibrant customizable aesthetic without the bundle overhead of opinionated component libraries. Competitors (Hypixel, CraftersLand, ModdedMC) share zero features with what CraftPro Brasil can deliver: a first-class ELO ranking system surfaced on a polished web UI with Discord-native identity is genuinely rare in the Minecraft server ecosystem.

The critical path is the game server integration. The PixelmonShowdown plugin must POST match results to the Next.js backend before any of the competitive features (ELO leaderboard, top-10 wins, match history, rank badges) become real. This means the Minecraft server admin must configure the plugin webhook before the ranking system goes live — the website can launch with a fully designed but data-empty leaderboard while waiting for this integration. All other features (hero landing, server listing, banned items, Discord login, user profiles, store placeholder) are buildable independently and should be completed first.

The top risks are: (1) Discord OAuth refresh token rotation — get this wrong and users are silently logged out after a week; (2) ELO manipulation via match abandonment — define the abandonment policy at design time, not after players discover the exploit; (3) hero section performance on Brazilian mobile connections — the reference Minecraft/Pokémon background image must be WebP with srcset or the site will feel broken on 4G. None of these are difficult to avoid if addressed in the correct build phase.

## Key Findings

### Recommended Stack

The full stack is verified with HIGH confidence against official documentation. Next.js 16 with React 19 and the App Router is the correct framework — React Server Components eliminate client-side data fetching boilerplate for leaderboards and profiles, and Turbopack makes iteration fast. Drizzle ORM over PostgreSQL (Neon) is strongly preferred over Prisma for this deployment target: no Rust binary means no cold start penalty on Vercel serverless functions, and the SQL-like query builder maps cleanly to the relational ELO data model (players, matches, FK constraints). Auth.js v5 with the Discord provider is the only auth approach worth implementing for a Discord-exclusive login requirement.

**Core technologies:**
- **Next.js 16 + React 19:** Full-stack framework with App Router — SSR leaderboards and profiles for free, single repo for frontend + API routes
- **TypeScript 5.x:** Non-negotiable for a codebase with ELO math, DB schemas, and OAuth token handling
- **Tailwind CSS 4.x + shadcn/ui:** CSS-first utility styling with copy-paste component primitives — zero bundle overhead, full custom aesthetic control
- **Auth.js v5 (next-auth@beta):** Discord OAuth2 with database adapter; the only proven option for App Router + Discord
- **PostgreSQL via Neon + Drizzle ORM 0.45.x:** Relational model for ELO integrity, serverless-friendly driver, atomic transactions for ELO writes
- **Motion 12.x (formerly Framer Motion):** Page transitions, hero parallax, leaderboard row animations — import from `motion/react`
- **TanStack Query v5:** Client-side data fetching with caching for leaderboard polling and profile mutations
- **`elo-rating` npm package:** Pure JS ELO calculation used server-side in API routes/Server Actions
- **Zustand 5.x:** Lightweight global state for UI (modals, optimistic updates) — not for server data

**Critical version note:** Use `motion` package (not `framer-motion`). Use `next-auth@beta` (v5, not v4). Tailwind v4 requires `postcss.config.mjs`. shadcn/ui updated for Tailwind v4 in Feb 2025 — use `npx shadcn@latest`.

### Expected Features

The feature landscape is well-understood through competitor analysis (Hypixel, CraftersLand, ModdedMC) and domain knowledge of Pokémon competitive systems. The signature differentiator — a website-integrated competitive ELO ranking system — is absent from virtually all Minecraft server websites, making it the primary reason to invest in this project.

**Must have (table stakes):**
- Hero landing page with server IP and branded identity — first thing every player needs
- Server listing with live status + player count — reason #1 players visit
- Banned items page — universal expectation on modded servers, reduces support load
- Discord OAuth login — gaming communities are Discord-native; friction-free auth required
- User profile page (avatar, ELO, win/loss) — players need to see themselves
- Pokemon ELO leaderboard (top N by ELO) — the signature feature, gated on game server integration
- Top 10 most wins leaderboard — quick win once ELO data flows
- Store "em breve" placeholder — prevents confusion about purchasing
- PT-BR throughout, vibrant Minecraft/Pokémon aesthetic

**Should have (differentiators):**
- Match history per player — requires storing per-match records from day one even if UI is deferred
- Rank badges / tier visualization (Bronze → Diamond style) — high engagement payoff, cosmetic layer on existing ELO
- Game mode detail cards (PokeBrawl, PokeDash, PokeGold) — fleshes out server listing
- Battle replay list page (even as stub with links) — once replay format is defined

**Defer (v2+):**
- Full Tebex store integration — payment processing, tax compliance, PCI considerations
- Battle replay viewer (interactive) — depends on format decision and parser implementation
- Pokemon team showcase on profile — needs structured team data from game server
- PWA / push notifications — only if retention becomes a problem

**Anti-features to avoid:**
- Real-time WebSocket leaderboard (over-engineering; 60s cache + "last updated" timestamp is sufficient)
- Forum/community posts (Discord already exists; fragmentation hurts both communities)
- Email/password auth (explicitly out of scope; doubles complexity)
- In-site battle simulator (this is Pokémon Showdown — do not rebuild it)

### Architecture Approach

The architecture is a Next.js monolith using route groups to separate public pages from auth-required pages, with Server Components handling all read-heavy pages (leaderboard, server listing, banned items) and client islands only where interactivity is required (profile edit forms, optimistic updates). The ELO update flow is the most critical data path: the Minecraft plugin POSTs to `/api/elo/update` with an API key, the server validates, calls `lib/elo.ts` pure functions, then writes winner ELO + loser ELO + match record in a single Drizzle `db.transaction()`. Atomic writes are non-negotiable — a partial ELO update corrupts the ranking permanently.

**Major components:**
1. **Landing Page** — hero, server overview, CTAs; polls Minecraft Status API (cached 30s)
2. **Servers Listing** — per-server status cards with live player counts; wraps external mc-status API
3. **ELO Leaderboard / Top-10** — Server Components querying DB directly; ISR revalidate 60s; cache invalidated on match result write
4. **User Profile** — hybrid (Server Component for initial data, client island for edit form); shows ELO, match history, rank badge
5. **Battle Replays** — listing page and individual replay viewer; JSON-blob storage in DB (Pokémon Showdown event-log format)
6. **Banned Items** — static or DB-driven list; no auth required
7. **Store Placeholder** — fully static, high-quality marketing asset
8. **Auth Layer** — Auth.js v5 Discord provider; upserts user on login using Discord snowflake ID (not username) as stable FK
9. **API Routes** — `/api/elo/update` (server-key auth), `/api/auth/[...nextauth]`, `/api/server-status` (cached wrapper)

**Key DB tables:** `users` (discordId as stable key), `matches` (ELO before/after for both players), `replays` (JSONB event log, FK to match), `banned_items`, `servers`.

### Critical Pitfalls

1. **Discord OAuth refresh token rotation** — Discord issues a new refresh token on every refresh call; reusing the old one causes `invalid_grant` and silently logs users out after ~7 days. Always overwrite the stored refresh token immediately after each refresh. Use Auth.js v5 database adapter — it handles rotation correctly when configured with a DB session store.

2. **ELO manipulation via match abandonment** — players protecting rating by disconnecting from losing matches is a well-documented ELO failure mode (caused MtG to abandon ELO in 2012). Define the abandonment policy — treat it as a loss for the abandoning player — at design time before writing any ELO logic. Every started match must produce a result record.

3. **OAuth CSRF state parameter omission** — skipping the `state` parameter verification on the OAuth callback enables account takeover. Auth.js v5 handles this automatically, but any custom OAuth implementation must generate, store, and verify state per login attempt.

4. **Hero section killing mobile performance** — the Minecraft/Pokémon background image served unoptimized causes 4-8 second first paint on 4G (the dominant connection type for the Brazilian audience). Export to WebP at multiple sizes (400/800/1600px), use `srcset`, set explicit dimensions. Target Lighthouse mobile score 70+.

5. **Replay schema undefined until build time** — replays feel like a UI feature but require the battle system to emit full event logs from battle one. If the JSON schema is designed after battle recording is built, there is no recovery path (you cannot reconstruct replay data from a win/loss record). Define the minimum replay schema — timestamp, player IDs, Pokémon used, moves per turn, outcome — before writing any battle recording code.

## Implications for Roadmap

Based on component dependencies, pitfall phase mappings, and the game server integration critical path, the research points to a 6-phase structure:

### Phase 1: Foundation
**Rationale:** Every subsequent phase depends on the DB schema being stable and the design system being established. Architecture research explicitly lists this as the prerequisite for all other phases. Changing the schema later is expensive.
**Delivers:** Next.js project scaffold, Drizzle schema (all core tables), Tailwind v4 design tokens (colors, typography, gaming aesthetic), Neon DB provisioned, environment setup, layout shell (nav + footer)
**Addresses:** Project setup, design language consistency
**Avoids:** Schema churn mid-build; visual inconsistency if design tokens are added late

### Phase 2: Public Static Pages
**Rationale:** No auth dependency — validates the design system against real content early. Server listing and banned items are the highest-utility pages for players before any competitive features exist. The store placeholder should ship here, not later, to avoid "feels abandoned" perception.
**Delivers:** Hero landing page (with server IP, WebP-optimized background), server listing with live status + player count, banned items page, store "em breve" placeholder, PT-BR copy throughout
**Addresses:** Table stakes features — hero, server listing, banned items, store placeholder
**Avoids:** Hero image performance pitfall (Lighthouse 70+ audit at end of phase); store placeholder quality pitfall (design language applied, CTA included)

### Phase 3: Authentication
**Rationale:** Discord OAuth is required before any personalized feature (profile, leaderboard identity, ELO assignment). Auth.js v5 database adapter must be wired before the users table has any rows. All three auth-related pitfalls (token rotation, CSRF state, token storage) must be resolved here before any dependent feature builds on top.
**Delivers:** Discord OAuth2 login flow, session middleware, user upsert on first login (discordId as stable FK), protected route group `/app/(auth)/`, Auth.js v5 configured with Drizzle adapter
**Addresses:** Discord OAuth login (table stakes), user identity foundation
**Avoids:** Refresh token rotation bug (integration test: 3 consecutive refreshes all succeed); OAuth CSRF pitfall (state param verified in code review before phase closes)

### Phase 4: ELO Ranking System
**Rationale:** The core competitive differentiator. Requires auth (Phase 3) and DB schema (Phase 1). The architecture's most critical data path — atomic ELO writes via `db.transaction()`, pure `lib/elo.ts` functions, match lifecycle policy for abandonments. The replay schema must also be locked here even if the replay UI is deferred — the `replays.data` JSONB field must exist in the matches table before battle one.
**Delivers:** `/api/elo/update` endpoint (server-key auth from Minecraft plugin), ELO + wins leaderboard pages (Server Components, ISR 60s, cache invalidation on write), top-10 wins leaderboard, match history stored from day one, replay JSONB schema defined and stored
**Addresses:** Pokemon ELO leaderboard, top-10 wins (table stakes + signature differentiator)
**Avoids:** ELO abandonment manipulation (abandonment policy documented and implemented); leaderboard staleness pitfall (cache invalidation tested — leaderboard reflects match within 5 seconds); replay schema undefined pitfall (schema locked this phase, UI deferred)

### Phase 5: User Profiles
**Rationale:** Depends on matches table being populated (Phase 4) — profile is naturally a drill-down from a leaderboard entry. Empty states for new users (no battles, no rank) must be designed explicitly; this is a common "looks done but isn't" failure mode.
**Delivers:** User profile page (avatar, ELO, win/loss, rank badge tier visualization), match history per player (paginated), rank badge component (tier thresholds defined), empty state UI for all sections
**Addresses:** User profile (table stakes), match history + rank badges (differentiators)
**Avoids:** Profile empty state pitfall (manual test: fresh account with no battle history renders gracefully for all sections)

### Phase 6: Battle Replays
**Rationale:** Deferred because replay format is "a definir" in PROJECT.md — the rest of the site must not block on this decision. However, the data is already being collected from Phase 4. This phase adds the display layer once the format is confirmed. Depends on match history existing from Phase 4/5.
**Delivers:** Replay listing page per player, individual replay viewer component (JSON event-log step-through), links from match history to replay, replay sharing
**Addresses:** Battle replay viewer (differentiator, v1.x)
**Avoids:** Replay system anti-feature trap (not building a video system; JSON log viewer is the correct lightweight approach)

### Phase Ordering Rationale

- Foundation before everything: schema stability is the most expensive thing to get wrong; paying that cost at the start is cheaper than mid-build migrations.
- Public pages before auth: validates design system with real content; catches visual issues before adding auth complexity.
- Auth before competitive features: player identity must exist before any ELO can be assigned to anyone.
- ELO system before profiles: profiles are a drill-down view of leaderboard data; you need data before you can display it.
- Replays last: the only feature explicitly flagged as "format to be decided" in PROJECT.md; everything else should be stable before this complexity is added.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4 (ELO Ranking System):** The PixelmonShowdown plugin integration is MEDIUM confidence — the plugin's exact webhook payload format and configuration options need to be verified against the actual running server before the API endpoint contract is finalized. Do not design the `/api/elo/update` request schema without inspecting the real plugin output.
- **Phase 6 (Battle Replays):** The replay format is explicitly undefined ("a definir"). This phase requires a design spike before technical planning — what does the PixelmonShowdown plugin actually emit? Is it compatible with Pokémon Showdown's replay format? This needs a short research phase when the time comes.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Next.js + Drizzle + Neon + Tailwind v4 setup is extremely well-documented. The STACK.md scaffold commands are sufficient.
- **Phase 2 (Public Static Pages):** Hero sections, server listing cards, banned items tables — all standard patterns with no novel integration points. Minecraft server status via `api.mcsrvstat.us` is a simple cached HTTP call.
- **Phase 3 (Authentication):** Auth.js v5 Discord provider is well-documented with the App Router. The only research needed is the specific Drizzle adapter configuration, which is covered in official Auth.js docs.
- **Phase 5 (User Profiles):** Standard profile page patterns; no novel integrations beyond reading data already established in Phase 4.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technologies verified against official docs, version compatibility confirmed. Only Auth.js v5 is still in beta (beta.25+), but it is production-stable for this use case. |
| Features | MEDIUM | Competitor analysis solid; ELO specifics based on PixelmonShowdown plugin patterns which need verification against the real running server. Replay feature has known unknowns. |
| Architecture | HIGH (patterns), MEDIUM (replay) | Server Component + RSC patterns are well-established. Replay architecture is MEDIUM because the format is TBD per PROJECT.md. |
| Pitfalls | MEDIUM-HIGH | Security pitfalls (OAuth CSRF, token rotation) are verified against official Discord docs and real GitHub issues. ELO abandonment is well-documented competitive game pattern. Performance traps are standard. |

**Overall confidence:** HIGH for Phase 1–3 and Phase 5. MEDIUM for Phase 4 (pending plugin integration verification) and Phase 6 (format TBD).

### Gaps to Address

- **PixelmonShowdown plugin webhook format:** The exact POST payload the plugin sends (field names, data types, authentication mechanism) must be verified against the running server before Phase 4 API design is finalized. Do not assume it matches the generic match schema in the architecture doc.
- **Battle replay data format:** PROJECT.md explicitly defers this decision. The gap must be resolved before Phase 6 begins — requires a conversation with the Minecraft server admin about what the plugin actually outputs.
- **ELO abandonment policy:** The policy (abandonment = loss for abandoning player, or timeout-based) is a game design decision, not a technical one. It must be decided by the project owner before Phase 4 implementation starts. The code is simple once the policy is defined.
- **Rank tier thresholds:** The ELO bracket definitions (Bronze/Silver/Gold/Diamond thresholds) are a design decision needed for Phase 5 badge implementation. These do not require research — they require a stakeholder decision.
- **Minecraft server status API:** The architecture references `api.mcsrvstat.us` as a potential provider. Confirm the actual server IP and that the status API returns player count in the expected format before Phase 2 ships live status.

## Sources

### Primary (HIGH confidence)
- [Next.js 16 official blog](https://nextjs.org/blog/next-16) — Turbopack stable, React Compiler, Cache Components
- [Next.js 16.1 release](https://nextjs.org/blog/next-16-1) — latest minor version details
- [Tailwind CSS v4.0 announcement](https://tailwindcss.com/blog/tailwindcss-v4) — stable since Jan 22 2025, CSS-first config
- [shadcn/ui Tailwind v4 docs](https://ui.shadcn.com/docs/tailwind-v4) — React 19 + Tailwind v4 compatible
- [Auth.js Discord provider](https://authjs.dev/getting-started/providers/discord) — official Discord integration
- [Auth.js v5 migration guide](https://authjs.dev/getting-started/migrating-to-v5) — App Router compatibility
- [Drizzle ORM npm](https://www.npmjs.com/package/drizzle-orm) — version 0.45.1 current
- [Neon plans & pricing](https://neon.com/docs/introduction/plans) — free tier details verified
- [Motion npm](https://www.npmjs.com/package/framer-motion) — v12.x current, `motion/react` import
- [TanStack Query SSR docs](https://tanstack.com/query/latest/docs/framework/react/guides/ssr) — App Router + RSC patterns
- [Discord OAuth2 official documentation](https://docs.discord.com/developers/topics/oauth2) — OAuth flow, scopes, token lifecycle
- [CraftersLand Banned Items List](https://forum.craftersland.net/topic/43760-banned-items-list-modded-servers-landing-page-updated-2025/) — competitor pattern
- [ModdedMC Network Banned Items](https://moddedmc.net/banned-items) — competitor pattern
- [Tebex official site](https://www.tebex.io/server) — store integration reference

### Secondary (MEDIUM confidence)
- [PixelmonShowdown GitHub](https://github.com/landonjw/PixelmonShowdown) — competitive ELO system for Pixelmon; last activity verified
- [Discord refresh token rotation bug confirmation](https://github.com/discord/discord-api-docs/issues/5942) — rotating token behavior
- [Drizzle vs Prisma 2026 — makerkit.dev](https://makerkit.dev/blog/tutorials/drizzle-vs-prisma) — performance comparison
- [Next.js 16 InfoQ coverage](https://www.infoq.com/news/2025/12/nextjs-16-release/) — Turbopack default
- [System Design of a Real-Time Gaming Leaderboard — AlgoMaster](https://blog.algomaster.io/p/design-real-time-gaming-leaderboard) — leaderboard architecture patterns
- [Pixelmon Servers competitive listing](https://pixelmonservers.com/) — community listing, pattern evidence

### Tertiary (LOW confidence)
- [TrackScore — Gaming Leaderboards Guide](https://trackscore.online/blog/gaming-leaderboards-essential-guide-for-developers-and-communities) — single source, informational
- Elo system limitations — Hacker News discussion and MMOS editorial — abandonment incentive analysis

---
*Research completed: 2026-03-18*
*Ready for roadmap: yes*
