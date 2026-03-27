# Phase 1: Hub Público - Research

**Researched:** 2026-03-18
**Domain:** Next.js 16 App Router + Tailwind v4 public-facing site — hero, navbar, server status, static content pages
**Confidence:** HIGH (core stack verified via official docs and prior STACK/ARCHITECTURE research)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Hero Section**
- Fullscreen imersivo — imagem de background ocupa 100vh
- Imagem fornecida pelo usuário como background (cenário Minecraft com Pokémon, água, céu azul)
- Gradiente escuro de baixo para cima para dar legibilidade ao texto
- Texto principal: "CraftPro Brasil" grande + tagline (tipo "Pokémon, Tech & Magia no Minecraft")
- 4 botões CTA: "Jogar Agora" (copia IP), "Discord" (link externo), "Ver Servidores" (scroll suave), "Loja" (link pra página)
- Animação parallax com Motion no hero

**Navegação**
- Navbar fixa no topo (sticky), sempre visível
- Links no menu principal: Início, Servidores, Ranking, Loja, Itens Banidos, Replays, Perfil — todos visíveis na navbar
- Mobile: Hamburger menu (☰) que abre menu lateral deslizante
- Footer com links úteis e convite Discord

**Lista de Servidores**
- Cards grandes por servidor com banner/screenshot próprio
- Cada card mostra: imagem/banner do servidor, nome, descrição, status, player count, IP copiável
- Status visual: glow/borda verde no card quando online, cinza quando offline
- Player count ao vivo por servidor

**Itens Banidos**
- Tabela pesquisável com busca
- Colunas: nome do item, razão do ban, categoria
- Filtro/busca para encontrar itens rapidamente

**Loja (Em Breve)**
- Teaser visual com preview de categorias (cosméticos, ranks/VIP, itens do servidor)
- Visual bonito com "Em Breve" ou countdown
- Não é uma página vazia — mostra o que virá

**Replays (Stub)**
- Página "Em Breve" com preview/mockup de como será a página de replays
- Visual consistente com o resto do site

### Claude's Discretion
- Fontes específicas (pixel font vs moderna gaming font)
- Esquema exato de cores (derivar da imagem de background)
- Estrutura do footer (colunas, links)
- Loading states e skeleton screens
- Animações secundárias (hover, transições de página)
- Layout exato do grid de server cards

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LAND-01 | Hero section imersivo com background Minecraft/Pokémon fornecido (otimizado WebP/srcset) | next/image with `priority` + `sizes` prop; WebP auto-conversion by Next.js; parallax via Motion useScroll/useTransform |
| LAND-02 | Navbar com navegação entre todas as páginas do site | shadcn/ui Sheet component for mobile drawer; sticky positioning via Tailwind; all 7 links hardcoded in Phase 1 |
| LAND-03 | Footer com links úteis e convite Discord | Static Server Component; no dependencies; Tailwind grid layout |
| LAND-04 | Animações com Motion (parallax hero, transições de página, efeitos visuais) | Motion v12 `motion/react`; `useScroll` + `useTransform` for parallax; `AnimatePresence` for page transitions |
| LAND-05 | Design responsivo mobile-first (otimizado para conexões BR) | Tailwind v4 mobile-first breakpoints; next/image `sizes` for bandwidth savings on 4G; no large JS bundles |
| SERV-01 | Página listando todos os servidores do network com status online/offline | mcsrvstat.us v3 API — `GET https://api.mcsrvstat.us/3/<address>`; Next.js `revalidate: 30` on fetch |
| SERV-02 | Contagem de jogadores ao vivo por servidor | `players.online` field from mcsrvstat.us v3 response; cached server-side to avoid blocking render |
| SERV-03 | Botão para copiar IP do servidor | `navigator.clipboard.writeText()` in a Client Component; toast feedback via shadcn/ui Sonner |
| EXTRA-01 | Página de itens banidos com lista e razão de cada ban | Static JSON data file or DB-seeded rows; client-side filter with `useState`; shadcn/ui Table component |
| EXTRA-02 | Página da loja com status "Em Breve" e preview do que virá | Static page; no dependencies; vibrant teaser design per CONTEXT.md — not a blank page |
| EXTRA-03 | Página de replays de batalhas (stub/placeholder — formato a definir) | Static "Em Breve" page; visual consistent with site design |
</phase_requirements>

---

## Summary

Phase 1 is a greenfield Next.js 16 scaffold that builds every public-facing page of CraftPro Brasil. No auth, no database writes, no ELO logic — this phase is purely visual and integrates with one external API (mcsrvstat.us for live server status). The critical technical work is: (1) scaffolding the correct project structure that Phases 2 and 3 will build on top of, (2) configuring Tailwind v4 design tokens once so all subsequent work uses the same color palette, and (3) integrating the Minecraft server status API safely (cached, never blocking render).

The hero section is the most technically interesting piece: a fullscreen background image with Motion parallax, four CTA buttons (one of which uses the clipboard API), and a gradient overlay. The server cards require a client-side data fetch with a 30-second revalidation cycle and must degrade gracefully when a server is offline. The banned items page is the most interactive: a table with client-side search/filter.

Pitfall 4 from PITFALLS.md (hero image killing mobile performance) is the highest-risk item. The user-provided background image must be processed into WebP with responsive `sizes` before Phase 1 is considered complete. All other pages in this phase are static or near-static.

**Primary recommendation:** Scaffold with `create-next-app@16`, configure Tailwind v4 `@theme` tokens in `globals.css` in Wave 1, then build in order: layout shell (navbar/footer) → hero → server listing → static pages (banned items, store teaser, replays stub).

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.x | Full-stack React framework (App Router) | Turbopack default, RSC for server status fetch, zero-config Vercel deployment |
| React | 19.x | UI library | Ships with Next.js 16; React Compiler auto-memoizes |
| TypeScript | 5.x | Type safety | Catches component prop mismatches, API response shape errors |
| Tailwind CSS | 4.x | Utility-first styling | CSS-first `@theme` for design tokens; no `tailwind.config.js` needed; 5x faster builds |
| shadcn/ui | latest (Tailwind v4 compatible) | Accessible component primitives | Copy-paste into project — own the code; Sheet for mobile drawer; Table for banned items |
| Motion | 12.x | Animations | `motion/react` import; `useScroll` + `useTransform` for parallax; `AnimatePresence` for transitions |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Lucide React | latest | Icons | Hamburger icon, copy icon, status indicator icons — tree-shakeable |
| `next-intl` | 3.x | PT-BR string management | Keeps all copy out of JSX; enables future i18n without refactor |
| Sonner (via shadcn) | latest | Toast notifications | "IP copiado!" feedback on SERV-03 copy button |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| mcsrvstat.us | mcstatus.io API | Both free; mcsrvstat.us has been around longer and has dedicated Node wrapper; mcstatus.io has cleaner docs. Either works. |
| shadcn/ui Sheet (mobile menu) | Custom drawer from scratch | Sheet is already accessible (focus trap, keyboard nav, ARIA). No reason to hand-roll. |
| Motion `useScroll` | CSS `@keyframes` scroll-driven animation | CSS scroll-driven animations are native but have worse browser support and less control for per-element parallax layers |

### Installation

```bash
# Scaffold (choose these options or pass flags)
npx create-next-app@16 craftpro-site --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Animation
npm install motion

# Icons
npm install lucide-react

# i18n
npm install next-intl

# shadcn/ui init (Tailwind v4 + React 19 mode)
npx shadcn@latest init

# Add shadcn components needed in Phase 1
npx shadcn@latest add sheet          # Mobile nav drawer
npx shadcn@latest add table          # Banned items table
npx shadcn@latest add badge          # Server status badges
npx shadcn@latest add button         # CTA buttons, copy button
npx shadcn@latest add sonner         # Toast for "IP copiado!"
npx shadcn@latest add input          # Search input for banned items
```

---

## Architecture Patterns

### Recommended Project Structure (Phase 1 scope)

```
src/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                  # Landing page — hero + overview
│   │   ├── servidores/
│   │   │   └── page.tsx              # Server listing (SERV-01, SERV-02, SERV-03)
│   │   ├── itens-banidos/
│   │   │   └── page.tsx              # Banned items table (EXTRA-01)
│   │   ├── loja/
│   │   │   └── page.tsx              # Store "Em Breve" teaser (EXTRA-02)
│   │   └── replays/
│   │       └── page.tsx              # Replays stub (EXTRA-03)
│   ├── layout.tsx                    # Root layout — Navbar, Footer, fonts
│   └── globals.css                   # Tailwind base + @theme design tokens
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx                # Sticky navbar, desktop links, mobile Sheet
│   │   ├── NavbarMobile.tsx          # Sheet content for mobile menu
│   │   └── Footer.tsx                # Footer grid with links + Discord CTA
│   ├── hero/
│   │   ├── HeroSection.tsx           # Client Component — Motion parallax
│   │   └── HeroCTAButtons.tsx        # "Jogar Agora" (copy IP), Discord, etc.
│   ├── server-status/
│   │   ├── ServerCard.tsx            # Individual server card with status glow
│   │   ├── ServerGrid.tsx            # Grid layout for server cards
│   │   └── CopyIPButton.tsx          # Client Component — clipboard API
│   ├── banned-items/
│   │   ├── BannedItemsTable.tsx      # Client Component — Table + search filter
│   │   └── BannedItemsSearch.tsx     # Controlled input for filtering
│   └── ui/                           # shadcn components live here (auto-generated)
├── lib/
│   └── minecraft-status.ts           # mcsrvstat.us API client with caching
├── data/
│   └── banned-items.ts               # Static banned items data (seed for Phase 1)
└── types/
    └── index.ts                      # Shared TypeScript interfaces
```

### Pattern 1: Server Component + Cached External API Fetch (SERV-01, SERV-02)

**What:** The servers page fetches Minecraft status server-side with a 30-second revalidation window. The Server Component renders the initial state; a separate polling strategy can be added later if needed.
**When to use:** Any page that shows external data but doesn't need real-time updates faster than 30 seconds.
**Example:**
```typescript
// src/lib/minecraft-status.ts
export interface ServerStatus {
  online: boolean;
  playersOnline: number;
  playersMax: number;
}

export async function getServerStatus(address: string): Promise<ServerStatus> {
  const res = await fetch(`https://api.mcsrvstat.us/3/${address}`, {
    next: { revalidate: 30 },
    headers: { 'User-Agent': 'CraftPro Brasil Website (craftprobrasil.com)' },
  });
  if (!res.ok) return { online: false, playersOnline: 0, playersMax: 0 };
  const data = await res.json();
  return {
    online: data.online ?? false,
    playersOnline: data.players?.online ?? 0,
    playersMax: data.players?.max ?? 0,
  };
}
```

```typescript
// src/app/(public)/servidores/page.tsx — Server Component
import { getServerStatus } from '@/lib/minecraft-status';

const SERVERS = [
  { id: 'pokebrawl', name: 'PokeBrawl', ip: 'pokebrawl.craftprobrasil.com', description: '...' },
  { id: 'pokedash', name: 'PokeDash', ip: 'pokedash.craftprobrasil.com', description: '...' },
  { id: 'pokegold', name: 'PokeGold', ip: 'pokegold.craftprobrasil.com', description: '...' },
];

export default async function ServidoresPage() {
  const statuses = await Promise.all(
    SERVERS.map(s => getServerStatus(s.ip))
  );
  return <ServerGrid servers={SERVERS} statuses={statuses} />;
}
```

### Pattern 2: Motion Parallax Hero (LAND-01, LAND-04)

**What:** Hero background image moves at a slower rate than scroll to create depth. Requires a Client Component because it uses `useScroll`.
**When to use:** Hero section only — don't apply to other sections without measuring performance impact.
**Example:**
```typescript
// src/components/hero/HeroSection.tsx
'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import Image from 'next/image';

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  return (
    <section ref={containerRef} className="relative h-screen overflow-hidden">
      <motion.div style={{ y: backgroundY }} className="absolute inset-0 scale-110">
        <Image
          src="/images/hero-background.webp"
          alt="CraftPro Brasil — Minecraft e Pokémon"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4">
        {/* Title, tagline, CTA buttons */}
      </div>
    </section>
  );
}
```

### Pattern 3: Tailwind v4 Design Tokens via `@theme` (LAND-05)

**What:** All brand colors, fonts, and spacing defined once in `globals.css` using `@theme`. Generates Tailwind utility classes (`bg-brand-primary`, `text-brand-accent`, etc.) automatically.
**When to use:** Set up in Wave 1 of Phase 1 — before any component is built. All downstream phases inherit these tokens.
**Example:**
```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  /* Brand palette — derived from hero image (vibrant Minecraft/Pokémon tones) */
  --color-brand-primary: #1a1a2e;    /* Deep night sky — page background */
  --color-brand-surface: #16213e;    /* Card/panel backgrounds */
  --color-brand-accent: #e94560;     /* Hot coral — primary CTA color */
  --color-brand-green: #00ff87;      /* Online status glow */
  --color-brand-blue: #4cc9f0;       /* Water / info color */
  --color-brand-yellow: #ffd60a;     /* Pokémon gold accent */

  /* Typography */
  --font-display: 'Press Start 2P', monospace;   /* OR gaming sans — Claude's discretion */
  --font-body: 'Inter', sans-serif;
}

@layer base {
  body {
    background-color: var(--color-brand-primary);
    color: white;
    font-family: var(--font-body);
  }
}
```

### Pattern 4: Client-Side Search Filter — Banned Items (EXTRA-01)

**What:** Items are loaded server-side (static data or DB), passed as props to a Client Component, filtered with `useState`. No API calls on keystroke.
**When to use:** When dataset is small enough to load all at once (< 500 items). Banned items list is static or near-static.
**Example:**
```typescript
// src/components/banned-items/BannedItemsTable.tsx
'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface BannedItem { name: string; reason: string; category: string; }

export function BannedItemsTable({ items }: { items: BannedItem[] }) {
  const [query, setQuery] = useState('');
  const filtered = items.filter(
    item =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar item ou categoria..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Razão do Ban</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map(item => (
            <TableRow key={item.name}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>{item.reason}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

### Pattern 5: Copy IP to Clipboard (SERV-03)

**What:** Client Component button that writes server IP to clipboard and shows a toast. Uses browser-native `navigator.clipboard` API.
**Example:**
```typescript
// src/components/server-status/CopyIPButton.tsx
'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

export function CopyIPButton({ ip }: { ip: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(ip);
    setCopied(true);
    toast.success('IP copiado!', { description: ip });
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button onClick={handleCopy} variant="outline" size="sm">
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? 'Copiado!' : ip}
    </Button>
  );
}
```

### Pattern 6: Mobile Navbar with shadcn Sheet (LAND-02)

**What:** Desktop navbar shows all links inline. On mobile, a hamburger button opens a `Sheet` (slide-in drawer) with the same navigation links.
**Example:**
```typescript
// src/components/layout/Navbar.tsx
'use client';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import Link from 'next/link';

const navLinks = [
  { href: '/', label: 'Início' },
  { href: '/servidores', label: 'Servidores' },
  { href: '/ranking', label: 'Ranking' },
  { href: '/loja', label: 'Loja' },
  { href: '/itens-banidos', label: 'Itens Banidos' },
  { href: '/replays', label: 'Replays' },
  { href: '/perfil', label: 'Perfil' },
];

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-brand-primary/90 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="font-display text-brand-accent text-lg">CraftPro Brasil</Link>

        {/* Desktop */}
        <ul className="hidden md:flex gap-6">
          {navLinks.map(link => (
            <li key={link.href}>
              <Link href={link.href} className="text-sm text-white/70 hover:text-white transition-colors">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-brand-surface">
            <nav className="flex flex-col gap-4 mt-8">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} className="text-lg text-white hover:text-brand-accent transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
```

### Anti-Patterns to Avoid

- **Calling mcsrvstat.us from a Client Component:** Every user page load triggers an external network request from the browser. If the Minecraft server is down or the API is slow, the page hangs in the user's browser. Always fetch server-side with `revalidate`.
- **Using `<img>` instead of `next/image` for the hero background:** Skips automatic WebP conversion, srcset generation, and lazy-loading. This is the #1 mobile performance killer for this page.
- **Wrapping the entire page in `'use client'` to use Motion:** Only the `HeroSection` needs to be a Client Component. The server listing, banned items, and other pages should remain Server Components — use the `'use client'` boundary at the lowest possible level.
- **Using `position: fixed` for the navbar without `backdrop-blur`:** A solid opaque navbar feels heavy on a design-forward site. Use `bg-brand-primary/90 backdrop-blur-md` for a frosted glass effect.
- **Storing server IPs in the database for Phase 1:** Server metadata is static content for Phase 1. Put it in a `data/servers.ts` constant — no DB dependency in this phase.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Mobile slide-out menu | Custom CSS drawer with JS visibility toggle | shadcn/ui `Sheet` | Focus trap, keyboard nav, accessibility, swipe-to-close are already handled |
| Toast notification ("IP copiado!") | Custom positioned `<div>` with opacity animation | shadcn/ui Sonner | Stacking, dismiss, accessibility, multiple variants covered |
| Data table with sorting/search | Custom `<table>` element with useState sort logic | shadcn/ui `Table` + client-side filter | Accessible markup, consistent styling — filter logic is still custom but table markup is not |
| Image optimization (WebP, srcset) | Manual `<picture>` tags with pregenerated WebP files | `next/image` with `priority` + `sizes` | Automatic format selection (AVIF > WebP > JPEG), automatic srcset, built-in lazy loading |
| Parallax scroll effect | Raw `addEventListener('scroll', ...)` with `requestAnimationFrame` | Motion `useScroll` + `useTransform` | Auto-cleanup, spring physics, GPU-accelerated transforms, no scroll jank |
| Clipboard copy | Manual `document.execCommand('copy')` | `navigator.clipboard.writeText()` | `execCommand` is deprecated; async clipboard API is the standard |

**Key insight:** Phase 1 is primarily a UI assembly phase, not an engineering phase. Almost every UI primitive needed already exists in shadcn/ui. The custom work is: design tokens, Motion parallax, mcsrvstat.us integration, and the banned items filter.

---

## Common Pitfalls

### Pitfall 1: Hero Image Destroying Mobile Performance (HIGH RISK)

**What goes wrong:** The user-provided Minecraft/Pokémon panoramic background is used directly without optimization. Brazilian audience on 4G mobile sees 4-8 second first paint. Lighthouse mobile score drops below 50. This is Pitfall 4 from PITFALLS.md.
**Why it happens:** Designing on a fast desktop connection; forgetting to add the `priority` prop and `sizes` attribute to `next/image`.
**How to avoid:**
- Place hero image in `/public/images/hero-background.webp` (convert to WebP before committing)
- Use `next/image` with `fill`, `priority`, `sizes="100vw"` — Next.js handles srcset automatically
- The `priority` prop tells Next.js to preload this image (it IS the LCP element)
- Target: hero image download < 200KB on mobile (Next.js serves the appropriate srcset size)
**Warning signs:** Image file > 500KB in `/public`; no `priority` prop on the hero `<Image>`; Lighthouse mobile LCP > 4 seconds.

### Pitfall 2: mcsrvstat.us API Blocking Page Render

**What goes wrong:** Server status fetch is called in a Client Component `useEffect` or directly on every render without caching. If the Minecraft server is offline or mcsrvstat.us is slow (it caches for 2 minutes), the servers page hangs.
**Why it happens:** Treating server status like any other client-side API call.
**How to avoid:** Fetch in a Server Component with `next: { revalidate: 30 }` on the `fetch()` call. The page always renders from Next.js cache. Never fails due to external API latency.
**Warning signs:** `useEffect` calling mcsrvstat.us directly in a component; no `revalidate` on the fetch.

### Pitfall 3: Motion Causing SSR Hydration Mismatches

**What goes wrong:** Motion components that read scroll position or window size during SSR produce different HTML than the client hydration pass. React throws hydration errors in the console.
**Why it happens:** `useScroll` and `useTransform` are client-only hooks. If used in a Server Component (missing `'use client'` directive), Next.js will throw.
**How to avoid:** All Motion animation components MUST have `'use client'` at the top. Keep animated components as small isolated islands (e.g., `HeroSection.tsx` is client, but the parent `page.tsx` remains a Server Component).
**Warning signs:** "Hydration mismatch" errors in browser console; motion imports in files without `'use client'`.

### Pitfall 4: Navbar "Perfil" and "Ranking" Links Leading Nowhere in Phase 1

**What goes wrong:** All 7 nav links are rendered from the start (per CONTEXT.md decision). But `/ranking` and `/perfil` pages are not built until Phases 2 and 3. Users click them and get a 404.
**Why it happens:** Implementing the full nav list before all pages exist.
**How to avoid:** Create stub pages for `/ranking` and `/perfil` in Phase 1 — a minimal "Em Breve" page that matches the site design. These stubs are replaced by real content in later phases. The planner should include tasks for these two stubs.
**Warning signs:** Nav links pointing to non-existent routes; 404 errors for `/ranking` and `/perfil`.

### Pitfall 5: Store/Replays "Em Breve" Pages Feeling Like Abandoned Placeholders

**What goes wrong:** The store and replays stubs ship as blank pages with a single line of text. Players assume the project is abandoned.
**Why it happens:** Placeholder pages get minimal design investment.
**How to avoid:** Per CONTEXT.md, these pages must be first-class marketing assets — vibrant design, preview of what's coming, Discord CTA. Use the same Motion entrance animations as the rest of the site. Show category cards for the store (Cosméticos, Ranks VIP, Itens) even without functionality.
**Warning signs:** Store/Replays pages have no animation; no Discord link; no preview content.

---

## Code Examples

### mcsrvstat.us v3 API Response Shape

```typescript
// Source: https://api.mcsrvstat.us/ — verified 2026-03-18
// GET https://api.mcsrvstat.us/3/<address>
// Required header: User-Agent (descriptive string)

interface McsrvstatResponse {
  online: boolean;
  ip?: string;
  port?: number;
  players?: {
    online: number;
    max: number;
    list?: Array<{ name: string; uuid: string }>;
  };
  version?: string;
  // ...debug fields omitted
}

// Cache hit header: X-Cache-Hit
// Cache expiry header: X-Cache-Time-Remaining
// API internal cache: 2 minutes
// Use Next.js revalidate: 30 — stale-while-revalidate on your side
```

### Tailwind v4 `@theme` — Full Design Token Block

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  /* Colors — derive exact hex from hero image, these are starting points */
  --color-brand-primary: #1a1a2e;
  --color-brand-surface: #16213e;
  --color-brand-card: #0f3460;
  --color-brand-accent: #e94560;
  --color-brand-online: #00ff87;
  --color-brand-offline: #6b7280;
  --color-brand-blue: #4cc9f0;
  --color-brand-yellow: #ffd60a;

  /* Fonts — install via next/font/google in layout.tsx */
  --font-display: var(--font-press-start), monospace;
  --font-body: var(--font-inter), sans-serif;

  /* Spacing overrides if needed */
  --radius-card: 0.75rem;
}
```

### Next.js Font Setup (layout.tsx)

```typescript
// src/app/layout.tsx
import { Inter, Press_Start_2P } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const pressStart = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-press-start',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${pressStart.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
```

### Server Status Glow Effect (Tailwind v4)

```typescript
// src/components/server-status/ServerCard.tsx
// Online: green glow border; Offline: grey border, muted
function ServerCard({ server, status }: { server: Server; status: ServerStatus }) {
  return (
    <div
      className={[
        'rounded-card border-2 p-6 transition-all duration-300',
        status.online
          ? 'border-brand-online shadow-[0_0_20px_rgba(0,255,135,0.3)]'
          : 'border-brand-offline opacity-70',
      ].join(' ')}
    >
      {/* ... card content */}
    </div>
  );
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `framer-motion` package | `motion` package, import from `motion/react` | Late 2024 | Old package still works but receives no new features — use `motion` |
| `tailwind.config.js` for design tokens | `@theme` directive in CSS (`globals.css`) | Tailwind v4, Jan 2025 | No config file needed; tokens are CSS variables automatically |
| `postcss-import` + tailwind config plugins | `@import "tailwindcss"` single line in CSS | Tailwind v4 | Simplified setup; PostCSS config still needed but simpler |
| `next/font` wrapping with `className` | CSS variable approach (`variable` prop + `className` on `<html>`) | Next.js 13+ (now standard) | Fonts load via CSS variables, referenced in `@theme` |
| `document.execCommand('copy')` | `navigator.clipboard.writeText()` | Widely supported 2023+ | `execCommand` deprecated; async clipboard API is the standard |

**Deprecated/outdated:**
- `framer-motion`: Still published, no new features. All new work uses `motion` package.
- `tailwind.config.js` color definitions: Replaced by `@theme` CSS block in Tailwind v4.
- `next-auth` v4: Incompatible with Next.js 16 App Router. Use `next-auth@beta` (v5).

---

## Open Questions

1. **Exact server IP addresses for mcsrvstat.us**
   - What we know: The hero background shows three game modes — PokeBrawl, PokeDash, PokeGold
   - What's unclear: The actual IP/hostname for each sub-server (e.g., `pokebrawl.craftprobrasil.com` or a single IP with port differentiation)
   - Recommendation: Planner should create a task that puts server addresses in an environment variable or `data/servers.ts` constant with a clear `// TODO: replace with real IPs` comment

2. **Hero background image location and format**
   - What we know: User has a Minecraft/Pokémon panoramic image to provide
   - What's unclear: Whether the image has been provided yet, its current format, and its dimensions
   - Recommendation: Wave 0 task should include: convert image to WebP, place in `/public/images/hero-background.webp`, verify file size < 500KB

3. **Banned items data source**
   - What we know: EXTRA-01 requires a searchable table of banned items with name, reason, and category
   - What's unclear: Whether the banned items list already exists (e.g., as a spreadsheet) or needs to be created from scratch
   - Recommendation: Phase 1 should use a static `data/banned-items.ts` array seeded with placeholder data. Phase 2 or 3 can move this to the DB if needed.

4. **Font choice: pixel/retro vs. modern gaming**
   - What we know: Marked as Claude's discretion in CONTEXT.md
   - What's unclear: Press Start 2P (retro pixel) works for headings but is unreadable at body size; Inter is clean but generic for a gaming site
   - Recommendation: Use **Press Start 2P** for the logo and major headings only (LAND-01 hero title), **Inter** for all body text and UI. This is the industry pattern for gaming sites that want character without sacrificing readability.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (recommended — pairs with Next.js App Router; no Jest config conflict) |
| Config file | `vitest.config.ts` — Wave 0 gap |
| Quick run command | `npx vitest run --reporter=dot` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LAND-01 | Hero `<Image>` has `priority` and `sizes="100vw"` props | unit | `vitest run tests/hero.test.tsx` | ❌ Wave 0 |
| LAND-02 | Navbar renders all 7 nav links | unit | `vitest run tests/navbar.test.tsx` | ❌ Wave 0 |
| LAND-02 | Mobile Sheet opens on hamburger click | unit | `vitest run tests/navbar.test.tsx` | ❌ Wave 0 |
| LAND-03 | Footer renders Discord CTA link | unit | `vitest run tests/footer.test.tsx` | ❌ Wave 0 |
| LAND-04 | HeroSection is a Client Component (has `'use client'`) | lint/unit | Static check in navbar test | ❌ Wave 0 |
| LAND-05 | Hero image file size < 500KB | smoke | `node scripts/check-assets.js` | ❌ Wave 0 |
| SERV-01 | `getServerStatus` returns `{ online: false }` on API error | unit | `vitest run tests/minecraft-status.test.ts` | ❌ Wave 0 |
| SERV-02 | `getServerStatus` maps `players.online` from API response | unit | `vitest run tests/minecraft-status.test.ts` | ❌ Wave 0 |
| SERV-03 | CopyIPButton calls `navigator.clipboard.writeText` with correct IP | unit | `vitest run tests/copy-ip.test.tsx` | ❌ Wave 0 |
| EXTRA-01 | BannedItemsTable filters by search query | unit | `vitest run tests/banned-items.test.tsx` | ❌ Wave 0 |
| EXTRA-01 | BannedItemsTable shows empty state when query has no results | unit | `vitest run tests/banned-items.test.tsx` | ❌ Wave 0 |
| EXTRA-02 | Loja page renders Discord CTA and category preview cards | unit | `vitest run tests/loja.test.tsx` | ❌ Wave 0 |
| EXTRA-03 | Replays stub page renders without errors | unit | `vitest run tests/replays.test.tsx` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npx vitest run --reporter=dot`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `vitest.config.ts` — Vitest config with jsdom environment for React component tests
- [ ] `tests/setup.ts` — shared test setup (React Testing Library, mock `navigator.clipboard`)
- [ ] Framework install: `npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event jsdom`
- [ ] `tests/hero.test.tsx` — covers LAND-01
- [ ] `tests/navbar.test.tsx` — covers LAND-02
- [ ] `tests/footer.test.tsx` — covers LAND-03
- [ ] `tests/minecraft-status.test.ts` — covers SERV-01, SERV-02 (mock fetch)
- [ ] `tests/copy-ip.test.tsx` — covers SERV-03 (mock clipboard API)
- [ ] `tests/banned-items.test.tsx` — covers EXTRA-01
- [ ] `tests/loja.test.tsx` — covers EXTRA-02
- [ ] `tests/replays.test.tsx` — covers EXTRA-03
- [ ] `scripts/check-assets.js` — covers LAND-05 (file size check for hero image)

---

## Sources

### Primary (HIGH confidence)
- [Next.js 16 blog post](https://nextjs.org/blog/next-16) — scaffold defaults, Turbopack, React Compiler
- [Next.js create-next-app CLI docs](https://nextjs.org/docs/app/api-reference/cli/create-next-app) — flag options verified
- [Tailwind CSS v4 theme docs](https://tailwindcss.com/docs/theme) — `@theme` directive, CSS variables for design tokens
- [mcsrvstat.us API](https://api.mcsrvstat.us/) — v3 endpoint format, response schema, User-Agent requirement
- [Motion scroll animations docs](https://www.framer.com/motion/scroll-animations/) — `useScroll`, `useTransform` API
- [shadcn/ui Sheet docs](https://ui.shadcn.com/docs/components/radix/sidebar) — mobile drawer pattern
- Prior project research: `STACK.md`, `ARCHITECTURE.md`, `PITFALLS.md`, `FEATURES.md` — all HIGH confidence

### Secondary (MEDIUM confidence)
- [Next.js image optimization 2025 — Prateeksha](https://prateeksha.com/blog/nextjs-image-optimization-real-performance-client-projects) — `priority` + `sizes` best practices, verified against Next.js official docs
- [Tailwind v4 theming — Medium](https://medium.com/@sir.raminyavari/theming-in-tailwind-css-v4-support-multiple-color-schemes-and-dark-mode-ba97aead5c14) — dark mode + multi-theme patterns
- [Framer Motion parallax implementation — Medium](https://medium.com/@rob.bettison94/framer-motion-parallax-implementation-in-react-b4c0c652c407) — useScroll + useTransform layer pattern, cross-verified with official docs

### Tertiary (LOW confidence)
- Design token color values — these are starting points derived from expected hero image palette. Exact hex values should be adjusted once the real hero image is available.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified via official docs and prior STACK.md research
- Architecture: HIGH — follows patterns from ARCHITECTURE.md; App Router route structure is well-established
- mcsrvstat.us API: HIGH — verified against live API docs; response shape confirmed
- Motion parallax: HIGH — verified against official Motion docs; `useScroll`/`useTransform` is stable API
- Design tokens: MEDIUM — color values are hypothetical until hero image is analyzed
- Pitfalls: HIGH — verified against PITFALLS.md prior research + official Next.js image docs

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (stable stack, 30-day window)
