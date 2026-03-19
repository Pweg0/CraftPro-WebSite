# Requirements: CraftPro Brasil

**Defined:** 2026-03-18
**Core Value:** Transmitir a fusão Minecraft + Pokémon de forma vibrante, sendo o hub central para jogadores do CraftPro Brasil

## v1 Requirements

Requirements para release inicial. Cada um mapeia para fases do roadmap.

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

## v2 Requirements

Deferidos para release futura. Rastreados mas fora do roadmap atual.

### Loja

- **SHOP-01**: Loja funcional com itens cosméticos
- **SHOP-02**: Planos de Rank/VIP com vantagens
- **SHOP-03**: Integração com pagamento (MercadoPago/PIX)

### Replays

- [x] **REPL-01**: Visualizador de replays — página /match/[id] com replay log formatado do protocolo Showdown (implementado v1)
- **REPL-02**: Filtro de replays por jogador/data/resultado

### Perfil Avançado

- **PROF-03**: Avatar e info detalhados do Discord no perfil
- **PROF-04**: Badges/conquistas no perfil

### Competitivo Avançado

- **RANK-05**: Temporadas competitivas com reset de elo
- **RANK-06**: Histórico de elo ao longo do tempo (gráfico)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Login via email/senha ou Microsoft | Discord é o único método de auth |
| App mobile nativo | Web-first, mobile via responsive |
| Conteúdo em inglês | Site exclusivamente PT-BR |
| Fórum/chat no site | Discord já serve como hub de comunidade |
| Simulador de batalha no site | Pokémon Showdown já existe, seria over-engineering |
| Leaderboard real-time via WebSocket | Dados de elo mudam lentamente, ISR/polling é suficiente |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| LAND-01 | Phase 1 | Complete |
| LAND-02 | Phase 1 | Complete |
| LAND-03 | Phase 1 | Complete |
| LAND-04 | Phase 1 | Complete |
| LAND-05 | Phase 1 | Complete |
| AUTH-01 | Phase 2 | Complete |
| AUTH-02 | Phase 2 | Complete |
| AUTH-03 | Phase 2 | Complete |
| SERV-01 | Phase 1 | Complete |
| SERV-02 | Phase 1 | Complete |
| SERV-03 | Phase 1 | Complete |
| RANK-01 | Phase 3 | Complete |
| RANK-02 | Phase 3 | Complete |
| RANK-03 | Phase 3 | Complete |
| RANK-04 | Phase 3 | Complete |
| PROF-01 | Phase 3 | Complete |
| PROF-02 | Phase 3 | Complete |
| EXTRA-01 | Phase 1 | Complete |
| EXTRA-02 | Phase 1 | Complete |
| EXTRA-03 | Phase 1 | Complete |

### Admin Panel (Phase 4)

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

**Coverage:**
- v1 requirements: 20 total — all complete
- Admin requirements: 10 total — all complete
- Post-phase extras: 4 total — all complete
- v2 deferred: 6 remaining (SHOP-01..03, REPL-02, PROF-03..04, RANK-05..06)

---
*Requirements defined: 2026-03-18*
*Last updated: 2026-03-19 — v1 milestone complete, deployed to production*
