# Requirements: CraftPro Brasil

**Defined:** 2026-03-18
**Core Value:** Transmitir a fusão Minecraft + Pokémon de forma vibrante, sendo o hub central para jogadores do CraftPro Brasil

## v1 Requirements (Complete)

All v1.0 requirements delivered and deployed to craftprobrasil.com.br.

### Landing Page

- [x] **LAND-01**: Hero section imersivo com background Minecraft/Pokémon fornecido (otimizado WebP/srcset)
- [x] **LAND-02**: Navbar com navegação entre todas as páginas do site
- [x] **LAND-03**: Footer com links úteis e convite Discord
- [x] **LAND-04**: Animações com Motion (parallax hero, transições de página, efeitos visuais)
- [x] **LAND-05**: Design responsivo mobile-first (otimizado para conexões BR)

### Autenticação

- [x] **AUTH-01**: Usuário pode fazer login via Discord OAuth2
- [x] **AUTH-02**: Sessão persiste entre refreshes do navegador
- [x] **AUTH-03**: Usuário pode fazer logout de qualquer página

### Servidores

- [x] **SERV-01**: Página listando todos os servidores do network com status online/offline
- [x] **SERV-02**: Contagem de jogadores ao vivo por servidor
- [x] **SERV-03**: Botão para copiar IP do servidor

### Ranking & Competitivo

- [x] **RANK-01**: Página de leaderboard mostrando jogadores ordenados por elo
- [x] **RANK-02**: Página Top 10 jogadores com mais vitórias
- [x] **RANK-03**: Tiers/ranks visuais (Bronze, Silver, Gold, Diamond, etc.)
- [x] **RANK-04**: Sistema de cálculo ELO (sobe com vitória, desce com derrota)

### Perfil de Usuário

- [x] **PROF-01**: Página de perfil com stats de batalha (wins, losses, win rate, elo atual)
- [x] **PROF-02**: Histórico de batalhas recentes no perfil

### Páginas Extras

- [x] **EXTRA-01**: Página de itens banidos com lista e razão de cada ban
- [x] **EXTRA-02**: Página da loja com status "Em Breve" e preview do que virá
- [x] **EXTRA-03**: Página de replays de batalhas (stub/placeholder — formato a definir)

### Admin Panel

- [x] **ADMIN-01**: Schema com 5 tabelas admin + coluna banned em arena_players
- [x] **ADMIN-02**: Sistema de permissões (isAdmin, isSuperAdmin, hasPermission) via env var + DB
- [x] **ADMIN-03**: Rota /admin protegida com middleware + layout guard + página 403 temática
- [x] **ADMIN-04**: CRUD de itens banidos, servidores e loja preview via Server Actions
- [x] **ADMIN-05**: Permissões granulares por seção + log de auditoria em todas as mutações
- [x] **ADMIN-06**: Dashboard com stats ao vivo e logs de auditoria recentes
- [x] **ADMIN-07**: Leaderboard management — ban/unban jogadores, deletar partidas
- [x] **ADMIN-08**: Ban reversível (flag, dados preservados, filtro no leaderboard público)
- [x] **ADMIN-09**: Link "Admin" condicional na navbar (só pra admins logados)
- [x] **ADMIN-10**: Página 403 com visual temático Minecraft/Pokémon

### Post-Phase Extras

- [x] **POST-01**: Página /match/[id] com detalhes da partida e replay log formatado
- [x] **POST-02**: Página /replays atualizada com lista de partidas recentes do banco
- [x] **POST-03**: Admin /usuarios para vincular Discord ↔ Minecraft (Mojang API)
- [x] **POST-04**: /perfil auto-redirect pro perfil competitivo quando Minecraft vinculado

## v2.0 Requirements

Requirements para milestone v2.0: Loja e Blog. Cada um mapeia para fases do roadmap.

### Loja (Store)

- [x] **SHOP-01**: Jogador pode navegar a loja e ver itens disponíveis (ranks, cosméticos, itens in-game, keys) com preços em BRL
- [x] **SHOP-02**: Jogador pode comprar item via Pix (MercadoPago Checkout Pro) e ver QR code/código para pagamento
- [ ] **SHOP-03**: Após pagamento confirmado, rank/item é entregue automaticamente no servidor via RCON + LuckPerms
- [x] **SHOP-04**: Jogador pode acompanhar status do pedido (pendente/entregue/falhou) em /loja/pedido/[id]
- [ ] **SHOP-05**: Sistema de fila de entrega com retry automático quando servidor estava offline no momento da compra
- [ ] **SHOP-06**: Webhook MercadoPago valida assinatura HMAC e garante idempotência (sem entrega duplicada)
- [ ] **SHOP-07**: Admin pode ver todos os pedidos em /admin/pedidos, filtrar por status, e forçar retry manual

### Blog + Eventos

- [ ] **BLOG-01**: Admin pode criar, editar e deletar posts no blog via /admin/blog (markdown)
- [ ] **BLOG-02**: Visitante pode ver listagem de posts em /blog e ler post completo em /blog/[slug]
- [ ] **BLOG-03**: Admin pode fixar posts importantes no topo da listagem
- [ ] **BLOG-04**: Admin pode criar eventos com data, tipo e descrição via /admin/eventos
- [ ] **BLOG-05**: Visitante pode ver calendário de eventos/torneios em /eventos com filtro por tipo

### Temporadas de Ranking

- [ ] **SEASON-01**: Admin pode encerrar temporada atual, resetando ELO de todos para 1000 via transação atômica
- [ ] **SEASON-02**: Ao encerrar temporada, snapshot dos rankings é salvo automaticamente para hall da fama
- [ ] **SEASON-03**: Visitante pode ver hall da fama das temporadas passadas em /temporadas

### Dashboard do Jogador

- [ ] **DASH-01**: Perfil do jogador exibe gráfico de evolução ELO ao longo do tempo (Recharts)
- [ ] **DASH-02**: Perfil do jogador exibe Pokémon mais usados em batalhas ranqueadas
- [ ] **DASH-03**: Histórico de ELO é registrado automaticamente a cada partida para alimentar o gráfico

### Notificações Discord

- [ ] **NOTIF-01**: Compra confirmada envia embed no canal #compras do Discord via webhook
- [ ] **NOTIF-02**: Novo jogador registrado envia embed no canal #novos-jogadores do Discord
- [ ] **NOTIF-03**: Resultado de batalha ranqueada envia embed no canal de batalhas do Discord

## Future Requirements (v3.0+)

Deferred beyond v2.0.

### Replays

- **REPL-02**: Filtro de replays por jogador/data/resultado

### Perfil Avançado

- **PROF-03**: Avatar e info detalhados do Discord no perfil
- **PROF-04**: Badges/conquistas no perfil

## Out of Scope

| Feature | Reason |
|---------|--------|
| Login via email/senha ou Microsoft | Discord é o único método de auth |
| App mobile nativo | Web-first, mobile via responsive |
| Conteúdo em inglês | Site exclusivamente PT-BR |
| Fórum/chat no site | Discord já serve como hub de comunidade |
| Simulador de batalha no site | Pokémon Showdown já existe, seria over-engineering |
| Leaderboard real-time via WebSocket | Dados de elo mudam lentamente, ISR/polling é suficiente |
| Custom payment card form | PCI compliance; usar Checkout Pro hosted flow |
| discord.js gateway bot no Vercel | WebSocket persistente incompatível com serverless |
| Headless CMS (Strapi/Sanity) para blog | Overhead desnecessário; DB + admin panel existente é suficiente |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

### v1.0 (Complete)

| Requirement | Phase | Status |
|-------------|-------|--------|
| LAND-01..05 | Phase 1 | Complete |
| AUTH-01..03 | Phase 2 | Complete |
| SERV-01..03 | Phase 1 | Complete |
| RANK-01..04 | Phase 3 | Complete |
| PROF-01..02 | Phase 3 | Complete |
| EXTRA-01..03 | Phase 1 | Complete |
| ADMIN-01..10 | Phase 4 | Complete |
| POST-01..04 | Post-Phase | Complete |

### v2.0 (Roadmap created 2026-03-26)

| Requirement | Phase | Status |
|-------------|-------|--------|
| SHOP-01 | Phase 5 | Complete |
| SHOP-02 | Phase 5 | Complete |
| SHOP-03 | Phase 5 | Pending |
| SHOP-04 | Phase 5 | Complete |
| SHOP-05 | Phase 5 | Pending |
| SHOP-06 | Phase 5 | Pending |
| SHOP-07 | Phase 5 | Pending |
| BLOG-01 | Phase 6 | Pending |
| BLOG-02 | Phase 6 | Pending |
| BLOG-03 | Phase 6 | Pending |
| BLOG-04 | Phase 6 | Pending |
| BLOG-05 | Phase 6 | Pending |
| NOTIF-01 | Phase 7 | Pending |
| NOTIF-02 | Phase 7 | Pending |
| NOTIF-03 | Phase 7 | Pending |
| SEASON-01 | Phase 7 | Pending |
| SEASON-02 | Phase 7 | Pending |
| SEASON-03 | Phase 7 | Pending |
| DASH-01 | Phase 8 | Pending |
| DASH-02 | Phase 8 | Pending |
| DASH-03 | Phase 8 | Pending |

**Coverage:**
- v1 requirements: 34 total — all complete
- v2.0 requirements: 21 total — 21 mapped, 0 unmapped
- Future (v3.0+): 3 remaining (REPL-02, PROF-03, PROF-04)

---
*Requirements defined: 2026-03-18*
*Last updated: 2026-03-26 — v2.0 roadmap created; all 21 requirements mapped to Phases 5-8*
