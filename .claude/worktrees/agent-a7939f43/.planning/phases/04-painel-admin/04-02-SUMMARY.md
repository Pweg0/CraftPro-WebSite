---
phase: 04-painel-admin
plan: 02
subsystem: ui
tags: [next.js, admin, middleware, auth, drizzle, lucide, shadcn]

# Dependency graph
requires:
  - phase: 04-01
    provides: permissions.ts (isAdmin, isSuperAdmin, getAdminSections), schema tables (bannedItems, servers, shopItems, adminPermissions, adminAuditLog)
provides:
  - Admin panel shell with middleware protection, 403 forbidden page, and layout with sidebar
  - AdminSidebar component (fixed desktop + Sheet drawer mobile) with permission-aware nav links
  - AdminStatCard component for dashboard stat display
  - getDashboardStats and getRecentAuditLogs Drizzle queries
  - Dashboard page with 4 stat cards and audit log table
  - Conditional Admin link in public Navbar for admin users
affects:
  - 04-03 (banned items CRUD — uses AdminSidebar, AdminStatCard, admin layout, logAudit)
  - 04-04 (servers, shop, leaderboard, permissions CRUD — same shell)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Admin route group via Next.js (admin) route group with shared layout
    - Coarse middleware guard (env var, Edge-safe) + fine-grained layout guard (DB-backed isAdmin)
    - isAdmin flag embedded in Auth.js session callback to avoid NEXT_PUBLIC_ env var exposure to client

key-files:
  created:
    - middleware.ts (updated — admin coarse check)
    - src/app/403/page.tsx
    - src/app/(admin)/layout.tsx
    - src/app/(admin)/admin/page.tsx
    - src/components/admin/AdminSidebar.tsx
    - src/components/admin/AdminStatCard.tsx
    - src/lib/db/queries/admin.ts
  modified:
    - src/components/layout/Navbar.tsx (isAdminUser conditional Admin link)
    - src/lib/auth.ts (session.user.isAdmin flag)
    - src/types/next-auth.d.ts (isAdmin?: boolean added to Session user)
    - tests/admin-queries.test.ts (filled in from stubs)

key-decisions:
  - "isAdmin flag embedded in Auth.js session callback via env var check — avoids NEXT_PUBLIC_ exposure of admin IDs to client bundle"
  - "Two-layer admin guard: middleware (env-var only, Edge runtime) + layout (DB-backed isAdmin) for defence in depth"
  - "AdminSidebar uses sections prop from layout to control visibility — super-admin sees all links, regular admin sees only their assigned sections"

patterns-established:
  - "Admin route group: src/app/(admin)/ — all admin pages share layout.tsx guard and sidebar"
  - "Coarse guard in middleware (env var check, no DB), fine guard in layout (DB isAdmin call)"
  - "Session embeds isAdmin boolean for client components that need conditional rendering"

requirements-completed: [ADMIN-03, ADMIN-09, ADMIN-10]

# Metrics
duration: 12min
completed: 2026-03-18
---

# Phase 4 Plan 02: Admin Panel Shell Summary

**Next.js admin route group with middleware guard, 403 page, sidebar navigation (desktop + mobile Sheet drawer), dashboard stat cards, and audit log table — full admin shell ready for CRUD sections**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-18T20:41:40Z
- **Completed:** 2026-03-18T20:53:00Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- Middleware coarse admin check (ADMIN_DISCORD_IDS + SUPER_ADMIN_DISCORD_ID env vars) redirects to /403 without any DB call in Edge runtime
- Admin route group layout with isAdmin + isSuperAdmin guards wrapping all /admin/* pages with AdminSidebar
- AdminSidebar component: fixed 256px desktop sidebar + Sheet drawer mobile with hamburger (aria-label="Abrir menu"), permission-aware nav links, active state with accent left border
- Dashboard page fetching 4 live DB stats + last 10 audit log entries via Drizzle queries
- Navbar conditionally renders Admin link via session.user.isAdmin flag (no NEXT_PUBLIC_ exposure)

## Task Commits

Each task was committed atomically:

1. **Task 1: Middleware admin check, 403 page, admin layout with sidebar, navbar Admin link** - `94e3f923` (feat)
2. **Task 2: Dashboard page with stats query, stat cards, and recent audit logs** - `5371ae75` (feat)

## Files Created/Modified

- `middleware.ts` - Added coarse admin check via env vars, redirects non-admin to /403
- `src/app/403/page.tsx` - Themed Acesso Negado page with ShieldX icon and Voltar ao site button
- `src/app/(admin)/layout.tsx` - Admin route group layout with isAdmin guard and AdminSidebar
- `src/app/(admin)/admin/page.tsx` - Dashboard server component with 4 stat cards and audit log table
- `src/components/admin/AdminSidebar.tsx` - Fixed desktop sidebar + Sheet mobile drawer with permission-aware links
- `src/components/admin/AdminStatCard.tsx` - Stat card with colored top-border accent and text-3xl value
- `src/lib/db/queries/admin.ts` - getDashboardStats and getRecentAuditLogs Drizzle queries
- `src/components/layout/Navbar.tsx` - Conditional Admin link for admin users
- `src/lib/auth.ts` - Session callback embeds isAdmin boolean flag
- `src/types/next-auth.d.ts` - Added isAdmin?: boolean to Session user type
- `tests/admin-queries.test.ts` - Tests verifying getDashboardStats shape and getRecentAuditLogs signature

## Decisions Made

- **isAdmin in session**: Rather than expose ADMIN_DISCORD_IDS as NEXT_PUBLIC_ env vars (security risk), the Auth.js session callback computes isAdmin server-side and embeds it in the session token. Client components read session.user.isAdmin safely.
- **Two-layer guard**: Middleware handles the coarse check (env var, Edge-compatible, no DB) and layout handles the fine check (DB isAdmin via permissions.ts). Defence in depth — middleware ensures even a misconfigured layout can't expose admin routes.
- **sections prop pattern**: AdminSidebar receives sections[] from the layout (which calls getAdminSections for non-super-admins). This keeps DB calls in Server Components and the sidebar purely presentational.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None — all files created cleanly, all tests passed on first run.

## User Setup Required

None - no external service configuration required. Env vars SUPER_ADMIN_DISCORD_ID and ADMIN_DISCORD_IDS should already be set from Phase 4 Plan 01 setup.

## Next Phase Readiness

- Admin shell complete: layout, sidebar, and dashboard all functional
- Plans 03-04 can add CRUD section pages directly as routes under src/app/(admin)/
- All section routes (itens-banidos, servidores, loja, leaderboard, permissoes) already linked in sidebar
- logAudit from permissions.ts ready to be called from Server Actions

---
*Phase: 04-painel-admin*
*Completed: 2026-03-18*
