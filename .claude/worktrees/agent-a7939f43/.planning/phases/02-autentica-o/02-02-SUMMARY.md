---
phase: 02-autentica-o
plan: "02"
subsystem: auth
tags: [nextauth, discord-oauth2, drizzle-adapter, session-provider, next.js]

# Dependency graph
requires:
  - phase: 02-01
    provides: "Drizzle db instance and schema tables (users, accounts, sessions, verificationTokens)"
provides:
  - "src/lib/auth.ts — Auth.js v5 config with Discord OAuth2, DrizzleAdapter, discordId upsert, session user.id exposure"
  - "src/app/api/auth/[...nextauth]/route.ts — OAuth callback and session route handler"
  - "src/lib/providers.tsx — Client Component SessionProvider wrapper"
  - "src/app/layout.tsx updated — all app content wrapped in <Providers>"
  - "src/types/index.ts extended — User interface with discordId"
affects: [03-perfil-e-navbar, phase-03, auth-ui, elo-system]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Auth.js v5 with DrizzleAdapter for session-based OAuth"
    - "discordId upserted via signIn callback using stable Discord snowflake"
    - "Server Components import signIn/signOut from @/lib/auth; Client Components use next-auth/react hooks"
    - "SessionProvider wrapped in dedicated 'use client' file (providers.tsx) — never in Server Component layout"

key-files:
  created:
    - src/lib/auth.ts
    - src/app/api/auth/[...nextauth]/route.ts
    - src/lib/providers.tsx
  modified:
    - src/app/layout.tsx
    - src/types/index.ts

key-decisions:
  - "signIn callback upserts discordId using profile.id (Discord snowflake) — stable FK for Phase 3 ELO FK references"
  - "session callback exposes user.id so Phase 3 can look up ELO records by userId"
  - "Providers wrapper in separate 'use client' file to keep layout.tsx as Server Component"

patterns-established:
  - "Pattern: auth server entry point is @/lib/auth — never import next-auth directly on server side"
  - "Pattern: client components use useSession() from next-auth/react; server components use auth() from @/lib/auth"

requirements-completed: [AUTH-01, AUTH-02]

# Metrics
duration: 2min
completed: 2026-03-18
---

# Phase 02 Plan 02: Auth.js Wire-up Summary

**Auth.js v5 Discord OAuth2 with DrizzleAdapter, discordId upsert on sign-in, SessionProvider wrapping entire app**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-18T20:34:20Z
- **Completed:** 2026-03-18T20:36:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Auth.js v5 config wired with Discord provider, DrizzleAdapter connected to all 4 schema tables from Plan 01
- discordId automatically upserted from Discord profile.id (stable snowflake) on every sign-in
- SessionProvider wraps entire app via dedicated 'use client' providers.tsx file
- User type with discordId exported from types/index.ts for Phase 3 usage

## Task Commits

Each task was committed atomically:

1. **Task 1: Auth.js config + route handler** - `b1124ccb` (feat)
2. **Task 2: SessionProvider wrapper + layout update + User type** - `acf9ce43` (feat)

## Files Created/Modified

- `src/lib/auth.ts` - Auth.js v5 config: Discord provider, DrizzleAdapter, discordId upsert signIn callback, session user.id exposure
- `src/app/api/auth/[...nextauth]/route.ts` - OAuth route handler delegating GET/POST to handlers
- `src/lib/providers.tsx` - 'use client' SessionProvider wrapper component
- `src/app/layout.tsx` - Added Providers import and wrapped body content in <Providers>
- `src/types/index.ts` - Extended with User interface (id, name, email, image, discordId)

## Decisions Made

- signIn callback upserts discordId via `db.update(users).set({ discordId: String(profile.id) })` — profile.id is the stable Discord snowflake, used as FK in Phase 3 ELO system
- session callback sets `session.user.id = user.id` — exposes internal DB user ID to client session for ELO lookup
- Providers wrapper lives in a separate file to maintain layout.tsx as a Server Component (anti-pattern avoided per research)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

**Environment variables required before OAuth works:**
- `AUTH_DISCORD_ID` — Discord application client ID
- `AUTH_DISCORD_SECRET` — Discord application client secret
- `AUTH_SECRET` — Auth.js secret for session encryption (generate with `openssl rand -base64 32`)
- Discord OAuth redirect URI must be set to: `https://yourdomain.com/api/auth/callback/discord`

## Next Phase Readiness

- Auth.js OAuth flow is fully wired — `/api/auth/[...nextauth]` handles all sign-in, sign-out, and callback routes
- `useSession()` is available in any Client Component (Navbar, AvatarDropdown, etc.)
- `auth()` server function available for Server Components and API routes
- User type with discordId ready for Phase 3 profile and ELO features
- Plan 03 can now implement sign-in/sign-out UI and session-gated routes

---
*Phase: 02-autentica-o*
*Completed: 2026-03-18*
