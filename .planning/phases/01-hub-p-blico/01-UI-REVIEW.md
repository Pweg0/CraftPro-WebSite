# Phase 01 — UI Review

**Audited:** 2026-03-18
**Baseline:** Abstract 6-pillar standards (no UI-SPEC.md)
**Screenshots:** Captured — desktop (1440x900), tablet (768x1024), mobile (375x812), plus 4 inner pages

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | All CTAs use Brazilian Portuguese with intent-specific labels; one minor gap: CopyIPButton uses raw domain string as its label with no "Copiar IP" prefix |
| 2. Visuals | 3/4 | Hero is immersive and on-brand; server card banner images are all broken (404) because `/images/servers/*.webp` files were never created |
| 3. Color | 3/4 | Brand tokens used consistently (50 brand-class usages); Discord blue `#5865F2` hardcoded in 6 separate locations instead of a single token |
| 4. Typography | 3/4 | 9 distinct font sizes in use — exceeds the informal 4-size guideline, creating a noisy scale across inner pages |
| 5. Spacing | 4/4 | Tailwind scale used consistently, no arbitrary `[px]` or `[rem]` values in app code; only shadcn primitive internals use arbitrary values |
| 6. Experience Design | 2/4 | Loading and error states missing on the /servidores page (no skeleton, no error boundary during live API fetch); no page transition feedback |

**Overall: 18/24**

---

## Top 3 Priority Fixes

1. **Broken server card banner images** — Every visitor to `/servidores` sees broken image icons in 160px-tall empty grey boxes, which makes the page look unfinished — Create placeholder WebP banners at `public/images/servers/pokebrawl.webp`, `pokedash.webp`, and `pokegold.webp` (even a solid-color gradient image with the server name is better than a broken `<img>` tag)

2. **No loading or error state on /servidores** — The page performs 3 live `fetch()` calls to mcsrvstat.us at render time with no skeleton, spinner, or error boundary; if the API is slow or returns an error the page either hangs or crashes silently — Add a Suspense boundary with a skeleton card grid around `<ServerGrid>`, and wrap the `getServerStatus` calls in a try/catch that renders a graceful "Status indisponível" fallback card rather than crashing

3. **Discord blue hardcoded 6 times** — `#5865F2` and `#4752C4` appear in `HeroCTAButtons.tsx`, `Footer.tsx`, `loja/page.tsx`, `replays/page.tsx`, `login/page.tsx`, and `AvatarDropdown.tsx` with no shared token — Add `--color-discord: #5865F2` and `--color-discord-hover: #4752C4` to the `@theme` block in `globals.css`, then replace all inline `bg-[#5865F2]` usages with `bg-discord`

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)

No generic labels ("Submit", "OK", "Cancel", "Save") found anywhere in the codebase. All CTAs are intent-specific and in Brazilian Portuguese:

- "Jogar Agora" — clear gaming action (`HeroCTAButtons.tsx:49`)
- "Discord" — accurate destination label (`HeroCTAButtons.tsx:56`)
- "Ver Servidores" — describes the scroll destination (`HeroCTAButtons.tsx:64`)
- "Loja" — clear destination (`HeroCTAButtons.tsx:71`)
- "Entrar no Discord" — used consistently in footer and all Em Breve pages
- "IP copiado!" — toast feedback is precise (`CopyIPButton.tsx:19`)

**Minor gap:** `CopyIPButton` renders the raw IP domain as its button label (e.g., "pokebrawl.craftprobrasil.com") with no "Copiar IP" prefix icon label. The Copy icon is present, so intent is partially communicated, but on mobile the long domain string can overflow. A label like "Copiar IP" with the domain as a sub-label in the toast description would be clearer (`CopyIPButton.tsx:32`).

**Empty states:** "Nenhum item encontrado para..." in `BannedItemsTable.tsx:45` — well-written, includes the query string for context. `ServerGrid.tsx:15` has "Nenhum servidor configurado." — acceptable but could name the action to take.

**Em Breve pages:** Copy is descriptive and forward-looking. Ranking, Perfil, Loja, and Replays pages each have a paragraph explaining what is coming rather than a bare "Em Breve" label.

**Deduction reason:** One minor copy gap on `CopyIPButton` label; otherwise copywriting is above average for a gaming site.

---

### Pillar 2: Visuals (3/4)

**Hero section (desktop/tablet/mobile screenshots):** The hero fills 100vh with the Minecraft/Pokémon background image and a `from-black/80` gradient overlay making the title legible. The parallax scale-110 wrapper with Motion useTransform gives depth on scroll. Visual hierarchy is clear: large pixel-font title → tagline → 4 CTA buttons.

**CTA button differentiation:** The 4 CTAs use distinct visual treatments — red fill (primary action), Discord-blue outline, white-outline ghost, and yellow-outline ghost — making the priority clear at a glance.

**Server cards:** All three cards on `/servidores` show broken image icons in the 160px banner area. The `server.bannerPath` values point to `/images/servers/pokebrawl.webp` etc. which do not exist in `public/images/servers/`. The fallback text renderer (`server.name` in a dark box) is not reached because `server.bannerPath` is truthy. This is the most visible visual defect in the build.

**Inner page hero sections:** Loja, Ranking, Replays, and Itens Banidos all use icon + badge + heading pattern — consistent and clean. The badge variant and color appropriately differ per page (yellow for Ranking, blue for Replays, red for Loja).

**Navbar:** "Perfil" was removed from navLinks in the final implementation (`Navbar.tsx:11-18`) and replaced with an `AvatarDropdown` in the right slot. The plan specified all 7 links as always visible; the implemented version has 6 links + an auth avatar. This is a reasonable design evolution but the desktop nav now has 6 visible links — consistent with the visible layout in the screenshot.

**Mobile:** The hamburger button is accessible with `aria-label="Abrir menu de navegação"`. The mobile screenshot shows the hero image with 2 CTA buttons visible and 2 partially cut off — the 4-button row wraps awkwardly at 375px. "Ver Servidores" and "Loja" are cut by the viewport bottom edge.

**Aria labels on icon-only buttons:** All icon buttons have appropriate aria-labels (`AvatarDropdown.tsx:46,62,99`, `Navbar.tsx:55`). No accessibility gaps found.

---

### Pillar 3: Color (3/4)

**Brand token usage:** 50 brand-class usages across all components (`bg-brand-primary`, `bg-brand-surface`, `bg-brand-card`, `text-brand-accent`, `border-brand-online`, `text-brand-blue`, `text-brand-yellow`, `text-brand-offline`). The 60/30/10 split is approximately respected: `brand-primary` and `brand-surface` as dominant backgrounds, `brand-card` as surface, `brand-accent` and Discord blue as accent.

**Hardcoded color issue:** Discord blue appears hardcoded in 6 files:
- `src/components/hero/HeroCTAButtons.tsx:57` — `border-[#5865F2] text-[#5865F2] hover:bg-[#5865F2]`
- `src/components/layout/Footer.tsx:48` — `bg-[#5865F2] hover:bg-[#4752C4]`
- `src/app/(public)/loja/page.tsx:92` — `bg-[#5865F2] hover:bg-[#4752C4]`
- `src/app/(public)/replays/page.tsx:56` — `bg-[#5865F2] hover:bg-[#4752C4]`
- `src/app/(public)/login/page.tsx:60` — `bg-[#5865F2] hover:bg-[#4752C4]`
- `src/components/auth/AvatarDropdown.tsx:45` — `bg-[#5865F2] hover:bg-[#4752C4]`

This is a maintainability risk (changing the Discord brand color requires 6 edits) and violates the principle of declaring colors once in the token system.

**shadcn default light-mode tokens in globals.css:** The `:root` block from shadcn init defines `--background: oklch(1 0 0)` (white) and `--foreground` in light-mode values, while the site runs in an always-dark brand-primary context. This means shadcn components that fall back to `var(--background)` or `var(--card)` will render light-colored backgrounds unless explicitly overridden. This is visible on the CopyIPButton (white/light rendering on the server card). The `@layer base` block at the bottom correctly overrides `body` background, but individual shadcn components may leak light defaults.

---

### Pillar 4: Typography (3/4)

**Font sizes in use (9 distinct):**

| Class | Count | Usage |
|-------|-------|-------|
| text-sm | 29 | Body text, nav links, descriptions |
| text-xs | 14 | Server names (font-display), badges, captions |
| text-2xl | 8 | Page headings |
| text-base | 4 | Mid-body copy |
| text-xl | 2 | Tagline, search input |
| text-lg | 2 | Mobile nav links, section subheads |
| text-5xl | 1 | Hero heading (large viewport) |
| text-4xl | 1 | Hero heading (md viewport) |
| text-3xl | 1 | Hero heading (sm viewport) |

9 sizes exceeds the informal 4-size guideline for a focused landing site. The hero has 3 responsive sizes via `text-3xl sm:text-4xl md:text-5xl` which counts as 3 entries but is actually one semantic level handled responsively — this is acceptable. However, `text-base`, `text-lg`, `text-xl`, and `text-2xl` all appear as body-level variants, creating an inconsistent scale on inner pages.

**Font weights in use (2 distinct):**

| Class | Count |
|-------|-------|
| font-medium | 9 |
| font-semibold | 8 |

Two weights is excellent — exactly on the guideline. The display font (Press Start 2P) is weight 400 by design.

**Two-font system:** Press Start 2P (`font-display`) for headings and Inter (`font-body`) for body is well-executed. The contrast between the pixel font and the clean sans-serif creates strong brand character.

**Minor issue:** `text-base` appears in the hero subtitle — it is the correct size but at 1440px desktop this reads as very small relative to the `text-5xl` heading. Consider stepping up the subtitle to `text-lg` on large viewports.

---

### Pillar 5: Spacing (4/4)

**Spacing class distribution** (top patterns by frequency):

| Class | Count |
|-------|-------|
| px-4 | 16 |
| py-1 | 14 |
| gap-2 | 13 |
| px-2 | 11 |
| gap-1 | 9 |
| py-16 | 8 |
| p-4 / p-1 / p-2 | 4 each |
| gap-6 / gap-4 / gap-3 | 3 each |

No arbitrary `[px]` or `[rem]` values in application code. All spacing uses Tailwind's 4px scale. The dominant patterns (`px-4` for container padding, `py-16` for section vertical rhythm, `gap-2/4/6` for component spacing) are consistent across pages.

The only arbitrary values found are inside shadcn primitive files (`badge.tsx`, `button.tsx`, `dropdown-menu.tsx`, `sheet.tsx`) — these are generated by `npx shadcn add` and are not app-authored spacing decisions.

Container spacing is consistent: `container mx-auto` + `px-4` is used on every page. Inner section spacing (`py-16`) is uniform.

---

### Pillar 6: Experience Design (2/4)

**Loading states:**
- `AvatarDropdown.tsx:31` has a skeleton for auth session loading — correct.
- `/servidores` page: **no loading state**. The page performs 3 concurrent `fetch()` calls to mcsrvstat.us inside an `async` Server Component. There is no `<Suspense>` boundary wrapping the data-fetching component, so the page blocks until all 3 API responses return (or times out). Users on slow connections will see a blank page while waiting.
- No skeleton screens on server cards during ISR revalidation window.

**Error states:**
- `minecraft-status.ts` correctly returns `{ online: false, playersOnline: 0, playersMax: 0 }` on fetch failure — this is a graceful API-level fallback.
- However, there is no UI-level error boundary on `/servidores/page.tsx`. If `getServerStatus` throws unexpectedly (not caught by the inner try/catch), the page crashes with a Next.js error overlay.
- No `error.tsx` file in `src/app/(public)/servidores/` for production error handling.

**Empty states:**
- `BannedItemsTable.tsx:40-45`: search empty state is correctly implemented with the query string in the message — good.
- `ServerGrid.tsx:12-15`: "Nenhum servidor configurado" handles the edge case of an empty SERVERS array.
- Stub pages (Ranking, Perfil, Loja, Replays) are first-class pages with Discord CTAs rather than blank 404s — excellent pattern.

**Disabled states:** No disabled states found for any interactive elements. The CopyIPButton does not disable during the clipboard write operation (a 2000ms window where double-clicking could trigger multiple toast notifications).

**Confirmation for destructive actions:** Not applicable for this phase (no destructive actions in the public hub).

**Mobile CTA overflow:** On 375px mobile, the 4 CTA buttons in `HeroCTAButtons.tsx` wrap into 2 rows but "Ver Servidores" and "Loja" are cut off at the bottom of the viewport in the screenshot. The buttons need either smaller text/padding at mobile breakpoint or a column layout on xs screens.

---

## Registry Safety

`components.json` has `"registries": {}` — no third-party registries configured. All shadcn components installed from the official shadcn registry only. Registry audit: 0 third-party blocks checked, no flags.

---

## Files Audited

**Application components:**
- `src/components/layout/Navbar.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/hero/HeroSection.tsx`
- `src/components/hero/HeroCTAButtons.tsx`
- `src/components/server-status/CopyIPButton.tsx`
- `src/components/server-status/ServerCard.tsx`
- `src/components/server-status/ServerGrid.tsx`
- `src/components/banned-items/BannedItemsTable.tsx`
- `src/components/auth/AvatarDropdown.tsx`
- `src/lib/providers.tsx`

**Pages:**
- `src/app/(public)/page.tsx`
- `src/app/(public)/servidores/page.tsx`
- `src/app/(public)/itens-banidos/page.tsx`
- `src/app/(public)/loja/page.tsx`
- `src/app/(public)/replays/page.tsx`
- `src/app/(public)/ranking/page.tsx`
- `src/app/(protected)/perfil/page.tsx`
- `src/app/(public)/login/page.tsx`

**Global styles / config:**
- `src/app/globals.css`
- `src/app/layout.tsx`
- `components.json`

**Screenshots captured:**
- `.planning/ui-reviews/01-20260318-181035/desktop.png` (1440x900)
- `.planning/ui-reviews/01-20260318-181035/mobile.png` (375x812)
- `.planning/ui-reviews/01-20260318-181035/tablet.png` (768x1024)
- `.planning/ui-reviews/01-20260318-181035/servidores-desktop.png`
- `.planning/ui-reviews/01-20260318-181035/itens-banidos-desktop.png`
- `.planning/ui-reviews/01-20260318-181035/loja-desktop.png`
- `.planning/ui-reviews/01-20260318-181035/ranking-desktop.png`
