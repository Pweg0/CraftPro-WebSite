# Phase 4: Painel Admin - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Rota /admin protegida com painel completo para gerenciar itens banidos (CRUD), servidores (CRUD), configurações da loja (CRUD de categorias/itens preview), e dados do leaderboard (visualização + ban de jogadores + exclusão de partidas). Sistema de permissões granulares por seção com super-admin via env var. Migração de dados estáticos (banned items, servers) para tabelas no Neon PostgreSQL. Log básico de auditoria. Dados via Drizzle ORM.

</domain>

<decisions>
## Implementation Decisions

### Controle de Acesso
- Lista de admins via env var `ADMIN_DISCORD_IDS` (IDs separados por vírgula)
- Super-admin via env var `SUPER_ADMIN_DISCORD_ID` — tem acesso total e gerencia permissões dos outros admins
- Permissões granulares por seção armazenadas em tabela no banco (admin_permissions com discordId + section)
- Middleware compara discordId da sessão com as env vars e tabela de permissões
- Link "Admin" visível na navbar apenas para usuários admin logados
- Usuário logado sem permissão de admin vê página 403 com visual temático Minecraft/Pokémon e botão pra voltar
- Todo admin tem acesso às seções que foram atribuídas; super-admin tem acesso a tudo + seção de permissões
- Log básico de auditoria: tabela com quem, ação, quando (admin_audit_log)

### Migração de Dados — Itens Banidos
- Dados migrados de `src/data/banned-items.ts` (estático) para tabela `banned_items` no Neon PostgreSQL
- Seed com os 12 itens banidos atuais (nome, razão, categoria)
- Admin faz CRUD completo (criar, editar, deletar itens banidos)
- Página pública `/itens-banidos` passa a ler do banco ao invés do arquivo estático

### Migração de Dados — Servidores
- Dados migrados de `src/data/servers.ts` (estático) para tabela `servers` no Neon PostgreSQL
- Seed com os 3 servidores atuais (id, name, ip, description, bannerPath)
- Admin faz CRUD completo (criar, editar, deletar servidores)
- Página pública `/servidores` passa a ler do banco ao invés do arquivo estático

### Loja — Configuração Preview
- Tabela `shop_items` com campos: nome, descrição, categoria
- Admin faz CRUD de categorias/itens preview que aparecem no teaser da loja
- Sem campo de preço por agora — será adicionado quando a loja funcional ativar
- Página pública `/loja` exibe os itens preview cadastrados pelo admin

### Layout do Painel Admin
- Sidebar fixa com links: Dashboard, Itens Banidos, Servidores, Loja, Leaderboard, Permissões (só super-admin)
- Dashboard como página inicial com stats: total de jogadores, partidas do dia, servidores online, total de itens banidos, logs recentes
- Visual segue o mesmo tema vibrante Minecraft/Pokémon do site público — experiência visual coesa
- Mobile: sidebar vira drawer deslizante (mesmo padrão do Sheet já usado na navbar pública)

### Gerenciamento do Leaderboard
- Dados de ELO são somente leitura — ELO vem do mod CobblemonArena, admin NÃO edita
- Admin pode banir jogadores do ranking (flag `banned` no arena_players — some do leaderboard público, dados ficam no banco, reversível)
- Tabela de partidas filtrável por jogador, data, arena com detalhes de cada partida
- Admin pode deletar partidas específicas (para limpar dados de bugs/exploits — não reverte ELO automaticamente)

### Claude's Discretion
- Design exato dos componentes de CRUD (modais vs inline editing vs formulários em página separada)
- Esquema de cores dos cards do dashboard
- Paginação e ordenação das tabelas admin
- Loading states e skeleton screens
- Confirmação de ações destrutivas (deletar item, banir jogador)
- Formato exato do log de auditoria (quais ações são logadas)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project context
- `.planning/PROJECT.md` — Visão do projeto, constraints, decisões chave
- `.planning/REQUIREMENTS.md` — Requirements v1 e v2, traceability
- `.planning/ROADMAP.md` — Phase 4 definition e dependências

### Prior phases
- `.planning/phases/01-hub-p-blico/01-CONTEXT.md` — Design decisions (colorido vibrante, navbar, server cards, banned items table, loja teaser)
- `.planning/phases/02-autentica-o/02-CONTEXT.md` — Auth decisions (Discord OAuth, discordId FK, middleware, avatar dropdown, SessionProvider)
- `.planning/phases/03-sistema-competitivo/03-CONTEXT.md` — Arena integration (CobblemonArena como fonte de verdade, divisões, thresholds, skin avatars)

### Arena integration spec
- `.planning/phases/03-sistema-competitivo/arena-integration-spec.json` — Payload format, divisões, thresholds, cores — essencial para tela de leaderboard admin

### Existing static data (to be migrated)
- `src/data/banned-items.ts` — 12 itens banidos atuais (seed data)
- `src/data/servers.ts` — 3 servidores atuais (seed data)

### Existing code
- `src/lib/auth.ts` — Auth.js config com Discord provider e discordId upsert
- `src/lib/db/schema.ts` — Schema atual (users, accounts, sessions, arenaPlayers, arenaMatches)
- `middleware.ts` — Já protege /admin (redireciona não logados pro login)
- `src/components/layout/Navbar.tsx` — Onde adicionar link "Admin" condicional
- `src/components/ui/sheet.tsx` — Sheet component para drawer mobile do admin

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/table.tsx` — Table component para tabelas CRUD do admin
- `src/components/ui/button.tsx` — Button para ações CRUD
- `src/components/ui/input.tsx` — Input para formulários CRUD
- `src/components/ui/badge.tsx` — Badge para status (online/offline, banido, etc.)
- `src/components/ui/sheet.tsx` — Sheet para drawer mobile da sidebar admin
- `src/components/ui/dropdown-menu.tsx` — DropdownMenu para ações em linhas da tabela
- `src/components/ranking/TierBadge.tsx` — TierBadge para exibir divisões na tela de leaderboard admin
- `src/components/banned-items/BannedItemsTable.tsx` — Referência de como itens banidos são exibidos (adaptar pra CRUD)
- `src/components/server-status/ServerCard.tsx` — Referência de como servidores são exibidos

### Established Patterns
- Client Component islands: componentes interativos usam 'use client', pages são Server Components
- Route groups: (public) e (protected) — admin será novo route group ou dentro de (protected)
- shadcn/ui: Badge, Table, Sheet, DropdownMenu, Input, Button já em uso
- Tailwind v4 design tokens: cores da marca definidas em globals.css
- Drizzle ORM: schema em src/lib/db/schema.ts, queries em src/lib/db/queries/

### Integration Points
- middleware.ts já protege /admin — precisa adicionar check de admin (discordId vs env var + permissões)
- Navbar.tsx precisa de link "Admin" condicional (verificar sessão + isAdmin)
- Schema precisa de 4 novas tabelas: banned_items, servers, shop_items, admin_permissions, admin_audit_log
- Páginas públicas /itens-banidos e /servidores precisam trocar de leitura estática pra leitura do banco
- Página /loja precisa ler itens preview do banco ao invés de conteúdo hardcoded

</code_context>

<specifics>
## Specific Ideas

- Super-admin é o dono do servidor — único que gerencia permissões de outros admins
- Permissões são por seção (itens banidos, servidores, loja, leaderboard) — não há permissão parcial dentro de uma seção
- Ban de jogador no leaderboard é reversível — dados nunca são deletados, apenas escondidos
- Dashboard serve como overview rápido do estado do servidor/site
- Log de auditoria básico: quem fez o quê e quando — para accountability com múltiplos admins

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-painel-admin*
*Context gathered: 2026-03-18*
