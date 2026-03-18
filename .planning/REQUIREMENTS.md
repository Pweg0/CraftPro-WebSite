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

- [ ] **RANK-01**: Página de leaderboard mostrando jogadores ordenados por elo
- [ ] **RANK-02**: Página Top 10 jogadores com mais vitórias
- [ ] **RANK-03**: Tiers/ranks visuais (Bronze, Silver, Gold, Diamond, etc.)
- [ ] **RANK-04**: Sistema de cálculo ELO (sobe com vitória, desce com derrota)

### Perfil de Usuário

- [ ] **PROF-01**: Página de perfil com stats de batalha (wins, losses, win rate, elo atual)
- [ ] **PROF-02**: Histórico de batalhas recentes no perfil

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

- **REPL-01**: Visualizador de replays completo (quando formato definido)
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
| RANK-01 | Phase 3 | Pending |
| RANK-02 | Phase 3 | Pending |
| RANK-03 | Phase 3 | Pending |
| RANK-04 | Phase 3 | Pending |
| PROF-01 | Phase 3 | Pending |
| PROF-02 | Phase 3 | Pending |
| EXTRA-01 | Phase 1 | Complete |
| EXTRA-02 | Phase 1 | Complete |
| EXTRA-03 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 20 total
- Mapped to phases: 20
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-18*
*Last updated: 2026-03-18 — traceability preenchida após criação do roadmap*
