---
phase: 04-painel-admin
plan: 01
subsystem: database
tags: [drizzle, neon, postgres, next-auth, shadcn, vitest, permissions]

# Dependency graph
requires:
  - phase: 02-autentica-o
    provides: users table with discordId column, Auth.js session infrastructure
  - phase: 03-sistema-competitivo
    provides: arenaPlayers and arenaMatches tables

provides:
  - 5 new DB tables: bannedItems, servers, shopItems, adminPermissions, adminAuditLog
  - banned column on arenaPlayers (integer, default 0)
  - session.user.discordId exposed via session callback
  - src/types/next-auth.d.ts Session type augmentation
  - src/lib/admin/permissions.ts with isAdmin, isSuperAdmin, hasPermission, getAdminSections, logAudit
  - scripts/seed-admin-data.ts with 12 banned_items and 3 servers
  - 4 shadcn components: dialog, select, textarea, alert-dialog
  - Wave 0 test stubs: admin-layout, admin-actions, admin-queries

affects: [04-02, 04-03, 04-04]

# Tech tracking
tech-stack:
  added: [shadcn dialog, shadcn select, shadcn textarea, shadcn alert-dialog, npx tsx for scripts]
  patterns: [TDD red-green for schema tests, idempotent seed scripts, dynamic imports in permissions module to avoid circular deps]

key-files:
  created:
    - src/lib/admin/permissions.ts
    - src/types/next-auth.d.ts
    - scripts/seed-admin-data.ts
    - src/components/ui/dialog.tsx
    - src/components/ui/select.tsx
    - src/components/ui/textarea.tsx
    - src/components/ui/alert-dialog.tsx
    - tests/admin-permissions.test.ts
    - tests/admin-layout.test.tsx
    - tests/admin-actions.test.ts
    - tests/admin-queries.test.ts
  modified:
    - src/lib/db/schema.ts
    - src/lib/auth.ts

key-decisions:
  - "permissions.ts uses dynamic imports for db/schema/drizzle-orm to avoid circular dependency issues in test environment"
  - "Test for arenaPlayers.banned uses Object.keys(schema.arenaPlayers) not ._.columns — Drizzle exposes columns as direct object keys"
  - "Seed script uses relative imports from ../src/lib/db/schema instead of @/ path alias — tsx runs outside Next.js context"

patterns-established:
  - "Admin permission checks: isAdmin(session) → hasPermission(session, section) pattern for layered authz"
  - "Wave 0 test stubs: it.todo() placeholders let downstream plans fill in real implementations without failing CI"
  - "Idempotent seeds: check .limit(1) before inserting, skip if rows exist"

requirements-completed: [ADMIN-01, ADMIN-02]

# Metrics
duration: 3min
completed: 2026-03-18
---

# Phase 4 Plan 01: Admin Foundation Summary

**5 new Drizzle/Neon tables, discordId in Auth.js session, permissions utility module, shadcn component quartet, seed script, and Wave 0 test stubs for admin panel**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-18T23:35:26Z
- **Completed:** 2026-03-18T23:38:46Z
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments

- Added 5 admin DB tables (bannedItems, servers, shopItems, adminPermissions, adminAuditLog) + banned column on arenaPlayers — synced to Neon via drizzle-kit push
- Extended Auth.js session callback to expose discordId; created next-auth.d.ts type augmentation
- Created permissions module with isAdmin/isSuperAdmin (env-var based) + hasPermission/logAudit (DB-backed)
- Installed 4 shadcn components (dialog, select, textarea, alert-dialog) required by Wave 2+ admin UI
- Ran idempotent seed: 12 banned_items and 3 servers inserted into Neon DB
- Created Wave 0 test stubs (admin-layout, admin-actions, admin-queries) with it.todo() placeholders for downstream plans

## Task Commits

Each task was committed atomically:

1. **Task 1: Schema, session, shadcn, permissions, Wave 0 stubs** - `0fbf5f10` (feat)
2. **Task 2: Seed script** - `84db7b73` (feat)

## Files Created/Modified

- `src/lib/db/schema.ts` — 5 new tables appended, banned column added to arenaPlayers
- `src/lib/auth.ts` — session callback extended with discordId DB lookup
- `src/types/next-auth.d.ts` — Session type augmented with discordId: string | null
- `src/lib/admin/permissions.ts` — isAdmin, isSuperAdmin, hasPermission, getAdminSections, logAudit
- `scripts/seed-admin-data.ts` — idempotent seed for bannedItems (12) and servers (3)
- `src/components/ui/dialog.tsx` — shadcn dialog component
- `src/components/ui/select.tsx` — shadcn select component
- `src/components/ui/textarea.tsx` — shadcn textarea component
- `src/components/ui/alert-dialog.tsx` — shadcn alert-dialog component
- `tests/admin-permissions.test.ts` — 13 passing tests for schema + isAdmin + isSuperAdmin
- `tests/admin-layout.test.tsx` — Wave 0 stub (2 it.todo)
- `tests/admin-actions.test.ts` — Wave 0 stub (4 it.todo)
- `tests/admin-queries.test.ts` — Wave 0 stub (2 it.todo)

## Decisions Made

- `permissions.ts` uses dynamic imports for `@/lib/db`, `@/lib/db/schema`, `drizzle-orm` to avoid circular dependency issues in the test environment
- Test for `arenaPlayers.banned` column uses `Object.keys(schema.arenaPlayers)` — Drizzle exposes column names as direct object keys, not via `._`
- Seed script uses relative imports (`../src/lib/db/schema`) instead of `@/` path aliases because `npx tsx` runs outside Next.js context

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed arenaPlayers column access pattern in test**
- **Found during:** Task 1 (TDD GREEN phase)
- **Issue:** Test used `(schema.arenaPlayers as any)._.columns` which is undefined in Drizzle v0.45 — columns are exposed as direct object keys
- **Fix:** Changed to `Object.keys(schema.arenaPlayers)` which correctly returns column names
- **Files modified:** tests/admin-permissions.test.ts
- **Verification:** Test passes (green)
- **Committed in:** 0fbf5f10

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor — just the test accessor pattern for Drizzle columns. No scope creep.

## Issues Encountered

- `drizzle-kit push` requires DATABASE_URL in env — loaded from `.env.local` via `export $(cat .env.local | ...)` shell expansion

## User Setup Required

None — DATABASE_URL was available in `.env.local`, seed ran successfully.

## Next Phase Readiness

- All 5 tables exist in Neon DB, schema committed
- `session.user.discordId` available after login (requires env vars `ADMIN_DISCORD_IDS` and `SUPER_ADMIN_DISCORD_ID` to be set for admin checks to work)
- Wave 0 test stubs ready for 04-02 (admin layout), 04-03 (server actions), 04-04 (queries)
- Permissions module ready for import in admin layouts and Server Actions

---
*Phase: 04-painel-admin*
*Completed: 2026-03-18*
