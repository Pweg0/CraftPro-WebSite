---
phase: 09-mod-neoforge-e-dashboard-de-beneficios
plan: 03
subsystem: admin-ui

tags: [nextjs, react, admin-panel, tailwind, server-actions]

dependency_graph:
  requires:
    - phase: 09-mod-neoforge-e-dashboard-de-beneficios
      plan: 01
      provides: getBeneficios, revogarBeneficio, getVendas Server Actions
  provides:
    - /admin/beneficios — active benefits table with countdown badges and revogar flow
    - /admin/vendas — read-only sales log with status and date filters
  affects:
    - Admin dashboard completeness (D-13 through D-21 delivered)

tech_stack:
  added: []
  patterns:
    - CountdownBadge: color-coded days-remaining badge (green/yellow/red/grey) per D-14
    - Debounced player search (300ms useRef timeout) for filter-via-URL pattern
    - Read-only table with no DropdownMenu (VendasCrud per D-20)
    - Date range filter via URL params without debounce (date inputs)

key_files:
  created:
    - src/app/(admin)/admin/beneficios/page.tsx
    - src/app/(admin)/admin/beneficios/BeneficiosCrud.tsx
    - src/app/(admin)/admin/vendas/page.tsx
    - src/app/(admin)/admin/vendas/VendasCrud.tsx
  modified: []

key_decisions:
  - "BeneficiosCrud hides DropdownMenu entirely for expired/revoked rows (not just greys out)"
  - "VendasCrud uses DeliveryStatusBadge based on deliveredAt/revokedAt fields, separate from payment StatusBadge"
  - "buildParams helper in VendasCrud centralizes filter URL construction for pagination + filter interactions"

requirements-completed: [MOD-04]

metrics:
  duration: ~8min
  completed: 2026-03-27
  tasks_completed: 2
  files_created: 4
  files_modified: 0
---

# Phase 09 Plan 03: Admin Dashboard — Beneficios and Vendas Pages Summary

**Two admin pages: /admin/beneficios with color-coded countdown badges and revocation flow, /admin/vendas with read-only 9-column sales log — both following the PedidosCrud pattern exactly.**

## Performance

- **Duration:** ~8 min
- **Completed:** 2026-03-27T22:26:00Z
- **Tasks:** 2 (Task 3 is checkpoint:human-verify — pending user approval)
- **Files created:** 4

## Task Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | /admin/beneficios page and BeneficiosCrud component | c7c7e5b8 | src/app/(admin)/admin/beneficios/page.tsx, BeneficiosCrud.tsx |
| 2 | /admin/vendas page and VendasCrud component | 0a06d87d | src/app/(admin)/admin/vendas/page.tsx, VendasCrud.tsx |

## What Was Built

### /admin/beneficios (BeneficiosCrud)

Server Component `page.tsx` reads `status`, `player`, `page` searchParams and calls `getBeneficios()`. Passes results to `BeneficiosCrud` Client Component.

**BeneficiosCrud features:**
- 7-column table per D-13: Player, Beneficio, Data de compra, Valor pago, Expira em, Status servidor, Actions
- `CountdownBadge`: green (`text-brand-online`) >14d, yellow (`text-brand-yellow`) 7-14d with AlertTriangle icon, red (`text-brand-accent`) <7d with AlertTriangle icon, grey expired/revoked
- `DeliveryStatusBadge`: Entregue (green), Pendente (blue), Revogado (red)
- Player search input debounced 300ms via `useRef`
- Status dropdown filter (Todos/Ativo/Expirando/Expirado) via URL params
- DropdownMenu row action hidden entirely for expired/revoked rows (not disabled)
- AlertDialog confirmation for revogar: "Revogar beneficio?" / "Sim, revogar"
- `revogarBeneficio()` Server Action + `toast.success`/`toast.error` feedback
- Empty state with Package icon: "Nenhum beneficio ativo"
- Pagination with `Pagina X de {totalPages}` label preserving filters in URL

### /admin/vendas (VendasCrud)

Server Component `page.tsx` reads `status`, `dateFrom`, `dateTo`, `page` searchParams and calls `getVendas()`.

**VendasCrud features:**
- 9-column read-only table per D-18: #, Player, Item, Valor, Status pagamento, Metodo, ID MercadoPago, Status entrega, Data
- `StatusBadge` with 7 status states including `revoked` (red) and `expired` (grey)
- `DeliveryStatusBadge` based on `deliveredAt`/`revokedAt` nullable fields
- Status dropdown + date range inputs (`De`/`Ate`) with immediate URL push on change
- MercadoPago ID truncated to 12 chars with full value as `title` tooltip
- No DropdownMenu — read-only table per D-20
- No CSV export — deferred per D-20
- Empty state with ShoppingBag icon: "Nenhuma venda registrada"
- Pagination with `Pagina X de {totalPages}` label preserving all filters

## Deviations from Plan

### Auto-fixed Issues

None.

Minor implementation choices:

1. `DropdownMenu` is conditionally rendered (not rendered at all) for expired/revoked beneficios rows — plan said "only if status !== 'expired' && status !== 'revoked'" which aligns with removing the trigger entirely rather than leaving an empty menu.
2. `buildParams` helper added in `VendasCrud` to DRY filter URL construction — avoids duplication between `handleStatusChange`, `handleDateFromChange`, `handleDateToChange`, and `buildPageUrl`.

## Known Stubs

None. Both pages are fully wired to their respective Server Actions. Data flows from Neon DB through `getBeneficios()`/`getVendas()` into the table components.

## Verification

- TypeScript: `npx tsc --noEmit` passes with zero errors
- All 4 files created under correct paths
- Task 3 (`checkpoint:human-verify`) awaiting user visual review

## Self-Check: PASSED

Files verified:
- `src/app/(admin)/admin/beneficios/page.tsx`: exists, contains `getBeneficios` and `BeneficiosCrud`
- `src/app/(admin)/admin/beneficios/BeneficiosCrud.tsx`: exists, `'use client'`, `CountdownBadge`, `text-brand-online`, `text-brand-yellow`, `text-brand-accent`, `revogarBeneficio`, `Revogar beneficio?`, `Sim, revogar`, `toast.success`, `Buscar player`, `Nenhum beneficio ativo`, `aria-label`, `Pagina`
- `src/app/(admin)/admin/vendas/page.tsx`: exists, contains `getVendas` and `VendasCrud`
- `src/app/(admin)/admin/vendas/VendasCrud.tsx`: exists, `'use client'`, `Log de Vendas`, `type="date"`, `dateFrom`, `mercadopagoPaymentId`, `.slice(0, 12)`, `Nenhuma venda registrada`, no `DropdownMenu`, no CSV, `Pagina`
- Commits: c7c7e5b8 and 0a06d87d confirmed in git log
