---
phase: 09-mod-neoforge-e-dashboard-de-beneficios
plan: 01
subsystem: api, database, admin

tags: [drizzle, neon, nextjs, server-actions, api-routes, admin-panel]

# Dependency graph
requires:
  - phase: 05-loja-funcional
    provides: orders table schema, admin permissions system, AdminSidebar pattern

provides:
  - deliveredAt, expiresAt, revokedAt columns on orders table (Neon DB)
  - GET /api/deliveries/pending — mod polling endpoint with MOD_API_KEY auth
  - POST /api/deliveries/confirm — mod confirms delivery with expiresAt
  - POST /api/deliveries/expired — mod notifies expiration
  - POST /api/deliveries/revoke — admin panel revokes benefit with audit log
  - getBeneficios() and revogarBeneficio() Server Actions
  - getVendas() Server Action with date/status filters
  - AdminSection expanded with 'beneficios' and 'vendas'
  - AdminSidebar with Beneficios and Vendas nav links
  - RCON infrastructure fully removed (client, commands, cron worker, npm package)

affects: [09-mod-neoforge-e-dashboard-de-beneficios plan 02 (admin pages UI)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - MOD_API_KEY bearer auth for mod-to-site API communication
    - Mod-pull delivery model: mod polls /api/deliveries/pending instead of server pushing via RCON
    - expiresAt/deliveredAt/revokedAt lifecycle tracking on orders table

key-files:
  created:
    - src/app/api/deliveries/pending/route.ts
    - src/app/api/deliveries/confirm/route.ts
    - src/app/api/deliveries/expired/route.ts
    - src/app/api/deliveries/revoke/route.ts
    - src/lib/admin/actions/beneficios.ts
    - src/lib/admin/actions/vendas.ts
  modified:
    - src/lib/db/schema.ts
    - src/lib/admin/permissions.ts
    - src/app/(admin)/layout.tsx
    - src/components/admin/AdminSidebar.tsx
    - src/lib/admin/actions/orders.ts
    - package.json
  deleted:
    - src/lib/rcon/client.ts
    - src/lib/rcon/commands.ts
    - src/app/api/cron/process-orders/route.ts

key-decisions:
  - "Mod-pull delivery model: mod polls /api/deliveries/pending; no RCON push from server"
  - "forceRetryDelivery now sets status to 'paid' (not 'delivering') so mod picks it up"
  - "revoke endpoint checks hasPermission('beneficios') via session, not MOD_API_KEY"
  - "deliveries/revoke as API route instead of Server Action (called from admin panel)"

patterns-established:
  - "MOD_API_KEY: Bearer token auth pattern for all mod-facing endpoints"
  - "Mod receives both pending deliveries and revocations in same poll response (orders + revocations arrays)"

requirements-completed: [MOD-01, MOD-02, MOD-03, MOD-04]

# Metrics
duration: 18min
completed: 2026-03-27
---

# Phase 09 Plan 01: Mod NeoForge e Dashboard de Beneficios — Foundation Summary

**Schema migration (deliveredAt/expiresAt/revokedAt) + 4 mod API endpoints + beneficios/vendas Server Actions + RCON infrastructure removed**

## Performance

- **Duration:** ~18 min
- **Started:** 2026-03-27T22:02:00Z
- **Completed:** 2026-03-27T22:13:50Z
- **Tasks:** 2
- **Files modified:** 12 (6 created, 3 modified, 3 deleted)

## Accomplishments

- Schema migrated: 3 new timestamp columns on orders table applied to Neon DB via drizzle-kit push
- 4 API endpoints for mod communication: pending deliveries poll, confirm, expired notification, admin revoke
- Admin Server Actions: getBeneficios (with daysRemaining calc) and getVendas (with date/status filters)
- RCON infrastructure fully removed: rcon-client npm package, client.ts, commands.ts, and cron worker deleted
- AdminSection type expanded, sidebar updated with Beneficios and Vendas nav items

## Task Commits

Each task was committed atomically:

1. **Task 1: Schema migration + API endpoints + permissions + sidebar** - `43e72abe` (feat)
2. **Task 2: Admin Server Actions + RCON removal** - `60e76a23` (feat)

## Files Created/Modified

- `src/lib/db/schema.ts` — Added deliveredAt, expiresAt, revokedAt to orders table
- `src/lib/admin/permissions.ts` — AdminSection expanded with 'beneficios' and 'vendas'
- `src/app/(admin)/layout.tsx` — superAdmin sections include beneficios and vendas
- `src/components/admin/AdminSidebar.tsx` — Added Gift (Beneficios) and DollarSign (Vendas) nav items
- `src/app/api/deliveries/pending/route.ts` — GET endpoint for mod polling (MOD_API_KEY auth)
- `src/app/api/deliveries/confirm/route.ts` — POST endpoint mod calls after delivery (sets deliveredAt, expiresAt)
- `src/app/api/deliveries/expired/route.ts` — POST endpoint mod calls when rank expires
- `src/app/api/deliveries/revoke/route.ts` — POST endpoint admin calls to revoke benefit
- `src/lib/admin/actions/beneficios.ts` — getBeneficios() and revogarBeneficio() Server Actions
- `src/lib/admin/actions/vendas.ts` — getVendas() Server Action
- `src/lib/admin/actions/orders.ts` — forceRetryDelivery updated: 'delivering' -> 'paid' for mod pickup
- `package.json` — rcon-client removed
- Deleted: `src/lib/rcon/client.ts`, `src/lib/rcon/commands.ts`, `src/app/api/cron/process-orders/route.ts`

## Decisions Made

- Mod-pull model: mod polls `/api/deliveries/pending` on its own schedule instead of server pushing via RCON — simpler, NeoForge-compatible, no firewall issues
- `deliveries/revoke` is an API route (not Server Action) — called from admin panel via fetch POST
- `forceRetryDelivery` now sets status to 'paid' so mod picks it up; also allows retry from legacy 'delivering' status

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added input validation and 404 handling to API endpoints**
- **Found during:** Task 1 (API endpoint implementation)
- **Issue:** Plan pattern omitted 404 responses for non-existent orders and body validation for required fields
- **Fix:** Added explicit body validation (400) and order existence check (404) to confirm, expired, and revoke endpoints
- **Files modified:** All 4 delivery route files
- **Verification:** TypeScript compiles clean, logic handles edge cases
- **Committed in:** 43e72abe (Task 1 commit)

**2. [Rule 1 - Bug] Used Gift icon instead of Shield for beneficios**
- **Found during:** Task 1 (AdminSidebar update)
- **Issue:** Plan specified `Shield` icon for beneficios but Shield is already used for Permissoes — would create visual ambiguity
- **Fix:** Used `Gift` icon for Beneficios (semantically appropriate for benefits/rank delivery)
- **Files modified:** src/components/admin/AdminSidebar.tsx
- **Committed in:** 43e72abe (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (1 missing critical, 1 bug fix)
**Impact on plan:** Both auto-fixes improve correctness and UX. No scope creep.

## Issues Encountered

- drizzle-kit push reported "No changes detected" on first run because it reads from the main repo schema.ts (not the worktree). Applied the schema change to both the worktree and the main repo, then push succeeded with "Changes applied".
- TSC binary CRLF issue in WSL — had to use `node node_modules/typescript/bin/tsc` directly.

## User Setup Required

None — no new external service configuration required.
MOD_API_KEY env var must be set in Vercel for mod endpoints to work (new env var needed).

## Next Phase Readiness

- All backend foundation for Plan 02 (admin UI pages) is ready
- `/admin/beneficios` and `/admin/vendas` routes will consume getBeneficios() and getVendas() Server Actions
- Mod can immediately start polling `/api/deliveries/pending` once MOD_API_KEY is configured in Vercel

---
*Phase: 09-mod-neoforge-e-dashboard-de-beneficios*
*Completed: 2026-03-27*
