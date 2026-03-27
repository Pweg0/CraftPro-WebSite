---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: verifying
stopped_at: Completed 09-mod-neoforge-e-dashboard-de-beneficios-01-PLAN.md
last_updated: "2026-03-27T22:15:24.931Z"
last_activity: 2026-03-27
progress:
  total_phases: 8
  completed_phases: 5
  total_plans: 19
  completed_plans: 19
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-26)

**Core value:** Transmitir a fusão Minecraft + Pokémon de forma vibrante, sendo o hub central para jogadores do CraftPro Brasil
**Current focus:** Phase 05 — loja-funcional

## Current Position

Phase: 05 (loja-funcional) — EXECUTING
Plan: 4 of 4
Status: Phase complete — ready for verification
Last activity: 2026-03-27

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
| Phase 05-loja-funcional P03 | 8 | 2 tasks | 11 files |
| Phase 05-loja-funcional P04 | 18 | 2 tasks | 10 files |
| Phase 05-loja-funcional P05 | 12 | 2 tasks | 10 files |
| Phase 09-mod-neoforge-e-dashboard-de-beneficios P01 | 18 | 2 tasks | 12 files |

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
- [Phase 05-loja-funcional]: createCheckoutPreference Server Action wraps MP checkout logic from Plan 02 API route
- [Phase 05-loja-funcional]: minecraftUuid exposed in session callback for conditional BuyButton rendering in ProductCard
- [Phase 05-loja-funcional]: category used as type discriminator in ProductCard — schema lacks separate type column
- [Phase 05-loja-funcional]: rconTemplate set to null on admin create/update — system auto-generates command from type per D-03
- [Phase 05-loja-funcional]: forceRetryDelivery resets order to 'delivering' (no deliveryQueue table in schema) — cron worker re-attempts
- [Phase 05-loja-funcional]: pedidos added to AdminSection type with granular permission separate from loja section
- [Phase 05-loja-funcional]: RCON abstraction in src/lib/rcon/client.ts isolates rcon-client dependency — swappable if maintainer abandons
- [Phase 05-loja-funcional]: mercadopagoPaymentId (UNIQUE) separate from mercadopagoId (preference ID) for clean idempotency
- [Phase 05-loja-funcional]: RCON delivery worker uses orders table as queue (no separate deliveryQueue) — exponential backoff, max 10 retries (~48h)
- [Phase 09-mod-neoforge-e-dashboard-de-beneficios]: Mod-pull delivery model: mod polls /api/deliveries/pending instead of server pushing via RCON — simpler, NeoForge-compatible
- [Phase 09-mod-neoforge-e-dashboard-de-beneficios]: forceRetryDelivery sets status 'paid' (not 'delivering') so mod picks it up via poll; also allows retry from legacy 'delivering'
- [Phase 09-mod-neoforge-e-dashboard-de-beneficios]: MOD_API_KEY bearer token auth for all mod-facing delivery endpoints

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

Last session: 2026-03-27T22:15:24.876Z
Stopped at: Completed 09-mod-neoforge-e-dashboard-de-beneficios-01-PLAN.md
Resume file: None
Next action: /gsd:plan-phase 5
