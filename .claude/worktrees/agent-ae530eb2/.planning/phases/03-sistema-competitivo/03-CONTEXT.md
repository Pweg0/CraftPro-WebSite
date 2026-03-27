# Phase 3: Sistema Competitivo - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

ELO, leaderboards, top-10 de vitórias, tiers visuais com badges e perfis de usuário completos com histórico de batalhas. O mod CobblemonArena é a fonte de verdade — calcula ELO, atribui divisões e envia tudo via webhook. O site armazena e exibe. Endpoint POST /api/replays já existe e funciona. Loja, replays viewer e admin são fases separadas.

</domain>

<decisions>
## Implementation Decisions

### Fonte de Dados
- Plugin CobblemonArena calcula ELO, delta e divisão — site NÃO calcula ELO
- Dados chegam via POST /api/replays (já implementado) com Bearer token auth
- ranking_snapshot no payload atualiza arena_players via upsert (já implementado)
- Site é camada de exibição + armazenamento, não lógica de negócio

### Divisões & Tiers (definidos pelo mod)
- 7 divisões: UNRANKED, BRONZE, SILVER, GOLD, PLATINUM, DIAMOND, MASTER
- Thresholds: Bronze 0-999, Silver 1000-1199, Gold 1200-1399, Platinum 1400-1599, Diamond 1600-1799, Master 1800+
- UNRANKED = placement incompleto (precisa de 10 partidas em 7 dias)
- Cores definidas: UNRANKED #888888, BRONZE #cd7f32, SILVER #c0c0c0, GOLD #f59e0b, PLATINUM #00d4ff, DIAMOND #b9f2ff, MASTER #ff4444

### Placement
- 10 partidas necessárias, prazo de 7 dias
- ELO inicial: 800
- Jogador fica UNRANKED até completar placement

### Leaderboard & Top-10
- Página única /ranking com duas abas: "Leaderboard (ELO)" e "Top 10 Vitórias"
- Informações por jogador na tabela: posição, avatar (mc-heads.net 24px), nome, ELO, divisão badge colorida, wins, losses, win rate
- Paginação de 20 jogadores por página
- Jogadores UNRANKED aparecem no final da lista, separados dos rankeados, com badge "Em Classificação"
- ISR 60 segundos (definido no ROADMAP)

### Perfil do Jogador
- Perfil público: qualquer visitante acessa /perfil/[uuid] e vê stats + histórico
- Clicar no nome no leaderboard abre o perfil do jogador
- Avatar: skin 3D corpo inteiro via crafatar.com/renders/body/{uuid}?size=200
- Cabeça 2D (mc-heads.net 48px) como fallback/complemento
- Histórico: 20 últimas batalhas com paginação pra ver mais
- Cada batalha mostra: adversário (avatar+nome), resultado (V/D), ELO antes/depois (+delta), razão (victory/timeout/flee/etc), data, duração, link pro replay
- Empty state limpo para conta nova sem batalhas

### Perfil — Extras Privados (jogador logado vendo próprio perfil)
- Seção Discord: mostra nome/avatar do Discord vinculado
- Stats detalhados: win rate por arena, win streak atual, melhor ELO atingido
- Visitantes NÃO veem essas seções

### Skin Avatars
- Cabeça 24px (leaderboard): https://mc-heads.net/avatar/{uuid}/24
- Cabeça 48px (perfil/detalhes): https://mc-heads.net/avatar/{uuid}/48
- Corpo 3D (perfil): https://crafatar.com/renders/body/{uuid}?size=200

### Claude's Discretion
- Design exato dos tier badges (formato, brilho, animação)
- Layout do perfil (seções, espaçamento, responsivo)
- Design das abas no ranking
- Loading states e skeleton screens
- Empty states visuais
- Cache strategy para imagens de skin externas

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Arena Integration
- `.planning/phases/03-sistema-competitivo/arena-integration-spec.json` — Spec completa: payload format, divisões, thresholds, cores, placement system, queries úteis, skin avatar URLs, rotas de API

### Project context
- `.planning/PROJECT.md` — Visão do projeto, constraints, decisões chave
- `.planning/REQUIREMENTS.md` — RANK-01, RANK-02, RANK-03, RANK-04, PROF-01, PROF-02

### Prior phases
- `.planning/phases/01-hub-p-blico/01-CONTEXT.md` — Design decisions (colorido vibrante, navbar links, client component islands)
- `.planning/phases/02-autentica-o/02-CONTEXT.md` — Auth decisions (Discord OAuth, discordId FK, avatar dropdown)

### Existing code
- `src/app/api/replays/route.ts` — Endpoint POST/GET já implementado (auth, idempotência, upsert)
- `src/lib/db/schema.ts` — Schema arenaPlayers + arenaMatches já definido
- `src/app/(public)/ranking/page.tsx` — Stub atual do ranking (substituir)
- `src/app/(protected)/perfil/page.tsx` — Stub atual do perfil (substituir)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/badge.tsx` — Badge component para tier badges
- `src/components/ui/table.tsx` — Table component para leaderboard
- `src/components/ui/button.tsx` — Button para paginação e navegação
- `src/components/ui/input.tsx` — Input para busca no leaderboard
- `src/app/api/replays/route.ts` — Endpoint completo: POST (recebe dados do mod) + GET (retorna replay por match_id)
- `src/lib/db/schema.ts` — arenaPlayers e arenaMatches schemas completos

### Established Patterns
- Client Component islands: componentes interativos usam 'use client', pages são Server Components
- Route groups: (public) para páginas abertas, (protected) para páginas com auth
- shadcn/ui: Badge, Table, Sheet, DropdownMenu já em uso
- Tailwind v4 design tokens: cores da marca definidas em globals.css
- ISR pattern: Server Components com revalidação temporal

### Integration Points
- `/ranking` route em (public) — página pública, sem auth necessário
- `/perfil/[uuid]` nova rota dinâmica em (public) — perfil público de qualquer jogador
- `/perfil` em (protected) — redireciona pro próprio perfil com extras privados
- Navbar já tem links para Ranking e Perfil (stubs)
- Auth session via `auth()` para detectar jogador logado no perfil

</code_context>

<specifics>
## Specific Ideas

- Plugin CobblemonArena é a fonte de verdade — site nunca calcula ou modifica ELO
- Skin avatars via APIs externas (mc-heads.net para cabeças, crafatar.com para corpo 3D)
- Referência visual: tiers com cores vibrantes que combinam com o estilo Minecraft/Pokémon do site
- Perfis clicáveis no leaderboard — cada nome é um link pro perfil público
- Win rate por arena como stat privado exclusivo do jogador logado

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-sistema-competitivo*
*Context gathered: 2026-03-18*
