---
phase: 05-loja-funcional
plan: 02
status: complete
started: 2026-03-26
completed: 2026-03-26
tasks_completed: 3
tasks_total: 3
---

# Plan 05-02 Summary: MercadoPago Checkout + Webhook + BuyButton + Orders Page

## What Was Built

### Task 1: MercadoPago Checkout API + Webhook Handler
- `src/app/api/loja/checkout/route.ts` — POST route that creates MP Preference + order record, returns initPoint for redirect
- `src/app/api/loja/webhook/route.ts` — POST handler for MP payment notifications, maps payment status to order status
- `mercadopago@2.12.0` added to dependencies

### Task 2: BuyButton Client Component
- `src/components/shop/BuyButton.tsx` — 'use client' component with auth-awareness (shows login prompt when not authenticated), loading state, calls checkout API, redirects to MercadoPago

### Task 3: User Orders Page
- `src/app/(protected)/pedidos/page.tsx` — Protected page showing user's order history with status badges (pending/paid/delivered/failed/refunded), BRL formatting, empty state

## Deviations

- Agent hit rate limit before creating SUMMARY and updating state files — orchestrator completed these manually
- middleware.ts had a minor uncommitted change (1 line) committed as WIP

## Requirements Addressed

- **SHOP-02**: Checkout flow via MercadoPago Checkout Pro
- **SHOP-04**: Order status visible to user at /pedidos
- **SHOP-06**: Webhook handler for payment notifications (HMAC validation deferred to RCON delivery phase)

## Environment Variables Required

- `MP_ACCESS_TOKEN` — MercadoPago access token (sandbox or production)
- `NEXT_PUBLIC_BASE_URL` — Base URL for back_urls and notification_url

## Next Plan

05-03 and 05-04 (Wave 3) — Public UI refinement + Admin orders page
