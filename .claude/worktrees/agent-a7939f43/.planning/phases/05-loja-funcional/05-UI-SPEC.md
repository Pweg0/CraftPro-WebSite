---
phase: 05
phase_name: Loja Funcional
status: draft
created: 2026-03-26
design_system: shadcn/ui — style base-nova, baseColor neutral, cssVariables true
---

# UI-SPEC: Phase 05 — Loja Funcional

## 1. Design System

| Field | Value | Source |
|-------|-------|--------|
| Tool | shadcn/ui | components.json (found) |
| Style | base-nova | components.json |
| Base color | neutral | components.json |
| CSS variables | true | components.json |
| Icon library | lucide-react | components.json |
| Third-party registries | none | components.json — `"registries": {}` |
| Registry safety gate | not applicable — no third-party registries declared | — |

Installed shadcn components (available without install):
`alert-dialog`, `badge`, `button`, `dialog`, `dropdown-menu`, `input`, `select`, `sheet`, `sonner`, `table`, `textarea`

Components needed this phase (install if not present):
- `skeleton` — for order status polling states
- `separator` — optional for card layout grouping

---

## 2. Design Tokens

### Brand Palette (from globals.css @theme)

All new UI in Phase 5 MUST use these tokens exclusively. Do not introduce new hex values.

| Token | Value | Semantic Use |
|-------|-------|-------------|
| `brand-primary` | `#0a0e1a` | Page background |
| `brand-surface` | `#111827` | Section backgrounds, containers |
| `brand-card` | `#1a2236` | Product cards, order cards |
| `brand-accent` | `#ff2d55` | Primary CTA buttons, rank/VIP product type badge |
| `brand-online` | `#00ff87` | "Entregue" status indicator, success states |
| `brand-offline` | `#4b5563` | "Falhou" status, inactive/disabled states |
| `brand-blue` | `#00d4ff` | Keys product type badge, "Pago" status indicator |
| `brand-yellow` | `#ffd60a` | Cosmetics product type badge, price display |
| `brand-purple` | `#a855f7` | "Entregando" status indicator |
| `brand-glow` | `#ff2d5540` | Box-shadow glow on CTA hover |
| `white/45` | — | Secondary body text, descriptions |
| `white/[0.06]` | — | Card border (default, non-interactive) |

### Color Split (60/30/10)

- **60% dominant:** `brand-primary` (#0a0e1a) — all page backgrounds
- **30% secondary:** `brand-card` (#1a2236) and `brand-surface` (#111827) — all cards, order rows, form containers, admin table rows
- **10% accent:** `brand-accent` (#ff2d55) — reserved for: "Comprar" CTA button, "Forçar Retry" button, active status pills, form submit buttons in admin. No decorative use.

### Status Color Map (reserved — do not reuse for other meaning)

| Order Status | Color Token | Usage |
|---|---|---|
| `pending` (Aguardando pagamento) | `brand-yellow` | Badge background tint + text |
| `paid` (Pago) | `brand-blue` | Badge background tint + text |
| `delivering` (Entregando) | `brand-purple` | Badge background tint + text |
| `delivered` (Entregue) | `brand-online` | Badge background tint + text |
| `failed` (Falhou) | `brand-offline` + destructive red tint | Badge background tint + text |

---

## 3. Spacing Scale

8-point scale only. Use these exact values — no exceptions.

| Step | px | Tailwind | Use |
|------|-----|----------|-----|
| 1 | 4px | `p-1` / `gap-1` | Icon internal padding |
| 2 | 8px | `p-2` / `gap-2` | Badge padding, tight icon+label gaps |
| 3 | 12px | `p-3` | Secondary button padding |
| 4 | 16px | `p-4` / `gap-4` | Default element padding, card internal spacing |
| 5 | 20px | `p-5` | Product card body padding (matches existing loja page) |
| 6 | 24px | `p-6` | Admin section headers, form group spacing |
| 8 | 32px | `p-8` | Page section gaps |
| 12 | 48px | `py-12` | Vertical section padding on public pages |
| 20 | 80px | `py-20` | Page top/bottom padding (matches existing loja page) |

Touch targets (interactive elements): minimum 44px height. Buttons use `h-11` (44px) for primary CTAs.

Grid layout: `grid-cols-1 md:grid-cols-3 gap-5` for product card grids (matches existing loja page pattern).

---

## 4. Typography

### Fonts

| Role | Token | Fallback | Use |
|------|-------|----------|-----|
| Display | `--font-display` (Press Start 2P) | monospace | Page headings only (h1 on /loja, /loja/pedido/[id]) |
| Body | `--font-body` (Sora) | sans-serif | All body text, labels, descriptions, table content |

Press Start 2P renders large at any size. Use sparingly — only h1-level page titles.

### Type Scale (4 sizes, 2 weights)

| Name | Size | Weight | Line-height | Tailwind | Use |
|------|------|--------|-------------|----------|-----|
| Display | 24–28px | 400 (regular — Press Start 2P has no bold) | 1.3 | `text-2xl sm:text-3xl font-display` | Page titles (/loja, /loja/pedido/[id]) |
| Heading | 18px | 600 (semibold) | 1.3 | `text-lg font-semibold` | Section headings, card group labels |
| Body | 14px | 400 | 1.6 | `text-sm` | Descriptions, table cells, form labels |
| Caption | 12px | 400 | 1.5 | `text-xs` | Badges, timestamps, meta info, price labels |

**Weights used: regular (400) and semibold (600) only.**

---

## 5. Component Inventory

### New Components for Phase 5

| Component | Type | Route | Description |
|-----------|------|-------|-------------|
| `ProductCard` | Server Component | `/loja` | Displays single shop item: name, description, type badge, price in BRL, Comprar button |
| `BuyButton` | Client Component | `/loja` | Triggers `createCheckoutPreference()` Server Action; shows loading state; redirects to MP |
| `NoMinecraftWarning` | Server Component | `/loja` | Shown when user is logged in but has no minecraftUuid — instructs to contact admin on Discord |
| `OrderStatusPage` | Server Component + polling | `/loja/pedido/[id]` | Displays order status with live refresh; shows status stepper |
| `OrderStatusStepper` | Client Component | `/loja/pedido/[id]` | 4-step stepper: Aguardando → Pago → Entregando → Entregue (or Falhou branch) |
| `OrderHistoryPage` | Server Component | `/loja/meus-pedidos` | Table of all player orders with status badges and links to order detail |
| `PedidosCrud` | Client Component | `/admin/pedidos` | Admin order table: filterable by status, retry button on failed orders |
| `LojaCrud` (rewrite) | Client Component | `/admin/loja` | Existing component extended with price, type, rconTemplate, duration, active fields |

### Existing Components Reused (no redesign)

- `Badge` (shadcn) — product type labels, order status pills
- `Button` (shadcn) — all CTAs
- `Table`, `TableBody`, etc. (shadcn) — admin pedidos and order history tables
- `AlertDialog` (shadcn) — retry confirmation in admin (matches Phase 4 destructive action pattern)
- `DropdownMenu` (shadcn) — admin table row actions (matches existing LojaCrud pattern)
- `Select` (shadcn) — status filter in /admin/pedidos
- `Input`, `Textarea` (shadcn) — form fields in admin/loja CRUD
- `Skeleton` (shadcn — install if needed) — loading states on order status page

---

## 6. Page-by-Page Contracts

### 6.1 /loja — Product Catalog (REWRITE)

**Layout:** Full-width dark page, `min-h-screen bg-brand-primary`, `py-20 px-4`. Ambient glow blobs retained from current page.

**Page header:** Retain existing header structure — icon container, page title (`font-display text-2xl sm:text-3xl`), subtitle (`text-sm text-white/45`). Remove "Em Breve" badge. Remove Discord CTA section.

**Product grid:** `grid grid-cols-1 md:grid-cols-3 gap-5`

**ProductCard anatomy:**
```
bg-brand-card/60 rounded-2xl border border-white/[0.06] p-5
backdrop-blur-sm transition-all duration-300
hover:border-{type-color}/30 hover:shadow-[0_0_30px_{type-color}/10] hover:-translate-y-1
```
- Type badge (top-left): `Badge variant="outline"` — color matches product type (rank=accent, key=blue, cosmetic=yellow)
- Item name: `text-sm font-semibold text-white`
- Description: `text-xs text-white/45 leading-relaxed`
- Price: `text-lg font-semibold text-brand-yellow` formatted as `R$ XX,XX`
- Duration (if rank): `text-xs text-white/45` — e.g. "30 dias"
- BuyButton: full-width, `mt-4`, uses accent color

**Empty state (no active items):** Centered layout, `ShoppingBag` icon at `w-12 h-12 text-white/20`, heading "Nenhum item disponível", body "Novos itens serão adicionados em breve." at `text-sm text-white/45`.

**Not logged in state:** Show items in catalog but BuyButton is replaced with "Entrar para Comprar" link-button that triggers Discord login.

**Logged in, no Minecraft UUID:** Show `NoMinecraftWarning` in place of BuyButton — card text: "Vincule sua conta Minecraft para comprar. Entre em contato com um admin no Discord." with Discord link.

**Category filter (optional — Claude's discretion):** If more than 6 items exist across types, show type filter tabs above the grid using `brand-card` pill buttons. Active tab uses `brand-accent` underline indicator.

### 6.2 /loja/pedido/[id] — Order Status

**Layout:** Centered single-column, `max-w-lg mx-auto py-20 px-4`.

**Card:** `bg-brand-card/60 rounded-2xl border border-white/[0.06] p-8`

**Page heading:** `font-display text-xl text-white` — "Pedido #[id]"

**Item summary:** Item name (`text-sm font-semibold text-white`), price (`text-xs text-white/45`), type badge

**OrderStatusStepper:** 4 steps rendered vertically or horizontally (horizontal on md+):
- Step 1: Aguardando pagamento — icon `Clock`, color `brand-yellow`
- Step 2: Pago — icon `CheckCircle`, color `brand-blue`
- Step 3: Entregando — icon `Package`, color `brand-purple`
- Step 4: Entregue — icon `Zap`, color `brand-online`
- Failed branch: replaces step 3-4 with single "Falhou" step — icon `XCircle`, color `brand-offline`

Active step: full color. Completed steps: full color with checkmark overlay. Future steps: `text-white/20`.

**Auto-refresh:** Page uses `router.refresh()` polling every 10 seconds while status is `pending` or `delivering`. Show `Skeleton` on initial load before data resolves.

**"Aguardando pagamento" state copy:** "Aguarde enquanto confirmamos seu pagamento via Pix. Isso pode levar alguns minutos."

**"Pago" state copy:** "Pagamento confirmado! Seu item está sendo processado para entrega no servidor."

**"Entregando" state copy:** "Entregando no servidor Minecraft… O item será aplicado automaticamente."

**"Entregue" state copy:** "Entregue com sucesso! Seu item já está disponível no servidor."

**"Falhou" state copy:** "Não foi possível entregar o item. Nossa equipe foi notificada. Entre em contato no Discord se precisar de ajuda."

**Back link:** `← Voltar para a Loja` at top-left, `text-sm text-white/45 hover:text-white`.

### 6.3 /loja/meus-pedidos — Order History

**Layout:** Full-width table page, `container mx-auto py-16 px-4`.

**Page heading:** `text-lg font-semibold text-white` — "Meus Pedidos". Subtitle: `text-sm text-white/45` — "Histórico de todas as suas compras."

**Table:** shadcn Table component with `bg-brand-card/40 rounded-2xl border border-white/[0.06]`

| Column | Content |
|--------|---------|
| Pedido | `#[id]` — `text-xs text-white/45` |
| Item | Item name — `text-sm font-semibold text-white` |
| Valor | Price in BRL — `text-sm text-brand-yellow` |
| Status | Status Badge (see status color map) |
| Data | Formatted date — `text-xs text-white/45` |
| Ação | Link "Ver detalhes" → `/loja/pedido/[id]` |

**Empty state:** Centered — `ShoppingBag` icon, "Nenhuma compra ainda", "Seus pedidos aparecerão aqui após a primeira compra." + "Ir para a Loja" Button (accent).

**Not logged in:** Redirect to login. No unauthenticated view.

### 6.4 /admin/pedidos — Admin Order Management (NEW)

**Layout:** Follows existing admin layout (sidebar + main content area). Header matches `/admin/loja` header pattern.

**Filter bar:** `Select` component for status filter — options: Todos, Pendente, Pago, Entregando, Entregue, Falhou. Positioned top-right of the table header section. Default: "Todos".

**Table columns:**

| Column | Content |
|--------|---------|
| ID | `#[id]` |
| Jogador | Discord name + Minecraft name |
| Item | Item name |
| Valor | Price in BRL |
| Status | Status Badge |
| Data | Creation timestamp |
| Ações | DropdownMenu: "Ver Detalhes" (→ /loja/pedido/[id] in new tab), "Forçar Retry" (only shown for `failed` status) |

**"Forçar Retry" interaction:** Opens AlertDialog (existing pattern) — title "Forçar reentrega?", body "Isso tentará entregar o item novamente via RCON. O pedido voltará para a fila.", confirm button "Confirmar Retry" (accent), cancel "Cancelar".

**Pagination:** Server-side, 25 orders per page. Show `← Anterior` / `Próxima →` plain text buttons at bottom. `text-sm text-white/45`.

### 6.5 /admin/loja — LojaCrud Extended (REWRITE)

**New form fields added to existing ShopItemForm/Sheet:**

| Field | Control | Validation |
|-------|---------|-----------|
| Preço (BRL) | `Input type="number"` — displays as `R$ X,XX`, stores centavos | Required, min 1 |
| Tipo | `Select` — Rank, Key, Cosmético | Required |
| Duração (dias) | `Input type="number"` — shown only when Tipo = Rank | Optional |
| Ativo | Toggle/Checkbox — `active` boolean | Default true |

The `rconTemplate` field is NOT shown in admin UI — it is auto-generated by the system based on `type` (D-03). Do not expose to admin.

---

## 7. Copywriting Contract

### CTAs

| Element | Copy | Notes |
|---------|------|-------|
| Product buy button | "Comprar" | Verb only — no noun needed, context is clear |
| Buy button loading state | "Processando…" | Shown while Server Action runs |
| Login to buy | "Entrar para Comprar" | Shown when unauthenticated |
| Admin retry | "Forçar Retry" | Admin-facing; kept technical |
| Admin retry confirm | "Confirmar Retry" | In AlertDialog confirm button |
| Back to store | "← Voltar para a Loja" | In /loja/pedido/[id] |
| View my orders | "Meus Pedidos" | Navbar link for authenticated players |
| Go to store (empty state) | "Ir para a Loja" | In /loja/meus-pedidos empty state |

### Empty States

| Page | Copy |
|------|------|
| /loja — no items | Heading: "Nenhum item disponível" / Body: "Novos itens serão adicionados em breve." |
| /loja/meus-pedidos — no orders | Heading: "Nenhuma compra ainda" / Body: "Seus pedidos aparecerão aqui após a primeira compra." |
| /admin/pedidos — no orders | Heading: "Nenhum pedido encontrado" / Body: "Os pedidos aparecerão aqui após a primeira compra na loja." |

### Error States

| Scenario | Copy | Placement |
|----------|------|-----------|
| createCheckoutPreference fails (generic) | "Erro ao iniciar compra. Tente novamente." | sonner toast, destructive variant |
| createCheckoutPreference fails — no UUID | "Você precisa vincular sua conta Minecraft antes de comprar. Fale com um admin no Discord." | Inline warning in ProductCard (not toast) |
| createCheckoutPreference fails — item inactive | "Este item não está mais disponível." | sonner toast |
| Order page — order not found | "Pedido não encontrado." | Centered on page, link back to /loja |
| Admin forceRetry fails | "Erro ao recolocar na fila. Tente novamente." | sonner toast, destructive variant |

### Destructive Actions

| Action | Confirmation approach |
|--------|-----------------------|
| Admin: Forçar Retry on failed order | AlertDialog — title "Forçar reentrega?", body describes action, confirm "Confirmar Retry" (accent), cancel "Cancelar" |
| Admin: Delete shop item (existing) | AlertDialog (existing pattern — no change) |

### No destructive actions requiring irreversible warnings (refunds are MercadoPago-only per D-16).

---

## 8. Interaction Contracts

### BuyButton State Machine

```
idle → loading (Server Action fires) → redirect (MP init_point) — success path
idle → loading → error toast — failure path
```

- `idle`: "Comprar", full opacity, accent color
- `loading`: "Processando…", opacity 0.7, spinner icon replaces text, pointer-events-none
- Transition duration: instant on click (no animation delay)

### OrderStatusStepper Auto-Refresh

- Poll interval: 10 seconds
- Active only when status is `pending` or `delivering`
- Stop polling when status is `delivered` or `failed`
- Implementation: `useEffect` with `router.refresh()` + `clearInterval` on status terminal states
- No visible "refreshing" indicator — silent background refresh

### Admin Status Filter

- Filter is immediate (no submit button) — uses `router.push()` with query param `?status=failed`
- URL is shareable/bookmarkable
- Select default value matches URL param on page load

### Admin Retry Button

- Shown only for rows where `status === 'failed'`
- Disabled + spinner while Server Action is in flight
- On success: sonner toast "Pedido recolocado na fila para reentrega." + `revalidatePath('/admin/pedidos')`
- On error: sonner toast destructive

---

## 9. Responsive Breakpoints

| Context | Mobile (< 768px) | Desktop (>= 768px) |
|---------|------------------|--------------------|
| /loja product grid | 1 column | 3 columns |
| /loja/pedido status stepper | vertical stack | horizontal stepper |
| /admin/pedidos table | horizontal scroll | full table visible |
| /loja/meus-pedidos table | horizontal scroll, hide "Pedido #" column | full table |

All pages follow `container mx-auto` with `px-4` horizontal padding at mobile.

---

## 10. Accessibility

- All `Button` elements have visible focus ring (`outline-ring/50` via global base styles)
- Status badges must not rely on color alone — include text label inside every status Badge
- `BuyButton` loading state sets `aria-disabled="true"` and `aria-label="Processando compra"`
- `OrderStatusStepper` steps use `aria-current="step"` on the active step
- Form inputs in admin have visible `<label>` elements (not just placeholder)
- Minimum touch target 44px height on all interactive elements (use `h-11` class on buttons)

---

## 11. Pre-Population Audit

| Field | Source | Value |
|-------|--------|-------|
| Design system | components.json | shadcn base-nova |
| Brand colors | globals.css @theme | All 8 brand tokens documented |
| Font tokens | globals.css @theme | --font-display (Press Start 2P), --font-body (Sora) |
| Installed components | src/components/ui/ | 11 components cataloged |
| Existing loja layout | src/app/(public)/loja/page.tsx | py-20, grid-cols-3, card class pattern |
| Admin pattern | LojaCrud.tsx + Phase 4 context | AlertDialog for destructive, DropdownMenu for row actions |
| Product types | CONTEXT.md D-01 | rank, key, cosmetic |
| Order states | CONTEXT.md D-07 | pending, paid, delivering, delivered, failed |
| Order history route | CONTEXT.md D-08 | /loja/meus-pedidos |
| Admin orders route | CONTEXT.md D-14 | /admin/pedidos |
| Retry pattern | CONTEXT.md D-15 | Manual retry button on failed orders |
| No refund UI | CONTEXT.md D-16 | No refund action in UI — MercadoPago panel only |

---

*UI-SPEC created: 2026-03-26*
*Phase: 05-loja-funcional*
*Status: draft — awaiting gsd-ui-checker validation*
