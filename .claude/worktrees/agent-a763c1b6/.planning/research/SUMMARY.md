# Project Research Summary

**Project:** CraftPro Brasil — v2.0 Feature Additions
**Domain:** Minecraft gaming community website — payments, RCON delivery, Discord notifications, blog/events, competitive seasons, player dashboard
**Researched:** 2026-03-26
**Confidence:** HIGH (core patterns); MEDIUM (Pokémon usage data dependency)

## Executive Summary

CraftPro Brasil v2.0 adds commercial infrastructure to a functioning v1.0 community site. The existing stack (Next.js 16, Drizzle + Neon, Auth.js v5, Vercel Hobby) handles all the new features with targeted library additions — MercadoPago SDK for Brazilian Pix payments, `rcon-client` for in-game rank delivery, Discord Incoming Webhooks for notifications, and Recharts for the ELO dashboard chart. The architecture is entirely additive: new tables, new routes, new services layered onto v1 without redesigning what already works.

The defining architectural decision is the decoupled delivery queue. The payment webhook must never call RCON directly. Instead, it writes a `deliveryQueue` row and returns 200 immediately; a separate cron job processes deliveries with retry logic. This single pattern prevents the three worst failure modes: lost deliveries when the Minecraft server is offline, duplicate deliveries from webhook retries, and payment webhook timeouts from RCON latency. Every other v2.0 pattern is standard and low-risk. The one external dependency that cannot be fully verified is whether the PixelmonShowdown game plugin emits per-Pokémon battle data — this blocks the Pokémon usage stats feature and should be confirmed before building that UI.

The recommended build order follows hard dependency chains: schema migration first, then the store (the core monetization milestone), blog and seasons in parallel (independent of each other and the store), and the player dashboard last (requires weeks of accumulated ELO history data to be meaningful). Discord notifications are fire-and-forget HTTP calls that can be wired in at any phase without blocking other features.

---

## Key Findings

### Recommended Stack

The v1.0 stack requires four additions for v2.0. All are additive installs; nothing in the existing toolchain is replaced or upgraded.

**Core technologies:**
- `mercadopago@2.12.0` (official SDK): payment creation, Pix QR generation, webhook HMAC verification — dominant Pix-native payment provider in Brazil; Stripe does not support Pix
- `rcon-client@4.2.5`: TCP connection to Minecraft RCON port for LuckPerms rank delivery — most battle-tested Node.js RCON library despite an unmaintained warning; wrap in an abstraction layer so it can be swapped if needed
- `recharts@3.8.0`: ELO line chart and Pokémon usage bar chart on the player dashboard — React-native SVG library that matches the existing shadcn/ui component pattern; requires `react-is@19` peer dep override for React 19
- Discord Incoming Webhooks (no library): outbound purchase/battle notifications via plain `fetch()` POST — no persistent process, fully serverless-compatible; using `discord.js` on Vercel is architecturally broken
- `react-markdown@9.x`: blog post markdown rendering — reuses existing Neon storage; no external CMS needed

See `.planning/research/STACK.md` for full version compatibility table, installation commands, and explicit anti-feature list.

### Expected Features

The v2.0 feature set breaks cleanly into a core monetization group that must ship together and a secondary group that can follow.

**Must have (table stakes) — ship as the functional store:**
- Real Pix payment processing (Brazilian players expect this as the primary method)
- Purchase confirmation visible on screen and in Discord
- In-game rank delivery with LuckPerms via RCON
- Delivery state visibility (pending, delivered, failed) on the order page
- Retry-on-reconnect for deliveries when server was offline at purchase time
- Admin order management panel (view, manual retry, cancel)
- Blog/notícias with admin CRUD (low complexity; signals an active server)

**Should have (competitive differentiators) — ship in same release:**
- Discord embed notifications on purchases (#compras channel)
- ELO season system with hard reset to 1000 and hall of fame page
- Events calendar (reuses blog system with an `event_date` field)

**Defer to v2.1:**
- Player dashboard — ELO graph (needs 2–4 weeks of history post-launch to be meaningful)
- Player dashboard — Pokémon usage stats (blocked on game server emitting per-Pokémon data)
- Discord notification on battle results (low priority, high noise at scale)

**Explicitly do not build:**
- Custom payment card form (PCI compliance nightmare; use Checkout Pro hosted flow)
- `discord.js` gateway bot on Vercel (persistent WebSocket is incompatible with serverless)
- Headless CMS (Strapi/Sanity) for the blog (second system, second auth, zero benefit at this scale)
- Pokémon stats before confirming game server data availability

See `.planning/research/FEATURES.md` for full dependency graph, delivery queue state machine, and shop product type breakdown.

### Architecture Approach

The v2.0 architecture is five new components bolted onto the v1 foundation via new DB tables and routes. All state lives in the existing Neon PostgreSQL database — no Redis, no external queues, no new persistence layer. The most structurally significant component is the payment-to-delivery pipeline: a three-step decoupled chain where the webhook handler writes to `deliveryQueue` (fast, returns 200), Vercel Cron polls the queue, and the RCON worker executes and marks delivered. The other components are conventional: ISR blog pages with on-demand revalidation via `revalidateTag`, a DB-transaction season reset, and chart components imported with `next/dynamic { ssr: false }` to prevent hydration errors.

**Major components:**
1. **Loja funcional (Store)** — extends `shopItems` table; new `orders` and `deliveryQueue` tables; MercadoPago Checkout Pro + webhook handler; RCON cron worker; admin `/pedidos` panel
2. **Blog + Eventos** — new `blogPosts` and `events` tables; admin CRUD in existing panel; ISR pages at `/blog` and `/eventos`; no external CMS
3. **Notificações Discord** — stateless Discord Incoming Webhook calls from Server Actions and Route Handlers; fire-and-forget; no bot process
4. **Temporadas de Ranking** — new `seasons` and `seasonSnapshots` tables; atomic DB transaction for ELO reset; public `/temporadas` hall of fame
5. **Dashboard do Jogador** — new `eloHistory` and `pokemonStats` tables; Recharts chart components as `"use client"` with `dynamic` import; extends existing `/perfil/[id]` page

See `.planning/research/ARCHITECTURE.md` for full route structure, DB schema additions, and code patterns for the webhook handler, cron worker, season reset transaction, and Discord notification helper.

### Critical Pitfalls

1. **RCON called synchronously in the webhook handler** — the Minecraft server will be offline sometimes; synchronous RCON in the webhook causes missed deliveries with no retry path and triggers MercadoPago's 8-attempt retry loop. Prevention: write to `deliveryQueue` and return 200 immediately; RCON runs only in the cron worker.

2. **No idempotency on the MercadoPago webhook** — without a `UNIQUE` constraint on `mercadopago_payment_id` in the orders table, the same payment fires twice and delivers duplicate ranks. Prevention: add the unique constraint; check for existing payment ID as the first operation in the handler.

3. **Missing `x-signature` HMAC validation** — any HTTP POST to the webhook URL triggers delivery without this check. Prevention: validate HMAC-SHA256 of `id;request-id;ts` before any DB write; reject with 401 if invalid.

4. **Season reset without snapshot** — running `UPDATE players SET elo = 1000` before capturing top rankings destroys the hall of fame data permanently (Neon free tier has no point-in-time recovery). Prevention: wrap snapshot → close season → reset ELO → open new season in a single DB transaction.

5. **Chart component causing hydration mismatch** — Recharts reads browser APIs during render; importing directly in a Server Component crashes the page. Prevention: `dynamic(() => import('./EloChart'), { ssr: false })` from the first implementation, with a matching skeleton placeholder.

See `.planning/research/PITFALLS.md` for the full checklist of "looks done but isn't" verification steps and security mistakes.

---

## Implications for Roadmap

Based on the hard dependency graph in ARCHITECTURE.md and the MVP priorities in FEATURES.md, the natural phase structure is:

### Phase 1: Schema Foundation
**Rationale:** All v2.0 features require new DB tables. Nothing can be tested without them. A single Drizzle migration for all new tables eliminates migration conflicts across phases.
**Delivers:** Complete Drizzle schema for `orders`, `deliveryQueue`, `blogPosts`, `events`, `seasons`, `seasonSnapshots`, `eloHistory`, `pokemonStats`; `shopItems` and `arenaMatches` extensions; all new env vars documented
**Addresses:** Removes the schema blocker that gates every other phase
**Avoids:** Pitfall 5 (ELO reset without snapshot table existing) and double-migration conflicts later

### Phase 2: Loja Funcional (Store + Payments + RCON Delivery)
**Rationale:** This is the core monetization milestone and the most complex phase. It must ship before any other commercial features because it is the only phase that generates revenue. It also has the highest pitfall density — idempotency, signature validation, delivery queue, RCON reliability — all of which must be addressed here.
**Delivers:** Working Pix payment flow via MercadoPago Checkout Pro; webhook handler with HMAC validation and idempotency; `deliveryQueue` with cron-driven RCON execution; LuckPerms rank delivery with verification; admin `/pedidos` management panel; `/loja/sucesso` confirmation page
**Uses:** `mercadopago@2.12.0`, `rcon-client@4.2.5`, Vercel Cron
**Avoids:** Pitfalls 1–3 and 7 (synchronous RCON, missing idempotency, missing signature validation, Vercel timeout batch limit)

### Phase 3: Blog + Eventos
**Rationale:** Zero dependency on payments or RCON. Can be built concurrently with Phase 2 or directly after it. Low complexity, high perceived value — a blog signals an active server to players browsing the site.
**Delivers:** Admin blog CRUD at `/admin/blog`; public `/blog` listing and `/blog/[slug]` detail with ISR; `/eventos` calendar filtered by event type; markdown rendering via `react-markdown`
**Uses:** `react-markdown@9.x`, existing Neon + Drizzle + admin panel patterns
**Avoids:** Anti-pattern of storing blog in MDX files (requires deploy per post) and external CMS overhead

### Phase 4: Discord Notifications
**Rationale:** Stateless HTTP calls that hook into events established in Phases 2–3. Can be added incrementally at any phase boundary but is cleanest as a dedicated pass after the event-triggering code exists.
**Delivers:** Discord Incoming Webhook integration for purchase confirmed (#compras) and new player join (#novos-jogadores); `notifyDiscord()` helper wired into webhook handler and Auth.js callback; env vars for multiple webhook channels
**Avoids:** Pitfall 4 (discord.js gateway on Vercel) — zero `discord.js` dependency in the Next.js app

### Phase 5: Temporadas de Ranking (Seasons)
**Rationale:** Depends on Phase 1 (seasons/seasonSnapshots tables) but not on Phases 2–4. Natural milestone to launch alongside or after a working shop — "new season, new shop" is a clean community announcement.
**Delivers:** Admin "Encerrar Temporada" action with atomic DB transaction (snapshot → reset → new season); `/temporadas` hall of fame page; season selector on existing leaderboard; Discord notification on season close
**Avoids:** Pitfall 5 (season reset without snapshot) — transaction must be verified in staging before any production reset

### Phase 6: Dashboard do Jogador (ELO Chart + Pokémon Stats)
**Rationale:** Deliberately last. The `eloHistory` table starts recording from Phase 1's schema migration, so by the time Phase 6 is built there will be meaningful data to display. Pokémon usage stats should only be built after confirming the game server emits per-Pokémon battle data.
**Delivers:** `eloHistory` rows recorded per match from Phase 2 onward; Recharts EloChart client component with `dynamic` import + skeleton; Pokémon usage bar chart (conditional on data availability); `/perfil/[id]` extended with dashboard tab
**Uses:** `recharts@3.8.0`, `next/dynamic { ssr: false }`
**Avoids:** Pitfall 6 (chart hydration mismatch); builds on real data rather than empty state

### Phase Ordering Rationale

- Phase 1 before everything: all new DB tables are shared dependencies; a single migration eliminates conflicts
- Phase 2 before Phases 4–5: Discord notifications and season events are triggered by purchase events established in Phase 2
- Phase 3 is independent and can run concurrently with Phase 2 if two workstreams are available
- Phase 6 is intentionally last so the ELO history table has 4–8 weeks of data before the chart UI is shipped

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (Loja):** Verify whether to use MercadoPago Checkout Pro (redirect) or Checkout API (transparent/Pix-only). STACK.md documents both — the choice depends on whether credit card support is in v2.0 scope. Also verify MercadoPago sandbox credentials work end-to-end before committing to the integration pattern.
- **Phase 2 (RCON):** Verify that `rcon-client@4.2.5` can connect from Vercel's outbound network to the specific Minecraft server IP/port. The game server firewall must allow Vercel's IP ranges on port 25575 — confirm with the server operator before implementation.
- **Phase 6 (Pokémon stats):** Confirm with the game server operator whether PixelmonShowdown emits per-Pokémon data in battle results before planning the Pokémon stats UI. If unavailable, scope that feature out of Phase 6 entirely.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Schema):** Drizzle migration is routine; schema is fully specified in ARCHITECTURE.md
- **Phase 3 (Blog):** Standard CRUD with ISR; fully documented Next.js pattern; no novel integration
- **Phase 4 (Discord Webhooks):** Pure `fetch()` POST; pattern is trivial and fully verified
- **Phase 5 (Seasons):** Drizzle transaction pattern is standard; all logic is self-contained in the reset action

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core library choices verified via official repos, npm, and Vercel KB. `rcon-client` unmaintained warning is known; mitigated by abstraction layer. `recharts@3.8.0` react-is workaround verified against GitHub issue #4558. |
| Features | HIGH (core) / LOW (Pokémon stats) | MercadoPago flow, RCON delivery, blog, seasons all verified against official docs and industry patterns. Pokémon usage stats blocked on unverified game server data format. |
| Architecture | HIGH | Webhook + queue + cron pattern is well-documented. Season reset transaction pattern is standard. Discord webhook pattern is official. RCON delivery queue mirrors documented patterns from GameServerApp and Tebex. |
| Pitfalls | HIGH | Every critical pitfall is backed by official docs or GitHub issues with direct citations: MercadoPago retry policy (official), LuckPerms issue #2948, Vercel function limits (official), Discord bot Vercel KB (official), shadcn chart hydration issue #5661. |

**Overall confidence:** HIGH

### Gaps to Address

- **Pokémon usage data:** The game server operator must confirm whether PixelmonShowdown emits per-Pokémon battle data. If not, defer the Pokémon stats feature to v3.0 and scope Phase 6 to ELO graph only.
- **Vercel Hobby cron frequency:** ARCHITECTURE.md notes the hobby plan may be limited to once-per-day cron invocations. Verify in the actual Vercel account dashboard before finalizing RCON delivery frequency expectations. If daily batch is unacceptable, the mitigation is a free cron-job.org trigger to the `/api/cron/process-orders` route handler.
- **MercadoPago sandbox:** Verify test credentials and sandbox webhook delivery work end-to-end before starting Phase 2 implementation. MercadoPago's sandbox has historically been inconsistent.
- **Minecraft server firewall:** Vercel outbound IPs must be allowed through the game server's firewall on port 25575. Confirm with the server operator before RCON integration is tested.

---

## Sources

### Primary (HIGH confidence)
- [MercadoPago Node.js SDK — GitHub](https://github.com/mercadopago/sdk-nodejs) — v2.12.0 confirmed, TypeScript types
- [MercadoPago Pix integration docs](https://www.mercadopago.com.br/developers/pt/docs/checkout-api-orders/payment-integration/pix) — Pix order API flow
- [MercadoPago webhook notifications](https://www.mercadopago.com.br/developers/en/docs/your-integrations/notifications/webhooks) — retry policy (8 attempts), x-signature validation
- [MercadoPago x-signature validation news (2024)](https://www.mercadopago.com.br/developers/en/news/2024/02/27/Ensure-the-validity-of-notifications-sent-by-Mercado-Pago) — HMAC-SHA256 requirement
- [LuckPerms Command Usage — luckperms.net](https://luckperms.net/wiki/Command-Usage) — `lp user X parent addtemp` syntax
- [LuckPerms RCON silent failure — Issue #2948](https://github.com/LuckPerms/LuckPerms/issues/2948) — version-specific bug
- [Vercel Cron Jobs — official docs](https://vercel.com/docs/cron-jobs) — schedule format, hobby plan limits
- [Vercel Hobby Plan limits](https://vercel.com/docs/plans/hobby) — function max duration 60s
- [Vercel Discord bot KB](https://vercel.com/kb/guide/can-i-deploy-discord-bots-to-vercel) — persistent WS incompatibility confirmed
- [Discord Incoming Webhooks — discord.dev](https://discord.com/developers/docs/resources/webhook) — HTTP POST pattern
- [Recharts v3.8.0 — GitHub releases](https://github.com/recharts/recharts/releases) — March 6 2026 release
- [Recharts React 19 peer dep — Issue #4558](https://github.com/recharts/recharts/issues/4558) — react-is workaround
- [shadcn/ui chart hydration bug — Issue #5661](https://github.com/shadcn-ui/ui/issues/5661) — Next.js 15 hydration error confirmed
- [Next.js on-demand ISR revalidation](https://nextjs.org/docs/app/guides/incremental-static-regeneration) — revalidateTag + revalidatePath
- [rcon-client — npm](https://www.npmjs.com/package/rcon-client) — v4.2.5, TypeScript-native

### Secondary (MEDIUM confidence)
- [Next.js + MercadoPago Pix — tabnews.com.br](https://www.tabnews.com.br/zilvodev/como-integrar-mercado-pago-pix-no-next-js-15-app-router) — App Router practical integration guide
- [Discord Webhooks with Next.js 15 — freeCodeCamp](https://www.freecodecamp.org/news/integrate-discord-webhooks-with-nextjs-15-example-project/) — fetch-based webhook pattern confirmed
- [GameServerApp delivery docs](https://docs.gameserverapp.com/dashboard/monetization/deliveries/) — industry delivery queue pattern reference
- [goncy/next-mercadopago — GitHub](https://github.com/goncy/next-mercadopago) — reference MercadoPago + Next.js implementation
- [LoL Ranked Season 2025 — esports.gg](https://esports.gg/news/league-of-legends/league-of-legends-in-2025-new-season-model-rank-resets/) — season model reference
- [FACEIT Season 7 ELO Reset FAQ](https://support.faceit.com/hc/en-us/articles/23699854766876-Season-7-Elo-Reset-FAQ) — competitive reset pattern reference
- [Railway Discord bot deployment](https://railway.com/deploy/discordjs) — $5/month free credit, always-on Node process (fallback if bot commands needed in v2.1)

---
*Research completed: 2026-03-26*
*Ready for roadmap: yes*
