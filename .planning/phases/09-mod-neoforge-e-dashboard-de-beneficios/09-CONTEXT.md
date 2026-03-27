# Phase 9: Mod NeoForge e Dashboard de Benefícios - Context

**Gathered:** 2026-03-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Substituir o sistema RCON por um mod NeoForge que faz polling da API do site para entregar itens/ranks via FTB Ranks, gerencia expiração local com timer (remove rank após N dias), e sincroniza status de volta ao site. No site, admin tem dashboard de benefícios ativos com countdown de expiração e log completo de vendas. Remove toda a infraestrutura RCON existente (client, commands, cron worker).

</domain>

<decisions>
## Implementation Decisions

### Entrega via Mod
- **D-01:** Autenticação via API Key fixa — chave secreta configurada no mod (config file) e na Vercel (env var MOD_API_KEY). Header `Authorization: Bearer {key}` em todos os requests.
- **D-02:** Mod faz polling de `GET /api/deliveries/pending` a cada 30 segundos para buscar pedidos com status 'paid'.
- **D-03:** Quando jogador está offline, mod guarda o pedido na fila local e só executa `/ftbranks add` quando detectar o player online no servidor. Confirma entrega pro site apenas após execução.
- **D-04:** Mod para NeoForge 1.21.1 (mesma versão do AllTheMods V6 do servidor).
- **D-05:** Comandos in-game básicos: `/craftpro status` (mostra fila pendente e benefícios ativos) e `/craftpro reload` (recarrega config).
- **D-06:** Logs gravados em arquivo separado `logs/craftpro.log` além do console do servidor. Registra entregas, expirações e erros.
- **D-07:** Endpoints da API no site:
  - `GET /api/deliveries/pending` — retorna orders com status 'paid' (autenticado por MOD_API_KEY)
  - `POST /api/deliveries/confirm` — mod confirma entrega, envia expiresAt
  - `POST /api/deliveries/expired` — mod notifica que benefício expirou
  - `POST /api/deliveries/revoke` — site notifica mod para revogar benefício (admin action)

### Gerenciamento de Expiração
- **D-08:** Mod salva benefícios ativos em JSON local (ex: `config/craftpro/benefits.json`): `{player, rank, deliveredAt, expiresAt, orderId}`
- **D-09:** Ao reiniciar, mod restaura do JSON local — não depende do site estar online para manter benefícios.
- **D-10:** Contador usa tempo real (data de expiração fixa). Se servidor ficou offline 2 dias, jogador perdeu 2 dias. Sem período de graça.
- **D-11:** Mod verifica expirados a cada minuto — executa `/ftbranks remove <player> <rank>` e notifica site via POST.
- **D-12:** Quando rank expira, jogador online recebe mensagem no chat do Minecraft informando que o benefício expirou.

### Dashboard Admin — Benefícios (/admin/beneficios)
- **D-13:** Tabela com colunas: Player, Benefício, Data de compra, Valor pago, Expira em (countdown), Status do servidor (entregue/pendente)
- **D-14:** Indicador visual de countdown: Verde >14d, Amarelo 7-14d, Vermelho <7d
- **D-15:** Filtros por player, tipo de benefício, status (ativo/expirando/expirado)
- **D-16:** Botão de revogar manual — marca como expirado no banco e notifica o mod para remover o rank via endpoint `/api/deliveries/revoke`
- **D-17:** Seção "beneficios" adicionada ao sistema de permissões admin existente

### Log de Vendas (/admin/vendas)
- **D-18:** Tabela com colunas: # (pedido ID), Player, Item, Valor (R$), Status do pagamento, Método de pagamento, ID MercadoPago, Status de entrega, Data
- **D-19:** Filtros por status do pedido e intervalo de datas
- **D-20:** Export CSV anotado como feature futura (não implementar agora)
- **D-21:** Seção "vendas" adicionada ao sistema de permissões admin existente

### Remoção do RCON
- **D-22:** Remover `src/lib/rcon/client.ts` e `src/lib/rcon/commands.ts`
- **D-23:** Remover `/api/cron/process-orders` (cron worker)
- **D-24:** Remover dependência `rcon-client` do package.json
- **D-25:** Limpar referências a RCON em schema, STATE.md e documentação

### Claude's Discretion
- Estrutura interna do projeto Java do mod (packages, classes)
- Design exato do JSON de benefícios
- Formato da mensagem de expiração no chat do Minecraft
- Skeleton/loading states nas páginas admin
- Paginação na tabela de vendas
- Tratamento de erros HTTP no mod (retry, backoff)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Schema e Dados
- `src/lib/db/schema.ts` — Tabelas orders, shopItems, adminPermissions (precisa de campo expiresAt em orders, seções novas em permissions)
- `src/lib/shop/actions.ts` — Server Action de checkout existente (cria order com status 'pending')

### Padrões Admin
- `.planning/phases/04-painel-admin/04-CONTEXT.md` — Padrões de admin: sidebar, permissões, audit log
- `src/app/(admin)/admin/pedidos/page.tsx` — Página admin de pedidos existente (referência de padrão)
- `src/lib/admin/actions/` — Server Actions pattern para ações admin

### Sistema de Entrega Existente (a ser removido)
- `src/lib/rcon/client.ts` — RCON client (remover)
- `src/lib/rcon/commands.ts` — Comandos RCON (remover)
- `src/app/api/cron/process-orders/route.ts` — Cron worker (remover)

### Webhook MercadoPago
- `src/app/api/loja/webhook/route.ts` — Webhook que muda status para 'paid' (mod busca a partir desse status)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Admin layout + sidebar: `src/app/(admin)/admin/layout.tsx` — reusar para novas páginas
- `adminPermissions` table: sistema de permissões granulares — adicionar seções "beneficios" e "vendas"
- `adminAuditLog`: auditoria existente — reusar para log de revogação de benefícios
- `/admin/pedidos`: página existente de pedidos — padrão de referência para tabela com filtros
- `Badge` component: usado em status de pedidos — reusar para indicadores de countdown

### Established Patterns
- Server Actions em `src/lib/admin/actions/` com audit log
- Tabelas admin com filtro por status (padrão de /admin/pedidos)
- API routes com auth check via `auth()` do NextAuth
- Webhook pattern com validação HMAC

### Integration Points
- `orders` table: campo `status` muda para 'paid' via webhook → mod busca → muda para 'delivered' via API
- Sidebar admin: adicionar links para /admin/beneficios e /admin/vendas
- Navbar admin: se necessário, condicional por permissão

</code_context>

<specifics>
## Specific Ideas

- Mod é projeto Java separado (não faz parte do repo Next.js) — pode ser um diretório `mod/` na raiz ou repo separado
- FTB Ranks é a ferramenta de ranks no servidor (não LuckPerms)
- O servidor roda AllTheMods 1.21.1 V6 com NeoForge
- API Key fixa é suficiente pois há apenas um servidor conectando

</specifics>

<deferred>
## Deferred Ideas

- **Export CSV em /admin/vendas** — anotado para implementar em fase futura
- **Sincronização site→mod de benefícios** — no restart, mod carrega do JSON local. Sincronização com site pode ser adicionada depois para resolver divergências

</deferred>

---

*Phase: 09-mod-neoforge-e-dashboard-de-beneficios*
*Context gathered: 2026-03-27*
