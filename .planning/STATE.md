---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: unknown
stopped_at: Phase 4 UI-SPEC approved
last_updated: "2026-03-18T23:07:01.875Z"
progress:
  total_phases: 4
  completed_phases: 3
  total_plans: 9
  completed_plans: 9
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-18)

**Core value:** Transmitir a fusão Minecraft + Pokémon de forma vibrante, sendo o hub central para jogadores do CraftPro Brasil
**Current focus:** Phase 03 — sistema-competitivo

## Current Position

Phase: 03 (sistema-competitivo) — COMPLETE
Plan: 2 of 2

## Performance Metrics

**Velocity:**

- Total plans completed: 1
- Average duration: 18 min
- Total execution time: 0.3 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-hub-p-blico | 1/3 | 18 min | 18 min |

**Recent Trend:**

- Last 5 plans: 01-01 (18 min)
- Trend: baseline

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

### Roadmap Evolution

- Phase 4 added: Painel Admin — rota /admin protegida para gerenciar itens banidos, servidores, loja e leaderboard

### Pending Todos

- Delete craftpro-temp scaffold directory at C:/Users/JoJo/Desktop/ALEMA/craftpro-temp

### Blockers/Concerns

- [Phase 3]: Formato exato do webhook do PixelmonShowdown plugin precisa ser verificado no servidor real antes de finalizar o contrato da /api/elo/update
- [Phase 3]: Política de abandono de batalha (abandono = derrota?) precisa ser decidida pelo dono do projeto antes de escrever qualquer lógica ELO
- [Phase 3]: Thresholds dos tiers (ELO para Bronze/Silver/Gold/Diamond) são decisão de design — definir antes de implementar badges

## Session Continuity

Last session: 2026-03-18T23:07:01.861Z
Stopped at: Phase 4 UI-SPEC approved
Resume file: .planning/phases/04-painel-admin/04-UI-SPEC.md
