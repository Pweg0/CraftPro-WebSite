# Roadmap: CraftPro Brasil

## Overview

### v1.0 (Complete — Phases 1-4)

Fases 1-4 entregaram o hub público completo (hero, servidores, itens banidos), autenticação Discord, sistema competitivo ELO com leaderboards e perfis, e painel admin com CRUD e permissões granulares. Tudo em produção em craftprobrasil.com.br.

### v2.0 — Loja e Blog (Fases 5-8)

Transforma o CraftPro Brasil num hub funcional completo: loja com pagamento real via Pix, blog com eventos, notificações Discord, temporadas competitivas com hall da fama e dashboard do jogador com gráfico ELO. Cada fase entrega uma capacidade verificável de ponta a ponta.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

**v1.0 (Complete)**

- [x] **Phase 1: Hub Público** - Toda a experiência pública — hero, navegação, servidores, páginas de suporte, design vibrante completo (completed 2026-03-18)
- [x] **Phase 2: Autenticação** - Login via Discord com sessão persistente e logout de qualquer página (completed 2026-03-18)
- [x] **Phase 3: Sistema Competitivo** - ELO, leaderboards, top-10, tiers visuais e perfis de usuário completos (completed 2026-03-18)
- [x] **Phase 4: Painel Admin** - Rota /admin protegida com CRUD para itens banidos, servidores, loja e leaderboard, com permissões granulares e auditoria (completed 2026-03-18)

**v2.0 (Active)**

- [ ] **Phase 5: Loja Funcional** - Schema v2.0 + fluxo completo de compra Pix via MercadoPago com entrega automática no servidor via RCON + fila com retry
- [ ] **Phase 6: Blog e Eventos** - Admin publica posts e eventos; visitantes leem /blog e /eventos com calendário filtrado por tipo
- [ ] **Phase 7: Notificações e Temporadas** - Discord webhooks em compras e novos jogadores + sistema de temporadas com reset ELO atômico e hall da fama
- [ ] **Phase 8: Dashboard do Jogador** - Gráfico de evolução ELO e Pokémon mais usados no perfil, alimentados por histórico acumulado desde Phase 5

## Phase Details

### Phase 5: Loja Funcional
**Goal**: Jogadores podem comprar ranks, cosméticos e itens via Pix e receber a entrega automaticamente no servidor — o CraftPro Brasil gera receita real
**Depends on**: Phase 4 (admin panel, schema foundation)
**Requirements**: SHOP-01, SHOP-02, SHOP-03, SHOP-04, SHOP-05, SHOP-06, SHOP-07
**Success Criteria** (what must be TRUE):
  1. Jogador navega /loja, vê itens com nome, descrição e preço em BRL, e consegue iniciar uma compra clicando em "Comprar"
  2. Jogador é redirecionado para o fluxo MercadoPago Checkout Pro, paga via Pix, e ao retornar vê a página /loja/pedido/[id] confirmando o pedido como "aguardando entrega"
  3. Após confirmação do webhook MercadoPago, o rank/item é entregue via RCON + LuckPerms no servidor Minecraft e o pedido muda para "entregue"
  4. Se o servidor Minecraft estava offline no momento da compra, o item é entregue automaticamente na próxima execução do cron sem intervenção manual
  5. Admin acessa /admin/pedidos, vê todos os pedidos com status, consegue filtrar por status e forçar retry manual de qualquer pedido com falha
**Plans:** 4 plans
Plans:
- [ ] 05-01-PLAN.md — Schema migration + types + permissions + RCON resolver (foundation)
- [ ] 05-02-PLAN.md — Backend logic: checkout action + webhook + cron worker
- [ ] 05-03-PLAN.md — Public store UI: /loja + /loja/pedido/[id] + /loja/meus-pedidos + navbar
- [ ] 05-04-PLAN.md — Admin UI: /admin/loja extension + /admin/pedidos
**UI hint**: yes

### Phase 6: Blog e Eventos
**Goal**: Visitantes encontram notícias, patch notes e torneios no site — o servidor parece ativo e bem gerenciado
**Depends on**: Phase 5 (schema migrations for blogPosts and events tables already migrated)
**Requirements**: BLOG-01, BLOG-02, BLOG-03, BLOG-04, BLOG-05
**Success Criteria** (what must be TRUE):
  1. Admin acessa /admin/blog, cria um post em markdown com título e slug, e o post aparece imediatamente em /blog na listagem pública
  2. Visitante acessa /blog/[slug] e lê o post completo renderizado em markdown com formatação correta
  3. Admin fixa um post como importante e ele aparece no topo da listagem de /blog acima dos demais
  4. Admin cria um evento em /admin/eventos com data, tipo e descrição; visitante acessa /eventos, vê o evento no calendário e consegue filtrar por tipo
**Plans**: TBD
**UI hint**: yes

### Phase 7: Notificações e Temporadas
**Goal**: A comunidade é notificada no Discord sobre eventos relevantes, e o admin pode encerrar temporadas competitivas com reset de ELO preservando o hall da fama
**Depends on**: Phase 5 (purchase events), Phase 3 (ELO and arena_players tables)
**Requirements**: NOTIF-01, NOTIF-02, NOTIF-03, SEASON-01, SEASON-02, SEASON-03
**Success Criteria** (what must be TRUE):
  1. Compra confirmada no MercadoPago dispara automaticamente um embed no canal #compras do Discord com nome do jogador, item e valor
  2. Novo jogador que faz login pela primeira vez recebe boas-vindas no canal #novos-jogadores do Discord via embed
  3. Admin clica em "Encerrar Temporada" no painel, o snapshot dos rankings é salvo, todos os ELOs resetam para 1000 via transação atômica, e uma nova temporada começa
  4. Visitante acessa /temporadas e vê o hall da fama com o top ranking de cada temporada passada, identificada por número e data de encerramento
**Plans**: TBD

### Phase 8: Dashboard do Jogador
**Goal**: Jogadores veem a evolução do seu desempenho competitivo ao longo do tempo — o perfil passa de stats estáticos para dashboard dinâmico
**Depends on**: Phase 5 (eloHistory table recording from Phase 5 onward), Phase 3 (arena_matches)
**Requirements**: DASH-01, DASH-02, DASH-03
**Success Criteria** (what must be TRUE):
  1. Perfil do jogador exibe gráfico de linha (Recharts) com a evolução do ELO ao longo do tempo, com pontos por partida e sem erro de hydration
  2. Cada partida registrada no banco atualiza automaticamente o histórico de ELO do jogador, alimentando o gráfico sem intervenção manual
  3. Perfil exibe lista dos Pokémon mais usados em batalhas ranqueadas com contagem de uso (condicional: disponível somente se o game server emite dados por Pokémon)
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
v1.0 complete. v2.0 phases execute in numeric order: 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Hub Público | 3/3 | Complete | 2026-03-18 |
| 2. Autenticação | 3/3 | Complete | 2026-03-18 |
| 3. Sistema Competitivo | 3/3 | Complete | 2026-03-18 |
| 4. Painel Admin | 4/4 | Complete | 2026-03-18 |
| 5. Loja Funcional | 0/4 | Not started | - |
| 6. Blog e Eventos | 0/? | Not started | - |
| 7. Notificações e Temporadas | 0/? | Not started | - |
| 8. Dashboard do Jogador | 0/? | Not started | - |

## Post-Phase Extras (v1.0 — implemented outside formal phases)

- [x] **Match Detail Page** — `/match/[id]` com header (avatares, ELO, divisões) e replay log formatado com cores por tipo de evento
- [x] **Replays Page Upgrade** — `/replays` agora lista partidas recentes do banco com links pra detalhes
- [x] **Admin User Management** — `/admin/usuarios` para vincular contas Discord ↔ Minecraft (Mojang API lookup)
- [x] **Perfil Auto-Redirect** — `/perfil` redireciona pro perfil competitivo quando Minecraft está vinculado
- [x] **Bug Fixes** — DropdownMenu onSelect→onClick (base-ui), banner path validation, CopyIPButton bg, asChild→render prop, Select null handling
- [x] **Vercel Deployment** — Site publicado em craftprobrasil.com.br com env vars, force-dynamic pages, DNS configurado
- [x] **Banner URL externa** — ServerCard aceita URLs externas (https://...) além de caminhos locais (/images/...), com unoptimized para domínios arbitrários
- [x] **"Ver Servidores" CTA** — Botão na hero agora navega para /servidores em vez de smooth scroll para anchor
- [x] **ServerForm label** — Campo de banner no admin atualizado para indicar URL ou caminho local
