---
phase: 01-hub-p-blico
plan: 03
subsystem: ui
tags: [nextjs, react, tailwind, server-components, minecraft-status, vitest, testing-library]

# Dependency graph
requires:
  - phase: 01-hub-p-blico plan 01
    provides: getServerStatus, SERVERS, BANNED_ITEMS, types (Server, ServerStatus, BannedItem), shadcn components, design tokens
  - phase: 01-hub-p-blico plan 02
    provides: layout shell, navbar, footer, route group (public)
provides:
  - CopyIPButton Client Component with clipboard.writeText and Sonner toast
  - ServerCard Server Component with online/offline glow border pattern
  - ServerGrid 3-col responsive grid
  - /servidores page Server Component fetching mcsrvstat.us status (revalidate:30)
  - BannedItemsTable Client Component with useState search filter (case-insensitive, multi-field)
  - /itens-banidos page with full BANNED_ITEMS dataset
  - /loja teaser with 3 category preview cards (Cosmeticos, Ranks VIP, Itens do Servidor) + Discord CTA
  - /replays visual stub with mockup cards and Discord CTA
  - /ranking Em Breve stub (prevents 404)
  - /perfil Login Necessario stub (prevents 404)
affects:
  - Phase 2 (auth/profile — /perfil stub will be replaced)
  - Phase 3 (ranking system — /ranking stub will be replaced, /servidores full data)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server Component fetches data, passes to Client Component islands (servidores -> ServerGrid -> ServerCard; itens-banidos -> BannedItemsTable)"
    - "Server status ISR: export const revalidate = 30 on page + force-dynamic"
    - "CopyIPButton pattern: clipboard.writeText + Sonner toast.success + setTimeout reset"
    - "Em Breve pages are first-class with visual content and Discord CTA — not blank placeholders"

key-files:
  created:
    - src/components/server-status/CopyIPButton.tsx
    - src/components/server-status/ServerCard.tsx
    - src/components/server-status/ServerGrid.tsx
    - src/app/(public)/servidores/page.tsx
    - src/components/banned-items/BannedItemsTable.tsx
    - src/app/(public)/itens-banidos/page.tsx
    - src/app/(public)/loja/page.tsx
    - src/app/(public)/replays/page.tsx
    - src/app/(public)/ranking/page.tsx
    - src/app/(public)/perfil/page.tsx
  modified:
    - tests/copy-ip.test.tsx
    - tests/banned-items.test.tsx
    - tests/loja.test.tsx
    - tests/replays.test.tsx

key-decisions:
  - "Server status fetched in Server Component only — getServerStatus never called from Client Components"
  - "force-dynamic + revalidate:30 on /servidores page ensures ISR with per-request freshness window"
  - "Em Breve pages include Discord CTA and visual preview content per CONTEXT.md spec"
  - "/ranking and /perfil stubs prevent 404s from navbar links, will be replaced in Phase 3 and Phase 2 respectively"

patterns-established:
  - "Pattern 1: Online glow — border-brand-online shadow-[0_0_20px_rgba(0,255,135,0.3)] for online, border-brand-offline opacity-70 for offline"
  - "Pattern 2: Search filter — useState query + .filter() with .toLowerCase().includes() across multiple fields"
  - "Pattern 3: Stub pages — include icon, Em Breve badge, description, Discord CTA for engagement"

requirements-completed: [SERV-01, SERV-02, SERV-03, EXTRA-01, EXTRA-02, EXTRA-03, LAND-02]

# Metrics
duration: 15min
completed: 2026-03-18
---

# Phase 01 Plan 03: Content Pages Summary

**6 public pages + 3 server-status components delivering live server status with glow cards, searchable banned-items table, and first-class Em Breve stubs — all navbar links resolve to real pages**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-18T16:15:00Z
- **Completed:** 2026-03-18T16:30:00Z
- **Tasks:** 2
- **Files modified:** 14

## Accomplishments
- CopyIPButton, ServerCard, ServerGrid components + /servidores Server Component with ISR revalidate:30
- BannedItemsTable with real-time case-insensitive search filter across name, category, and reason fields
- /loja teaser with 3 category preview cards (Cosmeticos, Ranks VIP, Itens do Servidor) — not a blank page
- /replays visual stub with mockup cards and Discord CTA
- /ranking and /perfil stub pages preventing 404s from navbar links
- 28 tests passing across 8 test files, `npx next build` exits 0

## Task Commits

Each task was committed atomically:

1. **Task 1: Server status page (ServerCard, CopyIPButton, ServerGrid, /servidores page)** - `704ab48a` (feat)
2. **Task 2: Banned items table, Loja teaser, Replays stub, Ranking stub, Perfil stub** - `a0dddec5` (feat)

## Files Created/Modified
- `src/components/server-status/CopyIPButton.tsx` - Client Component with clipboard.writeText + Sonner toast
- `src/components/server-status/ServerCard.tsx` - Server Component with online/offline glow border
- `src/components/server-status/ServerGrid.tsx` - 3-col responsive grid layout
- `src/app/(public)/servidores/page.tsx` - Server Component with getServerStatus + revalidate:30
- `src/components/banned-items/BannedItemsTable.tsx` - Client Component with useState search filter
- `src/app/(public)/itens-banidos/page.tsx` - Server Component passing BANNED_ITEMS to table
- `src/app/(public)/loja/page.tsx` - Store teaser with 3 category preview cards + Discord CTA
- `src/app/(public)/replays/page.tsx` - Visual stub with mockup cards + Discord CTA
- `src/app/(public)/ranking/page.tsx` - Em Breve stub preventing 404
- `src/app/(public)/perfil/page.tsx` - Login Necessario stub preventing 404
- `tests/copy-ip.test.tsx` - 3 tests for CopyIPButton (render, clipboard, state)
- `tests/banned-items.test.tsx` - 5 tests for BannedItemsTable (render, filter, empty state, case-insensitive)
- `tests/loja.test.tsx` - 3 tests for LojaPage (badge, category cards, Discord CTA)
- `tests/replays.test.tsx` - 3 tests for ReplaysPage (badge, Discord CTA, heading)

## Decisions Made
- Server status fetched only in Server Components — mcsrvstat.us API never called from Client Components
- `force-dynamic` combined with `revalidate = 30` on /servidores page ensures ISR with per-request freshness
- Em Breve pages follow CONTEXT.md spec: include icon, badge, description, Discord CTA, and visual preview content
- /ranking and /perfil are Phase 1 stubs to be replaced in Phase 3 and Phase 2 respectively

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None - all components and tests worked on first run.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All Phase 1 content pages complete: every navbar link resolves to a real page
- Phase 1 requirements fully satisfied: LAND-01..05, SERV-01..03, EXTRA-01..03
- Phase 2 (auth): /perfil stub ready to be replaced with Discord OAuth2 profile
- Phase 3 (ranking): /ranking stub ready to be replaced with ELO leaderboard

---
*Phase: 01-hub-p-blico*
*Completed: 2026-03-18*
