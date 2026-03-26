# Stack Research

**Domain:** Minecraft gaming community website — v2.0 additions: payment, RCON delivery, Discord bot, blog, seasons, ELO charts
**Researched:** 2026-03-26
**Confidence:** HIGH (core choices verified via official docs and npm; deployment architecture verified via Vercel KB)

---

## Context: What Already Exists

The following stack is validated and NOT re-researched here:

- Next.js 16 (Turbopack) + TypeScript 5.x
- Tailwind CSS v4 + shadcn/ui (base-ui)
- Drizzle ORM 0.45.x + Neon PostgreSQL
- Auth.js v5 (Discord provider)
- Vitest + Testing Library
- Deployed on Vercel (hobby plan)

This document covers ONLY the additions required for v2.0 features.

---

## Recommended Stack Additions

### Payments — MercadoPago

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `mercadopago` (official SDK) | 2.12.0 | Server-side payment creation, Pix QR code generation, webhook verification | Official SDK from MercadoPago; TypeScript types included; ES Module compatible; handles Checkout API (transparent flow — no redirect to MP hosted page) and Checkout Pro; last published Jan 2025 |

**Integration pattern for this project:**
- Use **Checkout API** (transparent) not Checkout Pro. Checkout Pro redirects to mercadopago.com — bad UX for a gaming site selling ranks/items. Checkout API keeps the payment form in your site.
- Pix flow: POST to `/v1/orders` with `payment_method.id: "pix"` → receive `qr_code_base64` + `qr_code` text → display QR to user → receive webhook on `status: "approved"` → trigger RCON delivery.
- Webhook endpoint: Next.js Route Handler at `app/api/webhooks/mercadopago/route.ts`. Verify `X-Signature` HMAC header before processing. Never trust `paymentId` from webhook body alone — re-fetch from API to confirm status.
- Frontend: use `@mercadopago/sdk-js` (separate browser-side SDK, distinct from server SDK) only if you need hosted card fields for credit card. For Pix-only (recommend starting here), the server SDK is sufficient.

### RCON — Minecraft Server Communication

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `rcon-client` | 4.2.5 | TCP connection to Minecraft's native RCON port; send commands (e.g., LuckPerms rank grant, item give) | RCON is natively built into Minecraft — no mods needed, works on NeoForge. `rcon-client` is TypeScript-native, async/await, has a built-in packet queue to prevent race conditions. **Warning: maintainer posted unmaintained notice** — mitigate by wrapping in an abstraction layer so it can be swapped |

**Why not the alternatives:**
- `@minecraft-js/rcon` v1.1.0 — last commit Aug 2022, effectively dead.
- `ts-rcon` v1.2.1 — last release May 2021, minimal maintenance.
- `@c43721/rcon` v0.0.10 — published to JSR (not npm), cross-runtime focus; adds complexity without clear benefit.
- `rcon-client` despite the warning has the most weekly downloads and the most battle-tested Minecraft-specific usage; version 4.2.5 is feature-complete for this use case.

**Delivery queue pattern (critical for reliability):**
Do NOT call RCON directly from the payment webhook handler. The Minecraft server may be offline (restarts, backups). Instead:

```
webhook confirmed → insert row in `delivery_queue` table (status=pending)
→ cron job (Vercel Cron, every 1 min) → read pending rows → attempt RCON
→ on success: mark delivered; on failure: increment retry_count; max 5 retries
```

This pattern lives entirely in Neon PostgreSQL (existing infrastructure) + Vercel Cron. No Redis, no BullMQ, no extra services needed on hobby plan.

### Discord Notifications

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Discord Webhooks (no library needed) | N/A | Send notifications to Discord channel for purchases, new players, battle results | Vercel Hobby plan cannot run persistent WebSocket processes — discord.js `Client` gateway bot is **incompatible** with Vercel. Discord Webhooks are pure HTTP POST — no persistent connection, works perfectly in serverless Next.js Route Handlers and Server Actions |

**Integration pattern:**
```typescript
// From any Server Action or Route Handler:
await fetch(process.env.DISCORD_WEBHOOK_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    embeds: [{
      title: "Nova compra: Rank VIP",
      description: `${playerName} comprou o rank VIP por R$XX`,
      color: 0x00ff88,
    }]
  })
});
```

No `discord.js` install needed. Store `DISCORD_WEBHOOK_URL` as Vercel env var (set per channel — one webhook URL per notification category is fine).

**If you need a bot that listens to events (e.g., reacts to `!rank` command):**
- Deploy discord.js 14.x as a separate Node.js service on Railway (free $5/month credit covers a small always-on Node process).
- The Next.js app communicates with the bot via a shared Neon DB row or a simple HTTP endpoint on Railway — not direct Discord API.
- Start with webhooks only (covers 100% of v2.0 notification needs). Bot can be v2.1.

### ELO Charts — Player Dashboard

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Recharts | 3.8.0 | `LineChart` for ELO history over time; `BarChart` for Pokémon usage stats | React-native SVG charting library, composable component API matches the existing shadcn/ui + Tailwind pattern. v3.8.0 is the current stable (released March 6 2026). Compatible with React 19 + Next.js 16 (known `react-is` peer dep workaround needed — see compatibility section). Installed in many Next.js 16 admin dashboards in production |

**Why not Chart.js/react-chartjs-2:** Canvas-based, harder to style with Tailwind, less React-native API. Overkill — ELO history for typical players is <1000 data points, well within Recharts SVG sweet spot.

**Why not Victory or Nivo:** More complex APIs, heavier bundles, Recharts is the standard for Next.js dashboards.

### Scheduled Jobs — RCON Delivery + Season Resets

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Vercel Cron Jobs | N/A (platform feature) | Trigger RCON delivery queue processing every minute; trigger season ELO reset on schedule | Zero infrastructure cost on Hobby plan (up to 2 cron jobs on hobby). Defined in `vercel.json`. Calls a Next.js Route Handler that reads the DB queue and dispatches RCON commands |

**Cron limitation on hobby:** 1 invocation/day max frequency. If you need minute-level retry (RCON queue), use a different approach: trigger the queue processor from the webhook confirmation itself (fire-and-forget via `waitUntil` from the Vercel Edge Runtime, or simply run synchronously if the server is online). The DB queue handles persistence across failures regardless.

**Update:** Vercel Hobby actually supports cron at 60-second intervals as of 2024 for cron jobs defined in vercel.json — verify in your account dashboard. If restricted to daily, use a free external cron service (cron-job.org) to hit your `/api/cron/deliver` Route Handler.

---

## Supporting Libraries (New)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@mercadopago/sdk-js` | latest | Browser-side card tokenization (Checkout API credit card) | Only needed if adding credit/debit card input on the page. Not needed for Pix-only launch |
| `recharts` | 3.8.0 | ELO line chart + Pokémon bar chart in player dashboard | Player dashboard phase only |
| `date-fns` | 3.x (already in stack) | Format PT-BR dates on blog posts, event calendar, match timestamps | Already installed; no addition needed |

---

## Installation

```bash
# Payments
npm install mercadopago

# RCON (Minecraft server communication)
npm install rcon-client

# Charts
npm install recharts

# If adding credit card tokenization later (not needed for Pix launch):
# npm install @mercadopago/sdk-js
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| `mercadopago` SDK v2 | Stripe | If expanding to international sales or needing better DX. Stripe does not support Pix natively in Brazil — use MercadoPago for Brazilian market |
| `mercadopago` SDK v2 | PagSeguro / PagBank SDK | If audience has distrust of MercadoPago. PagSeguro has worse Node.js SDK quality. MercadoPago has dominant market share in Brazil |
| `rcon-client` (unmaintained but working) | Implement raw RCON TCP socket in Node.js `net` module | If rcon-client breaks on a future Node.js version. The RCON protocol is simple (4-byte little-endian length header + type + body) — a custom implementation is ~50 lines |
| Discord Webhooks (no library) | `discord.js` v14 on Railway | Only if needing bot commands (slash commands, message reactions). Not needed for notification-only v2.0 use cases |
| Recharts | Victory | Victory has a cleaner API for animations, but lower ecosystem adoption in Next.js; Recharts has more shadcn/ui examples to follow |
| Vercel Cron | cron-job.org + Route Handler | If Vercel Hobby cron frequency is insufficient. cron-job.org is free and more flexible; use it as the HTTP trigger for your `/api/cron/deliver` endpoint |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `discord.js` Client on Vercel | discord.js requires a persistent WebSocket gateway connection. Vercel Functions time out after 10–60 seconds and cannot maintain WebSocket connections. It will silently fail | Discord Webhooks (pure HTTP POST) for notifications; discord.js on Railway only if bot commands are needed |
| BullMQ / Bull / Redis for RCON queue | BullMQ requires Redis. Vercel Hobby has no Redis. Adding Upstash Redis (cheapest) adds cost and complexity for a queue that can live in the existing Neon PostgreSQL table | `delivery_queue` table in Neon + Vercel Cron / cron-job.org |
| Checkout Pro (MercadoPago hosted page) | Redirects user to mercadopago.com to complete payment — breaks the immersive gaming store UX, loses brand control, harder to customize | Checkout API (transparent) — payment stays on your domain |
| Stripe | Does not natively support Pix, which is the dominant payment method in Brazil (especially for the gaming demographic). Adds friction | `mercadopago` SDK — supports Pix, boleto, and credit/debit cards natively for Brazilian market |
| Chart.js + `react-chartjs-2` | Canvas-based rendering makes Tailwind CSS styling difficult; requires `Chart.register(...)` boilerplate; less composable with React component patterns | Recharts — SVG-based, composable, React-first |
| `next-intl` blog CMS | next-intl manages string translations, not content management. Using it as a "CMS" by storing blog posts as JSON locale files creates an unmanageable content editing workflow | Store blog posts in Neon (markdown body column), admin UI in existing Next.js admin panel |
| External CMS (Contentful, Sanity, Strapi) | Over-engineered for a gaming community blog where the admin already has a Next.js admin panel. Adds API cost, another auth layer, and a separate deployment | Blog posts table in Neon + markdown body + `react-markdown` or `next-mdx-remote` for rendering |

---

## Blog/Content Rendering

No external CMS. Blog posts live in the existing Neon database with a `content TEXT` column (markdown). Rendering:

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react-markdown` | 9.x | Render markdown blog post content as React | Simpler use case — no code blocks, just text/images/links |
| `next-mdx-remote` | 5.x | Render MDX (markdown + React components) server-side | If you want to embed React components (event banners, player cards) inside blog posts |

**Recommendation:** Start with `react-markdown`. Upgrade to `next-mdx-remote` only if admin needs to embed custom components in posts. Both are zero-cost and use existing infrastructure.

```bash
npm install react-markdown
# or, if MDX needed later:
# npm install next-mdx-remote
```

---

## Stack Patterns by Feature

**Loja (Store) — purchase flow:**
```
User clicks "Buy" → Server Action creates MercadoPago order (server-side SDK)
→ Return Pix QR code to client → User pays via Pix
→ MercadoPago POSTs to /api/webhooks/mercadopago (Route Handler)
→ Verify HMAC signature → Confirm payment via API re-fetch
→ Insert row: delivery_queue {player_id, command, status: "pending"}
→ Insert row: orders {player_id, item_id, status: "paid"}
→ Vercel Cron / cron-job.org hits /api/cron/deliver
→ Read pending delivery_queue rows → rcon-client.send(command)
→ Update row status: "delivered"
→ POST Discord Webhook: "Compra entregue para {player}"
```

**Temporadas (Season reset):**
```
Admin triggers via admin panel OR Vercel Cron on season-end date
→ Server Action: copy current rankings to hall_da_fama table
→ Server Action: reset all player elo to starting value (e.g., 1000)
→ Increment current_season counter in seasons table
→ POST Discord Webhook: "Temporada X encerrada! Campeão: {player}"
```

**Dashboard do jogador — ELO chart:**
```
RSC Page /jogadores/[id]: fetch elo_history table (date, rating) for player
→ Pass as prop to <EloChart /> client component
→ Recharts LineChart with date on X axis, elo on Y axis
→ Tailwind + Recharts customTooltip for PT-BR formatting
```

**Blog post:**
```
Admin creates post in /admin/blog: title, slug, content (markdown textarea), published_at
→ Drizzle insert into blog_posts table
→ Public page /blog/[slug]: RSC fetches by slug, renders with react-markdown
→ revalidatePath("/blog") on publish
```

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `mercadopago@2.12.0` | Node.js 18+, TypeScript 5.x | ES Module; use `import { MercadoPagoConfig, Payment } from "mercadopago"` |
| `rcon-client@4.2.5` | Node.js 14+, TypeScript 5.x | CommonJS; works in Next.js API routes and Server Actions |
| `recharts@3.8.0` | React 19, Next.js 16 | Requires `react-is` peer dep override for React 19: `npm install react-is@19` or add `overrides: { "react-is": "19.x" }` in package.json. Required as of March 2026 |
| `react-markdown@9.x` | React 18+, React 19 | ESM only; import with `import ReactMarkdown from "react-markdown"` |
| Discord Webhooks | N/A | Pure `fetch()` — no package, no compatibility concerns |

---

## Sources

- [MercadoPago Node.js SDK — GitHub releases](https://github.com/mercadopago/sdk-nodejs/releases) — v2.12.0 confirmed Jan 2025 (HIGH confidence)
- [MercadoPago Pix integration docs](https://www.mercadopago.com.br/developers/pt/docs/checkout-api-orders/payment-integration/pix) — Pix order API flow (HIGH confidence)
- [Next.js + MercadoPago Pix integration — tabnews.com.br](https://www.tabnews.com.br/zilvodev/como-integrar-mercado-pago-pix-no-next-js-15-app-router) — Next.js 15 App Router practical guide (MEDIUM confidence)
- [rcon-client — GitHub](https://github.com/janispritzkau/rcon-client) — v4.2.5, unmaintained warning noted (HIGH confidence for functionality, LOW for long-term maintenance)
- [rcon-client on libraries.io](https://libraries.io/npm/rcon-client) — version 4.2.3 (MEDIUM confidence)
- [Can I deploy Discord bots to Vercel? — Vercel KB](https://vercel.com/kb/guide/can-i-deploy-discord-bots-to-vercel) — persistent WS bots do not work on Vercel (HIGH confidence)
- [Discord Webhooks with Next.js 15 — freeCodeCamp](https://www.freecodecamp.org/news/integrate-discord-webhooks-with-nextjs-15-example-project/) — fetch-based webhook approach (HIGH confidence)
- [discord.js v14.25.1 — discord.js.org](https://discord.js.org/docs) — current version confirmed (HIGH confidence)
- [Recharts v3.8.0 — GitHub releases](https://github.com/recharts/recharts/releases) — released March 6 2026 (HIGH confidence)
- [Recharts React 19 compatibility — GitHub issue #4558](https://github.com/recharts/recharts/issues/4558) — react-is peer dep workaround (HIGH confidence)
- [Railway Discord bot deployment](https://railway.com/deploy/discordjs) — $5/month free credit, always-on (MEDIUM confidence)
- [BullMQ Vercel incompatibility — Next.js discussion #33989](https://github.com/vercel/next.js/discussions/33989) — confirmed Redis/BullMQ requires persistent process (HIGH confidence)

---

*Stack research for: CraftPro Brasil — v2.0 additions (Loja, Blog, Notificações Discord, Temporadas, Dashboard)*
*Researched: 2026-03-26*
