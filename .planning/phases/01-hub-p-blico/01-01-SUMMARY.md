---
phase: 01-hub-p-blico
plan: 01
subsystem: ui
tags: [nextjs, tailwind, shadcn, vitest, typescript, minecraft, mcsrvstat]

# Dependency graph
requires: []
provides:
  - Next.js 16.2 + Tailwind v4 + shadcn/ui project scaffold
  - CraftPro Brasil brand design tokens (8 colors + fonts + card radius)
  - Shared TypeScript interfaces (Server, ServerStatus, ServerWithStatus, BannedItem)
  - mcsrvstat.us v3 API client with server-side ISR (revalidate: 30)
  - Static server data (PokeBrawl, PokeDash, PokeGold)
  - Static banned items seed data (12 items)
  - Hero background WebP image (166KB) at public/images/hero-background.webp
  - Vitest test infrastructure with jsdom + @testing-library/react
  - shadcn components: sheet, button, badge, sonner, input, table
affects: [01-02, 01-03, 02, 03]

# Tech tracking
tech-stack:
  added:
    - next@16.2.0
    - react@19.2.4
    - tailwindcss@4
    - shadcn/ui (Radix preset)
    - motion@12 (framer-motion successor)
    - lucide-react
    - vitest@4
    - "@testing-library/react@16"
    - "@testing-library/jest-dom"
    - jsdom
    - sharp (image conversion)
  patterns:
    - Tailwind v4 @theme block for design tokens (not tailwind.config.js)
    - Server-side fetch with next.revalidate for ISR
    - All shared types in src/types/index.ts imported via @/types
    - Test stubs as describe.todo for future population

key-files:
  created:
    - src/types/index.ts
    - src/lib/minecraft-status.ts
    - src/data/servers.ts
    - src/data/banned-items.ts
    - public/images/hero-background.webp
    - vitest.config.ts
    - tests/setup.ts
    - tests/minecraft-status.test.ts
    - tests/hero.test.tsx
    - tests/navbar.test.tsx
    - tests/footer.test.tsx
    - tests/copy-ip.test.tsx
    - tests/banned-items.test.tsx
    - tests/loja.test.tsx
    - tests/replays.test.tsx
    - scripts/check-assets.js
    - src/components/ui/sheet.tsx
    - src/components/ui/button.tsx
    - src/components/ui/badge.tsx
    - src/components/ui/sonner.tsx
    - src/components/ui/input.tsx
    - src/components/ui/table.tsx
  modified:
    - src/app/globals.css
    - src/app/layout.tsx
    - next.config.ts
    - tsconfig.json
    - package.json

key-decisions:
  - "Used React.createElement in tests/setup.ts instead of JSX because OXC parser rejects JSX in .ts files"
  - "Excluded tests/ from Next.js tsconfig to avoid vitest global type conflicts with tsc"
  - "Hero image converted with sharp quality=80 yielding 166KB (well under 500KB mobile limit)"
  - "Scaffolded in temp directory then copied due to space-in-directory-name npm restriction"

patterns-established:
  - "Pattern: All brand colors as @theme tokens in globals.css, consumed as bg-brand-* utility classes"
  - "Pattern: getServerStatus always called server-side with revalidate: 30 — never in Client Components"
  - "Pattern: Shared types in src/types/index.ts — no inline type definitions in components"

requirements-completed: [LAND-05, SERV-01, SERV-02, SERV-03, EXTRA-01]

# Metrics
duration: 18min
completed: 2026-03-18
---

# Phase 01 Plan 01: Project Scaffold Summary

**Next.js 16 + Tailwind v4 foundation with mcsrvstat.us API client, brand design tokens, shared TypeScript contracts, and Vitest test infrastructure for CraftPro Brasil**

## Performance

- **Duration:** 18 min
- **Started:** 2026-03-18T18:47:21Z
- **Completed:** 2026-03-18T19:05:00Z
- **Tasks:** 2
- **Files modified:** 28

## Accomplishments
- Scaffolded Next.js 16.2 with TypeScript, Tailwind v4, App Router, and shadcn/ui (Radix preset with Sheet, Button, Badge, Sonner, Input, Table)
- Defined all CraftPro Brasil brand design tokens as Tailwind v4 @theme variables (8 brand colors, display/body fonts, card radius)
- Created immutable type contracts (Server, ServerStatus, BannedItem) and mcsrvstat.us API client with ISR revalidation
- Configured Vitest with jsdom environment, 5 passing minecraft-status unit tests, 7 todo stubs ready for Wave 2
- Converted hero background to 166KB WebP (quality 80 via sharp), passing the <500KB mobile performance threshold

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Next.js 16 project and install all dependencies** - `29c2902` (chore)
2. **Task 2: Design tokens, shared types, static data, API client, and hero image** - `50711afc` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `src/types/index.ts` - Shared interfaces: Server, ServerStatus, ServerWithStatus, BannedItem
- `src/lib/minecraft-status.ts` - mcsrvstat.us v3 fetch client with revalidate: 30 and User-Agent header
- `src/data/servers.ts` - Static SERVERS array with 3 placeholder Minecraft server entries
- `src/data/banned-items.ts` - BANNED_ITEMS seed data with 12 realistic entries
- `src/app/globals.css` - Extended with @theme brand tokens (kept existing shadcn tokens)
- `src/app/layout.tsx` - Inter + Press Start 2P fonts, lang="pt-BR", CraftPro metadata
- `public/images/hero-background.webp` - 166KB hero image converted from JPG source
- `vitest.config.ts` - jsdom environment, @/* alias, setup file
- `tests/setup.ts` - clipboard mock, next/image mock (React.createElement to avoid OXC JSX error in .ts)
- `tests/minecraft-status.test.ts` - 5 unit tests for getServerStatus (all passing)
- `tests/*.test.tsx` (7 files) - Stub tests with describe.todo for future plans
- `scripts/check-assets.js` - Hero image size validator (<500KB)
- `next.config.ts` - Remote image patterns for cdn.discordapp.com
- `tsconfig.json` - Added tests/ to exclude list to prevent vitest global conflicts

## Decisions Made
- Used `React.createElement` in `tests/setup.ts` instead of JSX because the OXC parser (used by Vitest's Vite transform) rejects JSX syntax in `.ts` files — renaming to `.tsx` would work too but would require updating vitest.config.ts
- Excluded `tests/` from Next.js tsconfig because `vi` global is not recognized by the standard TypeScript checker and caused the build to fail with a type error
- Scaffolded in `C:/Users/JoJo/Desktop/ALEMA/craftpro-temp` then copied files because npm naming restrictions reject directories with spaces (create-next-app uses the directory name as the package name)
- Hero image converted at quality 80 yielding 166KB — no need for quality 60 fallback

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed JSX in .ts setup file causing OXC parse error**
- **Found during:** Task 1 (vitest run after creating tests/setup.ts)
- **Issue:** tests/setup.ts contained `return <img src={src} alt={alt} {...props} />;` — OXC parser cannot handle JSX in .ts files
- **Fix:** Replaced JSX with `React.createElement('img', { src, alt, ...props })` and added React import
- **Files modified:** tests/setup.ts
- **Verification:** npx vitest run exits 0 with 8 test files (7 skipped + 1 n/a at that point)
- **Committed in:** 29c2902 (Task 1 commit)

**2. [Rule 3 - Blocking] Excluded tests/ from tsconfig to fix Next.js build type error**
- **Found during:** Task 2 verification (npx next build)
- **Issue:** `vi` global from Vitest not recognized by standard TypeScript — `Cannot find name 'vi'` error in tests/setup.ts during next build type check
- **Fix:** Added `"tests"` to `exclude` array in tsconfig.json
- **Files modified:** tsconfig.json
- **Verification:** npx next build exits 0 with no TypeScript errors
- **Committed in:** 50711afc (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking issue)
**Impact on plan:** Both fixes were necessary for correctness — test runner and build both pass cleanly. No scope creep.

## Issues Encountered
- npm create-next-app rejects directory names with spaces. Workaround: scaffold in `craftpro-temp` then copy files. The craftpro-temp directory can be deleted manually.

## User Setup Required
None - no external service configuration required for the scaffold plan. mcsrvstat.us is a public API requiring no auth.

## Next Phase Readiness
- All Wave 2 plans (01-02, 01-03) can start immediately — types, tokens, and API client are ready
- Server banner images at `/images/servers/pokebrawl.webp` etc. are referenced but not yet created (Wave 2 plan will add placeholders or real images)
- The `craftpro-temp` directory at `C:/Users/JoJo/Desktop/ALEMA/craftpro-temp` can be deleted — it was a scaffolding artifact

---
*Phase: 01-hub-p-blico*
*Completed: 2026-03-18*

## Self-Check: PASSED

All created files verified to exist on disk. All task commits verified in git log.
- FOUND: src/types/index.ts
- FOUND: src/lib/minecraft-status.ts
- FOUND: src/data/servers.ts
- FOUND: src/data/banned-items.ts
- FOUND: public/images/hero-background.webp
- FOUND: vitest.config.ts
- FOUND: tests/setup.ts
- FOUND: tests/minecraft-status.test.ts
- FOUND: src/components/ui/sheet.tsx
- FOUND: .planning/phases/01-hub-p-blico/01-01-SUMMARY.md
- COMMIT 29c2902: chore(01-01): scaffold Next.js 16 project
- COMMIT 50711afc: feat(01-01): design tokens, types, API client, static data, hero image
- COMMIT 67326983: docs(01-01): complete scaffold foundation plan
