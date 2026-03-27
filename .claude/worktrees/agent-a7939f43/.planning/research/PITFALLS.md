# Pitfalls Research

**Domain:** Minecraft server community website — v2.0 additions: functional shop (MercadoPago + RCON + LuckPerms), Blog/Events, Discord bot notifications, competitive seasons (ELO reset + hall of fame), player dashboard (ELO chart, Pokémon stats)
**Researched:** 2026-03-26
**Confidence:** MEDIUM-HIGH (Vercel limits verified from official docs; MercadoPago behavior from official docs + community; RCON/LuckPerms from GitHub issues; Discord architecture from official docs)

---

## Critical Pitfalls

### Pitfall 1: RCON From Serverless — New TCP Connection Per Invocation Kills Reliability

**What goes wrong:**
RCON is a stateful TCP protocol. Every serverless function invocation (Vercel cold or warm) opens a new TCP connection to the Minecraft server, authenticates, sends the command, then discards the connection. At the Vercel Hobby plan's 60-second max duration, this is fine for a single command — but when the Minecraft server is unreachable (offline for maintenance, restarting after a crash), the TCP connect attempt blocks until the function times out. The payment is already confirmed by MercadoPago, but the rank/item was never delivered. There is no retry.

**Why it happens:**
Developers treat RCON like a REST call. It is not. It is a raw TCP connection that assumes the target is always reachable. The purchase flow calls RCON synchronously during the payment webhook, so a 3-second server blip causes a 60-second hang and a failed delivery with no recovery path.

**How to avoid:**
Never call RCON synchronously inside the payment webhook. Decouple the payment confirmation from the command delivery using a persistent queue in the database:
1. Webhook receives MercadoPago notification → immediately writes a `pending_delivery` row to Neon → returns 200 OK to MercadoPago within 500ms.
2. A separate cron job (Vercel Cron, free on Hobby) polls `pending_delivery` every minute → attempts RCON → on success marks `delivered`; on failure increments `attempts` and retries up to N times.
3. Alert admin when `attempts >= 5` (via Discord webhook, not bot) so manual intervention is possible.

This architecture is already planned ("fila no banco") — the pitfall is not skipping it under time pressure.

**Warning signs:**
- Payment webhook calls `rconClient.connect()` before returning the HTTP response.
- No `pending_delivery` table or equivalent queue exists in the schema.
- RCON errors cause the webhook to return a non-2xx response (triggers MercadoPago's retry loop, resulting in double-delivery).

**Phase to address:**
Loja funcional phase — design the queue schema and cron processor before writing any RCON code. The queue must exist on day one of the shop.

---

### Pitfall 2: LuckPerms Commands Silently Fail Over RCON

**What goes wrong:**
LuckPerms has a documented bug (Issue #2948) where RCON-sourced commands were silently ignored — the plugin received the command, printed no error, but made no changes. The root cause was improper permission checking for RCON-originated LP commands. The bug was introduced in build 5.3.3 and fixed later. If the server runs an affected version, the delivery queue will show commands as "executed" (RCON returned success) but the player's rank never changes. Players receive no VIP perks and raise support tickets.

**Why it happens:**
RCON returns a success response based on whether the command string was received, not whether LuckPerms processed it. There is no "command failed" signal at the RCON protocol level for LP-specific failures. Automated delivery systems assume RCON success = LuckPerms success.

**How to avoid:**
- Verify that the running LuckPerms version is not between 5.3.3 and the fix commit. The fix was merged; ensure the server runs a build after the fix.
- After sending the LP command via RCON, send a follow-up verification command: `lp user <player> info` and check the response body for the expected rank string. If the rank is absent, mark the delivery as failed and retry.
- Log the full RCON response for every LP command — never assume success from a non-error response.

**Warning signs:**
- Delivery queue shows commands as `delivered` but players report missing ranks.
- RCON responses for `lp user X parent add VIP` are empty strings (normal for LP commands — no output is not confirmation of success).
- Server running LuckPerms between major versions without checking changelogs.

**Phase to address:**
Loja funcional phase — include a verification step in the delivery worker before marking any rank delivery as complete.

---

### Pitfall 3: MercadoPago Webhook Delivers Duplicate Notifications — No Idempotency Guard

**What goes wrong:**
MercadoPago's retry policy sends the same webhook notification up to 8 times (at: 0min, 15min, 30min, 6h, 48h, 96h, 96h, 96h) if your endpoint doesn't return 200 quickly enough. On Vercel Hobby, a cold start + RCON connection attempt can easily exceed 500ms, causing MercadoPago to interpret the response as a failure and retry. Without idempotency checks, the same purchase is processed multiple times: the player receives duplicate ranks, duplicate items, or duplicate keys — and you lose revenue with no recourse.

**Why it happens:**
The webhook handler does not check if the payment ID has already been processed before running the delivery logic. The function takes too long (RCON + DB write) to respond within MercadoPago's tolerance window.

**How to avoid:**
- Return 200 immediately after validating the `x-signature` header and writing the event to a `webhook_events` table with the MercadoPago `payment_id` as a unique key. Any duplicate notification with the same `payment_id` gets a 200 but no further processing.
- Query the actual payment status from the MercadoPago API (not just trust the webhook payload) before confirming delivery — the webhook only signals that something happened; the payment status must be verified via `GET /v1/payments/{id}`.
- The entire webhook handler must complete within 2-3 seconds. RCON goes in the queue, not here.

**Warning signs:**
- Webhook handler calls RCON or complex DB logic before returning HTTP 200.
- No `UNIQUE` constraint on `payment_id` in the events or orders table.
- No validation of the `x-signature` header (means fraudulent notifications can trigger deliveries).

**Phase to address:**
Loja funcional phase — write the idempotency guard and signature validation as the first two lines of the webhook handler, before any business logic.

---

### Pitfall 4: Discord Bot Requires Persistent WebSocket — Incompatible With Vercel Serverless

**What goes wrong:**
A traditional Discord bot (discord.js with `client.login()`) requires a persistent WebSocket connection to the Discord Gateway. Vercel serverless functions terminate after the response is sent. The bot connects, registers as online, then immediately gets killed — it never processes events, never sends proactive notifications, and Discord eventually bans the application for repeated abnormal disconnects.

**Why it happens:**
Developers familiar with discord.js copy the standard bot template (`client.on('ready')`, `client.on('messageCreate')`) without realizing this pattern assumes a long-running Node.js process. Vercel's documentation explicitly states it does not support long-running servers.

**How to avoid:**
Use Discord Webhooks (not bots) for all proactive outbound notifications: purchases, new players, battle results. Incoming webhooks are simple HTTP POSTs to a channel URL — no connection, no state, no auth token, fully compatible with serverless.

For interactive slash commands (if needed later), use Discord's Interactions Endpoint URL pattern — Discord sends POST requests to your Vercel function; respond within 3 seconds. This works on Vercel.

The use cases described (purchase notifications, new player alerts, battle results) are all outbound-only. They need Discord webhooks, not a bot process.

**Warning signs:**
- `discord.js` listed as a production dependency with `client.login()` called inside a Vercel API route.
- Bot shows as "online" in Discord for a few seconds after a deploy then goes offline.
- `client.on('ready', ...)` event handler inside a serverless function.

**Phase to address:**
Notificações Discord phase — architect around Discord webhooks from the start. Don't add discord.js as a dependency if the only use case is sending notifications.

---

### Pitfall 5: ELO Season Reset Destroys Historical Data — No Hall of Fame Recovery

**What goes wrong:**
The season reset is implemented as a SQL `UPDATE players SET elo = 1000` (or similar). The top players at the end of the season are never recorded before the reset. The "hall da fama" feature requires knowing who held what rank at the end of each season — if you reset first and record second (or forget to record), the data is gone. Neon free tier has no point-in-time recovery on the free plan, so there is no fallback.

**Why it happens:**
Season resets feel like a single operation, not a two-step process. Developers run the reset first, plan to add the hall of fame display later, and discover the data to populate it no longer exists.

**How to avoid:**
The season reset must follow this exact order:
1. Snapshot current top-N players into a `season_records` table (season number, player ID, final ELO, final rank position, snapshot timestamp).
2. Only then reset ELO values.
3. Mark the season as closed in a `seasons` table.
These three steps must be wrapped in a single database transaction. If any step fails, the whole operation rolls back.

Additionally, store per-player ELO history as append-only rows (not updates) — this enables the ELO evolution graph on the player dashboard without any extra effort.

**Warning signs:**
- No `season_records` or `hall_of_fame` table in the database schema.
- Season reset is a single `UPDATE` statement without a preceding snapshot.
- ELO is stored as a mutable column that gets overwritten rather than computed from an event log.

**Phase to address:**
Temporadas de ranking phase — design the `season_records` table and the transactional reset procedure before implementing any reset UI or admin button.

---

### Pitfall 6: Chart Library Causes Hydration Mismatch in Next.js App Router

**What goes wrong:**
The ELO evolution graph on the player dashboard uses a chart library (Recharts, Chart.js, Tremor). These libraries read browser APIs (window dimensions, canvas context, ResizeObserver) during render. In Next.js App Router, components render on the server first. The server-rendered HTML shows no chart (or a broken placeholder); React on the client re-renders with the real chart. The two trees don't match, throwing a hydration error that either crashes the page or produces visible layout flicker. A confirmed bug report shows shadcn/ui chart components failing in Next.js 15 with this exact error.

**Why it happens:**
Chart libraries are designed for browser environments. SSR renders them without access to browser APIs. The component outputs different HTML server-side vs client-side, and React's hydration requires identical output.

**How to avoid:**
Import chart components with `dynamic(() => import('./EloChart'), { ssr: false })`. This prevents the component from being server-rendered entirely and renders it only after hydration. Add a skeleton/loading placeholder with matching dimensions to prevent layout shift while the chart loads.

Do not use `suppressHydrationWarning` — it hides the error but doesn't fix it, and the chart will still flicker.

**Warning signs:**
- Chart component is a direct import in a Server Component file.
- "Hydration failed" or "Text content does not match" errors in the browser console on the dashboard page.
- Chart renders fine in dev but breaks in production build (SSR is more aggressive in production).

**Phase to address:**
Dashboard do jogador phase — use `dynamic` import with `ssr: false` for every chart component from the first implementation. Don't fix it later.

---

### Pitfall 7: Vercel Hobby Plan 60-Second Function Limit Affects Webhook + RCON Queue Processor

**What goes wrong:**
The Vercel Hobby plan allows serverless functions to run for a maximum of 60 seconds (configurable from the default 10s up to 60s). The RCON delivery worker — which opens a TCP connection, authenticates, sends commands, reads responses, and updates the database — easily approaches this limit if the Minecraft server is slow to respond or the queue has many pending deliveries. When the function times out, the RCON connection is torn down mid-execution, possibly leaving commands in an ambiguous state: sent but not confirmed.

**Why it happens:**
The cron worker tries to process all pending deliveries in a single invocation. Each delivery takes 1-5 seconds (TCP connect + RCON auth + command + verification). Ten pending deliveries = 10-50 seconds. The 60-second limit is closer than it appears.

**How to avoid:**
- Configure the RCON worker function with `maxDuration: 60` in `vercel.json` to explicitly claim the full 60 seconds.
- Process only N deliveries per invocation (e.g., 5 at a time) rather than all pending items. The next cron tick handles the rest.
- Implement a `locked_at` timestamp on `pending_delivery` rows to prevent two concurrent invocations from processing the same delivery.
- Set a generous RCON connection timeout (e.g., 5 seconds) rather than waiting indefinitely for an unresponsive server.

**Warning signs:**
- Cron worker has no limit on how many rows it processes per run.
- `pending_delivery` rows have no `locked_at` field.
- Function duration in Vercel logs frequently approaches 55-60 seconds.

**Phase to address:**
Loja funcional phase — set the per-invocation batch limit and row locking before the first cron deployment.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Calling RCON synchronously in the webhook handler | Simpler code, no queue table | Every Minecraft server downtime causes failed deliveries with no retry | Never — the queue is non-negotiable |
| Trusting the MercadoPago webhook payload status without re-querying the API | Saves an extra API call | Fraudulent or replayed notifications trigger deliveries | Never — always re-query payment status |
| Skipping signature validation on the MercadoPago webhook | Faster to build | Anyone who knows your webhook URL can trigger fake deliveries | Never |
| Using discord.js gateway bot on Vercel | Familiar API | Bot is dead on arrival — serverless kills the WebSocket | Never — use Discord webhook URLs for notifications |
| Storing ELO as a mutable column only (no event log) | Simpler schema | Cannot build ELO evolution graph; cannot investigate disputes; season snapshots require separate logic | Only if player dashboard is explicitly out of scope |
| Soft-deleting blog posts with a boolean flag | Simpler than archiving | Can't distinguish "draft" from "deleted" from "scheduled" | Acceptable if three states are merged into one (`published` boolean) from the start |
| Rich text editor storing HTML instead of structured JSON | Easy to implement | XSS risk if not sanitized; hard to migrate format later | Never without DOMPurify sanitization on render |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| MercadoPago Webhooks | Not validating `x-signature` header | Always validate HMAC-SHA256 of `id;request-id;ts` against the secret before processing |
| MercadoPago Webhooks | Processing the webhook payload status directly | Webhook is only a trigger — call `GET /v1/payments/{id}` to confirm the actual status |
| MercadoPago Webhooks | Returning non-200 because of RCON errors | RCON goes in a queue; the webhook handler always returns 200 after writing the event row |
| MercadoPago Pix | Expecting instant confirmation | Pix can take minutes to confirm. Payment status will be `pending` then transition to `approved`. Webhook will fire again on transition. Handle both states. |
| RCON (Minecraft) | Treating empty RCON response as success | LuckPerms commands return empty strings for both success and silent failure — verify with a follow-up query |
| RCON (Minecraft) | Opening RCON connection without a timeout | Unresponsive server causes the function to hang until Vercel's 60-second kill; always set `timeout: 5000` in the RCON client config |
| LuckPerms via RCON | Assuming current version works correctly | Check LuckPerms changelog and GitHub issues before deploying; Issue #2948 shows LP silently ignoring RCON commands in some builds |
| Discord Notifications | Using discord.js `client.login()` in Vercel | Use Discord Incoming Webhook URLs (simple HTTP POST) — no library, no persistent connection, no auth token |
| Discord Webhooks | Sending notification inside the payment webhook handler | Adds latency to the webhook response; queue the notification alongside the RCON delivery and send it from the worker |
| Recharts / Chart.js | Importing directly in a Server Component | Use `next/dynamic` with `ssr: false`; render a skeleton until hydration completes |
| Neon PostgreSQL | Using `new Pool()` without closing it in serverless | Each invocation that doesn't close the pool leaks a connection; use `neon()` HTTP driver from `@neondatabase/serverless` for stateless invocations |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| ELO history as mutable column (no event log) | Can't render the ELO graph; N+1 queries to reconstruct history | Store each ELO change as an append-only `elo_events` row with timestamp | From the moment the dashboard graph is built |
| Fetching all blog posts for the calendar without pagination | Calendar page loads slowly; Neon free tier query time spikes | Paginate or limit calendar queries to current month ± 1 month; index on `published_at` | Around 200+ blog posts |
| Discord webhook calls inside request-response cycle | Purchase confirmation page takes 2+ seconds | Queue Discord notifications alongside RCON delivery; send from the worker | From the first slow Discord API response |
| No index on `season_records(season_id, final_elo DESC)` | Hall of fame page is slow | Add the index when creating the table | Around 500+ season records |
| Chart re-renders on every parent render | Dashboard flickers on any state change | Memoize chart data with `useMemo`; memoize chart component with `React.memo` | Noticeable from the first interactive session |
| Blog post rich text stored as HTML, rendered with `dangerouslySetInnerHTML` without sanitization | XSS vulnerability via admin-inserted malicious content | Sanitize with DOMPurify on render; or store as structured JSON (BlockNote / Tiptap) | The moment any admin account is compromised |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| No `x-signature` validation on MercadoPago webhook | Anyone can POST to your webhook URL and trigger fake deliveries | Validate HMAC-SHA256 signature on every incoming notification before touching the DB |
| Idempotency key not enforced on the orders table | Duplicate webhook fires create duplicate orders and deliveries | Add `UNIQUE` constraint on `mercadopago_payment_id` in the orders table |
| RCON password stored in Vercel environment variable but logged | Server RCON access if logs are exposed | Never log the RCON password or the full RCON client config object |
| Blog admin accessible to any `isAdmin` user without role scope | Any admin can publish to the blog, even if their admin role is scoped to leaderboard management | Check the specific permission scope (`blog_admin`) not just generic `isAdmin`; the existing granular permissions system must cover blog |
| Season reset accessible via API without rate-limiting and double-confirmation | Accidental or malicious season reset destroys live ELO data | Require super-admin role; add a confirmation step (e.g., type season name); log the action in the audit trail |
| Discord webhook URL stored in client-side code | Anyone can spam your Discord channel | Store Discord webhook URLs only in server-side environment variables, never in `NEXT_PUBLIC_` vars |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Purchase success page shown before delivery is confirmed | Player expects their rank immediately, logs into the server, has nothing | Show "Pagamento confirmado! Sua entrega será processada em até 5 minutos." — set honest expectations |
| No delivery failure notification to the player | Player waits indefinitely without knowing something went wrong | If the delivery worker fails after N retries, send a Discord DM or email to the player with a support contact |
| ELO graph with no data for new players | Empty chart looks like a broken page | Show a placeholder: "Jogue partidas para ver seu histórico de ELO aqui" with a link to join the server |
| Hall of fame showing all-time top players instead of per-season champions | Doesn't reward seasonal achievement; always shows the same veteran players at top | Hall of fame is indexed by season; each season shows its own champions with season name and dates |
| Blog post events calendar showing events in UTC | Brazilian players see wrong times for tournament start times | Store datetimes in UTC, display in `America/Sao_Paulo` using `Intl.DateTimeFormat` |
| Season reset with no community announcement | Players log in to find their rank gone, assume the site is broken | Send Discord notification (webhook) before AND after the reset; blog post explaining the new season |

---

## "Looks Done But Isn't" Checklist

- [ ] **Loja — Payment Flow:** Verify a completed Pix payment triggers the webhook, the delivery worker executes the RCON command, and the player has the rank in-game — not just that the UI shows "success."
- [ ] **Loja — Idempotency:** Verify that sending the same MercadoPago webhook notification twice does not create two delivery records.
- [ ] **Loja — Server Offline:** Verify that when the Minecraft server is unreachable, the pending delivery stays in the queue and is retried on the next cron tick — not silently lost.
- [ ] **Loja — Signature Validation:** Verify the webhook rejects requests with invalid or missing `x-signature` headers with a 400 response.
- [ ] **RCON — LuckPerms Verification:** Verify that after executing `lp user X parent add VIP`, a follow-up query confirms the rank was actually applied — not just that RCON returned without error.
- [ ] **Discord Notifications:** Verify the bot notifications use Discord Incoming Webhooks (HTTP POST) and not a persistent discord.js gateway connection.
- [ ] **Season Reset:** Verify the `season_records` snapshot is written before ELO values are reset — check by resetting in a staging environment and confirming the hall of fame populates.
- [ ] **Season Reset — Transaction:** Verify that if the ELO reset step fails, the `season_records` snapshot is also rolled back (no partial state).
- [ ] **Dashboard — ELO Graph:** Verify the chart component uses `dynamic` with `ssr: false` and renders a loading skeleton during hydration — not a blank space or hydration error.
- [ ] **Dashboard — Empty State:** Verify the dashboard renders correctly for a player with zero battles and no ELO history — not a crashed page or empty white space.
- [ ] **Blog — Rich Text XSS:** Verify that HTML stored from the rich text editor is sanitized before rendering with `dangerouslySetInnerHTML`.
- [ ] **Blog — Events Calendar:** Verify that event times display in `America/Sao_Paulo` timezone, not UTC.
- [ ] **Blog — Draft vs Published:** Verify that draft posts are not accessible via direct URL to non-admin users.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| RCON delivery without queue — lost deliveries | HIGH | Manually replay purchases by querying MercadoPago API for approved payments in the date range; execute RCON commands manually; implement the queue before re-opening the shop |
| Duplicate delivery from missing idempotency | MEDIUM | Audit `delivery_log` vs `orders`; revoke duplicate ranks via RCON; add `UNIQUE` constraint; apologize to affected players |
| Season reset without snapshot — hall of fame lost | HIGH | No recovery from Neon free tier (no PITR); must rebuild hall of fame from community screenshots/memory; add snapshot step before next reset |
| Discord bot going offline on Vercel | LOW | Replace discord.js with Discord webhook HTTP calls — this is a rewrite of the notification module but not the whole system; estimate 1-2 hours |
| Chart hydration errors in production | LOW | Add `dynamic(() => import('./Chart'), { ssr: false })` — this is a 5-minute fix per chart component |
| LuckPerms silently ignoring RCON commands | MEDIUM | Identify affected deliveries from the queue (delivered but not verified); re-execute commands after confirming the LP version; add verification step to the worker |
| Blog HTML with XSS — compromised content | HIGH | Purge the affected post; sanitize all existing HTML in the database with a migration script using DOMPurify; switch to structured JSON storage |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| RCON without delivery queue | Loja funcional — schema design | DB schema review: `pending_delivery` table exists with `attempts`, `locked_at`, `delivered_at` before writing any shop code |
| LuckPerms silent failure over RCON | Loja funcional — delivery worker | Integration test: execute LP rank command via RCON, confirm with follow-up query, check delivery log shows correct status |
| MercadoPago webhook duplicate / missing idempotency | Loja funcional — webhook handler | Test: send same webhook payload twice; confirm only one order row created; confirm second call returns 200 immediately |
| MercadoPago webhook signature not validated | Loja funcional — webhook handler | Test: send request without `x-signature`; confirm 400 response with no DB writes |
| Vercel 60-second function limit on RCON worker | Loja funcional — cron worker | Load test: insert 20 pending deliveries; confirm cron processes first 5, leaves 15 for next tick; verify no timeout in Vercel logs |
| Discord bot gateway on Vercel | Notificações Discord — architecture | Code review: zero uses of `client.login()` or `GatewayIntentBits`; notifications use `fetch()` to Discord webhook URL only |
| Season reset without snapshot | Temporadas de ranking — reset procedure | Staging test: execute reset, confirm `season_records` populated before ELO is zeroed, confirm rollback if step 2 fails |
| ELO graph hydration mismatch | Dashboard do jogador — chart implementation | Browser test: hard reload the dashboard page; confirm no hydration errors in console; confirm chart renders after 1-2 seconds with skeleton shown first |
| Blog HTML XSS | Blog + Eventos — rich text storage | Code review: confirm sanitization applied on render or structured JSON (not raw HTML) stored; confirm draft posts inaccessible to non-admins |
| Events in UTC timezone | Blog + Eventos — event calendar | Manual test: create event at 20:00 BRT; confirm calendar displays 20:00 not 23:00 UTC |

---

## Sources

- Vercel Hobby Plan official limits (function max duration 60s configurable): https://vercel.com/docs/plans/hobby
- Vercel Function duration configuration: https://vercel.com/docs/functions/configuring-functions/duration
- LuckPerms RCON silent failure bug (Issue #2948): https://github.com/LuckPerms/LuckPerms/issues/2948
- MercadoPago webhook retry policy and notification schedule: https://www.mercadopago.com.br/developers/en/docs/your-integrations/notifications/webhooks
- MercadoPago idempotency key mandatory from 2024: https://www.mercadopago.com.ar/developers/en/news/2023/01/04/Idempotency-key-usage-will-be-mandatory
- MercadoPago x-signature validation (2024 update): https://www.mercadopago.com.br/developers/en/news/2024/02/27/Ensure-the-validity-of-notifications-sent-by-Mercado-Pago
- Vercel official statement on Discord bots: https://vercel.com/kb/guide/can-i-deploy-discord-bots-to-vercel
- Discord Interactions Endpoint (serverless-compatible bot pattern): https://discord.com/developers/docs/interactions/receiving-and-responding
- shadcn/ui chart bug in Next.js 15 — hydration error: https://github.com/shadcn-ui/ui/issues/5661
- Next.js hydration error documentation: https://nextjs.org/docs/messages/react-hydration-error
- Neon serverless driver (HTTP vs TCP connection): https://neon.com/docs/serverless/serverless-driver
- RCON protocol specification (TCP, stateful, fragmented responses): https://minecraft.wiki/w/RCON
- MercadoPago webhook implementation (Node.js): https://github.com/lucasmmaidana/mercado-pago-test
- Webhook idempotency guide: https://dev.to/ramapratheeba/how-to-handle-duplicate-webhook-events-in-aspnet-core-idempotency-guide-4kj6
- Vercel function timeout troubleshooting: https://vercel.com/kb/guide/what-can-i-do-about-vercel-serverless-functions-timing-out

---
*Pitfalls research for: CraftPro Brasil v2.0 — Loja (MercadoPago + RCON + LuckPerms), Blog/Eventos, Notificações Discord, Temporadas ELO, Dashboard do Jogador on Next.js + Vercel Hobby + Neon*
*Researched: 2026-03-26*
