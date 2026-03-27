---
phase: 04-painel-admin
plan: "04"
subsystem: admin
tags: [drizzle-orm, next-auth, server-actions, react, postgres, alert-dialog, useOptimistic]

requires:
  - phase: 04-01
    provides: Admin layout, middleware guard, AdminSidebar, auth session with discordId
  - phase: 04-02
    provides: permissions.ts module (hasPermission, isSuperAdmin, logAudit, getAdminSections)

provides:
  - banPlayer/unbanPlayer/deleteMatch server actions with audit logging
  - Admin leaderboard page with player table (ban/unban) and match table (delete)
  - grantPermission/revokePermission server actions restricted to super-admin
  - /admin/permissoes page with PermissionManager component (per-section checkboxes)
  - Public leaderboard queries patched to exclude banned players

affects: [public-ranking, player-profiles]

tech-stack:
  added: []
  patterns:
    - AlertDialog confirmation before destructive server actions
    - useOptimistic for immediate checkbox toggle feedback while server action is in-flight
    - Server-side URL-param pagination for admin tables (no client state needed)
    - isSuperAdmin guard at page level in addition to layout isAdmin guard

key-files:
  created:
    - src/lib/admin/actions/leaderboard.ts
    - src/lib/admin/actions/permissions.ts
    - src/app/(admin)/admin/leaderboard/page.tsx
    - src/app/(admin)/admin/permissoes/page.tsx
    - src/components/admin/LeaderboardActions.tsx
    - src/components/admin/PermissionManager.tsx
  modified:
    - src/lib/db/queries/leaderboard.ts
    - tests/admin-actions.test.ts

key-decisions:
  - "AlertDialog for destructive actions (ban, delete) — prevents accidental irreversible operations"
  - "useOptimistic in PermissionManager for instant checkbox feedback without waiting for server round-trip"
  - "Server-side URL-param pagination for admin tables — no client state, bookmarkable, no hydration cost"
  - "isSuperAdmin check at permissoes page level in addition to layout isAdmin — defense in depth for super-admin-only sections"
  - "Public leaderboard queries patched with and(eq(banned,0)) — banned players invisible on /ranking without DB deletions"

requirements-completed: [ADMIN-07, ADMIN-08]

duration: 4min
completed: 2026-03-18
---

# Phase 04 Plan 04: Leaderboard Management and Permission Manager Summary

**Ban/unban players, delete matches from admin panel, super-admin permission matrix with useOptimistic checkboxes, and banned-player filter on public leaderboard queries**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-18T23:47:52Z
- **Completed:** 2026-03-18T23:51:32Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Leaderboard admin page with dual tables: all players (with ban/unban actions) and all matches (with delete action), both server-side paginated and filterable
- Three server actions: `banPlayer` (sets banned=1), `unbanPlayer` (sets banned=0), `deleteMatch` — all permission-guarded and audit-logged
- Public leaderboard queries (`getLeaderboard`, `getTop10Wins`) patched to exclude banned players from /ranking
- Permission management page (super-admin only) with PermissionManager component — per-admin checkboxes for 4 sections using useOptimistic for instant toggle feedback
- `grantPermission` and `revokePermission` server actions restricted to super-admin via isSuperAdmin guard

## Task Commits

1. **Task 1: Leaderboard Server Actions, admin page, and public query patch** - `51b9f569` (feat)
2. **Task 2: Permission management page (super-admin only)** - `5799d484` (feat)

## Files Created/Modified

- `src/lib/admin/actions/leaderboard.ts` — banPlayer, unbanPlayer, deleteMatch server actions
- `src/lib/admin/actions/permissions.ts` — grantPermission, revokePermission server actions (super-admin only)
- `src/app/(admin)/admin/leaderboard/page.tsx` — Admin leaderboard page with players and matches tables
- `src/app/(admin)/admin/permissoes/page.tsx` — Permission management page with isSuperAdmin guard + redirect /403
- `src/components/admin/LeaderboardActions.tsx` — BanPlayerButton and DeleteMatchButton client components with AlertDialog
- `src/components/admin/PermissionManager.tsx` — Client component with useOptimistic checkboxes for per-section permission toggles
- `src/lib/db/queries/leaderboard.ts` — Added `and(eq(arenaPlayers.banned, 0))` filter to all 3 public queries
- `tests/admin-actions.test.ts` — Added passing tests for banPlayer, unbanPlayer, deleteMatch (sets correct value, Forbidden on no permission)

## Decisions Made

- AlertDialog for ban/unban/delete — prevents accidental irreversible mutations, matches UI-SPEC copy exactly
- `useOptimistic` in PermissionManager — checkbox toggles feel instant; server action runs in background, toast on error reverts
- Server-side URL-param pagination for both tables — consistent with other admin pages, no client state complexity
- `isSuperAdmin` page-level guard in `/admin/permissoes` — layout only checks `isAdmin`, page adds fine-grained super-admin check; redirect to /403

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Admin panel is feature-complete for Phase 4 scope: itens-banidos, servidores, loja, leaderboard, permissoes
- All ADMIN-01 through ADMIN-08 requirements satisfied
- Public leaderboard at /ranking now respects admin bans immediately on next cache revalidation

## Self-Check: PASSED

- All 7 created/modified source files exist on disk
- Commits 51b9f569 and 5799d484 verified in git log
- 30 tests passing across admin-actions, admin-permissions, and ranking test suites

---
*Phase: 04-painel-admin*
*Completed: 2026-03-18*
