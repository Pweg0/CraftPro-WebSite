# Architecture Research

**Domain:** Gaming community hub / Minecraft server network landing page
**Researched:** 2026-03-18
**Confidence:** HIGH (stack patterns), MEDIUM (replay architecture — format TBD per PROJECT.md)

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                         Browser (Client)                          │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌───────────────┐   │
│  │  Landing  │  │ Servers  │  │  Rankings  │  │    Profile    │   │
│  │   Page   │  │  Listing │  │ Leaderboard│  │  + Replays    │   │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘  └──────┬────────┘   │
└───────┼─────────────┼──────────────┼────────────────┼────────────┘
        │             │              │                │
┌───────┴─────────────┴──────────────┴────────────────┴────────────┐
│                    Next.js App Router (Server)                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Route Handlers (app/api/**)  │  Server Components (RSC)    │  │
│  │  - /api/auth/[...nextauth]    │  - Leaderboard page         │  │
│  │  - /api/elo/update            │  - Servers page             │  │
│  │  - /api/replays               │  - Profile page             │  │
│  │  - /api/users/[id]            │  - Banned items page        │  │
│  └─────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │               Middleware Layer                               │  │
│  │  - Auth session check (protected routes)                    │  │
│  │  - Rate limiting                                            │  │
│  └─────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬─────────────────────────────────┘
                                 │
┌────────────────────────────────┴─────────────────────────────────┐
│                        External Services                           │
│  ┌────────────────┐  ┌────────────────┐  ┌─────────────────────┐ │
│  │  Discord OAuth2 │  │  PostgreSQL DB  │  │  Minecraft Server   │ │
│  │  (Auth only)    │  │  (Neon/Supabase)│  │  Status API         │ │
│  └────────────────┘  └────────────────┘  └─────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| Landing Page | Hero section, server overview, calls-to-action | Server Status API (player count), links to sub-pages |
| Servers Listing | Show all network servers with status + player counts | Minecraft Status API, DB (server metadata) |
| ELO Ranking / Leaderboard | Display ranked players by ELO, Top-10 wins | DB (elo_scores, match_history) |
| User Profile | Display stats, match history, ELO history graph | DB (users, matches, replays), Discord OAuth session |
| Battle Replays | List and render stored battle replays | DB (replays table), linked to user profiles |
| Banned Items | Static or DB-driven list of prohibited items | DB (banned_items) or static MDX |
| Store Placeholder | "Em breve" page with teaser content | None (static) |
| Auth Layer | Discord OAuth2 sign-in, session management | Discord API, DB (users table upsert on login) |
| API Routes | Data mutations and protected reads | DB, Discord API, Minecraft Status API |

## Recommended Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Public route group (no auth required)
│   │   ├── page.tsx              # Landing page (hero + overview)
│   │   ├── servidores/           # Servers listing page
│   │   ├── ranking/              # ELO leaderboard page
│   │   ├── top10/                # Top 10 wins page
│   │   ├── replays/              # Battle replays listing
│   │   │   └── [id]/             # Individual replay view
│   │   ├── itens-banidos/        # Banned items page
│   │   └── loja/                 # Store placeholder "em breve"
│   ├── (auth)/                   # Auth-required route group
│   │   └── perfil/               # User profile
│   │       └── [id]/             # Other user profiles (public view)
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/    # NextAuth Discord provider
│   │   ├── elo/
│   │   │   └── update/           # POST: record match result, recalc ELO
│   │   ├── replays/
│   │   │   └── route.ts          # GET list / POST create replay
│   │   └── users/
│   │       └── [id]/             # GET user profile data
│   ├── layout.tsx                # Root layout (nav, footer, fonts)
│   └── globals.css               # Global styles + Tailwind base
├── components/
│   ├── ui/                       # Generic reusable UI (buttons, cards, badges)
│   ├── layout/                   # Navbar, Footer, PageWrapper
│   ├── leaderboard/              # Leaderboard table, rank badge, ELO delta
│   ├── profile/                  # Profile card, stats grid, match history
│   ├── replay/                   # Replay card, replay viewer
│   ├── server-status/            # Server status card, player count
│   └── hero/                     # Hero section, parallax background
├── lib/
│   ├── auth.ts                   # NextAuth config + Discord provider setup
│   ├── db.ts                     # Prisma client singleton
│   ├── elo.ts                    # ELO calculation logic (pure functions)
│   └── minecraft-status.ts       # Minecraft server status API client
├── types/
│   └── index.ts                  # Shared TypeScript types
└── prisma/
    └── schema.prisma             # DB schema (users, matches, replays, etc.)
```

### Structure Rationale

- **app/(public)/ vs app/(auth)/:** Route groups allow middleware to protect auth-required pages without URL clutter. Profile editing needs auth; viewing the leaderboard does not.
- **components/ by domain:** Keeps leaderboard components together, profile components together — easier to find, easier to delete a feature.
- **lib/elo.ts as pure functions:** ELO math is pure logic with no side effects. Isolating it makes it testable and reusable from both API routes and scripts.
- **lib/minecraft-status.ts:** The Minecraft server query (port 25565 via mc-server-status or similar) is an external boundary — wrapping it means you can mock it or swap providers without touching page code.

## Architectural Patterns

### Pattern 1: Server Components for Read-Heavy Pages

**What:** Leaderboard, servers listing, banned items, and replays list pages fetch data directly in the Server Component — no client-side fetch, no loading spinners, no useEffect.
**When to use:** All pages where the user does not need to interact with data in real time. This covers ~80% of CraftPro Brasil's pages.
**Trade-offs:** Faster initial load, no JS bundle for data fetching. Downside: no instant updates when data changes — add `revalidate` tags or polling for the leaderboard if freshness matters.

**Example:**
```typescript
// app/(public)/ranking/page.tsx — Server Component
export default async function RankingPage() {
  const players = await db.user.findMany({
    orderBy: { elo: 'desc' },
    take: 100,
  });
  return <LeaderboardTable players={players} />;
}
```

### Pattern 2: NextAuth + Discord Provider for Authentication

**What:** Use NextAuth.js (Auth.js v5 in Next.js 15 App Router) with the Discord provider. On first login, upsert the user into the DB using their Discord ID as the stable identifier.
**When to use:** The only auth flow in this project. Discord is the single sign-on method per requirements.
**Trade-offs:** NextAuth handles token refresh, session cookies, CSRF. Discord ID is stable even if the user changes their Discord username — use it as the FK in all related tables, not the display name.

**Example:**
```typescript
// lib/auth.ts
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Discord({
      clientId: process.env.AUTH_DISCORD_ID!,
      clientSecret: process.env.AUTH_DISCORD_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      await db.user.upsert({
        where: { discordId: profile.id },
        update: { username: profile.username, avatar: profile.avatar },
        create: { discordId: profile.id, username: profile.username, avatar: profile.avatar },
      });
      return true;
    },
  },
});
```

### Pattern 3: Centralized ELO Calculation as Pure Function

**What:** ELO math lives in `lib/elo.ts` as a pure function with no database calls. The API route fetches both players' current ELO, passes them to the function, receives new scores, then writes both updates in a single DB transaction.
**When to use:** Every time a match result is recorded.
**Trade-offs:** Simpler to test, audit, and change the K-factor later. The transaction guarantees both ELO scores update atomically — no partial updates.

**Example:**
```typescript
// lib/elo.ts
export function calculateElo(
  winnerElo: number,
  loserElo: number,
  kFactor = 32
): { newWinnerElo: number; newLoserElo: number } {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  const newWinnerElo = Math.round(winnerElo + kFactor * (1 - expectedWinner));
  const newLoserElo = Math.round(loserElo + kFactor * (0 - (1 - expectedWinner)));
  return { newWinnerElo, newLoserElo };
}
```

### Pattern 4: Replay as Structured JSON (not video)

**What:** Battle replays are stored as structured JSON blobs in the DB (or object storage for larger payloads) — a sequence of turns, moves, and outcomes — rendered in the browser as an animated step-through or static log viewer.
**When to use:** This is the recommended approach given "formato a definir" in PROJECT.md. JSON replays are lightweight, searchable, and renderable without a video player. They also match how competitive Pokémon battle simulators (Pokémon Showdown) store replays.
**Trade-offs:** Requires a custom renderer component. No audio/video. Not suitable if the server generates raw video files — but for a Minecraft/Pokémon battle plugin, event-log style data is standard output.

## Data Flow

### Authentication Flow

```
User clicks "Entrar com Discord"
    ↓
NextAuth redirects → Discord OAuth2 authorization page
    ↓
Discord redirects back → /api/auth/callback/discord
    ↓
NextAuth signIn callback → DB upsert (user row created/updated)
    ↓
Session cookie set → User is authenticated
    ↓
Middleware checks session on protected routes (/perfil/*)
```

### Match Result + ELO Update Flow

```
Minecraft plugin sends POST /api/elo/update
    (winner_discord_id, loser_discord_id, battle_data)
    ↓
API route authenticates request (server-side API key, not user session)
    ↓
Fetch both players' current ELO from DB
    ↓
lib/elo.ts calculateElo() → new scores
    ↓
DB transaction:
  - Update winner ELO + increment wins
  - Update loser ELO + increment losses
  - Insert match_history row
  - Insert replay row (JSON blob)
    ↓
200 OK response
```

### Leaderboard Read Flow

```
Browser requests /ranking
    ↓
Next.js Server Component executes on server
    ↓
db.user.findMany({ orderBy: { elo: 'desc' }, take: 100 })
    ↓
HTML rendered on server with player data embedded
    ↓
Browser receives complete HTML (no loading state needed)
    ↓
Optional: revalidatePath('/ranking') called after ELO update
         to bust Next.js page cache
```

### Discord OAuth Data Flow

```
Discord API → NextAuth callback
    ↓ profile fields extracted:
    - id (stable Discord snowflake — use as FK)
    - username (display name — can change)
    - avatar (hash — construct URL client-side)
    - discriminator (deprecated in new Discord accounts)
    ↓
DB users table: discordId (PK), username, avatarHash, elo, wins, losses
```

## Database Schema (Core Tables)

```
users
  id            UUID PK
  discordId     VARCHAR UNIQUE (Discord snowflake)
  username      VARCHAR
  avatarHash    VARCHAR NULLABLE
  elo           INTEGER DEFAULT 1000
  wins          INTEGER DEFAULT 0
  losses        INTEGER DEFAULT 0
  createdAt     TIMESTAMP

matches
  id            UUID PK
  winnerId      UUID FK → users.id
  loserId       UUID FK → users.id
  winnerEloBefore  INTEGER
  loserEloBefore   INTEGER
  winnerEloAfter   INTEGER
  loserEloAfter    INTEGER
  playedAt      TIMESTAMP

replays
  id            UUID PK
  matchId       UUID FK → matches.id NULLABLE
  title         VARCHAR
  data          JSONB   (battle turn sequence)
  createdAt     TIMESTAMP

banned_items
  id            UUID PK
  name          VARCHAR
  reason        TEXT
  imageUrl      VARCHAR NULLABLE

servers
  id            UUID PK
  name          VARCHAR
  description   TEXT
  ip            VARCHAR
  port          INTEGER DEFAULT 25565
  gameMode      VARCHAR  (e.g. "PokeBrawl", "PokeDash", "PokeGold")
  sortOrder     INTEGER
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-500 players | Monolith is fine. Single Neon/Supabase free tier. No caching needed. Server Components handle all reads. |
| 500-5k players | Add `revalidate: 60` on leaderboard page. Consider Redis sorted set for ELO rank queries if leaderboard queries slow down. |
| 5k+ players | Move replay JSON blobs to S3/R2 object storage. Cache leaderboard top-100 in Redis. Separate the ELO update endpoint from the main Next.js app if Minecraft plugin sends high-frequency updates. |

### Scaling Priorities

1. **First bottleneck:** Leaderboard page renders on every request. Fix with ISR (`revalidate: 30`) — leaderboard data stale by 30 seconds is acceptable for this scale.
2. **Second bottleneck:** ELO update endpoint under high match volume. Fix by making it async with a simple queue (Bull/BullMQ + Redis) rather than synchronous DB writes.

## Anti-Patterns

### Anti-Pattern 1: Storing Discord Display Name as User Identifier

**What people do:** Use `username` or `username#1234` as the user's FK in match and replay tables.
**Why it's wrong:** Discord usernames change. The discriminator system (#1234) was deprecated in 2023. Using a mutable field as an identifier causes orphaned records when users rename.
**Do this instead:** Store `discordId` (the immutable numeric snowflake) as the stable identifier. Store `username` for display only, update it on every login.

### Anti-Pattern 2: Fetching Leaderboard Data Client-Side with useEffect

**What people do:** Build the leaderboard as a Client Component, call `fetch('/api/leaderboard')` in `useEffect`, show a spinner.
**Why it's wrong:** Adds latency, increases JS bundle, breaks SEO, and creates a flash of empty content that hurts the visual quality of a vibrant gaming site.
**Do this instead:** Use a Server Component. Fetch from DB directly. Return pre-rendered HTML. Use ISR `revalidate` for cache control.

### Anti-Pattern 3: Calling the Minecraft Server Status API on Every Page Request

**What people do:** Query `play.craftprobrasil.com:25565` on every render of the landing page to show live player count.
**Why it's wrong:** External network call on the render path. If the Minecraft server is down or slow, the website hangs. Adds 50-300ms latency to every landing page load.
**Do this instead:** Use Next.js `revalidate: 30` on the server status fetch, or poll from the client via a lightweight `/api/server-status` endpoint that caches the last known result.

### Anti-Pattern 4: One Monolithic Leaderboard for Everything

**What people do:** Build a single leaderboard that tries to sort by ELO, wins, and other stats simultaneously.
**Why it's wrong:** The project already has two distinct leaderboards: ELO ranking (/ranking) and Top-10 wins (/top10). Mixing them creates confusing UX and complicates the query.
**Do this instead:** Keep them as separate pages/queries. Each is a simple `ORDER BY elo DESC` or `ORDER BY wins DESC` with `TAKE 10/100`. No complex query needed.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Discord OAuth2 | NextAuth.js Discord provider | Redirect URI must be whitelisted in Discord Developer Portal for each environment (dev + prod) |
| Minecraft Server Status | HTTP query to `api.mcsrvstat.us` or direct TCP port query | Wrap in a cached server action; never call on every render |
| PostgreSQL (Neon/Supabase) | Prisma ORM via connection pooling URL | Use `?pgbouncer=true` connection string on Neon for serverless environments |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Minecraft plugin ↔ Next.js API | REST POST with shared API key secret | Plugin posts match results to `/api/elo/update`; API key in `Authorization: Bearer` header |
| Server Components ↔ DB | Direct Prisma calls (no HTTP hop) | Only valid in Server Components and Route Handlers, never in Client Components |
| Client Components ↔ data | Server Actions or fetch to `/api/*` | Client Components that need mutations (e.g., admin actions) use Server Actions |
| ELO logic ↔ API route | Pure function import | `lib/elo.ts` has zero side effects; tested independently |

## Suggested Build Order (Phase Dependencies)

Based on component dependencies, the correct build sequence is:

1. **Foundation** — DB schema, Prisma setup, layout shell, Tailwind config, fonts
   - Everything else depends on the DB schema being stable
   - The visual design language (colors, typography) must be set before any feature UI

2. **Auth** — Discord OAuth2, session middleware, user upsert
   - Profile and protected features depend on session data
   - ELO updates need user identity to assign match results

3. **Public static pages** — Landing hero, Servers listing, Banned items, Store placeholder
   - No auth dependency; validates the design system early
   - Server status integration lives here (Minecraft API client)

4. **Leaderboard + ELO system** — Schema for matches, ELO calculation, ranking pages, Top-10 page
   - Requires auth (to identify players) and DB foundation
   - Core competitive feature — validates the ELO logic before replay complexity

5. **User profiles** — Profile page with stats, match history, ELO over time
   - Depends on matches table being populated (phase 4)
   - Naturally follows leaderboard (profile is a drill-down from a leaderboard entry)

6. **Battle Replays** — Replay storage, listing page, replay viewer component
   - Depends on match history existing (phase 4/5)
   - Deferred because replay format is "a definir" — the rest of the site should not block on this decision

## Sources

- [System Design of a Real-Time Gaming Leaderboard — AlgoMaster](https://blog.algomaster.io/p/design-real-time-gaming-leaderboard)
- [Leaderboard System Design — systemdesign.one](https://systemdesign.one/leaderboard-system-design/)
- [Discord OAuth2 Documentation — discord.dev](https://docs.discord.com/developers/topics/oauth2)
- [NextAuth.js Discord Provider](https://next-auth.js.org/providers/discord)
- [Next.js App Router Best Practices 2025 — Raftlabs](https://www.raftlabs.co/blog/building-with-next-js-best-practices-and-benefits-for-performance-first-teams/)
- [Next.js Server and Client Components — official docs](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Building APIs with Next.js — official blog](https://nextjs.org/blog/building-apis-with-nextjs)
- [Game Replay Architecture — Game Developer](https://www.gamedeveloper.com/programming/developing-your-own-replay-system)
- [ELO Rating in Pure SQL — sigma-star.io](https://blog.sigma-star.io/2024/09/elo-rating-in-pure-sql/)
- [Minecraft Network Website Templates — BuiltByBit](https://builtbybit.com/resources/minecraft-network-website-template.82887/)

---
*Architecture research for: CraftPro Brasil — Minecraft server network community hub*
*Researched: 2026-03-18*
