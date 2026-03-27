---
phase: 01-hub-p-blico
plan: 02
subsystem: ui
tags: [nextjs, react, tailwind, motion, shadcn, lucide-react, sonner, vitest]

# Dependency graph
requires:
  - phase: 01-hub-p-blico-plan-01
    provides: design tokens, shadcn components (Sheet, Button, Badge), vitest config, hero-background.webp, src/types/index.ts
provides:
  - Sticky Navbar with 7 nav links (desktop inline, mobile Sheet drawer)
  - Footer with Discord CTA and navigation columns
  - Root layout.tsx wrapping all pages with Navbar + Footer
  - HeroSection with Motion useScroll+useTransform parallax, fullscreen 100vh
  - HeroCTAButtons with 4 CTAs: copy server IP, Discord link, smooth scroll, Loja link
  - src/app/(public)/page.tsx landing page as Server Component
  - Navbar, Footer, Hero tests (9 passing tests)
affects:
  - 01-hub-p-blico-plan-03 (all content pages inherit Navbar/Footer from layout)
  - All subsequent plans using the layout shell

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "'use client' boundary isolation — HeroSection/HeroCTAButtons are Client Components; parent page.tsx stays Server Component"
    - "Motion parallax via useScroll+useTransform at the lowest possible client boundary"
    - "shadcn/base-ui Sheet without asChild — base-ui Dialog.Trigger doesn't support asChild prop (unlike Radix)"
    - "Route group (public) — src/app/(public)/page.tsx serves / without adding to URL"

key-files:
  created:
    - src/components/layout/Navbar.tsx
    - src/components/layout/Footer.tsx
    - src/components/hero/HeroSection.tsx
    - src/components/hero/HeroCTAButtons.tsx
    - src/app/(public)/page.tsx
    - tests/navbar.test.tsx
    - tests/footer.test.tsx
    - tests/hero.test.tsx
  modified:
    - src/app/layout.tsx
  deleted:
    - src/app/page.tsx (default Next.js scaffold — replaced by (public)/page.tsx)

key-decisions:
  - "SheetTrigger (base-ui) does not accept asChild prop — styled directly with className instead of wrapping Button"
  - "src/app/page.tsx removed in favor of src/app/(public)/page.tsx to use route group pattern consistently"
  - "Navbar hamburger button built without Button component — SheetTrigger renders its own button element"

patterns-established:
  - "Pattern: Client Component islands — only HeroSection and HeroCTAButtons are 'use client'; pages remain Server Components"
  - "Pattern: base-ui SheetTrigger styled inline without asChild (differs from Radix-based examples)"
  - "Pattern: Route group (public) for all public-facing pages"

requirements-completed: [LAND-01, LAND-02, LAND-03, LAND-04, LAND-05]

# Metrics
duration: 12min
completed: 2026-03-18
---

# Phase 01 Plan 02: Layout Shell + Hero Section Summary

**Sticky Navbar (7 links + mobile Sheet), Motion parallax hero (100vh + 4 CTAs), and Footer with Discord CTA wired into Next.js root layout**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-18T16:08:00Z
- **Completed:** 2026-03-18T16:20:00Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Sticky Navbar with all 7 nav links (Início, Servidores, Ranking, Loja, Itens Banidos, Replays, Perfil) — desktop inline, mobile Sheet drawer
- HeroSection with Motion useScroll+useTransform parallax, next/image with priority+sizes="100vw", fullscreen 100vh layout
- HeroCTAButtons with 4 CTAs: "Jogar Agora" (copies server IP to clipboard), "Discord" (external link), "Ver Servidores" (smooth scroll), "Loja" (link to /loja)
- Footer with Discord CTA and navigation columns wired into root layout
- 9 tests passing across navbar/footer/hero test files

## Task Commits

Each task was committed atomically:

1. **Task 1: Navbar + Footer + root layout shell** - `e6454dd3` (feat)
2. **Task 2: Hero section with Motion parallax and 4 CTA buttons** - `51f651ed` (feat)
3. **Deviation fix: SheetTrigger asChild removal** - `be56e6db` (fix)

**Plan metadata:** (committed with docs commit after SUMMARY)

## Files Created/Modified
- `src/components/layout/Navbar.tsx` - Sticky navbar, 7 links, mobile Sheet drawer via base-ui
- `src/components/layout/Footer.tsx` - Footer with Discord CTA, navigation columns, brand info
- `src/app/layout.tsx` - Updated to import/render Navbar + Footer around children
- `src/components/hero/HeroSection.tsx` - Client Component, Motion parallax, next/image priority fill
- `src/components/hero/HeroCTAButtons.tsx` - Client Component, 4 CTAs including clipboard copy
- `src/app/(public)/page.tsx` - Landing page Server Component importing HeroSection
- `tests/navbar.test.tsx` - 3 tests: 7 links rendered, logo link, hamburger button
- `tests/footer.test.tsx` - 2 tests: Discord CTA link, brand name
- `tests/hero.test.tsx` - 4 tests: 4 CTA buttons, Discord href, Loja href, clipboard call

## Decisions Made
- `SheetTrigger` (base-ui) does not accept `asChild` prop unlike Radix — applied styles directly on SheetTrigger element. The Navbar no longer imports Button component for the hamburger trigger.
- Removed default `src/app/page.tsx` (Next.js scaffold placeholder) in favor of `src/app/(public)/page.tsx` to use the route group pattern consistently with the project architecture.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] SheetTrigger asChild TypeScript error — base-ui vs Radix API difference**
- **Found during:** Overall verification (Next.js build)
- **Issue:** Plan code used `<SheetTrigger asChild>` pattern from Radix examples, but the installed shadcn components use base-ui's `Dialog.Trigger` which does not have `asChild` in its Props type. TypeScript build failed with "Property 'asChild' does not exist on type 'IntrinsicAttributes & Props<unknown>'"
- **Fix:** Replaced `<SheetTrigger asChild><Button ...>` pattern with `<SheetTrigger className="...">` with inline Tailwind styling. Removed Button import from Navbar since it's no longer needed there. This also resolved the nested `<button>` hydration warning.
- **Files modified:** `src/components/layout/Navbar.tsx`
- **Verification:** `npx next build` exits 0; all 3 navbar tests still passing
- **Committed in:** `be56e6db` (separate fix commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug in plan code for base-ui API)
**Impact on plan:** Fix required for TypeScript correctness and build success. No scope creep. Hamburger button is functionally identical — same appearance and behavior.

## Issues Encountered
- None beyond the base-ui/Radix API difference documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Layout shell (Navbar + Footer) is wired into root layout — all pages in Plan 03 will inherit it automatically
- HeroSection ready on landing page with parallax effect
- 9 tests passing as baseline for Plan 03
- `npx next build` exits 0

## Self-Check: PASSED

All key files found, all commits verified:
- FOUND: src/components/layout/Navbar.tsx
- FOUND: src/components/layout/Footer.tsx
- FOUND: src/components/hero/HeroSection.tsx
- FOUND: src/components/hero/HeroCTAButtons.tsx
- FOUND: src/app/(public)/page.tsx
- FOUND: .planning/phases/01-hub-p-blico/01-02-SUMMARY.md
- FOUND: e6454dd3 (Task 1 commit)
- FOUND: 51f651ed (Task 2 commit)
- FOUND: be56e6db (deviation fix commit)

---
*Phase: 01-hub-p-blico*
*Completed: 2026-03-18*
