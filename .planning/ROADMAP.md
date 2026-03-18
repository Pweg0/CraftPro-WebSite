# Roadmap: CraftPro Brasil

## Overview

O site é construído em três entregas coesas: primeiro o hub público (tudo que jogadores veem sem login — hero, servidores, páginas de suporte), depois a identidade do usuário via Discord (auth e sessão), e por último o sistema competitivo completo (ELO, leaderboards, perfis). Cada fase é verificável de forma independente antes de avançar.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Hub Público** - Toda a experiência pública — hero, navegação, servidores, páginas de suporte, design vibrante completo (completed 2026-03-18)
- [x] **Phase 2: Autenticação** - Login via Discord com sessão persistente e logout de qualquer página (completed 2026-03-18)
- [x] **Phase 3: Sistema Competitivo** - ELO, leaderboards, top-10, tiers visuais e perfis de usuário completos (completed 2026-03-18)
- [ ] **Phase 4: Painel Admin** - Rota /admin protegida com CRUD para itens banidos, servidores, loja e leaderboard, com permissões granulares e auditoria

## Phase Details

### Phase 1: Hub Público
**Goal**: Qualquer visitante pode explorar o site completo — ver o hero imersivo, navegar entre páginas, consultar servidores ao vivo, itens banidos, loja placeholder e replays stub — com design colorido Minecraft/Pokémon e site totalmente em PT-BR
**Depends on**: Nothing (first phase)
**Requirements**: LAND-01, LAND-02, LAND-03, LAND-04, LAND-05, SERV-01, SERV-02, SERV-03, EXTRA-01, EXTRA-02, EXTRA-03
**Success Criteria** (what must be TRUE):
  1. Visitante abre o site e vê o hero section com o background Minecraft/Pokémon, IP do servidor visível e navegação funcional para todas as páginas
  2. Visitante acessa a página de Servidores e vê cada servidor com status online/offline, contagem de jogadores ao vivo e consegue copiar o IP com um clique
  3. Visitante acessa a página de Itens Banidos e vê a lista completa com a razão de cada ban
  4. Visitante acessa a Loja e vê a página "Em Breve" com preview do que virá; acessa Replays e vê página placeholder
  5. Site carrega rápido em mobile 4G brasileiro (Lighthouse mobile score 70+), sem quebra de layout em nenhuma tela
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Scaffold Next.js 16, Tailwind v4 @theme design tokens, shared types, mcsrvstat.us client, static data, Vitest + test stubs, hero image WebP
- [x] 01-02-PLAN.md — Navbar (sticky + mobile Sheet), Footer, HeroSection (Motion parallax), HeroCTAButtons (copy IP + Discord + scroll + Loja)
- [x] 01-03-PLAN.md — Server status page (ServerCard glow, CopyIPButton, live player count), Banned Items table (searchable), Loja teaser, Replays stub, Ranking/Perfil stubs

### Phase 2: Autenticação
**Goal**: Usuários logados via Discord têm identidade persistente no site — podem fazer login, permanecer logados entre sessões e sair de qualquer página
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03
**Success Criteria** (what must be TRUE):
  1. Usuário clica em "Entrar com Discord", autoriza no OAuth e retorna ao site já logado com nome e avatar do Discord visíveis na navbar
  2. Usuário fecha o browser, reabre o site e continua logado sem precisar autenticar novamente
  3. Usuário clica em "Sair" de qualquer página e a sessão é encerrada imediatamente, removendo o estado de logado da navbar
**Plans**: 3 plans

Plans:
- [x] 02-01-PLAN.md — Neon DB setup (human gate) + packages install + Drizzle schema (Auth.js tables + discordId) + drizzle.config.ts + test stubs (auth.test.tsx)
- [x] 02-02-PLAN.md — Auth.js v5 config (Discord provider + DrizzleAdapter + discordId upsert) + /api/auth/[...nextauth] route handler + SessionProvider + layout.tsx + User type
- [x] 02-03-PLAN.md — AvatarDropdown component (login button / avatar+dropdown) + Navbar integration + middleware.ts route protection + custom login page

### Phase 3: Sistema Competitivo
**Goal**: Jogadores podem ver o ranking completo de Pokémon por ELO, o top-10 de vitórias, seus tiers visuais, e acessar perfis com histórico de batalhas — o hub competitivo central do CraftPro Brasil está vivo
**Depends on**: Phase 2
**Requirements**: RANK-01, RANK-02, RANK-03, RANK-04, PROF-01, PROF-02
**Success Criteria** (what must be TRUE):
  1. Visitante acessa o Leaderboard e vê jogadores ordenados por ELO com tier badge visual (Bronze/Silver/Gold/Diamond) ao lado de cada nome
  2. Visitante acessa Top 10 Vitórias e vê os 10 jogadores com mais vitórias, com rank e stats
  3. O ELO de um jogador sobe após uma vitória e desce após uma derrota, refletido no leaderboard em até 60 segundos
  4. Usuário acessa o próprio perfil e vê ELO atual, wins, losses, win rate e histórico das batalhas recentes; perfil de conta nova sem batalhas exibe empty state limpo
**Plans**: 3 plans

Plans:
- [x] 03-01-PLAN.md — Query modules (leaderboard.ts, player.ts), TierBadge component, calcWinRate utility, next.config.ts remote patterns
- [x] 03-02-PLAN.md — Ranking page with ELO leaderboard and Top 10 Wins tabs, ISR 60s, pagination, PlayerRow with profile links
- [ ] 03-03-PLAN.md — Player profile page (/perfil/[uuid]) with stats, tier badge, paginated match history, empty states, 404 handling (gap closure)

### Phase 4: Painel Admin
**Goal**: Admin do CraftPro Brasil pode gerenciar todo o conteudo dinamico do site — itens banidos, servidores, loja preview, leaderboard (ban/unban jogadores, deletar partidas) — via painel protegido em /admin com permissoes granulares por secao e log de auditoria
**Depends on**: Phase 3
**Requirements**: ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04, ADMIN-05, ADMIN-06, ADMIN-07, ADMIN-08, ADMIN-09, ADMIN-10
**Success Criteria** (what must be TRUE):
  1. Admin logado acessa /admin e ve dashboard com stats (total jogadores, partidas hoje, itens banidos, servidores) e logs recentes de auditoria
  2. Admin pode criar, editar e deletar itens banidos via /admin/itens-banidos e as mudancas refletem na pagina publica /itens-banidos
  3. Admin pode criar, editar e deletar servidores via /admin/servidores e as mudancas refletem na pagina publica /servidores
  4. Admin pode criar, editar e deletar itens preview da loja via /admin/loja e as mudancas refletem na pagina publica /loja
  5. Admin pode banir/desbanir jogadores do leaderboard e deletar partidas especificas via /admin/leaderboard
  6. Super-admin pode gerenciar permissoes de outros admins por secao via /admin/permissoes
  7. Usuario nao-admin logado ve pagina 403 ao tentar acessar /admin
**Plans**: 4 plans

Plans:
- [ ] 04-01-PLAN.md — Schema (5 new tables + banned column), session discordId extension, permissions utility, seed script, shadcn components
- [ ] 04-02-PLAN.md — Middleware admin check, 403 page, admin layout + sidebar, dashboard with stats and audit logs, navbar Admin link
- [ ] 04-03-PLAN.md — CRUD for banned items, servers, shop items (Server Actions + forms + admin pages) + public page migrations to DB
- [ ] 04-04-PLAN.md — Leaderboard management (ban/unban players, delete matches) + permissions management (super-admin only)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Hub Publico | 3/3 | Complete    | 2026-03-18 |
| 2. Autenticacao | 3/3 | Complete    | 2026-03-18 |
| 3. Sistema Competitivo | 3/3 | Complete   | 2026-03-18 |
| 4. Painel Admin | 1/4 | In Progress|  |
