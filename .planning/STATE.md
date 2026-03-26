---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: — Loja e Blog
status: Roadmap ready — awaiting plan-phase 5
stopped_at: Phase 5 context gathered
last_updated: "2026-03-26T14:17:19.016Z"
last_activity: 2026-03-26 — Roadmap v2.0 written (Phases 5-8)
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-26)

**Core value:** Transmitir a fusão Minecraft + Pokémon de forma vibrante, sendo o hub central para jogadores do CraftPro Brasil
**Current focus:** Milestone v2.0 — Loja funcional (Phase 5) is next

## Current Position

Phase: Phase 5 — Loja Funcional (not started)
Plan: —
Status: Roadmap ready — awaiting plan-phase 5
Last activity: 2026-03-26 — Roadmap v2.0 written (Phases 5-8)

Progress bar: [░░░░░░░░░░░░░░░░░░░░] 0/4 phases complete

## Performance Metrics

**Velocity (v1.0 reference):**

- Total plans completed: 13
- Average duration: ~10 min/plan
- Total execution time: ~2.2 hours (v1.0)

**v1.0 By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-hub-publico | 3/3 | 45 min | 15 min |
| 02-autenticacao | 3/3 | 42 min | 14 min |
| 03-sistema-competitivo | 3/3 | 19 min | 6 min |
| 04-painel-admin | 4/4 | 25 min | 6 min |

**v2.0 By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 05-loja-funcional | 0/? | — | — |
| 06-blog-e-eventos | 0/? | — | — |
| 07-notificacoes-e-temporadas | 0/? | — | — |
| 08-dashboard-do-jogador | 0/? | — | — |

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting v2.0:

- [v2.0 arch]: Payment webhook must NEVER call RCON directly — write to deliveryQueue, return 200, RCON runs only in cron worker (prevents lost deliveries + MercadoPago retry storm)
- [v2.0 arch]: UNIQUE constraint on mercadopago_payment_id in orders table — idempotency against duplicate webhook delivery
- [v2.0 arch]: HMAC-SHA256 validation of x-signature before any DB write in webhook handler — security requirement
- [v2.0 arch]: Season reset wrapped in single DB transaction: snapshot → close season → reset ELO → open new season — prevents hall of fame data loss
- [v2.0 arch]: Recharts chart components use next/dynamic { ssr: false } from day one — prevents hydration mismatch (confirmed shadcn issue #5661)
- [v2.0 arch]: Discord notifications via plain fetch() POST to Incoming Webhooks — no discord.js, no persistent process, Vercel-compatible
- [v2.0 arch]: Blog stored in Neon DB + existing admin panel — no headless CMS, no MDX files, no external auth
- [v2.0 stack]: mercadopago@2.12.0, rcon-client@4.2.5, recharts@3.8.0, react-markdown@9.x
- [v2.0 roadmap]: Schema migration folded into Phase 5 (Loja) — coarse granularity, all new tables migrate together as first task of Phase 5
- [v2.0 roadmap]: Notificações and Temporadas combined into Phase 7 — both small, both fire-and-forget or self-contained; coarse granularity justifies merge

### Roadmap Evolution

- v1.0 Phases 1-4: Complete (deployed to craftprobrasil.com.br 2026-03-18)
- v2.0 Phases 5-8: Roadmap created 2026-03-26

### Pending Todos

- Delete craftpro-temp scaffold directory at C:/Users/JoJo/Desktop/ALEMA/craftpro-temp
- Verify Vercel Hobby cron frequency in account dashboard before finalizing RCON delivery SLA expectations (may be 1x/day; mitigation: cron-job.org trigger)
- Verify MercadoPago sandbox credentials work end-to-end before starting Phase 5 implementation
- Confirm game server firewall allows Vercel outbound IPs on port 25575 (RCON) with server operator
- Confirm with server operator whether PixelmonShowdown emits per-Pokémon battle data (gates Pokémon stats in Phase 8)

### Blockers/Concerns

- [Phase 5]: MercadoPago sandbox historically inconsistent — test end-to-end before building the full flow
- [Phase 5]: Vercel Hobby cron may be limited to once-per-day — verify before finalizing delivery latency expectations
- [Phase 5]: Vercel outbound IP ranges must be whitelisted on game server firewall at port 25575 — unverified
- [Phase 8]: Pokémon usage stats (DASH-02) depend on PixelmonShowdown emitting per-Pokémon data — unverified; feature is conditional in success criteria

## Session Continuity

Last session: 2026-03-26T14:17:18.971Z
Stopped at: Phase 5 context gathered
Resume file: .planning/phases/05-loja-funcional/05-CONTEXT.md
Next action: /gsd:plan-phase 5
