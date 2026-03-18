# Roadmap: CraftPro Brasil

## Overview

O site é construído em três entregas coesas: primeiro o hub público (tudo que jogadores veem sem login — hero, servidores, páginas de suporte), depois a identidade do usuário via Discord (auth e sessão), e por último o sistema competitivo completo (ELO, leaderboards, perfis). Cada fase é verificável de forma independente antes de avançar.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Hub Público** - Toda a experiência pública — hero, navegação, servidores, páginas de suporte, design vibrante completo
- [ ] **Phase 2: Autenticação** - Login via Discord com sessão persistente e logout de qualquer página
- [ ] **Phase 3: Sistema Competitivo** - ELO, leaderboards, top-10, tiers visuais e perfis de usuário completos

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
- [ ] 01-01-PLAN.md — Scaffold Next.js 16, Tailwind v4 @theme design tokens, shared types, mcsrvstat.us client, static data, Vitest + test stubs, hero image WebP
- [ ] 01-02-PLAN.md — Navbar (sticky + mobile Sheet), Footer, HeroSection (Motion parallax), HeroCTAButtons (copy IP + Discord + scroll + Loja)
- [ ] 01-03-PLAN.md — Server status page (ServerCard glow, CopyIPButton, live player count), Banned Items table (searchable), Loja teaser, Replays stub, Ranking/Perfil stubs

### Phase 2: Autenticação
**Goal**: Usuários logados via Discord têm identidade persistente no site — podem fazer login, permanecer logados entre sessões e sair de qualquer página
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03
**Success Criteria** (what must be TRUE):
  1. Usuário clica em "Entrar com Discord", autoriza no OAuth e retorna ao site já logado com nome e avatar do Discord visíveis na navbar
  2. Usuário fecha o browser, reabre o site e continua logado sem precisar autenticar novamente
  3. Usuário clica em "Sair" de qualquer página e a sessão é encerrada imediatamente, removendo o estado de logado da navbar
**Plans**: TBD

Plans:
- [ ] 02-01: Auth.js v5 Discord provider + Drizzle adapter + upsert de usuário (discordId como FK estável), rota protegida /app/(auth)/
- [ ] 02-02: Integração da sessão na Navbar (avatar + nome + logout), testes de persistência e rotação de refresh token

### Phase 3: Sistema Competitivo
**Goal**: Jogadores podem ver o ranking completo de Pokémon por ELO, o top-10 de vitórias, seus tiers visuais, e acessar perfis com histórico de batalhas — o hub competitivo central do CraftPro Brasil está vivo
**Depends on**: Phase 2
**Requirements**: RANK-01, RANK-02, RANK-03, RANK-04, PROF-01, PROF-02
**Success Criteria** (what must be TRUE):
  1. Visitante acessa o Leaderboard e vê jogadores ordenados por ELO com tier badge visual (Bronze/Silver/Gold/Diamond) ao lado de cada nome
  2. Visitante acessa Top 10 Vitórias e vê os 10 jogadores com mais vitórias, com rank e stats
  3. O ELO de um jogador sobe após uma vitória e desce após uma derrota, refletido no leaderboard em até 60 segundos
  4. Usuário acessa o próprio perfil e vê ELO atual, wins, losses, win rate e histórico das batalhas recentes; perfil de conta nova sem batalhas exibe empty state limpo
**Plans**: TBD

Plans:
- [ ] 03-01: Schema de matches + ELO puro (lib/elo.ts), endpoint /api/elo/update (server-key auth), política de abandono definida e implementada
- [ ] 03-02: Páginas de Leaderboard e Top-10 (Server Components, ISR 60s, cache invalidation on write), tiers visuais com thresholds definidos
- [ ] 03-03: Página de Perfil (ELO, wins/losses/win rate, histórico paginado, rank badge, empty states)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Hub Público | 0/3 | Ready to execute | - |
| 2. Autenticação | 0/2 | Not started | - |
| 3. Sistema Competitivo | 0/3 | Not started | - |
