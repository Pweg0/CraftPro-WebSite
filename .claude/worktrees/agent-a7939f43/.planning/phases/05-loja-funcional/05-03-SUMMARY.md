---
phase: 05-loja-funcional
plan: 03
subsystem: shop-public-ui
status: complete
started: 2026-03-26
completed: 2026-03-26
tasks_completed: 2
tasks_total: 2
duration_minutes: 8
files_created: 6
files_modified: 3
tags: [shop, public-ui, order-status, buy-flow, navbar]
requirements: [SHOP-01, SHOP-02, SHOP-04]

dependency_graph:
  requires:
    - 05-01  # DB schema + auth session
    - 05-02  # checkout API route + orders table
  provides:
    - public product catalog with live buy flow
    - order status page with auto-refresh stepper
    - order history page at /loja/meus-pedidos
    - Meus Pedidos navbar link for authenticated users
  affects:
    - src/components/layout/Navbar.tsx
    - src/lib/auth.ts (session now exposes minecraftUuid)

tech_stack:
  added:
    - src/lib/shop/actions.ts (Server Action wrapping MP checkout)
  patterns:
    - useTransition for Server Action invocation in Client Component
    - setInterval + router.refresh() for polling without visible indicator
    - Session-conditional rendering: no session / no UUID / has UUID

key_files:
  created:
    - src/app/(public)/loja/page.tsx (rewritten)
    - src/components/shop/ProductCard.tsx
    - src/components/shop/BuyButton.tsx (rewritten)
    - src/components/shop/NoMinecraftWarning.tsx
    - src/components/shop/OrderStatusStepper.tsx
    - src/lib/shop/actions.ts
    - src/app/(public)/loja/pedido/[id]/page.tsx
    - src/app/(public)/loja/meus-pedidos/page.tsx
  modified:
    - src/components/layout/Navbar.tsx (Meus Pedidos link)
    - src/lib/auth.ts (minecraftUuid + minecraftName in session)
    - src/types/next-auth.d.ts (Session type update)

decisions:
  - "createCheckoutPreference Server Action created in src/lib/shop/actions.ts — Plan 02 built API route, Plan 03 adds Server Action layer on top"
  - "minecraftUuid exposed in session callback — required for conditional BuyButton rendering"
  - "Button.asChild not supported — Link styled directly as button for empty state CTA (matches Phase 1 pattern)"
  - "category used as type discriminator in ProductCard — schema has no separate type column"
---

# Phase 05 Plan 03 Summary: Public Store UI — Product Catalog, Order Status, and Order History

## One-liner

Live product catalog with conditional buy flow (BuyButton/NoMinecraftWarning/login-gate), order status stepper with 10s polling, and authenticated order history at /loja/meus-pedidos.

## What Was Built

### Task 1: Product catalog page + shop components

- **src/app/(public)/loja/page.tsx** (rewritten): Removed "Em Breve" badge and Discord CTA. Now fetches active shop items from DB and renders ProductCard grid. Empty state with ShoppingBag icon when no items. `force-dynamic` retained.

- **src/components/shop/ProductCard.tsx** (new): Server Component. Shows type badge (category-mapped to brand color), item name, description, BRL-formatted price. Bottom action area shows "Entrar para Comprar" link (unauthenticated), `NoMinecraftWarning` (no UUID), or `BuyButton` (has UUID).

- **src/components/shop/BuyButton.tsx** (rewritten): Client Component using `useTransition`. Calls `createCheckoutPreference` Server Action. Loading state shows "Processando..." + spinner. Error handling: `NO_MINECRAFT_UUID` error shows specific toast, generic error shows fallback toast. On success: `window.location.href = result.checkoutUrl`.

- **src/components/shop/NoMinecraftWarning.tsx** (new): Inline warning with Discord link for users without linked Minecraft account.

- **src/lib/shop/actions.ts** (new): `createCheckoutPreference` Server Action. Auth gate, Minecraft UUID gate, item availability check, MP preference creation, order record creation. Throws typed strings: `Unauthorized`, `NO_MINECRAFT_UUID`, `Item not found`, `PAYMENTS_UNAVAILABLE`.

- **src/lib/auth.ts** (modified): Session callback now fetches `minecraftUuid` + `minecraftName` from DB and exposes them on `session.user`.

- **src/types/next-auth.d.ts** (modified): Added `minecraftUuid: string | null` and `minecraftName: string | null` to Session type.

### Task 2: Order status + order history + navbar

- **src/app/(public)/loja/pedido/[id]/page.tsx** (new): Server Component, `force-dynamic`. Fetches order by ID, verifies ownership. Renders order card with item summary, type badge, price, `OrderStatusStepper`. Status-specific copy text for all 5 states. "Pedido nao encontrado" fallback with link back to /loja.

- **src/components/shop/OrderStatusStepper.tsx** (new): Client Component. 4-step stepper (pending/paid/delivering/delivered) + failed branch. Active step gets `aria-current="step"`. `useEffect` polls `router.refresh()` every 10s when status is not `delivered` or `failed`. Stops polling on terminal states. Horizontal on md+, vertical on mobile.

- **src/app/(public)/loja/meus-pedidos/page.tsx** (new): Server Component, `force-dynamic`. Redirects unauthenticated users to login. Renders shadcn Table with order history (id, item name, value, status badge, date, "Ver detalhes" link). Empty state with "Nenhuma compra ainda" + "Ir para a Loja" button.

- **src/components/layout/Navbar.tsx** (modified): Added conditional "Meus Pedidos" link for authenticated users, in both desktop nav and mobile Sheet menu. Active state with underline indicator.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created missing `src/lib/shop/actions.ts`**
- **Found during:** Task 1
- **Issue:** Plan 03 context stated `createCheckoutPreference` was output by Plan 02, but Plan 02 built an API route at `/api/loja/checkout` instead of a Server Action
- **Fix:** Created `src/lib/shop/actions.ts` as a `'use server'` module that wraps the same MP checkout logic
- **Files modified:** `src/lib/shop/actions.ts` (created)
- **Commit:** fe8a2003

**2. [Rule 2 - Missing Critical Functionality] Exposed `minecraftUuid` in session**
- **Found during:** Task 1
- **Issue:** `ProductCard` needs `session.user.minecraftUuid` to decide which action to show, but session callback only exposed `id`, `discordId`, `isAdmin`
- **Fix:** Updated `auth.ts` session callback to select and expose `minecraftUuid` + `minecraftName`; updated `next-auth.d.ts` type
- **Files modified:** `src/lib/auth.ts`, `src/types/next-auth.d.ts`
- **Commit:** fe8a2003

**3. [Rule 1 - Bug] Button.asChild not supported in shadcn base-nova**
- **Found during:** Task 2
- **Issue:** TypeScript error on `<Button asChild>` — `asChild` prop not in ButtonProps (known Phase 1 pattern)
- **Fix:** Replaced `<Button asChild><Link>` with a directly-styled `<Link>` in meus-pedidos empty state
- **Files modified:** `src/app/(public)/loja/meus-pedidos/page.tsx`
- **Commit:** bee139ec

**4. Schema field adaptation**
- **Found during:** Task 1
- **Issue:** Plan context referenced `shopItems.active` but actual schema uses `shopItems.available`; schema also lacks `type`, `rconTemplate`, `duration` columns
- **Fix:** Used `shopItems.available` in queries; `category` field used as type discriminator in ProductCard with TYPE_MAP
- **Impact:** Functionally equivalent — `available` is the same semantic field

## Known Stubs

None — all data flows are wired to the DB.

## Requirements Addressed

- **SHOP-01**: Product catalog with real prices and buy flow visible at /loja
- **SHOP-02**: BuyButton triggers checkout via createCheckoutPreference → MercadoPago redirect
- **SHOP-04**: Order status visible at /loja/pedido/[id]; order history at /loja/meus-pedidos

## Next Plan

05-04 — Admin order management page (/admin/pedidos) + LojaCrud extended fields

## Self-Check: PASSED

All created/modified files verified to exist:
- src/app/(public)/loja/page.tsx: FOUND
- src/components/shop/ProductCard.tsx: FOUND
- src/components/shop/BuyButton.tsx: FOUND
- src/components/shop/NoMinecraftWarning.tsx: FOUND
- src/components/shop/OrderStatusStepper.tsx: FOUND
- src/lib/shop/actions.ts: FOUND
- src/app/(public)/loja/pedido/[id]/page.tsx: FOUND
- src/app/(public)/loja/meus-pedidos/page.tsx: FOUND
- src/components/layout/Navbar.tsx: modified, verified contains Meus Pedidos

Commits verified:
- fe8a2003: FOUND (feat(05-03): product catalog...)
- bee139ec: FOUND (feat(05-03): order status page...)

TypeScript: compiles clean (no errors)
