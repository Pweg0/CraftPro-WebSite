---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: loja-funcional
status: in-progress
stopped_at: "Phase 05-loja-funcional Plan 01 complete — shop schema foundation, orders table, ShopItemCard, /loja catalog"
last_updated: "2026-03-26T15:12:00.000Z"
progress:
  total_phases: 5
  completed_phases: 4
  total_plans: 14
  completed_plans: 14
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-19)

**Core value:** Transmitir a fusão Minecraft + Pokémon de forma vibrante, sendo o hub central para jogadores do CraftPro Brasil
**Current focus:** Phase 05-loja-funcional — loja funcional com MercadoPago, RCON, LuckPerms (v2.0)

## Current Position

Phase: 05-loja-funcional (Plan 01/? complete)
Milestone: v2.0 — IN PROGRESS

## Performance Metrics

**Velocity:**

- Total plans completed: 14
- Average duration: ~10 min
- Total execution time: ~2.3 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-hub-p-blico | 3/3 | 45 min | 15 min |
| 02-autentica-o | 3/3 | 42 min | 14 min |
| 03-sistema-competitivo | 3/3 | 19 min | 6 min |
| 04-painel-admin | 4/4 | 25 min | 6 min |
| 05-loja-funcional | 1/? | 9 min | 9 min |

**Recent Trend:**

- Last 5 plans: 03-01 (10 min), 03-02 (5 min), 03-03 (4 min), 04-01 (3 min), 04-02 (12 min)
- Trend: steady

*Updated after each plan completion*
| Phase 01-hub-p-blico P01 | 18min | 2 tasks | 28 files |
| Phase 01-hub-p-blico P02 | 12 | 2 tasks | 9 files |
| Phase 01-hub-p-blico P03 | 15 | 2 tasks | 14 files |
| Phase 02-autentica-o P01 | 25 | 2 tasks | 7 files |
| Phase 02-autentica-o P02 | 2 | 2 tasks | 5 files |
| Phase 02-autentica-o P03 | 15 | 3 tasks | 10 files |
| Phase 03-sistema-competitivo P01 | 10 | 2 tasks | 7 files |
| Phase 03-sistema-competitivo P02 | 5 | 2 tasks | 4 files |
| Phase 03-sistema-competitivo P03 | 4 | 2 tasks | 5 files |
| Phase 04-painel-admin P01 | 3 | 2 tasks | 13 files |
| Phase 04-painel-admin P02 | 12 | 2 tasks | 10 files |
| Phase 04-painel-admin P04 | 4 | 2 tasks | 8 files |
| Phase 04-painel-admin P03 | 6 | 3 tasks | 18 files |
| Phase 05-loja-funcional P01 | 9 | 3 tasks | 10 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Setup]: Login exclusivamente via Discord OAuth2 — Auth.js v5 + Drizzle adapter
- [Setup]: Loja como "Em Breve" placeholder no v1 — funcionalidade adiada
- [Setup]: Ranking tipo elo competitivo (sobe com vitória, desce com derrota)
- [Setup]: Design colorido vibrante Minecraft/Pokémon, site inteiro em PT-BR
- [01-01]: React.createElement used in tests/setup.ts instead of JSX to avoid OXC parser error in .ts files
- [01-01]: tests/ excluded from Next.js tsconfig to prevent vitest global type conflicts
- [01-01]: Hero image converted at quality 80 yielding 166KB (under 500KB mobile limit)
- [Phase 01-02]: SheetTrigger (base-ui) does not accept asChild prop — styled directly with className instead of wrapping Button
- [Phase 01-02]: src/app/page.tsx removed in favor of src/app/(public)/page.tsx to use route group pattern
- [Phase 01-02]: Client Component islands — HeroSection and HeroCTAButtons are 'use client'; page.tsx stays Server Component
- [Phase 01-hub-p-blico]: Server status fetched in Server Components only — getServerStatus never called from Client Components
- [Phase 01-hub-p-blico]: Em Breve pages are first-class with Discord CTA and visual preview content, not blank placeholders
- [Phase 02-autentica-o]: vi.mock at top-level for missing AvatarDropdown — Vite static analysis fails on dynamic import() of non-existent files
- [Phase 02-autentica-o]: discordId column added to users table as project extension for Phase 3 ELO system FK
- [Phase 02-autentica-o]: neon-http driver chosen over neon-ws for App Router serverless compatibility
- [Phase 02-autentica-o]: signIn callback upserts discordId using profile.id (Discord snowflake) as stable FK for Phase 3 ELO system
- [Phase 02-autentica-o]: Providers wrapper in separate 'use client' file to keep layout.tsx as Server Component
- [Phase 03-sistema-competitivo]: replayLog excluded from getPlayerMatches select — large JSONB not needed in match history, reserved for future replay viewer
- [Phase 03-sistema-competitivo]: TierBadge uses inline styles not Tailwind tokens — 7 division colors are mod-spec constants that cannot be safely tokenized
- [Phase 03-sistema-competitivo]: Division prop typed as string not strict union — DB returns plain strings, component degrades to UNRANKED for unknown values
- [Phase 03-sistema-competitivo]: getAllByText used for Em Classificacao assertion — separator row AND UNRANKED TierBadge both render the same string
- [Phase 03-sistema-competitivo]: showUnranked condition tied to isLastPage — unranked players shown only on last page of ranked results
- [Phase 03-sistema-competitivo]: Protected /perfil shows Discord session info + link to /ranking — no Discord-to-Minecraft UUID FK exists so cannot auto-redirect to profile
- [Phase 03-sistema-competitivo]: MatchHistoryTable client-side pagination for v1 — page state is local, all 20 matches from server; true server-side pagination deferred
- [Phase 04-painel-admin]: permissions.ts uses dynamic imports for db/schema to avoid circular dependency issues in test environment
- [Phase 04-painel-admin]: Seed script uses relative imports from ../src/lib/db/schema instead of @/ path alias — tsx runs outside Next.js context
- [Phase 04-painel-admin]: isAdmin flag embedded in Auth.js session callback via env var check — avoids NEXT_PUBLIC_ exposure of admin IDs to client bundle
- [Phase 04-painel-admin]: Two-layer admin guard: middleware (env-var only, Edge runtime) + layout (DB-backed isAdmin) for defence in depth
- [Phase 04-painel-admin]: AdminSidebar receives sections[] from layout Server Component — keeps DB calls server-side, sidebar is purely presentational
- [Phase 04-painel-admin]: AlertDialog for ban/unban/delete actions prevents accidental irreversible mutations
- [Phase 04-painel-admin]: useOptimistic in PermissionManager for instant checkbox toggle feedback without waiting for server round-trip
- [Phase 04-painel-admin]: isSuperAdmin page-level guard in permissoes page — layout only checks isAdmin, page adds super-admin check and redirects to /403
- [Phase 04-painel-admin]: Server slug for servers auto-generated from name via normalize+lowercase+replace; shown as disabled field on edit since it is the PK
- [Phase 04-painel-admin]: loja.test.tsx updated to mock db and await async Server Component after migration from static to DB-backed page
- [Phase 05-loja-funcional]: orders table uses integer cents for BRL price — avoids floating point rounding errors
- [Phase 05-loja-funcional]: available column is integer 0/1 (not boolean) — consistent with existing banned column pattern
- [Phase 05-loja-funcional]: getShopItems() filters available=1 and sorts by category+name — deterministic catalog order
- [Phase 05-loja-funcional]: ShopItemCard buy button disabled — MercadoPago integration deferred to later Phase 5 plans
- [Phase 05-loja-funcional]: loja.test.tsx updated to empty-state + item-card tests replacing static category card tests

### Roadmap Evolution

- Phase 4 added: Painel Admin — rota /admin protegida para gerenciar itens banidos, servidores, loja e leaderboard
- Phase 5 started: Loja Funcional — schema foundation (orders, price, available), ShopItemCard, catalog /loja page

### Pending Todos

- Delete craftpro-temp scaffold directory at C:/Users/JoJo/Desktop/ALEMA/craftpro-temp
- Run `npx drizzle-kit push` to sync new schema (orders table, price/available columns) to Neon database

### Blockers/Concerns

- [Phase 3]: Formato exato do webhook do PixelmonShowdown plugin precisa ser verificado no servidor real antes de finalizar o contrato da /api/elo/update
- [Phase 3]: Política de abandono de batalha (abandono = derrota?) precisa ser decidida pelo dono do projeto antes de escrever qualquer lógica ELO
- [Phase 3]: Thresholds dos tiers (ELO para Bronze/Silver/Gold/Diamond) são decisão de design — definir antes de implementar badges
- [Phase 5]: drizzle-kit push needed to apply schema changes (orders table + shopItems columns) to production Neon DB

## Session Continuity

Last session: 2026-03-26
Stopped at: Phase 05-loja-funcional Plan 01 complete. Schema foundation built. Next: MercadoPago integration (05-02).
Resume file: None

## v2.0 Planning Notes

Discussed features for next milestone:
- **Loja funcional** — MercadoPago (Pix/cartão), entrega via RCON + fila no banco, ranks temporários via LuckPerms
- **Notificações Discord** — bot para compras, novos jogadores, resultados de batalhas
- **Blog/notícias** — admin publica updates e eventos
- **Temporadas de ranking** — reset de ELO, hall da fama
- **Dashboard do jogador** — gráfico de evolução ELO, Pokémon mais usados

Infrastructure decisions:
- Servidor roda NeoForge (não suporta plugins, apenas mods)
- RCON + fila no banco para entrega de itens da loja (sem mod extra)
- LuckPerms será instalado para substituir FTB Ranks (melhor para ranks temporários + integra com FTB Chunks)
- MercadoPago como gateway de pagamento (público brasileiro)
