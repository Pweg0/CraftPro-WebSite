# Feature Landscape

**Domain:** Minecraft Server Network Community Website — v2.0 New Features
**Researched:** 2026-03-26
**Confidence:** MEDIUM-HIGH — based on official MercadoPago docs, LuckPerms wiki, GameServerApp delivery patterns, Discord.js docs, and LoL/FACEIT season models. RCON delivery queue pattern is custom but based on documented retry patterns.

---

## Context: What Already Exists (v1)

These features are complete and should NOT be rebuilt:

- Landing page, navbar, footer (retro-neon aesthetic)
- Server status with live player counts
- Banned items (DB-backed, admin CRUD)
- Shop preview page ("Em Breve" + admin CRUD)
- Replay pages (Showdown log format, match details)
- Discord OAuth login with persistent sessions
- ELO ranking with leaderboard, Top 10, tier badges (Bronze→Diamond)
- Player profiles (stats, match history)
- Admin panel (permissions, audit logs, full CRUD)
- License key system for mod keys

The v2.0 features below build on this foundation.

---

## Table Stakes (Players Expect These)

Features players expect from a server with a real shop. Missing these = distrust or abandoned purchases.

| Feature | Why Expected | Complexity | Dependencies on Existing |
|---------|--------------|------------|--------------------------|
| Real payment processing (Pix/cartão/boleto) | Brazilian players expect Pix as primary payment. Cartão and boleto are secondary. Shop without Pix feels broken. | HIGH | Existing shop preview page (convert "em breve" to functional) |
| Purchase confirmation + receipt | Player receives confirmation on screen and/or Discord DM after payment. No confirmation = player thinks purchase failed. | MEDIUM | Discord OAuth login (have Discord ID) |
| Rank/VIP delivery to game account | VIP rank must actually appear in-game. If it doesn't arrive within ~60 seconds, player opens support ticket. | HIGH | Existing Discord↔Minecraft link (admin-set), RCON |
| Delivery state visibility | Player must see if their delivery is pending (server offline), delivered, or failed. No visibility = repeated purchase attempts. | MEDIUM | New: orders table + status page |
| Retry on server reconnect | If server was offline at purchase time, delivery runs automatically when server comes back. Expected behavior on every game server shop. | MEDIUM | RCON + delivery queue |
| Admin order management | Admin sees all orders, payment status, delivery status, can manually retry or cancel. | MEDIUM | Existing admin panel (extend it) |
| Blog/notícias (patch notes, updates) | Players need to know about updates, events, and changes. Absence feels like an abandoned server. | MEDIUM | Existing admin panel (new section) |
| Event/tournament calendar | Players want to know when the next ranked tournament or event is. Expected by competitive communities. | LOW | Blog system (events are blog posts with date/type metadata) |
| Season announcements | ELO reset and new season must be announced clearly. Players need advance notice to prepare. | LOW | Blog + existing ELO system |

---

## Differentiators (Competitive Advantage)

Features that distinguish CraftPro Brasil from generic server websites.

| Feature | Value Proposition | Complexity | Dependencies on Existing |
|---------|-------------------|------------|--------------------------|
| Discord bot notifications (embeds) | Rich embeds in Discord on purchases, new player joins, battle results. Makes the server feel alive in Discord. Most servers use plain text or nothing. | MEDIUM | Discord OAuth (have user IDs), existing battle/match data |
| ELO season system with hall of fame | Seasonal resets with a preserved champion record. Borrowed from LoL/FACEIT but rare on Minecraft servers. Drives end-of-season engagement spike. | MEDIUM | Existing ELO ranking system (add season foreign key) |
| Player dashboard — ELO graph | Line chart of ELO over time. Players love watching their progression. Zero Minecraft server websites do this. | MEDIUM | Existing match history (add ELO snapshot per match) |
| Player dashboard — Pokémon stats | Most-used Pokémon, win rate per Pokémon, usage trends. Gives identity beyond just a number. | MEDIUM | Existing match/battle data (needs Pokémon breakdown per match) |
| Temporary rank expiry visibility | Player sees exactly when their VIP expires on their profile. Standard in premium game services but absent on most Minecraft server sites. | LOW | LuckPerms expiry data (store in DB when delivering), player profile |
| LuckPerms ranks with auto-expiry | VIP/rank automatically expires after duration without admin intervention. Builds trust. | MEDIUM | RCON + LuckPerms (lp user {name} parent addtemp {rank} {duration}) |

---

## Anti-Features (Explicitly Avoid)

| Anti-Feature | Why Requested | Why Problematic | What to Do Instead |
|--------------|---------------|-----------------|-------------------|
| Custom payment processing (own checkout form) | "Why redirect to MercadoPago?" | PCI compliance nightmare. Handling raw card data requires SAQ-D PCI DSS certification. Legal risk in Brazil (LGPD). | Use MercadoPago Checkout Pro — redirect flow handles all card data on their side |
| Real-time delivery status (WebSocket polling) | "I want to see it update live" | Adds WebSocket infra for a flow that completes in ~5 seconds. Over-engineering for occasional purchases. | Page refresh or simple polling endpoint (every 10s for 60s) during post-purchase flow |
| Headless CMS (Strapi, Sanity, Contentful) for blog | "Let's use a real CMS" | Already have admin panel + Drizzle/Neon. Adding a separate CMS adds a second system to maintain, second auth, extra cost. | Store blog posts and events directly in Neon DB with admin CRUD in existing panel. Rich text via markdown (react-markdown + remark). |
| Discord bot as persistent process on Vercel | "Deploy the bot to Vercel" | Vercel serverless functions time out after 10s (hobby) and don't support persistent WebSocket connections needed for a Discord gateway bot. | Discord Webhooks for outbound notifications (no bot process needed). For any inbound commands: Discord Interactions (HTTP endpoint, not gateway). |
| Email newsletter for events | "Send emails for new events" | Adds email infra (SendGrid/Resend), LGPD consent flows, unsubscribe management. The audience is already in Discord. | Discord channel notification via webhook. Players who want updates join the Discord. |
| Inventory check before delivery | "Don't deliver if inventory is full" | RCON has no inventory read API in vanilla/NeoForge contexts. Would require a custom mod. Scope creep. | Queue delivery with retry. On failure, admin sees it in order panel and can retry manually. |
| Season ELO soft-reset (partial decay) | "Like LoL's soft reset" | Complex math, player confusion, hard to explain. Massive overkill for a small Minecraft server. | Hard reset to a base value (e.g., 1000 ELO) at season start. Simple, predictable, fair for a community server. |
| Public purchase history / transparency log | "Show everyone what was bought" | Privacy concern (LGPD). Players don't want their spending visible. Looks like pay-to-win advertising. | Admin-only order log. Player sees only their own orders. |

---

## Feature Dependencies (v2.0)

```
MercadoPago Payment Flow
    └──requires──> New: products table (name, price, type, RCON commands)
    └──requires──> New: orders table (user_id, product_id, status, payment_id)
    └──requires──> New: /api/checkout route (creates MP preference, returns init_point)
    └──requires──> New: /api/webhooks/mercadopago route (confirms payment, queues delivery)
    └──depends on──> Existing: Discord OAuth (user identity)
    └──depends on──> Existing: Discord↔Minecraft link (to know the MC username)

RCON Delivery Queue
    └──requires──> New: deliveries table (order_id, commands[], status, attempts, next_retry_at)
    └──requires──> New: delivery worker (cron or on-demand) that polls deliveries table
    └──requires──> New: RCON client module (mcrcon-compatible, Node.js)
    └──depends on──> MercadoPago Payment Flow (triggers queue insert on payment approved)
    └──depends on──> LuckPerms (delivery command: lp user {mc_user} parent addtemp {rank} {duration})

LuckPerms Rank Delivery
    └──requires──> RCON Delivery Queue
    └──requires──> rank_expiry stored in orders/deliveries table (for profile display)
    └──delivers via──> RCON: /lp user {mc_username} parent addtemp {rank} {duration} {expiry_mode}

Blog + Events
    └──requires──> New: posts table (title, slug, content_md, type [news|patch|event], published_at, event_date?)
    └──requires──> New: admin CRUD routes for posts (extend existing admin panel)
    └──requires──> New: /blog page (list), /blog/[slug] page (detail)
    └──requires──> New: /eventos page (calendar view filtered by type=event)
    └──independent of──> shop, RCON, ELO (no hard dependency)

Discord Bot Notifications
    └──requires──> New: DISCORD_WEBHOOK_URL(s) in env (one per channel: #compras, #novos-jogadores, #batalhas)
    └──requires──> New: notification dispatch calls in: order confirmed handler, new player event, battle recorded handler
    └──depends on──> MercadoPago webhook handler (triggers purchase notification)
    └──depends on──> Existing: match/battle recording (triggers battle notification)
    └──NO persistent bot process needed──> Uses Discord Incoming Webhooks (HTTP POST)

ELO Seasons
    └──requires──> New: seasons table (id, name, started_at, ended_at)
    └──requires──> New: season_rankings snapshot table (season_id, user_id, final_elo, rank, position)
    └──requires──> New: current_season_id foreign key on elo/matches tables
    └──requires──> New: /temporadas page (hall of fame listing past seasons)
    └──requires──> New: admin action: "Encerrar Temporada + Iniciar Nova" (snapshot → reset ELO)
    └──depends on──> Existing: ELO ranking system, leaderboard, player profiles

Player Dashboard
    └──requires──> New: elo_history table (user_id, elo_value, recorded_at, match_id)
           NOTE: must start recording from season start — retroactive data unavailable
    └──requires──> New: pokemon_usage table (user_id, pokemon_name, wins, losses, season_id)
           NOTE: requires game server to emit per-Pokémon data in battle results
    └──requires──> New: /jogador/[id]/dashboard route (extend existing profile)
    └──depends on──> Existing: player profiles, match history
    └──depends on──> Existing: battle recording format (needs Pokémon breakdown field)
    └──blocked on──> Pokemon usage data: game server must emit which Pokémon was used per battle
```

### Critical Dependency Notes

- **MercadoPago → RCON → LuckPerms is a single critical path.** All three must work together before the shop can be considered functional. Test end-to-end in staging before launch.
- **ELO history must start recording from day one of the new season.** There is no retroactive history before implementation. Launch the dashboard after at least 2–4 weeks of history accumulation or the graph will be nearly empty.
- **Discord↔Minecraft link is already admin-set in v1.** The RCON delivery depends on this mapping being accurate. If a player's MC username changes (name change), delivery will fail silently. Add username validation on delivery attempt.
- **Pokémon usage stats are blocked on game server data.** If the PixelmonShowdown plugin does not emit which Pokémon was used per match, the per-Pokémon stats feature cannot be built. Plan a fallback (show only ELO graph, defer Pokémon stats).
- **Discord Webhooks (not a bot gateway) for notifications.** This is a key architectural decision: outbound notifications go to Discord via Incoming Webhooks (simple HTTP POST). No persistent process, no Discord.js gateway connection, no Vercel incompatibility.

---

## MVP for v2.0

### Ship First (Core Value)

| Feature | Rationale |
|---------|-----------|
| MercadoPago Checkout Pro (Pix + cartão) | Core monetization — entire v2.0 milestone depends on this |
| RCON delivery queue (with retry + offline queuing) | Without reliable delivery, shop is a liability not an asset |
| LuckPerms rank delivery with expiry | The primary sellable product |
| Admin order dashboard (view, retry, cancel) | Required to operate the shop safely |
| Blog (news + patch notes, admin CRUD) | Low complexity, high perceived server health signal |

### Ship in Same Release

| Feature | Rationale |
|---------|-----------|
| Discord notification on purchase (#compras channel) | Immediate social proof loop — players see others buying |
| Events calendar (blog posts with event_date) | Reuses blog system, adds event_date field only |
| ELO season system + season reset | Natural milestone — launch new season with v2.0 |
| Hall of fame page (/temporadas) | Gives the ELO reset a visible payoff |

### Defer to v2.1 if Needed

| Feature | Reason to Defer |
|---------|-----------------|
| Player dashboard — ELO graph | Needs 2–4 weeks of history data post-launch to be meaningful |
| Player dashboard — Pokémon stats | Blocked on game server emitting per-Pokémon data |
| Discord notification on new player join | Low priority vs purchase notifications |
| Discord notification on battle result | Low priority, high noise if server is active |

---

## Shop Product Types

Understanding what can actually be sold drives schema and delivery logic.

| Product Type | Delivery Method | RCON Command Pattern | Expiry? |
|--------------|-----------------|----------------------|---------|
| VIP/Rank (temporary) | LuckPerms via RCON | `/lp user {mc_user} parent addtemp {rank} {duration}` | Yes — store expiry in DB |
| VIP/Rank (permanent) | LuckPerms via RCON | `/lp user {mc_user} parent set {rank}` | No |
| In-game item / kit | NeoForge command via RCON | `/give {mc_user} {item} {count}` or custom kit command | No |
| Caixa (loot key) | Custom mod command via RCON | `/cratereload {mc_user} {crate_type} {amount}` | No |
| Cosmético | Cosmetics mod command via RCON | Mod-specific, configured per product in admin | No |

All product types share the same delivery queue pattern. Admin configures RCON commands per product in the shop admin panel (store as array of command strings with `{mc_user}` placeholder).

---

## MercadoPago Integration Pattern

**Flow (confirmed against official docs, MEDIUM-HIGH confidence):**

1. Player clicks "Comprar" on shop item
2. POST `/api/checkout` → create MP preference via `sdk-nodejs` → return `init_point` URL
3. Redirect player to MercadoPago hosted checkout (Checkout Pro)
4. Player pays via Pix/cartão/boleto on MercadoPago's domain
5. MercadoPago sends webhook POST to `/api/webhooks/mercadopago` (JSON, signed with `x-signature` header)
6. Backend validates signature, queries MP API to confirm `status === 'approved'`
7. Order marked `paid`, delivery job inserted into `deliveries` table
8. Delivery worker picks up job, runs RCON commands, marks `delivered`
9. Player redirected back to `/loja/pedido/{id}` (success/pending/failure page)

**Payment statuses to handle:** `approved` (deliver), `pending` (wait, re-check), `rejected` (inform player), `cancelled` (no delivery).

**SDK:** `mercadopago` npm package (official, `mercadopago/sdk-nodejs` on GitHub). Install: `npm install mercadopago`.

---

## RCON Delivery Queue Pattern

**Queue states for `deliveries` table:**

| State | Meaning | Next Action |
|-------|---------|-------------|
| `pending` | Awaiting delivery attempt | Worker picks up immediately |
| `in_progress` | RCON connection active | Worker executing commands |
| `delivered` | All commands executed successfully | No action — done |
| `failed_retrying` | RCON failed, scheduled for retry | Retry after backoff (1m, 5m, 15m, 60m) |
| `failed_permanent` | Max retries exceeded | Alert admin, manual intervention |
| `player_offline` | Server online but player not logged in | Re-attempt on next cron tick (commands queue in LuckPerms even when offline for some command types) |

**Known RCON risks (from research):**
- RCON is not thread-safe for rapid concurrent commands — execute sequentially per order
- Connection can drop silently — always verify response, never assume success
- NeoForge RCON is vanilla-compatible (same protocol as Java Edition)
- LuckPerms `addtemp` works even when player is offline — LP stores it in its own DB

---

## Discord Notification Architecture

**No bot gateway process.** Use Discord Incoming Webhooks.

- Create 1–3 webhooks in Discord channel settings (one per channel type)
- Store webhook URLs in env vars: `DISCORD_WEBHOOK_COMPRAS`, `DISCORD_WEBHOOK_JOGADORES`, `DISCORD_WEBHOOK_BATALHAS`
- From Next.js server-side code: `fetch(webhookUrl, { method: 'POST', body: JSON.stringify({ embeds: [...] }) })`
- No discord.js dependency needed for outbound-only notifications
- Embeds include: player Discord mention, product name, order ID, timestamp

**Notification triggers:**
- Purchase approved → #compras embed (product, player, tier badge color)
- New player first login → #novos-jogadores embed (Discord avatar, username)
- Battle completed → #batalhas embed (winner, loser, ELO delta) — defer to v2.1

---

## Blog + Events Architecture

**Simplest viable pattern:** blog posts stored in Neon DB, rendered server-side in Next.js, admin CRUD in existing panel.

- `posts` table: `id, title, slug, content_md, type (news|patch_notes|event|announcement), published_at, event_date (nullable), event_end_date (nullable), banner_url (nullable), author_id`
- Content stored as Markdown string — rendered with `react-markdown` + `remark-gfm`
- `/blog` — paginated list, filter by type, most recent first
- `/blog/[slug]` — full post detail
- `/eventos` — filter posts where `type = 'event'` AND `event_date >= today`, show as calendar cards or sorted list
- Admin: rich textarea with Markdown preview (or simple `<textarea>` + live preview panel) — no external CMS needed

**No headless CMS.** The existing admin panel already handles auth, permissions, and CRUD patterns. Adding a CMS (Strapi, Sanity) would introduce a second system, second deployment, and second auth layer for zero benefit at this scale.

---

## ELO Season System Pattern

**Based on LoL / FACEIT season patterns, adapted for community server scale:**

- One active season at a time (`seasons` table: `id, name, started_at, ended_at, is_active`)
- At season end: snapshot all current ELO rankings into `season_rankings` (read-only archive)
- ELO reset: all players' current ELO set back to 1000 (hard reset — simpler than soft reset)
- Hall of fame page: `/temporadas` listing past seasons, expandable to show top 10 per season
- Admin action: "Encerrar Temporada" → creates snapshot → resets ELO → creates new season record
- Leaderboard page already shows current season by default — add season selector dropdown

**Season length:** Not defined in scope. Recommend 2–3 months for a community server. Admin decides.

---

## Player Dashboard Pattern

**ELO graph:** Line chart of ELO value over time (one point per match played).
- Data source: `elo_history` table — insert one row per match with `(user_id, match_id, elo_after, recorded_at)`
- Chart library: Recharts (already React-native, lightweight, works as client component in Next.js)
- Display: AreaChart with ELO on Y axis, match date on X axis. Color matches player's current tier.

**Pokémon usage stats:** Win rate and usage count per Pokémon.
- Data source: `pokemon_usage` per match record — requires game server to emit Pokémon name used
- Display: Bar chart (top 5 most used) + usage table with win/loss columns
- **Risk:** If PixelmonShowdown does not emit per-Pokémon data, this feature is blocked. Confirm data availability before building UI.

**Dashboard location:** Extend `/perfil/[id]` page or add `/perfil/[id]/dashboard` tab. Visible to all users, detailed stats only for self.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| MercadoPago flow | HIGH | Official SDK (mercadopago/sdk-nodejs), official docs confirm webhook + Checkout Pro pattern |
| RCON delivery queue | MEDIUM | Protocol is well-documented; queue/retry pattern is custom but standard across all server shop platforms (GameServerApp, Tebex, etc.) |
| LuckPerms RCON commands | HIGH | LuckPerms wiki confirms `lp user {name} parent addtemp {rank} {duration}` syntax; works offline |
| Discord Webhooks | HIGH | Official Discord docs, webhook HTTP POST is stable and well-documented |
| Blog/Events (DB-backed) | HIGH | Standard CRUD pattern, proven in existing admin panel |
| ELO season system | MEDIUM | Pattern borrowed from LoL/FACEIT; adapted for simpler community server needs |
| Player dashboard (ELO graph) | HIGH | Recharts + Next.js is well-documented, ELO history table is straightforward |
| Pokémon usage stats | LOW | Blocked on game server data format — unverified whether PixelmonShowdown emits per-Pokémon data |

---

## Sources

- [MercadoPago Checkout Pro Docs](https://www.mercadopago.com.ar/developers/en/docs/checkout-pro/overview) — HIGH confidence (official)
- [MercadoPago Payment Notifications / Webhooks](https://www.mercadopago.com.ar/developers/en/docs/checkout-pro/payment-notifications) — HIGH confidence (official)
- [mercadopago npm (official SDK)](https://www.npmjs.com/package/mercadopago) — HIGH confidence (official package)
- [mercadopago/sdk-nodejs GitHub](https://github.com/mercadopago/sdk-nodejs) — HIGH confidence (official repo)
- [LuckPerms Developer API Wiki](https://luckperms.net/wiki/Developer-API) — HIGH confidence (official)
- [LuckPerms temporary permissions (GitHub issue #1785)](https://github.com/LuckPerms/LuckPerms/issues/1785) — MEDIUM confidence (community confirmed)
- [Minecraft RCON Wiki](https://minecraft.wiki/w/RCON) — HIGH confidence (official Minecraft Wiki)
- [GameServerApp Delivery Docs](https://docs.gameserverapp.com/dashboard/monetization/deliveries/) — MEDIUM confidence (platform docs, illustrates industry pattern)
- [Discord Webhooks (discord.js guide)](https://discordjs.guide/popular-topics/embeds.html) — HIGH confidence (official guide)
- [How to Integrate Discord Webhooks with Next.js 15 (freeCodeCamp)](https://www.freecodecamp.org/news/integrate-discord-webhooks-with-nextjs-15-example-project/) — MEDIUM confidence (tutorial, confirmed pattern)
- [Recharts + Next.js Dashboard (Ably blog)](https://ably.com/blog/informational-dashboard-with-nextjs-and-recharts) — MEDIUM confidence (tutorial, confirmed library usage)
- [LoL Ranked Season 2025 (esports.gg)](https://esports.gg/news/league-of-legends/league-of-legends-in-2025-new-season-model-rank-resets/) — MEDIUM confidence (pattern reference for season model)
- [FACEIT Season 7 ELO Reset FAQ](https://support.faceit.com/hc/en-us/articles/23699854766876-Season-7-Elo-Reset-FAQ) — MEDIUM confidence (competitive season reset pattern reference)

---

*Feature research for: CraftPro Brasil — v2.0 Loja, Blog, Notificações, Temporadas, Dashboard*
*Researched: 2026-03-26*
