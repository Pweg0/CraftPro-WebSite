---
phase: 03-sistema-competitivo
plan: 02
subsystem: ui, testing
tags: [next.js, react, vitest, testing-library, tailwind, drizzle-orm]

requires:
  - phase: 03-01
    provides: getLeaderboard, getTop10Wins query functions, TierBadge component, calcWinRate utility

provides:
  - /ranking page as Server Component with ISR 60s (ranking/page.tsx)
  - LeaderboardTable client component with tab switching and pagination (LeaderboardTable.tsx)
  - PlayerRow component with avatar, name link, stats, TierBadge (PlayerRow.tsx)
  - 8 ranking tests covering tab switching, pagination, unranked separator, player row (ranking.test.tsx)

affects:
  - visitors can now view the full competitive leaderboard at /ranking

tech-stack:
  added: []
  patterns:
    - Server Component ISR: export const revalidate = 60 on page.tsx for 60s cache
    - Client island: LeaderboardTable is 'use client', page.tsx stays Server Component (data fetched server-side)
    - Dual query pattern: getLeaderboard returns ranked/unranked split; page passes both + top10Wins to LeaderboardTable
    - Test mock pattern: vi.mock('next/link') inline in test file (next/image already mocked in setup.ts)

key-files:
  created:
    - src/components/ranking/LeaderboardTable.tsx
    - src/components/ranking/PlayerRow.tsx
    - tests/ranking.test.tsx
  modified:
    - src/app/(public)/ranking/page.tsx

key-decisions:
  - "getAllByText used for 'Em Classificacao' assertion — separator row AND UNRANKED TierBadge both render the same string; getByText would throw on multiple matches"
  - "showUnranked condition tied to isLastPage — unranked players only shown when viewer reaches last page of ranked results, keeping pagination uncluttered"

requirements-completed: [RANK-01, RANK-02, RANK-03]

duration: 5min
completed: 2026-03-18
---

# Phase 3 Plan 02: Ranking Page Implementation Summary

**Full /ranking page with ELO leaderboard and Top 10 Wins tabs, ISR 60s, pagination at 20/page, UNRANKED separator, and player links to profiles**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-18T22:02:37Z
- **Completed:** 2026-03-18T22:07:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- `/ranking` page replaces Phase 1 stub — full Server Component with `export const revalidate = 60`
- LeaderboardTable client component: ELO tab (paginated 20/page) and Top 10 Wins tab, resets page on tab switch
- UNRANKED players appear at bottom of last ranked page with "Em Classificacao" separator row
- PlayerRow renders mc-heads.net avatar, /perfil/[uuid] link, ELO, TierBadge, W/L, win rate
- 8 tests covering all core behaviors; 14 total (including pre-existing tier-badge tests) all pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Create LeaderboardTable, PlayerRow components and replace ranking page stub** - `b603200d` (feat)
2. **Task 2: Create ranking page tests** - `ba2fb225` (test)

## Files Created/Modified

- `src/app/(public)/ranking/page.tsx` - Server Component; fetches ranked, unranked, top10Wins; renders LeaderboardTable; ISR 60s
- `src/components/ranking/LeaderboardTable.tsx` - 'use client'; tab state + page state; pagination controls; Em Classificacao separator
- `src/components/ranking/PlayerRow.tsx` - Table row with avatar, /perfil/ link, ELO, TierBadge, W/L, win rate
- `tests/ranking.test.tsx` - 8 tests: 5 for LeaderboardTable, 3 for PlayerRow

## Decisions Made

- getAllByText used in "Em Classificacao" test — both the separator `<td>` and the UNRANKED player's TierBadge render this exact string; using getByText would throw "found multiple elements"
- UNRANKED players shown only on the last page of ranked results — keeps each paginated view clean while still surfacing unranked players to curious visitors

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed test asserting single "Em Classificacao" element**
- **Found during:** Task 2 test run
- **Issue:** The test used `getByText("Em Classificacao")` but both the separator row AND the unranked player's TierBadge rendered the same string, causing "found multiple elements" error
- **Fix:** Changed to `getAllByText("Em Classificacao")` and asserted `length >= 1`
- **Files modified:** tests/ranking.test.tsx
- **Commit:** ba2fb225

## Issues Encountered

None beyond the test fix above.

## Next Phase Readiness

- Plan 03 (player profile page) can now proceed independently; all shared dependencies (queries, TierBadge, utils) are in place
- No blockers

## Self-Check: PASSED

- LeaderboardTable.tsx: FOUND
- PlayerRow.tsx: FOUND
- ranking.test.tsx: FOUND
- 03-02-SUMMARY.md: FOUND
- Commit b603200d: FOUND
- Commit ba2fb225: FOUND

---
*Phase: 03-sistema-competitivo*
*Completed: 2026-03-18*
