# Architecture Patterns — v2.0 Integration

**Domain:** Minecraft server network hub — adding payment, delivery, blog, Discord notifications, seasons, and player dashboard to existing Next.js app
**Researched:** 2026-03-26
**Confidence:** HIGH (Next.js patterns), HIGH (MercadoPago webhook), MEDIUM (RCON delivery queue), MEDIUM (Discord bot hosting)

---

## What Exists (v1.0 Baseline)

This research assumes the following is already working and should NOT be redesigned:

| Layer | Current state |
|-------|--------------|
| Framework | Next.js 16 App Router, Turbopack, TypeScript |
| DB | Drizzle ORM + Neon PostgreSQL (neon-http driver, sa-east-1) |
| Auth | Auth.js v5, Discord provider, session callbacks, admin DB check |
| Admin panel | `(admin)` route group, middleware env-var guard + layout DB guard |
| Mutations | Server Actions |
| Public pages | ISR with `revalidate` |
| Hosting | Vercel hobby plan + Neon free tier |
| Schema tables | users, accounts, sessions, arenaPlayers, arenaMatches, bannedItems, servers, shopItems, adminPermissions, licenses, adminAuditLog |

The v2.0 task is **additive**: new tables, new routes, new services. No existing patterns need to change.

---

## Updated System Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                            Browser (Client)                           │
│  ┌──────────┐ ┌─────────┐ ┌────────────┐ ┌──────────┐ ┌──────────┐  │
│  │  Loja    │ │  Blog   │ │ Temporadas │ │Dashboard │ │  Admin   │  │
│  │ /loja    │ │ /blog   │ │ /temporadas│ │ /perfil  │ │ /admin   │  │
│  └────┬─────┘ └────┬────┘ └─────┬──────┘ └────┬─────┘ └────┬─────┘  │
└───────┼────────────┼────────────┼─────────────┼────────────┼─────────┘
        │            │            │             │            │
┌───────┴────────────┴────────────┴─────────────┴────────────┴─────────┐
│                    Next.js App Router (existing + new)                 │
│                                                                        │
│  NEW Route Handlers:                                                   │
│  POST /api/webhooks/mercadopago   ← MercadoPago payment events        │
│  GET  /api/cron/process-orders    ← Vercel Cron (daily) RCON flush    │
│  POST /api/revalidate/blog        ← on-demand ISR after publish       │
│                                                                        │
│  NEW Server Actions (mutations):                                       │
│  - createOrder(), cancelOrder()                                        │
│  - publishPost(), updatePost()                                         │
│  - resetSeasonElo(), createSeason()                                    │
│                                                                        │
│  MODIFIED Server Components (reads):                                   │
│  - /loja → shopItems + shopCategories (new tables)                     │
│  - /perfil/[id] → eloHistory, pokemonStats (new tables)               │
│  - /temporadas → seasons, seasonHallOfFame (new tables)               │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
┌────────────────────────────┴─────────────────────────────────────────┐
│                          External Services                             │
│                                                                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────────────┐  │
│  │  MercadoPago    │  │  Neon PostgreSQL │  │  Minecraft Server     │  │
│  │  Checkout Pro + │  │  (existing +     │  │  (RCON port 25575)    │  │
│  │  Webhooks       │  │  new tables)     │  │  LuckPerms commands   │  │
│  └─────────────────┘  └─────────────────┘  └───────────────────────┘  │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  Discord Bot (separate persistent process — NOT on Vercel)      │  │
│  │  Deployed on Railway (free $5/mo credit with card verification) │  │
│  │  Reads from Neon DB directly or via internal API endpoint       │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

---

## New Components and Their Integration Points

### Component 1: Loja Funcional (Store)

**What's new vs what exists:**

| Element | Status |
|---------|--------|
| `shopItems` table | EXISTS (name, description, category only — no price/type) |
| Payment flow, orders table | NEW |
| MercadoPago integration | NEW |
| RCON delivery | NEW |
| Admin CRUD for items | EXISTS at `/admin/loja` (preview only, no price fields) |

**Integration points:**
- Extends existing `shopItems` table with `price`, `itemType` (rank/cosmetic/item/key), `luckPermsGroup`, `duration`, `rconCommand` fields
- New `orders` table: tracks purchase lifecycle (pending → paid → delivered → failed)
- New `deliveryQueue` table: items waiting for RCON execution
- MercadoPago SDK (`mercadopago` npm, v2.12.0) — POST to MP API from a Server Action creates a Checkout Pro preference, returns redirect URL
- Webhook hits `/api/webhooks/mercadopago` Route Handler — verifies HMAC-SHA256 signature from `x-signature` header, marks order as paid, inserts to `deliveryQueue`
- Vercel Cron (daily, hobby limit) calls `/api/cron/process-orders` — dequeues items, opens `rcon-client` TCP connection to Minecraft server, sends LuckPerms commands

**Critical constraint — RCON on Vercel serverless:**

Vercel serverless functions can open TCP connections. `rcon-client` (npm) establishes a standard TCP connection to port 25575. This works from Vercel serverless during the function execution window (max 10s on hobby). The constraint is not TCP itself — it's the **once-per-day cron limit** on hobby. This means RCON delivery runs at most once every 24 hours, not on payment completion.

Workaround options (in order of preference):
1. Accept daily batch delivery (cheapest, works for ranks/VIPs — player gets rank within 24h)
2. Upgrade to Vercel Pro ($20/mo) for per-minute cron
3. Use a self-hosted cron: a Minecraft server companion process polls Neon directly every 5 minutes and fires RCON locally

Option 1 is acceptable for a small Minecraft server. Players expect delivery within hours, not seconds, for VIP purchases.

**Data flow — purchase to delivery:**

```
User clicks "Comprar" on /loja/[itemId]
  ↓
Server Action: createOrder()
  - insert orders row (status: 'pending', userId, shopItemId)
  - call MercadoPago Payments.create() or Preference.create()
  - returns MP checkout URL
  ↓
Browser redirects to MercadoPago hosted checkout
  ↓
User pays (Pix/boleto/cartão)
  ↓
MercadoPago POST /api/webhooks/mercadopago
  - verify x-signature HMAC-SHA256
  - fetch payment details from MP API (payment.id → payment object)
  - if status === 'approved':
    - update orders.status = 'paid'
    - insert deliveryQueue row (shopItemId, minecraftUuid, command)
  - respond 200 within 22s
  ↓
Vercel Cron (daily) → /api/cron/process-orders
  - query deliveryQueue WHERE status = 'pending'
  - for each item:
    - open rcon-client connection
    - send lp command (e.g. "lp user PlayName parent addtemp vip 30d")
    - on success: update deliveryQueue.status = 'delivered'
    - on failure: update deliveryQueue.status = 'failed', increment retries
  - log results to adminAuditLog
```

---

### Component 2: Blog + Eventos

**What's new:**

| Element | Status |
|---------|--------|
| Blog posts table | NEW |
| Events/calendar table | NEW |
| Admin publish UI | NEW (add to existing `/admin`) |
| Public blog page | NEW |
| ISR revalidation | NEW |

**Integration points:**
- New `blogPosts` table: id, title, slug (unique), content (markdown/HTML), category (news/patch/event), publishedAt, authorDiscordId, published (bool)
- New `events` table: id, title, description, startsAt, endsAt, type (torneio/evento)
- Admin publishes via Server Action → `revalidateTag('blog')` + `revalidatePath('/blog')` — ISR cache busted immediately
- Public `/blog` page uses `export const revalidate = 3600` (hourly fallback) + `unstable_cache` with tag `'blog'`
- `/blog/[slug]` uses ISR `revalidate: 3600` + on-demand revalidation on publish
- No headless CMS needed — admin panel is the CMS

**Data flow — admin publish:**

```
Admin clicks "Publicar" in /admin/blog
  ↓
Server Action: publishPost(postId)
  - update blogPosts.published = true, publishedAt = now()
  - revalidateTag('blog')         ← busts all blog list caches
  - revalidatePath('/blog')       ← busts blog index
  - revalidatePath('/blog/' + slug) ← busts individual post page
  ↓
Next request to /blog serves fresh HTML from DB
```

---

### Component 3: Discord Bot (Notificações)

**What's new:**

| Element | Status |
|---------|--------|
| Discord bot process | NEW — NOT on Vercel |
| Bot notifications | NEW |
| Internal notification API | NEW (optional) |

**Critical architectural decision — Discord bot CANNOT run on Vercel.**

Vercel serverless functions are stateless and short-lived. A Discord.js bot requires a persistent WebSocket connection to Discord Gateway. This connection breaks when the function terminates. There are two valid patterns:

**Pattern A (recommended): Outbound webhook calls from Next.js**
- No persistent bot process needed
- Use Discord Incoming Webhooks (not bot token)
- Next.js Server Action or Route Handler calls `https://discord.com/api/webhooks/[id]/[token]`
- No extra hosting, no cost, no process to manage
- Limitation: can only POST messages to a fixed channel; cannot read messages or respond to commands

**Pattern B: Persistent bot on Railway**
- Discord.js bot deployed as a persistent worker on Railway (free $5/mo credit with card verification)
- Bot connects to Neon DB directly (same DATABASE_URL env var)
- Next.js triggers bot via a shared DB table (`notificationQueue`) or a lightweight internal HTTP endpoint
- Supports slash commands, DM notifications, role management
- Required if v2.0 needs interactive bot features (player stats on demand, etc.)

**Recommendation: Pattern A for v2.0.** Notifications (purchase confirmations, new player joins, battle results) are one-way messages. Discord webhooks cover this completely without extra infrastructure. Upgrade to Pattern B only if interactive slash commands are requested.

**Data flow — Pattern A (Discord webhook):**

```
Event occurs in Next.js (purchase paid, new player registered, match result)
  ↓
Server Action or Route Handler calls discord-notification.ts helper:
  await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ embeds: [{ title: '...', description: '...' }] })
  })
  ↓
Discord posts message to configured channel
```

Fire-and-forget: do not await the Discord call on the critical path (purchase webhook has 22s limit). Use `void discordNotify(...)` — failure is non-blocking.

---

### Component 4: Temporadas de Ranking (Seasons)

**What's new:**

| Element | Status |
|---------|--------|
| `arenaPlayers.elo` | EXISTS (single ELO, no season awareness) |
| `seasons` table | NEW |
| `seasonSnapshots` table | NEW (ELO at end of each season) |
| Hall da fama | NEW (derived from seasonSnapshots) |
| ELO reset logic | NEW |

**Integration points:**
- New `seasons` table: id, name, number, startedAt, endedAt (nullable = active), active (bool)
- New `seasonSnapshots` table: seasonId, arenaPlayerUuid, finalElo, finalDivision, rank (position at end), capturedAt
- ELO reset = Server Action `resetSeasonElo()`: snapshot all players → insert into seasonSnapshots → reset arenaPlayers.elo to 800, wins/losses to 0, division to UNRANKED
- Season reset is a DB transaction — atomic. If partial failure, no data is corrupted
- Hall da fama page `/temporadas` shows past seasons; each season links to its snapshot leaderboard
- `arenaMatches` gains a `seasonId FK` column so matches are season-scoped

**Data flow — season end:**

```
Admin clicks "Encerrar Temporada" in /admin/temporadas
  ↓
Server Action: endSeason(seasonId)
  DB transaction:
    1. capture all arenaPlayers → insert seasonSnapshots (rank by elo)
    2. update seasons.endedAt = now(), active = false
    3. update arenaPlayers: elo = 800, wins = 0, losses = 0, division = 'UNRANKED'
    4. insert new seasons row (active = true) for next season
  ↓
revalidatePath('/ranking'), revalidatePath('/temporadas')
  ↓
Discord notification: "Temporada X encerrada! Campeão: [PlayerName]"
```

---

### Component 5: Dashboard do Jogador

**What's new vs what exists:**

| Element | Status |
|---------|--------|
| `/perfil/[id]` page | EXISTS (basic stats, match history) |
| ELO history chart | NEW |
| Pokémon usage stats | NEW |
| `eloHistory` table | NEW |
| `pokemonStats` table | NEW |

**Integration points:**
- New `eloHistory` table: id, arenaPlayerUuid, elo, matchId, recordedAt — one row per match, created in the existing `POST /api/replays` or ELO update route alongside the arenaMatches insert
- New `pokemonStats` table: arenaPlayerUuid, pokemonName, usageCount, wins, losses — updated on each match result (extract from `replayLog` JSONB)
- ELO chart uses **Recharts** (already pulled in by shadcn/ui's `chart` component) — mark as `"use client"`, receives pre-fetched `eloHistory[]` as prop from Server Component
- Pokémon most used: simple `SELECT pokemonName, usageCount ORDER BY usageCount DESC LIMIT 6`
- The existing `/perfil/[id]` Server Component gains two new data fetches; no structural change needed

**ELO chart component boundary:**

```typescript
// app/(protected)/perfil/[id]/page.tsx — Server Component
const eloHistory = await db.select().from(eloHistoryTable)
  .where(eq(eloHistoryTable.arenaPlayerUuid, playerUuid))
  .orderBy(asc(eloHistoryTable.recordedAt))
  .limit(100)

return (
  <ProfileLayout>
    <EloChart data={eloHistory} /> {/* "use client" component */}
  </ProfileLayout>
)

// components/profile/EloChart.tsx — Client Component
"use client"
import { LineChart } from "recharts" // already in package.json via shadcn/ui chart
```

---

## New Database Tables (v2.0 additions to schema.ts)

```
shopItems (EXTEND existing)
  + price           INTEGER NOT NULL           -- in centavos (BRL)
  + itemType        TEXT NOT NULL              -- 'rank' | 'cosmetic' | 'item' | 'key'
  + luckPermsGroup  TEXT                       -- e.g. 'vip', 'vip+' (null for non-rank)
  + durationDays    INTEGER                    -- null = permanent
  + rconCommand     TEXT                       -- override command template (null = auto-generate)
  + active          BOOLEAN DEFAULT true
  + imageUrl        TEXT

orders (NEW)
  id                INTEGER PK (generated)
  userId            TEXT FK → users.id
  shopItemId        INTEGER FK → shopItems.id
  mpPaymentId       TEXT UNIQUE                -- MercadoPago payment ID
  mpPreferenceId    TEXT                       -- MP preference ID (pre-payment)
  status            TEXT DEFAULT 'pending'     -- pending | paid | delivered | failed | refunded
  amountCentavos    INTEGER
  createdAt         TIMESTAMP
  paidAt            TIMESTAMP
  deliveredAt       TIMESTAMP

deliveryQueue (NEW)
  id                INTEGER PK (generated)
  orderId           INTEGER FK → orders.id
  minecraftUuid     TEXT NOT NULL              -- linked via users.minecraftUuid
  rconCommand       TEXT NOT NULL              -- full command string to execute
  status            TEXT DEFAULT 'pending'     -- pending | delivered | failed
  retries           INTEGER DEFAULT 0
  lastAttemptAt     TIMESTAMP
  deliveredAt       TIMESTAMP

blogPosts (NEW)
  id                INTEGER PK (generated)
  slug              TEXT UNIQUE NOT NULL
  title             TEXT NOT NULL
  content           TEXT NOT NULL              -- markdown string
  category          TEXT NOT NULL              -- 'news' | 'patch' | 'announcement'
  published         BOOLEAN DEFAULT false
  authorDiscordId   TEXT NOT NULL
  publishedAt       TIMESTAMP
  createdAt         TIMESTAMP
  updatedAt         TIMESTAMP

events (NEW)
  id                INTEGER PK (generated)
  title             TEXT NOT NULL
  description       TEXT
  startsAt          TIMESTAMP NOT NULL
  endsAt            TIMESTAMP
  eventType         TEXT NOT NULL              -- 'torneio' | 'evento' | 'manutencao'
  createdAt         TIMESTAMP

seasons (NEW)
  id                INTEGER PK (generated)
  number            INTEGER UNIQUE NOT NULL
  name              TEXT NOT NULL
  active            BOOLEAN DEFAULT false
  startedAt         TIMESTAMP
  endedAt           TIMESTAMP

seasonSnapshots (NEW)
  id                INTEGER PK (generated)
  seasonId          INTEGER FK → seasons.id
  arenaPlayerUuid   TEXT FK → arenaPlayers.uuid
  finalElo          INTEGER NOT NULL
  finalDivision     TEXT NOT NULL
  rank              INTEGER NOT NULL           -- position at season end
  capturedAt        TIMESTAMP

eloHistory (NEW)
  id                INTEGER PK (generated)
  arenaPlayerUuid   TEXT NOT NULL
  matchId           INTEGER FK → arenaMatches.id
  elo               INTEGER NOT NULL
  recordedAt        TIMESTAMP

pokemonStats (NEW)
  id                INTEGER PK (generated)
  arenaPlayerUuid   TEXT NOT NULL
  pokemonName       TEXT NOT NULL
  usageCount        INTEGER DEFAULT 0
  wins              INTEGER DEFAULT 0
  losses            INTEGER DEFAULT 0
  UNIQUE (arenaPlayerUuid, pokemonName)

arenaMatches (EXTEND existing)
  + seasonId        INTEGER FK → seasons.id    -- null = pre-season or legacy matches
```

---

## New Route Structure

```
src/app/
├── (public)/
│   ├── loja/
│   │   ├── page.tsx              ← Shop listing (ISR revalidate: 300)
│   │   └── [itemId]/
│   │       └── page.tsx          ← Item detail + buy button (Server Component)
│   ├── loja/sucesso/
│   │   └── page.tsx              ← Post-purchase confirmation (checks order status)
│   ├── blog/
│   │   ├── page.tsx              ← Blog listing (ISR + revalidateTag('blog'))
│   │   └── [slug]/
│   │       └── page.tsx          ← Post detail (ISR + revalidateTag('blog'))
│   └── temporadas/
│       ├── page.tsx              ← Season list + hall da fama
│       └── [seasonId]/
│           └── page.tsx          ← Season leaderboard snapshot
├── (protected)/
│   └── perfil/
│       └── [id]/
│           └── page.tsx          ← EXTEND existing: add EloChart + PokemonStats
├── (admin)/
│   └── admin/
│       ├── blog/                 ← NEW: post CRUD + publish
│       ├── loja/                 ← EXTEND existing: add price/itemType fields
│       ├── pedidos/              ← NEW: order management, manual re-delivery
│       └── temporadas/           ← NEW: season management, reset button
├── api/
│   ├── webhooks/
│   │   └── mercadopago/
│   │       └── route.ts          ← POST: verify + process MP payment events
│   └── cron/
│       └── process-orders/
│           └── route.ts          ← GET: RCON delivery batch (called by Vercel Cron)
```

---

## Patterns to Follow

### Pattern 1: Webhook Route Handler (not Server Action)

Webhooks from MercadoPago arrive as raw HTTP POST from external IPs — Server Actions are not usable here. Use a Route Handler.

```typescript
// app/api/webhooks/mercadopago/route.ts
export async function POST(request: Request) {
  const body = await request.text() // raw body for HMAC verification
  const signature = request.headers.get('x-signature') ?? ''
  const requestId = request.headers.get('x-request-id') ?? ''

  if (!verifyMercadoPagoSignature(body, signature, requestId)) {
    return new Response('Unauthorized', { status: 401 })
  }

  const event = JSON.parse(body)
  if (event.type === 'payment' && event.action === 'payment.updated') {
    await handlePaymentUpdate(event.data.id)
  }

  return new Response('OK', { status: 200 })
}
// Must respond within 22 seconds — keep DB writes minimal
```

### Pattern 2: RCON Delivery as Cron Route

```typescript
// app/api/cron/process-orders/route.ts
export async function GET(request: Request) {
  // Verify Vercel cron caller (user-agent check + CRON_SECRET)
  const auth = request.headers.get('Authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const pending = await db.select().from(deliveryQueue)
    .where(eq(deliveryQueue.status, 'pending'))
    .limit(50)

  for (const item of pending) {
    try {
      const rcon = await Rcon.connect({
        host: process.env.MC_RCON_HOST!,
        port: Number(process.env.MC_RCON_PORT ?? 25575),
        password: process.env.MC_RCON_PASSWORD!,
      })
      await rcon.send(item.rconCommand)
      await rcon.end()
      await db.update(deliveryQueue)
        .set({ status: 'delivered', deliveredAt: new Date() })
        .where(eq(deliveryQueue.id, item.id))
    } catch (err) {
      await db.update(deliveryQueue)
        .set({ retries: sql`${deliveryQueue.retries} + 1`, lastAttemptAt: new Date() })
        .where(eq(deliveryQueue.id, item.id))
    }
  }
  return Response.json({ processed: pending.length })
}
```

`vercel.json` addition:
```json
{
  "crons": [{ "path": "/api/cron/process-orders", "schedule": "0 12 * * *" }]
}
```

### Pattern 3: Season ELO Reset as DB Transaction

```typescript
// lib/actions/seasons.ts
export async function resetSeasonElo(seasonId: number) {
  "use server"
  await db.transaction(async (tx) => {
    // 1. Snapshot all ranked players
    const players = await tx.select().from(arenaPlayers)
      .where(not(eq(arenaPlayers.division, 'UNRANKED')))
      .orderBy(desc(arenaPlayers.elo))

    const snapshots = players.map((p, idx) => ({
      seasonId,
      arenaPlayerUuid: p.uuid,
      finalElo: p.elo,
      finalDivision: p.division,
      rank: idx + 1,
      capturedAt: new Date(),
    }))
    if (snapshots.length) await tx.insert(seasonSnapshots).values(snapshots)

    // 2. Close current season
    await tx.update(seasons)
      .set({ endedAt: new Date(), active: false })
      .where(eq(seasons.id, seasonId))

    // 3. Reset all ELO
    await tx.update(arenaPlayers).set({
      elo: 800, wins: 0, losses: 0, division: 'UNRANKED',
    })

    // 4. Open new season
    const [prev] = await tx.select({ number: seasons.number })
      .from(seasons).where(eq(seasons.id, seasonId))
    await tx.insert(seasons).values({
      number: prev.number + 1,
      name: `Temporada ${prev.number + 1}`,
      active: true,
      startedAt: new Date(),
    })
  })

  revalidatePath('/ranking')
  revalidatePath('/temporadas')
}
```

### Pattern 4: Discord Notification Helper (Outbound Webhook)

```typescript
// lib/discord-notify.ts
type NotificationPayload = { title: string; description: string; color?: number }

export async function notifyDiscord(payload: NotificationPayload): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) return // graceful no-op in dev

  // Fire-and-forget — do not block calling function
  fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ embeds: [{ ...payload, color: payload.color ?? 0x00ff88 }] }),
  }).catch(() => {}) // swallow error — notification is non-critical
}
```

Called from: payment webhook handler (purchase confirmed), match ELO update route (battle result), new player creation in Auth.js callback.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Server Action for Webhook Endpoint

**What:** Using a Server Action to receive MercadoPago webhook POSTs.
**Why bad:** Server Actions are protected by CSRF tokens and expect browser clients. External webhooks from MercadoPago have no CSRF token — the call will be rejected or, worse, accepted without signature validation, creating a spoofing vector.
**Do this instead:** Route Handler at `/api/webhooks/mercadopago/route.ts` with explicit HMAC-SHA256 verification of `x-signature`.

### Anti-Pattern 2: RCON on Every Purchase

**What:** Connecting to RCON immediately inside the webhook handler when a payment is approved.
**Why bad:** RCON TCP connection from a Vercel function to a Minecraft server on a home or small VPS adds 100-500ms of latency. If the Minecraft server is offline, the webhook handler fails, and MercadoPago retries the webhook repeatedly, potentially double-delivering. The 22-second response window offers no safety margin.
**Do this instead:** Write to `deliveryQueue` table inside the webhook handler (fast DB write). Separate cron job executes RCON delivery with retry logic.

### Anti-Pattern 3: Storing Discord Bot Token in Next.js App

**What:** Running `discord.js` client with bot token inside a Next.js API route or Server Action.
**Why bad:** `discord.js` requires a persistent WebSocket connection (Gateway). Serverless functions are terminated after each request — the connection is destroyed, reconnection overhead causes rate limiting, and bot status appears offline constantly.
**Do this instead:** For notifications, use Discord Incoming Webhooks (stateless HTTP, no bot token needed). For interactive features, run a separate persistent process on Railway.

### Anti-Pattern 4: Blog Content in MDX Files

**What:** Storing blog posts as `.mdx` files in the repo, requiring a deploy for each post.
**Why bad:** Admin cannot publish without a developer deploying a new build. Adds latency between writing and publishing.
**Do this instead:** Store blog content as markdown strings in the `blogPosts` table. Admin publishes via UI → Server Action → `revalidatePath()`. Post is live within seconds, no deploy needed.

### Anti-Pattern 5: Blocking the Season Reset on Notification

**What:** `resetSeasonElo()` awaiting Discord notification before responding to the admin.
**Why bad:** If Discord webhook is slow or down, the reset appears to hang. The DB transaction has already committed but the admin sees a timeout.
**Do this instead:** Reset transaction first, respond to admin, then fire Discord notification as fire-and-forget.

### Anti-Pattern 6: ELO History Backfilled via Migration

**What:** Attempting to reconstruct full ELO history from existing `arenaMatches` table retroactively.
**Why bad:** `arenaMatches` has `winnerEloBefore`/`winnerEloAfter` etc., so backfill is technically possible, but writing a migration script adds risk to the schema migration and is not required for MVP.
**Do this instead:** Start `eloHistory` fresh from the day the v2.0 migration runs. Chart shows "No data yet" for players until they play their first match in v2.0. Note this in the dashboard UI.

---

## Integration Dependencies (Build Order)

The v2.0 features have hard dependencies. Build in this order:

```
1. Schema migration
   ↳ All new tables added in one Drizzle migration
   ↳ Extends shopItems (price, itemType, etc.)
   ↳ Adds seasonId FK to arenaMatches
   ↳ MUST run before any feature can be tested

2. Loja funcional (no payments yet)
   ↳ Admin: extend /admin/loja with price/itemType fields
   ↳ Public: /loja listing and /loja/[itemId] detail pages
   ↳ Validates store UI before payment complexity

3. MercadoPago checkout
   ↳ Depends on: loja pages (item exists)
   ↳ Server Action: createOrder() → MP Preference → redirect URL
   ↳ /loja/sucesso page

4. MercadoPago webhook + delivery queue
   ↳ Depends on: orders table, deliveryQueue table
   ↳ /api/webhooks/mercadopago Route Handler
   ↳ /api/cron/process-orders Route Handler + vercel.json cron
   ↳ RCON env vars (MC_RCON_HOST, MC_RCON_PORT, MC_RCON_PASSWORD)

5. Blog + Eventos
   ↳ No dependencies on payment features
   ↳ Can be built in parallel with steps 3-4
   ↳ Admin: /admin/blog CRUD
   ↳ Public: /blog listing, /blog/[slug], events calendar

6. Temporadas
   ↳ Depends on: seasons + seasonSnapshots tables
   ↳ Server Action: resetSeasonElo() (DB transaction)
   ↳ Admin: /admin/temporadas
   ↳ Public: /temporadas hall da fama

7. Dashboard do jogador
   ↳ Depends on: eloHistory table (step 1) AND matches being recorded (ongoing)
   ↳ Modify ELO update route to also insert into eloHistory
   ↳ Add EloChart (Recharts "use client") + PokemonStats to /perfil/[id]

8. Discord notificações
   ↳ Depends on: nothing — pure outbound HTTP
   ↳ Add notifyDiscord() calls to: payment webhook (step 4), ELO update, new user creation
   ↳ Can be added to any step incrementally
```

---

## Vercel Hobby Plan Constraints Checklist

| Feature | Constraint | Mitigation |
|---------|-----------|-----------|
| RCON delivery | Cron runs once/day max | Accept daily batch delivery; document for players |
| Cron timing | Up to 59min precision | Non-critical for delivery queue |
| Function timeout | 10s max on hobby | RCON per-item loop must be fast; limit batch to 50 items |
| Neon free tier | 0.5 GB storage | New tables are small; seasons/blog stay small for months |
| Concurrent executions | Limited on hobby | Cron is once/day — no concurrency concern |

---

## New Environment Variables Required

```
# MercadoPago
MP_ACCESS_TOKEN=         # production access token
MP_WEBHOOK_SECRET=       # secret for x-signature verification
MP_PUBLIC_KEY=           # frontend (checkout.js) public key

# Minecraft RCON
MC_RCON_HOST=            # server IP or hostname
MC_RCON_PORT=25575       # default RCON port
MC_RCON_PASSWORD=        # RCON password (set in server.properties)

# Discord (webhook, not bot token)
DISCORD_WEBHOOK_URL=     # incoming webhook URL for notification channel

# Cron security
CRON_SECRET=             # random secret; Vercel sends as Bearer token to cron endpoint
```

---

## Sources

- [MercadoPago Payment Notifications — developers.mercadopago.com](https://www.mercadopago.com.br/developers/en/docs/checkout-pro/payment-notifications)
- [goncy/next-mercadopago — GitHub reference implementation](https://github.com/goncy/next-mercadopago)
- [mercadopago SDK Node.js — GitHub](https://github.com/mercadopago/sdk-nodejs)
- [Vercel Cron Jobs — official docs](https://vercel.com/docs/cron-jobs)
- [Vercel Cron Usage & Pricing — official docs](https://vercel.com/docs/cron-jobs/usage-and-pricing)
- [Vercel backend limitations — Northflank](https://northflank.com/blog/vercel-backend-limitations)
- [rcon-client — npm](https://www.npmjs.com/package/rcon-client)
- [LuckPerms temporary group command — luckperms.net](https://luckperms.net/wiki/Command-Usage)
- [Discord bot deployment — Railway](https://railway.com/deploy/discord-bot-template)
- [Tremor Charts (acquired by Vercel, Jan 2025) — tremor.so](https://www.tremor.so/)
- [Next.js on-demand ISR revalidation — official docs](https://nextjs.org/docs/app/guides/incremental-static-regeneration)
- [Discord Incoming Webhooks — discord.dev](https://discord.com/developers/docs/resources/webhook)

---

*Architecture research for: CraftPro Brasil v2.0 — Loja, Blog, Notificações, Temporadas, Dashboard*
*Researched: 2026-03-26*
