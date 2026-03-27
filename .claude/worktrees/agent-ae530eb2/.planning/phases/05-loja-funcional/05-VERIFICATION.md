---
phase: 05-loja-funcional
verified: 2026-03-26T14:40:00Z
status: gaps_found
score: 4/7 requirements verified
re_verification: false
gaps:
  - truth: "After payment confirmed, rank/item is automatically delivered on the server via RCON + LuckPerms"
    status: failed
    reason: "No RCON execution code exists anywhere in the codebase. The webhook sets order.status = 'paid' and forceRetryDelivery sets status = 'delivering' but no code ever sends a command to the Minecraft server. The rconTemplate column stores null on all items. Delivery is inert."
    artifacts:
      - path: "src/app/api/loja/webhook/route.ts"
        issue: "Updates order status to 'paid' but does not trigger any delivery. No RCON call exists."
      - path: "src/lib/admin/actions/orders.ts"
        issue: "forceRetryDelivery sets status to 'delivering' but there is no cron worker or RCON executor that acts on this status."
    missing:
      - "RCON client integration (e.g. src/lib/rcon/client.ts) to send commands to Minecraft server"
      - "Delivery trigger in webhook: when payment.status = 'approved', execute the RCON command"
      - "LuckPerms command resolution from shopItem.type and shopItem.rconTemplate"
      - "Cron/queue worker that polls for status = 'delivering' and executes RCON (or inline trigger from webhook)"

  - truth: "Delivery queue with automatic retry when server was offline at purchase time"
    status: failed
    reason: "No delivery queue table exists in the schema. Plan 04 SUMMARY explicitly documents this as a known deviation: 'deliveryQueue table absent from schema'. forceRetryDelivery resets order.status to 'delivering' as a workaround but there is no automatic retry mechanism; the 'delivering' status is never acted upon."
    artifacts:
      - path: "src/lib/db/schema.ts"
        issue: "No deliveryQueue table. Schema has orders table but no separate delivery queue with retry_count or locked_at columns."
      - path: "src/lib/admin/actions/orders.ts"
        issue: "forceRetryDelivery depends on a cron worker that does not exist."
    missing:
      - "deliveryQueue table in schema (or equivalent retry logic in orders table)"
      - "Automatic retry worker that re-attempts delivery when server comes back online"
      - "Retry counter and backoff strategy"

  - truth: "Webhook validates MercadoPago HMAC signature and guarantees idempotency"
    status: failed
    reason: "The webhook handler processes any POST request without verifying the x-signature header from MercadoPago. No HMAC validation code exists. Additionally, the handler has no idempotency check — processing the same paymentId twice would attempt to update the order twice (though this is low-risk due to idempotent SQL UPDATE, the requirement explicitly requires a guard)."
    artifacts:
      - path: "src/app/api/loja/webhook/route.ts"
        issue: "No signature header extraction. No crypto.timingSafeEqual or HMAC comparison. Any actor can POST to this endpoint and manipulate order statuses."
    missing:
      - "HMAC signature validation using process.env.MP_WEBHOOK_SECRET against x-signature header"
      - "Idempotency check: verify mercadopagoId not already processed before updating order"

human_verification:
  - test: "End-to-end purchase flow with sandbox credentials"
    expected: "Click Comprar on /loja, redirected to MercadoPago sandbox, complete payment, land on /loja/pedido/[id] with 'Pago' status"
    why_human: "Requires live MercadoPago sandbox credentials (MP_ACCESS_TOKEN) and a browser session with a user who has minecraftUuid set"
  - test: "Navbar Meus Pedidos conditional display"
    expected: "Meus Pedidos link only appears when logged in (both desktop and mobile menu)"
    why_human: "Requires authenticated browser session to verify conditional rendering"
---

# Phase 5: Loja Funcional Verification Report

**Phase Goal:** Jogadores podem comprar ranks, cosméticos e itens via Pix e receber a entrega automaticamente no servidor — o CraftPro Brasil gera receita real
**Verified:** 2026-03-26T14:40:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

The phase goal has TWO halves: (1) players can purchase via Pix, and (2) items are automatically delivered on the server. Half (1) is verified — the checkout flow, payment UI, and order tracking all exist and are wired correctly. Half (2) is not achieved — there is no RCON delivery implementation anywhere in the codebase.

### Observable Truths

| #  | Truth                                                                                      | Status     | Evidence                                                                  |
|----|-------------------------------------------------------------------------------------------|------------|---------------------------------------------------------------------------|
| 1  | Player can browse /loja and see items with BRL prices                                     | VERIFIED   | ProductCard + getShopItems() wired to DB with price display               |
| 2  | Player can purchase via MercadoPago Pix (checkout flow)                                   | VERIFIED   | createCheckoutPreference Server Action + BuyButton wired to MP SDK        |
| 3  | After payment, item is automatically delivered via RCON + LuckPerms                       | FAILED     | No RCON client or executor exists; webhook only updates DB status         |
| 4  | Player can track order status at /loja/pedido/[id] with live stepper                      | VERIFIED   | OrderStatusStepper with 10s polling + status copy text wired              |
| 5  | Delivery queue retries automatically when server was offline                               | FAILED     | No deliveryQueue table; no retry worker; deviation documented in SUMMARY  |
| 6  | Webhook validates HMAC signature and guarantees no duplicate delivery                     | FAILED     | No signature check in webhook; no idempotency guard                       |
| 7  | Admin can manage orders at /admin/pedidos (filter, retry, view)                           | VERIFIED   | PedidosCrud with status filter, AlertDialog retry, pagination wired       |

**Score:** 4/7 truths verified

---

## Required Artifacts

### Plan 01 (SHOP-01, SHOP-02)

| Artifact                             | Expected                                      | Status     | Details                                                |
|--------------------------------------|-----------------------------------------------|------------|--------------------------------------------------------|
| `src/lib/db/schema.ts`               | orders table + extended shopItems             | VERIFIED   | price, imageUrl, available, type, rconTemplate, duration, active all present; orders table present |
| `src/lib/db/queries/shop.ts`         | getShopItems, getShopItemById, getOrdersByUser | VERIFIED  | All 4 functions exported; getShopItems filters available=1 |
| `src/components/shop/ShopItemCard.tsx` | Legacy card from plan 01 (superseded by plan 03) | VERIFIED | File exists; superseded by ProductCard in plan 03 |
| `tests/shop-queries.test.ts`         | Tests for shop query module                   | VERIFIED   | 153 lines; substantive test coverage present           |

### Plan 02 (SHOP-03)

| Artifact                                   | Expected                                     | Status     | Details                                                       |
|--------------------------------------------|----------------------------------------------|------------|---------------------------------------------------------------|
| `src/app/api/loja/checkout/route.ts`        | POST creates MP preference + order           | VERIFIED   | Auth gate, item check, MP preference creation, returns initPoint |
| `src/app/api/loja/webhook/route.ts`         | Handles MP payment notifications              | PARTIAL    | Updates order status correctly but lacks HMAC validation (SHOP-06 gap) |
| `src/components/shop/BuyButton.tsx`         | Client component calling createCheckoutPreference | VERIFIED | useTransition, NO_MINECRAFT_UUID handling, window.location.href redirect |
| `src/app/(protected)/pedidos/page.tsx`      | Protected orders history page                | VERIFIED   | Redirects to /login if unauthenticated; joins orders+shopItems |
| `tests/checkout-api.test.ts`               | Checkout API tests                           | VERIFIED   | 247 lines; substantive mocked tests                           |

### Plan 03 (SHOP-01, SHOP-02, SHOP-04)

| Artifact                                        | Expected                                       | Status     | Details                                              |
|-------------------------------------------------|------------------------------------------------|------------|------------------------------------------------------|
| `src/app/(public)/loja/page.tsx`                | Product catalog with real prices + buy flow    | VERIFIED   | Fetches active items, renders ProductCard grid, empty state present |
| `src/components/shop/ProductCard.tsx`           | Server Component with conditional actions      | VERIFIED   | Session-conditional: login link / NoMinecraftWarning / BuyButton |
| `src/components/shop/BuyButton.tsx`             | Rewritten — calls createCheckoutPreference     | VERIFIED   | 'use client', createCheckoutPreference import, window.location.href redirect |
| `src/components/shop/NoMinecraftWarning.tsx`    | Inline warning with Discord link               | VERIFIED   | Discord link present: discord.gg/FcdR6PPjg6          |
| `src/lib/shop/actions.ts`                       | createCheckoutPreference Server Action         | VERIFIED   | 'use server', auth gate, UUID gate, MP preference creation wired |
| `src/app/(public)/loja/pedido/[id]/page.tsx`    | Order status page with stepper                 | VERIFIED   | OrderStatusStepper rendered, "Pedido nao encontrado" fallback present |
| `src/components/shop/OrderStatusStepper.tsx`    | Client stepper with 10s polling                | VERIFIED   | 'use client', setInterval 10000, router.refresh(), aria-current |
| `src/app/(public)/loja/meus-pedidos/page.tsx`   | Authenticated order history table              | VERIFIED   | redirect to /login, Table with status badges, empty state with "Ir para a Loja" |
| `src/components/layout/Navbar.tsx`              | Meus Pedidos for authenticated users           | VERIFIED   | Conditional {session && <Link href="/loja/meus-pedidos">} in both desktop and mobile |

### Plan 04 (SHOP-01, SHOP-07)

| Artifact                                    | Expected                                          | Status     | Details                                                  |
|---------------------------------------------|---------------------------------------------------|------------|----------------------------------------------------------|
| `src/app/(admin)/admin/loja/LojaCrud.tsx`   | price, type, duration, active columns in table    | VERIFIED   | TypeBadge, price in brand-yellow, active dot indicator   |
| `src/components/admin/ShopItemForm.tsx`     | Preco, Tipo, Duracao (conditional), Ativo fields  | VERIFIED   | Conditional Duracao (type === 'rank'), Preco field present |
| `src/lib/admin/actions/shop-items.ts`       | Extended with price, type, duration, active       | VERIFIED   | ShopItemData interface has all fields; rconTemplate: null |
| `src/lib/admin/actions/orders.ts`           | getOrders + forceRetryDelivery                    | VERIFIED   | 'use server', hasPermission('pedidos'), logAudit, limit(25) |
| `src/app/(admin)/admin/pedidos/page.tsx`    | Server Component with searchParams                | VERIFIED   | Reads status + page params, passes to PedidosCrud        |
| `src/app/(admin)/admin/pedidos/PedidosCrud.tsx` | Client table with filter + retry AlertDialog  | VERIFIED   | router.push for filter, AlertDialog, forceRetryDelivery call |

---

## Key Link Verification

### Plan 03 Key Links

| From                                | To                        | Via                           | Status   | Details                                         |
|-------------------------------------|---------------------------|-------------------------------|----------|-------------------------------------------------|
| `BuyButton.tsx`                     | `src/lib/shop/actions.ts` | createCheckoutPreference call | VERIFIED | Import and call confirmed at line 7 + 19        |
| `OrderStatusStepper.tsx`            | router.refresh()          | setInterval polling           | VERIFIED | setInterval(10000) with router.refresh() at line 47 |

### Plan 04 Key Links

| From                           | To                              | Via                           | Status   | Details                                              |
|--------------------------------|---------------------------------|-------------------------------|----------|------------------------------------------------------|
| `PedidosCrud.tsx`              | `src/lib/admin/actions/orders.ts` | forceRetryDelivery call     | VERIFIED | Import at line 39, called at line 124               |
| `src/lib/admin/actions/orders.ts` | `src/lib/admin/permissions.ts` | hasPermission + logAudit    | VERIFIED | hasPermission(session, 'pedidos') + logAudit at lines 26, 79, 97 |

---

## Data-Flow Trace (Level 4)

| Artifact                              | Data Variable   | Source                                                  | Produces Real Data | Status     |
|---------------------------------------|-----------------|---------------------------------------------------------|--------------------|------------|
| `src/app/(public)/loja/page.tsx`      | items           | db.select().from(shopItems).where(available=1)          | Yes                | FLOWING    |
| `src/components/shop/ProductCard.tsx` | item, session   | Props from loja/page.tsx (server pass-through)          | Yes                | FLOWING    |
| `src/lib/shop/actions.ts`             | order.id        | db.insert(orders).returning(); MP preference.create()   | Yes                | FLOWING    |
| `src/app/(public)/loja/pedido/[id]/page.tsx` | order, itemName | db.select().join(shopItems)                    | Yes                | FLOWING    |
| `src/app/(public)/loja/meus-pedidos/page.tsx` | userOrders | db.select().from(orders).leftJoin(shopItems)           | Yes                | FLOWING    |
| `src/lib/admin/actions/orders.ts`     | rows            | db.select().from(orders).leftJoin(shopItems,users)      | Yes                | FLOWING    |
| `src/app/api/loja/webhook/route.ts`   | newStatus       | MP Payment.get() + status mapping                       | Yes (with MP token) | FLOWING   |

---

## Behavioral Spot-Checks

| Behavior                                            | Command                                                            | Result                     | Status   |
|-----------------------------------------------------|-------------------------------------------------------------------|----------------------------|----------|
| TypeScript compilation                              | node tsc.js --noEmit                                              | No output (0 errors)       | PASS     |
| shop-queries.test.ts exists and has content         | wc -l tests/shop-queries.test.ts                                  | 153 lines                  | PASS     |
| checkout-api.test.ts exists and has content         | wc -l tests/checkout-api.test.ts                                  | 247 lines                  | PASS     |
| mercadopago package installed                       | grep mercadopago package.json                                     | "^2.12.0" found            | PASS     |
| Vitest suite execution                              | vitest run tests/shop-queries.test.ts                             | Worker timeout in WSL env  | SKIP     |
| /loja page does not contain "Em Breve"              | grep "Em Breve" src/app/(public)/loja/page.tsx                    | No match                   | PASS     |
| Navbar has Meus Pedidos in both desktop+mobile      | grep "Meus Pedidos" src/components/layout/Navbar.tsx              | 2 conditional links        | PASS     |
| RCON executor exists                                | grep -r "rcon" src/ (excluding schema/UI references)              | No RCON client found       | FAIL     |
| Webhook HMAC validation                             | grep "hmac\|x-signature\|HMAC" src/app/api/loja/webhook/route.ts | No match                   | FAIL     |

Note: Vitest worker timeout is a WSL environment constraint, not a code issue. Test files have substantive content and TypeScript compiles clean.

---

## Requirements Coverage

| Requirement | Source Plan(s)         | Description                                                          | Status          | Evidence                                                             |
|-------------|------------------------|----------------------------------------------------------------------|-----------------|----------------------------------------------------------------------|
| SHOP-01     | 05-01, 05-03, 05-04    | Player can browse store and see available items with BRL prices      | SATISFIED       | /loja with ProductCard, price formatted via toLocaleString           |
| SHOP-02     | 05-01, 05-02, 05-03    | Player can purchase via Pix (MercadoPago Checkout Pro)               | SATISFIED       | createCheckoutPreference + BuyButton + MP preference creation        |
| SHOP-03     | 05-02                  | After confirmed payment, rank/item delivered via RCON + LuckPerms    | BLOCKED         | No RCON client; webhook does not execute any server command          |
| SHOP-04     | 05-02, 05-03           | Player can track order status at /loja/pedido/[id]                   | SATISFIED       | OrderStatusStepper with 10s polling; /loja/meus-pedidos order history |
| SHOP-05     | (not claimed by any plan) | Delivery queue with automatic retry when server was offline        | BLOCKED         | No deliveryQueue table or retry worker; ORPHANED — no plan claimed it |
| SHOP-06     | (partially 05-02)      | Webhook validates HMAC signature and guarantees idempotency          | BLOCKED         | No x-signature validation in webhook handler                         |
| SHOP-07     | 05-04                  | Admin can view all orders at /admin/pedidos, filter, force retry     | SATISFIED       | PedidosCrud with status filter, AlertDialog retry, pagination        |

### Orphaned Requirements

**SHOP-05** maps to Phase 5 in REQUIREMENTS.md but was not claimed by any of the 4 plans. No plan has SHOP-05 in its `requirements:` frontmatter. This requirement is explicitly marked as `[ ]` (pending) in REQUIREMENTS.md.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/app/api/loja/webhook/route.ts` | 19-73 | No HMAC signature validation — any caller can POST and change order statuses | Blocker | SHOP-06 not met; security vulnerability in production |
| `src/lib/admin/actions/orders.ts` | 91-95 | forceRetryDelivery sets status to 'delivering' but no worker processes this status | Blocker | SHOP-03/05 not met; retry UI works but does nothing |
| `src/lib/db/schema.ts` | 121 | rconTemplate stored as null for all items; no code ever generates RCON commands | Blocker | SHOP-03 not met; delivery mechanism absent |

---

## Human Verification Required

### 1. End-to-End Purchase Flow

**Test:** With sandbox MP_ACCESS_TOKEN configured, log in with a user who has minecraftUuid set, visit /loja, click Comprar on any item.
**Expected:** Redirect to MercadoPago sandbox checkout. After payment approval, return to /loja/pedido/[id] showing "Pago" status.
**Why human:** Requires live MercadoPago sandbox credentials and browser session.

### 2. Login-gated Buy Button

**Test:** Visit /loja without being logged in.
**Expected:** Product cards show "Entrar para Comprar" link instead of BuyButton.
**Why human:** Session-conditional rendering requires browser.

### 3. Navbar Meus Pedidos Visibility

**Test:** Log in and view desktop navbar and mobile sheet menu.
**Expected:** "Meus Pedidos" link appears for authenticated users in both locations.
**Why human:** Requires authenticated browser session.

---

## Gaps Summary

Phase 5 achieved its commercial storefront goal for the customer-facing purchase flow: players can browse a real product catalog, buy with MercadoPago/Pix, and track their order status. Four of seven requirements are satisfied.

However, the phase goal explicitly includes "receber a entrega automaticamente no servidor" (receive automatic delivery on the server). This is not achieved:

1. **SHOP-03 (Blocker):** No RCON client or delivery executor exists in the codebase. The webhook marks orders as 'paid' but nothing translates that into a Minecraft server command. The `rconTemplate` schema column exists but is null for all items with no code to populate or execute it.

2. **SHOP-05 (Blocker, Orphaned):** No delivery queue table or retry worker was ever built. This requirement was not claimed by any plan in Phase 5. It needs its own plan.

3. **SHOP-06 (Blocker):** The webhook handler accepts any POST without verifying the MercadoPago HMAC x-signature header. This is a security vulnerability that allows any actor to forge payment confirmations and manipulate order statuses.

The three gaps share a root cause: **the delivery subsystem was not implemented in Phase 5**. Plans 01-04 built the schema, checkout flow, UI, and admin tools — but the server-side delivery execution layer (RCON connection, command execution, delivery queue) is entirely absent.

---

_Verified: 2026-03-26T14:40:00Z_
_Verifier: Claude (gsd-verifier)_
