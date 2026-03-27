---
phase: 04-painel-admin
plan: 03
subsystem: admin
tags: [next.js, drizzle, server-actions, shadcn, sonner, base-ui, crud]

# Dependency graph
requires:
  - phase: 04-painel-admin-01
    provides: "DB schema for bannedItems, servers, shopItems, adminPermissions, adminAuditLog"
  - phase: 04-painel-admin-02
    provides: "Admin shell layout, sidebar, permissions.ts hasPermission/logAudit"
provides:
  - "Server Actions for bannedItems CRUD (createBannedItem, updateBannedItem, deleteBannedItem)"
  - "Server Actions for servers CRUD (createServer, updateServer, deleteServer)"
  - "Server Actions for shopItems CRUD (createShopItem, updateShopItem, deleteShopItem)"
  - "Server Actions for leaderboard admin (banPlayer, unbanPlayer, deleteMatch)"
  - "Admin CRUD pages: /admin/itens-banidos, /admin/servidores, /admin/loja"
  - "Form components: BannedItemForm, ServerForm, ShopItemForm"
  - "Public /itens-banidos reads from DB (not static file)"
  - "Public /servidores reads from DB (not static file)"
  - "Public /loja shows DB-backed preview items below category cards"
affects: [04-04-leaderboard, public-pages]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server Component page + Client island (CRUD state) pattern for admin pages"
    - "Server Actions with auth() + hasPermission() + logAudit() + dual revalidatePath"
    - "useTransition for pending state on form submit with Loader2 spinner"
    - "Controlled Dialog open/onOpenChange via base-ui Dialog.Root"
    - "AlertDialog for destructive action confirmation"

key-files:
  created:
    - src/lib/admin/actions/banned-items.ts
    - src/lib/admin/actions/servers.ts
    - src/lib/admin/actions/shop-items.ts
    - src/lib/admin/actions/leaderboard.ts
    - src/components/admin/BannedItemForm.tsx
    - src/components/admin/ServerForm.tsx
    - src/components/admin/ShopItemForm.tsx
    - src/app/(admin)/admin/itens-banidos/BannedItemsCrud.tsx
    - src/app/(admin)/admin/itens-banidos/page.tsx
    - src/app/(admin)/admin/servidores/ServidoresCrud.tsx
    - src/app/(admin)/admin/servidores/page.tsx
    - src/app/(admin)/admin/loja/LojaCrud.tsx
    - src/app/(admin)/admin/loja/page.tsx
  modified:
    - src/app/(public)/itens-banidos/page.tsx
    - src/app/(public)/servidores/page.tsx
    - src/app/(public)/loja/page.tsx
    - tests/admin-actions.test.ts
    - tests/loja.test.tsx

key-decisions:
  - "Server slug for servers table auto-generated from name via normalize+lowercase+replace — user shown disabled slug field when editing"
  - "leaderboard.ts actions created alongside this plan (not 04-04) because test file was auto-updated to reference them"
  - "loja.test.tsx updated to mock db and await async Server Component — test was incompatible with async page after migration"

patterns-established:
  - "Admin CRUD pattern: Server Component page fetches from DB + Client island (BannedItemsCrud/ServidoresCrud/LojaCrud) manages dialog/alert state"
  - "Form components accept open/onOpenChange props — parent CRUD island controls Dialog open state to support both create and edit modes"

requirements-completed: [ADMIN-04, ADMIN-05, ADMIN-06]

# Metrics
duration: 6min
completed: 2026-03-18
---

# Phase 04 Plan 03: Admin CRUD for Banned Items, Servers, and Shop Items Summary

**9 Server Actions + 3 Dialog form components + 3 admin CRUD pages + 3 public pages migrated from static imports to Drizzle DB reads**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-18T23:47:51Z
- **Completed:** 2026-03-18T23:53:16Z
- **Tasks:** 3
- **Files modified:** 18

## Accomplishments

- All 9 CRUD server actions implemented (bannedItems, servers, shopItems) with permission checks, audit logging, and dual revalidatePath
- Three admin CRUD pages using Server Component + Client island pattern with DropdownMenu row actions, AlertDialog delete confirmation, and Dialog create/edit forms
- All three public pages migrated to read from database — no remaining static imports from src/data/

## Task Commits

Each task was committed atomically:

1. **Task 1: Server Actions for banned items, servers, shop items** - `487e54cf` (feat)
2. **Task 2: Admin CRUD pages with form components** - `cb992432` (feat)
3. **Task 3: Migrate public pages from static data to DB reads** - `1a1ae2b6` (feat)

## Files Created/Modified

- `src/lib/admin/actions/banned-items.ts` - createBannedItem, updateBannedItem, deleteBannedItem
- `src/lib/admin/actions/servers.ts` - createServer, updateServer, deleteServer (slug auto-gen + uniqueness check)
- `src/lib/admin/actions/shop-items.ts` - createShopItem, updateShopItem, deleteShopItem
- `src/lib/admin/actions/leaderboard.ts` - banPlayer, unbanPlayer, deleteMatch (created to satisfy test suite)
- `src/components/admin/BannedItemForm.tsx` - Dialog form for banned item create/edit
- `src/components/admin/ServerForm.tsx` - Dialog form for server create/edit
- `src/components/admin/ShopItemForm.tsx` - Dialog form for shop item create/edit
- `src/app/(admin)/admin/itens-banidos/BannedItemsCrud.tsx` - Client CRUD island
- `src/app/(admin)/admin/itens-banidos/page.tsx` - Server Component, queries bannedItems
- `src/app/(admin)/admin/servidores/ServidoresCrud.tsx` - Client CRUD island
- `src/app/(admin)/admin/servidores/page.tsx` - Server Component, queries servers
- `src/app/(admin)/admin/loja/LojaCrud.tsx` - Client CRUD island
- `src/app/(admin)/admin/loja/page.tsx` - Server Component, queries shopItems
- `src/app/(public)/itens-banidos/page.tsx` - Migrated from static BANNED_ITEMS to DB
- `src/app/(public)/servidores/page.tsx` - Migrated from static SERVERS to DB
- `src/app/(public)/loja/page.tsx` - Added shopItems preview section, DB-backed
- `tests/admin-actions.test.ts` - Real tests added for all actions
- `tests/loja.test.tsx` - Updated to mock db and await async Server Component

## Decisions Made

- Server slug for servers auto-generated from name via normalize+lowercase+replace. Slug shown as disabled Input when editing since it's the PK and cannot be changed.
- leaderboard.ts actions were created as part of this plan because the test file was auto-updated to reference them (the automation that completed 04-04 early had added those tests).
- loja.test.tsx needed to be updated — the page became async after migration, requiring db mock and `await LojaPage()` pattern.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created leaderboard.ts server actions file**
- **Found during:** Task 1 (after tests ran and test file was auto-updated)
- **Issue:** tests/admin-actions.test.ts was automatically expanded to include banPlayer, unbanPlayer, deleteMatch tests referencing @/lib/admin/actions/leaderboard — that file did not exist
- **Fix:** Created src/lib/admin/actions/leaderboard.ts with banPlayer, unbanPlayer, deleteMatch following the same permission/audit pattern
- **Files modified:** src/lib/admin/actions/leaderboard.ts
- **Verification:** npx vitest run tests/admin-actions.test.ts — 9 passing
- **Committed in:** cb992432 (Task 2 commit)

**2. [Rule 1 - Bug] Updated loja.test.tsx for async Server Component**
- **Found during:** Task 3 (after migrating LojaPage to async)
- **Issue:** loja.test.tsx rendered `<LojaPage />` synchronously, but after migration to async Server Component with DB call, render returns Promise and the test would fail
- **Fix:** Updated test to mock @/lib/db and use `await LojaPage()` pattern to resolve the async component before rendering
- **Files modified:** tests/loja.test.tsx
- **Verification:** npx vitest run tests/loja.test.tsx — 3 passing
- **Committed in:** 1a1ae2b6 (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both auto-fixes necessary for test correctness and suite completeness. No scope creep.

## Issues Encountered

None — plan executed cleanly with two minor deviations handled automatically.

## Next Phase Readiness

- Admin CRUD infrastructure complete for all three primary content sections
- Server Actions pattern established — Phase 04-04 leaderboard actions follow the same structure
- All public pages now database-driven — mutations via admin panel are immediately reflected after revalidatePath

---
*Phase: 04-painel-admin*
*Completed: 2026-03-18*
