---
phase: 03-sistema-competitivo
plan: 01
subsystem: database, ui, testing
tags: [drizzle-orm, neon, react, vitest, testing-library, tailwind]

requires:
  - phase: 02-autenticacao
    provides: arenaPlayers and arenaMatches tables in schema.ts
provides:
  - getLeaderboard and getTop10Wins query functions (leaderboard.ts)
  - getPlayerProfile, getPlayerMatches, getPlayerMatchCount query functions (player.ts)
  - TierBadge component with 7 division colors (TierBadge.tsx)
  - calcWinRate utility with zero-division guard (utils.ts)
  - mc-heads.net and crafatar.com remote image patterns (next.config.ts)
affects:
  - 03-02 (leaderboard page depends on these queries and TierBadge)
  - 03-03 (player profile page depends on these queries and TierBadge)

tech-stack:
  added: []
  patterns:
    - Query modules in src/lib/db/queries/ — one file per domain entity
    - Server-safe components use inline styles for dynamic colors (not Tailwind tokens)
    - Division type accepts string (not strict union) — DB values are plain strings, component falls back gracefully

key-files:
  created:
    - src/lib/db/queries/leaderboard.ts
    - src/lib/db/queries/player.ts
    - src/components/ranking/TierBadge.tsx
    - tests/tier-badge.test.tsx
    - tests/queries.test.ts
  modified:
    - src/lib/utils.ts
    - next.config.ts

key-decisions:
  - "replayLog excluded from getPlayerMatches select — large JSONB not needed in match history, reserved for future replay viewer"
  - "TierBadge uses inline styles not Tailwind tokens — 7 division colors are mod-spec constants that cannot be safely tokenized"
  - "Division prop typed as string not strict union — DB returns plain strings, component degrades to UNRANKED for unknown values"

patterns-established:
  - "Query pattern: separate ranked/unranked result sets in getLeaderboard via two queries joined in return object"
  - "Pagination pattern: getPlayerMatches accepts limit/offset; getPlayerMatchCount provides total for page calculations"

requirements-completed: [RANK-03, RANK-04]

duration: 10min
completed: 2026-03-18
---

# Phase 3 Plan 01: Sistema Competitivo Foundation Summary

**Drizzle-ORM query modules for leaderboard/player data, TierBadge component with 7 division colors, calcWinRate utility, and next/image remote patterns for Minecraft skin APIs**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-18T19:00:00Z
- **Completed:** 2026-03-18T19:10:00Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Query layer for leaderboard page: getLeaderboard (ranked + unranked split), getTop10Wins
- Query layer for player profile page: getPlayerProfile, getPlayerMatches (paginated), getPlayerMatchCount
- TierBadge component covering all 7 arena divisions with spec-defined colors and sm/md size variants
- calcWinRate utility with zero-division guard (0/0 returns 0, not NaN)
- next.config.ts updated to allow mc-heads.net and crafatar.com for Minecraft skin images
- 11 tests passing: 6 for TierBadge (divisions, colors, fallback, sizes), 5 for calcWinRate

## Task Commits

Each task was committed atomically:

1. **Task 1: Create query modules, calcWinRate helper, and update next.config.ts** - `bd878a0c` (feat)
2. **Task 2: Create TierBadge component and test files** - `40d25664` (feat)

## Files Created/Modified

- `src/lib/db/queries/leaderboard.ts` - getLeaderboard (ranked/unranked split) and getTop10Wins
- `src/lib/db/queries/player.ts` - getPlayerProfile, getPlayerMatches (paginated), getPlayerMatchCount
- `src/components/ranking/TierBadge.tsx` - Renders division badge with dynamic inline styles; exports DIVISION_CONFIG and Division type
- `tests/tier-badge.test.tsx` - 6 tests for all division labels, colors, fallback, size variants
- `tests/queries.test.ts` - 5 tests for calcWinRate edge cases
- `src/lib/utils.ts` - Added calcWinRate helper after existing cn function
- `next.config.ts` - Added mc-heads.net and crafatar.com to remotePatterns

## Decisions Made

- replayLog excluded from getPlayerMatches select — the large JSONB field is not needed for match history display; only the future replay viewer will need it
- TierBadge uses inline styles for dynamic colors — 7 division colors are mod-spec constants that cannot be safely tokenized as Tailwind utility classes
- Division prop accepts `string` not strict `Division` union — Drizzle returns plain strings from DB; unknown values fall back to UNRANKED config instead of throwing

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness

- All shared artifacts are ready for Plans 02 and 03 to consume
- Plan 02 (leaderboard page) can import getLeaderboard, getTop10Wins, TierBadge directly
- Plan 03 (player profile page) can import getPlayerProfile, getPlayerMatches, getPlayerMatchCount, TierBadge directly
- No blockers

---
*Phase: 03-sistema-competitivo*
*Completed: 2026-03-18*
