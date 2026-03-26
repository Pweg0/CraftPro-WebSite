---
phase: 05-loja-funcional
plan: 01
subsystem: loja
tags: [shop, schema, orders, admin, catalog]
dependency_graph:
  requires: [04-painel-admin]
  provides: [shop-schema, orders-table, shop-query-module, shop-item-card, functional-catalog-ui]
  affects: [/loja, /admin/loja]
tech_stack:
  added: []
  patterns: [drizzle-orm queries, server-actions, BRL currency formatting]
key_files:
  created:
    - src/lib/db/queries/shop.ts
    - src/components/shop/ShopItemCard.tsx
    - tests/shop-queries.test.ts
    - .planning/phases/05-loja-funcional/05-01-PLAN.md
  modified:
    - src/lib/db/schema.ts
    - src/app/(public)/loja/page.tsx
    - src/app/(admin)/admin/loja/LojaCrud.tsx
    - src/app/(admin)/admin/loja/page.tsx
    - src/components/admin/ShopItemForm.tsx
    - src/lib/admin/actions/shop-items.ts
    - tests/loja.test.tsx
decisions:
  - "orders table uses integer cents for price storage (BRL) — avoids floating point rounding errors"
  - "available column is integer (0/1) not boolean — consistent with existing patterns in schema (banned column)"
  - "getShopItems() filters available=1 and sorts by category then name — deterministic catalog order"
  - "getAllShopItemsAdmin() returns all items including hidden — admin needs full visibility"
  - "ShopItemCard buy button is disabled with cursor-not-allowed — payment not yet integrated (Phase 5 later plans)"
  - "loja.test.tsx updated to use new empty-state and item-card patterns instead of static category cards"
metrics:
  duration: 9 min
  completed: "2026-03-26"
  tasks: 3
  files: 10
requirements:
  - SHOP-01
  - SHOP-02
---

# Phase 5 Plan 01: Loja Funcional Foundation Summary

**One-liner:** Extended shopItems schema with price/available columns, added orders table with MercadoPago ID field, built ShopItemCard with BRL formatting, and transformed /loja from static teaser to dynamic product catalog.

## What Was Built

### Schema Extensions (src/lib/db/schema.ts)

Three new columns added to `shop_items`:
- `price` — integer cents (BRL), e.g. 1990 = R$19,90, default 0
- `image_url` — optional product image URL
- `available` — integer 0/1 visibility flag, default 1

New `orders` table for Phase 5 payment tracking:
- `user_id` FK to users (cascade delete)
- `shop_item_id` FK to shop_items
- `status` — pending | paid | delivered | failed | refunded
- `mercadopago_id` — MP payment ID (filled after checkout)
- `amount_cents` — price snapshot at time of order
- Indexes on user_id and status

### Shop Query Module (src/lib/db/queries/shop.ts)

- `getShopItems()` — returns only available=1 items, sorted by category then name
- `getShopItemById(id)` — returns null if not found or not available
- `getOrdersByUser(userId)` — returns user's orders, most recent first
- `getAllShopItemsAdmin()` — returns ALL items (including hidden) for admin panel

### ShopItemCard Component (src/components/shop/ShopItemCard.tsx)

- Category-aware color coding (cosmeticos=yellow, ranks-vip=red, itens-servidor=blue)
- Price formatted in BRL via `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`
- Buy button disabled with "Pagamento em breve" tooltip (payment not yet integrated)
- Optional image support

### Updated /loja Page (src/app/(public)/loja/page.tsx)

- Now uses `getShopItems()` instead of direct db query
- Groups items by category with section headings
- Shows empty state with `PackageSearch` icon when no items available
- Keeps Em Breve badge, ambient glow, Discord CTA

### Updated Admin /admin/loja (3 files)

- `page.tsx` — uses `getAllShopItemsAdmin()` to show all items including hidden
- `LojaCrud.tsx` — shows price (formatted BRL) and Visível/Oculto status badge in table
- `ShopItemForm.tsx` — adds price (R$ input with step 0.01), imageUrl, and available toggle fields
- `shop-items.ts` actions — updated to include price, imageUrl, available in create/update

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Integer cents for price | Avoids floating point rounding errors in BRL |
| available as integer 0/1 | Consistent with existing banned column pattern |
| Buy button disabled | MercadoPago integration is future work (later Phase 5 plans) |
| Empty state on /loja | Better UX than showing "0 categories" with no items |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated loja.test.tsx to match new page structure**
- **Found during:** Task 3 review
- **Issue:** Existing test `renders all 3 store category cards` tested static UI (hardcoded category cards) that was replaced by dynamic catalog. With empty DB mock, categories no longer render — they only appear when items exist.
- **Fix:** Updated loja.test.tsx with new test structure: empty-state tests + item-rendering tests with mocked data
- **Files modified:** tests/loja.test.tsx
- **Commit:** 5c8117f4

## Known Stubs

- `ShopItemCard` buy button is permanently disabled — clicking does nothing. This is intentional: MercadoPago checkout integration is planned for later Phase 5 plans (05-02 or beyond).

## Self-Check: PASSED

Files exist:
- FOUND: src/lib/db/schema.ts
- FOUND: src/lib/db/queries/shop.ts
- FOUND: src/components/shop/ShopItemCard.tsx
- FOUND: src/app/(public)/loja/page.tsx
- FOUND: src/app/(admin)/admin/loja/LojaCrud.tsx
- FOUND: tests/shop-queries.test.ts

Commits exist:
- FOUND: 9b632736 — feat(05-loja-funcional-01): extend shopItems schema and add orders table
- FOUND: 8a9c5d68 — feat(05-loja-funcional-01): build ShopItemCard and update /loja page to real catalog
- FOUND: 5c8117f4 — feat(05-loja-funcional-01): update admin /loja CRUD with price and available fields

TypeScript: PASSED (npx tsc --noEmit — no errors)
