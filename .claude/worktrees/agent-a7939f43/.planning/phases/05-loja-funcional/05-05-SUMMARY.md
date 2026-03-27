---
phase: 05-loja-funcional
plan: 05
subsystem: loja
tags: [rcon, delivery, webhook, hmac, idempotency, cron, shop]
dependency_graph:
  requires:
    - phase: 05-02
      provides: orders table, webhook handler, checkout flow
    - phase: 05-04
      provides: forceRetryDelivery Server Action, /admin/pedidos
  provides:
    - RCON client abstraction (src/lib/rcon/client.ts)
    - RCON command generation by item type (src/lib/rcon/commands.ts)
    - Cron worker for batch RCON delivery with exponential backoff (/api/cron/process-orders)
    - Webhook HMAC-SHA256 validation against x-signature header
    - Idempotency via UNIQUE mercadopagoPaymentId
    - Orders schema: retryCount, nextRetryAt, minecraftUuid, mercadopagoPaymentId
  affects: [src/lib/db/schema.ts, src/app/api/loja/webhook/route.ts, src/lib/admin/actions/orders.ts, src/lib/shop/actions.ts]
tech-stack:
  added:
    - rcon-client@4.2.5 (already in node_modules; added to package.json dependencies)
  patterns:
    - RCON abstraction layer for TCP Minecraft server commands
    - Delivery queue via orders table status machine (pending→paid→delivering→delivered/failed)
    - Exponential backoff retry: 2^n minutes capped at 4h, max 10 attempts (~48h)
    - HMAC-SHA256 validation using Node.js crypto.createHmac + timingSafeEqual
    - Idempotency via UNIQUE constraint + early-return query before DB writes
key-files:
  created:
    - src/lib/rcon/client.ts
    - src/lib/rcon/commands.ts
    - src/app/api/cron/process-orders/route.ts
    - tests/rcon-commands.test.ts
  modified:
    - src/lib/db/schema.ts
    - src/app/api/loja/webhook/route.ts
    - src/lib/admin/actions/orders.ts
    - src/lib/shop/actions.ts
    - package.json
    - package-lock.json
key-decisions:
  - "RCON abstraction in src/lib/rcon/client.ts isolates rcon-client dependency — swappable if maintainer abandons it"
  - "mercadopagoPaymentId (UNIQUE) separate from mercadopagoId (preference ID) — clean idempotency without touching existing field"
  - "Max retries = 10 with exponential backoff (2^n min, cap 4h) — covers ~48h of server downtime before permanent failure"
  - "CRON_SECRET env var guards /api/cron/process-orders — required when deployed; skipped if not set (dev mode)"
  - "forceRetryDelivery resets retryCount=0 + nextRetryAt=null — ensures cron picks up immediately on next run"
  - "minecraftUuid snapshotted at order creation AND re-snapshotted on forceRetryDelivery — handles UUID changes"
requirements-completed: [SHOP-03, SHOP-05, SHOP-06]
duration: 12min
completed: "2026-03-26"
---

# Phase 5 Plan 05: Delivery Subsystem Gap Closure Summary

**RCON delivery client + cron worker with exponential backoff retry + webhook HMAC-SHA256 validation and idempotency guard — closing the three verification gaps from Plans 01-04.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-26T17:57:20Z
- **Completed:** 2026-03-26T18:09:34Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

### Task 1: RCON Delivery Subsystem + Orders Schema Extension

**Schema extensions (`src/lib/db/schema.ts`):**
- `mercadopagoPaymentId` — text, UNIQUE — stores the MP payment ID from webhook (separate from `mercadopagoId` which stores the preference ID at checkout creation); UNIQUE constraint is the idempotency guard
- `retryCount` — integer, default 0 — tracks RCON delivery attempt count
- `nextRetryAt` — nullable timestamp — earliest time for next delivery attempt (exponential backoff)
- `minecraftUuid` — text snapshot of player UUID at purchase time — decouples delivery from live user table

**RCON client abstraction (`src/lib/rcon/client.ts`):**
- `executeRconCommand(command, config?)` — opens TCP connection, sends command, returns response, closes connection
- `isRconConfigured()` — checks `RCON_HOST` + `RCON_PASSWORD` env vars — allows skipping RCON in dev/staging
- Env vars: `RCON_HOST`, `RCON_PORT` (default 25575), `RCON_PASSWORD`, `RCON_TIMEOUT` (default 5000ms)
- All config parameters overridable per-call for testability

**RCON command generation (`src/lib/rcon/commands.ts`):**
- `buildDeliveryCommand(itemType, itemName, playerUuid, duration)` — generates RCON command per D-03
- `rank` → `lp user <uuid> parent addtemp <group> <duration>d accumulate` (LuckPerms)
- `key` → `give <uuid> craftprobrasil:<slug> 1`
- `cosmetic` → `give <uuid> craftprobrasil:<slug> 1`
- Internal `slugify()` normalizes item names to RCON-safe slugs

**Cron worker (`src/app/api/cron/process-orders/route.ts`):**
- GET endpoint protected by `Authorization: Bearer <CRON_SECRET>` when `CRON_SECRET` is set
- Queries orders with `status='delivering'` and `nextRetryAt IS NULL OR nextRetryAt <= now` and `retryCount < 10`
- Processes up to 20 orders per invocation (configurable `BATCH_SIZE`)
- On RCON success: marks order `delivered`
- On RCON failure: increments `retryCount`, sets `nextRetryAt = now + 2^n minutes` (capped at 4h)
- After 10 failures: marks order `failed` permanently
- Skips (no fail) when `RCON_HOST`/`RCON_PASSWORD` not set — allows staging without Minecraft server
- Returns JSON summary: `{ processed, delivered, failed, skipped, results }`

**forceRetryDelivery update (`src/lib/admin/actions/orders.ts`):**
- Now re-snapshots `minecraftUuid` from current user record (handles UUID changes since purchase)
- Resets `retryCount=0` and `nextRetryAt=null` — cron picks up immediately on next run

**createCheckoutPreference update (`src/lib/shop/actions.ts`):**
- Snapshots `minecraftUuid` from session at order creation — ensures delivery UUID is available even if webhook fires after user record changes

### Task 2: Webhook HMAC Validation + Idempotency (SHOP-06)

**HMAC signature validation (`validateMpSignature`):**
- Parses `x-signature: ts=<timestamp>,v1=<hash>` header from MercadoPago
- Builds manifest string `id:<paymentId>;request-id:<requestId>;ts:<timestamp>;` per MP docs
- Compares against `HMAC-SHA256(MP_WEBHOOK_SECRET, manifest)` using `crypto.timingSafeEqual`
- Returns 401 if signature invalid
- Graceful dev mode: if `MP_WEBHOOK_SECRET` not set, logs warning and skips validation

**Idempotency check:**
- Queries `orders WHERE mercadopagoPaymentId = paymentId` before any DB write
- Returns 200 with `{ idempotent: true }` if already processed — no duplicate delivery
- UNIQUE constraint on `mercadopagoPaymentId` provides database-level deduplication as final guard

**Status machine update:**
- `approved` → `delivering` (was `paid`) — webhook now hands off to cron worker
- Cron worker handles the `delivering → delivered/failed` transitions

**Unit tests (`tests/rcon-commands.test.ts`):**
- 12 tests covering `buildDeliveryCommand` for rank/key/cosmetic types
- Tests: command format, LuckPerms accumulate flag, slug normalization, duration defaulting, error handling

## Files Created/Modified

- `src/lib/rcon/client.ts` — RCON abstraction with `executeRconCommand` + `isRconConfigured`
- `src/lib/rcon/commands.ts` — `buildDeliveryCommand` by item type with slugify
- `src/app/api/cron/process-orders/route.ts` — Batch RCON cron worker with retry
- `tests/rcon-commands.test.ts` — Unit tests for command generation
- `src/lib/db/schema.ts` — Extended orders: mercadopagoPaymentId (UNIQUE), retryCount, nextRetryAt, minecraftUuid
- `src/app/api/loja/webhook/route.ts` — HMAC validation, idempotency check, delivering trigger
- `src/lib/admin/actions/orders.ts` — forceRetryDelivery: re-snapshot UUID, reset counters
- `src/lib/shop/actions.ts` — Snapshot minecraftUuid at order creation
- `package.json` — rcon-client@4.2.5 added to dependencies
- `package-lock.json` — lock file updated

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| mercadopagoPaymentId separate from mercadopagoId | mercadopagoId stores MP preference ID at checkout creation; paymentId arrives later via webhook; keeping separate avoids schema confusion |
| Max retries = 10 with 2^n cap at 4h | Covers ~48h downtime (requirement D-09); 10 attempts = 2+4+8+16+32+64+120+120+120+120 minutes ≈ 11h if all retries hit cap |
| CRON_SECRET optional | Dev/CI environments don't need auth; production sets env var to prevent unauthorized triggers |
| minecraftUuid snapshot at both create and webhook | Purchase UUID may differ from webhook-time UUID if admin updates the link between purchase and payment confirmation |
| buildDeliveryCommand uses slugify for item names | Admin names items in Portuguese with spaces; RCON commands require alphanumeric slugs |

## Deviations from Plan

This was a gap-closure plan (no pre-existing PLAN.md). All implementation was driven by the 05-VERIFICATION.md gaps and CONTEXT.md decisions.

**No deviations from the verification requirements:**
- SHOP-03: RCON delivery fully implemented
- SHOP-05: Retry mechanism via orders table + cron worker (no separate deliveryQueue table needed — orders table extended per deviation documented in 05-04-SUMMARY.md)
- SHOP-06: HMAC validation + idempotency fully implemented

## Known Stubs

- **RCON delivery requires live Minecraft server**: `isRconConfigured()` returns false without `RCON_HOST`/`RCON_PASSWORD`, so orders accumulate in `delivering` status until env vars are set. This is intentional for staged deployment.
- **LuckPerms group name from slug**: `buildDeliveryCommand('rank', 'VIP', ...)` produces group `vip`. The actual LuckPerms group on the server must be named `vip` (lowercase). If group names differ, admin must ensure shopItem names match LuckPerms group names.

## Self-Check: PASSED
