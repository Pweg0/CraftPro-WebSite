---
phase: 02-autentica-o
plan: "03"
subsystem: auth-ui
tags: [avatar-dropdown, navbar, middleware, route-protection, discord-oauth, shadcn-dropdown-menu]

# Dependency graph
requires:
  - phase: 02-autentica-o
    plan: 02
    provides: Auth.js config, SessionProvider, signIn/signOut hooks

provides:
  - AvatarDropdown client component (login button / avatar+dropdown)
  - Navbar with auth UI integrated (desktop + mobile)
  - middleware.ts protecting /perfil and /admin routes
  - Custom /login page with Discord CTA
  - /perfil moved to (protected) route group
  - shadcn/ui DropdownMenu component

affects: [03-sistema-competitivo, 04-painel-admin]

# Tech tracking
tech-stack:
  added:
    - "@radix-ui/react-dropdown-menu (via shadcn/ui dropdown-menu)"
  patterns:
    - middleware.ts with auth() wrapper for route protection
    - Custom login page with callbackUrl passthrough
    - Protected route group (protected) vs public route group (public)

key-files:
  created:
    - src/components/auth/AvatarDropdown.tsx
    - src/components/ui/dropdown-menu.tsx
    - src/app/(public)/login/page.tsx
    - src/app/(protected)/perfil/page.tsx
    - middleware.ts
  modified:
    - src/components/layout/Navbar.tsx
    - src/lib/auth.ts
    - tests/auth.test.tsx
    - tests/navbar.test.tsx
  deleted:
    - src/app/(public)/perfil/page.tsx

key-decisions:
  - "middleware.ts used instead of proxy.ts — Next.js 15 middleware pattern, not Next.js 16 proxy"
  - "Custom /login page created instead of relying on default NextAuth signin page"
  - "/perfil moved from (public) to (protected) route group for clarity"
  - "shadcn/ui DropdownMenu used for avatar dropdown (close-on-outside-click, accessibility built-in)"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03]

# Metrics
duration: ~15min
completed: 2026-03-18
---

# Phase 2 Plan 03: Auth UI & Route Protection Summary

**AvatarDropdown component with Discord login/avatar dropdown, Navbar integration, middleware.ts route protection, custom login page, and /perfil moved to protected route group — all 3 auth requirements complete**

## Performance

- **Duration:** ~15 min
- **Tasks:** 3 (2 automated + 1 human checkpoint)
- **Files created:** 5
- **Files modified:** 4
- **Files deleted:** 1

## Accomplishments

- Created AvatarDropdown client component: shows "Entrar com Discord" button when logged out, Discord avatar with dropdown (Perfil link + Sair button) when logged in
- Integrated AvatarDropdown into Navbar (desktop right side + mobile Sheet)
- Created middleware.ts protecting /perfil and /admin routes — redirects unauthenticated users to /login with callbackUrl
- Created custom /login page with Discord OAuth CTA and callbackUrl passthrough
- Moved /perfil from (public) to (protected) route group
- Installed shadcn/ui dropdown-menu component
- All 6 auth tests in tests/auth.test.tsx pass GREEN

## Task Commits

1. **Task 1: AvatarDropdown component** - `d8e7c6ae` (feat(02-03): implement AvatarDropdown component)
2. **Task 2: Navbar integration + route protection** - `56c56b92` (feat(02-03): Navbar integration, proxy.ts route protection)
3. **Task 3: Custom login page + protected /perfil** - `b3048f91` (feat(02-03): custom login page, protected /perfil, remove Perfil from navbar)

## Files Created/Modified

- `src/components/auth/AvatarDropdown.tsx` - Client component: login button (logged out) or avatar + DropdownMenu (logged in)
- `src/components/ui/dropdown-menu.tsx` - shadcn/ui DropdownMenu primitives
- `src/app/(public)/login/page.tsx` - Custom login page with Discord OAuth CTA
- `src/app/(protected)/perfil/page.tsx` - Perfil page in protected route group
- `middleware.ts` - Route protection for /perfil and /admin, excludes /api/*
- `src/components/layout/Navbar.tsx` - Added AvatarDropdown import and render
- `src/lib/auth.ts` - Added authorized callback for route protection
- `tests/auth.test.tsx` - Updated tests from stubs to real component tests
- `tests/navbar.test.tsx` - Updated for AvatarDropdown integration

## Deviations from Plan

### Auto-fixed Issues

**1. middleware.ts instead of proxy.ts**
- **Issue:** Plan specified `proxy.ts` with `export const proxy` (Next.js 16 pattern), but project uses Next.js 15 which uses `middleware.ts` with `export default`
- **Fix:** Created `middleware.ts` with `export default auth(...)` pattern instead
- **Files modified:** middleware.ts (root)

**2. Custom login page added (not in original plan)**
- **Issue:** middleware redirects to `/login` but no custom page existed
- **Fix:** Created `src/app/(public)/login/page.tsx` with Discord OAuth CTA and callbackUrl handling
- **Files created:** src/app/(public)/login/page.tsx

**3. /perfil moved to (protected) route group**
- **Issue:** /perfil was in (public) route group but needs auth protection
- **Fix:** Moved to `src/app/(protected)/perfil/page.tsx`, deleted old file
- **Files:** src/app/(protected)/perfil/page.tsx (created), src/app/(public)/perfil/page.tsx (deleted)

---

**Total deviations:** 3 auto-fixed
**Impact on plan:** All deviations improved the implementation. Auth requirements fully satisfied.

## Next Phase Readiness

- All 3 auth requirements (AUTH-01, AUTH-02, AUTH-03) verified complete
- Discord OAuth flow: login → session → avatar → dropdown → logout all working
- Route protection active for /perfil and /admin
- Phase 3 (Sistema Competitivo) can now build on authenticated user identity
- discordId available in session for ELO system FK

## Self-Check: PASSED

- src/components/auth/AvatarDropdown.tsx — FOUND
- middleware.ts — FOUND
- src/app/(public)/login/page.tsx — FOUND
- src/app/(protected)/perfil/page.tsx — FOUND
- Commits d8e7c6ae, 56c56b92, b3048f91 — FOUND

---
*Phase: 02-autentica-o*
*Completed: 2026-03-18*
