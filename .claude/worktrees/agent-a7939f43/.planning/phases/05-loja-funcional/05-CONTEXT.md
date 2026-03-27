# Phase 5: Loja Funcional - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Schema v2.0 + fluxo completo de compra Pix via MercadoPago com entrega automática no servidor via RCON + fila com retry. Jogadores compram ranks, cosméticos e itens via Pix e recebem a entrega automaticamente no servidor — o CraftPro Brasil gera receita real. Inclui admin de pedidos em /admin/pedidos.

</domain>

<decisions>
## Implementation Decisions

### Tipos de Produto
- **D-01:** Três tipos de produto: Ranks temporários (VIP 30d, etc.), Keys para caixas, Cosméticos (titles, tags)
- **D-02:** Duração única por item — cada variante é um item separado (ex: VIP 30d = R$29,90, VIP 60d = R$49,90 são itens distintos na tabela)
- **D-03:** Comando RCON automático por tipo — sistema gera o comando baseado no tipo do produto (rank → LuckPerms `lp user {player} parent addtemp`, key → `give {player}`, cosmético → comando específico). Admin NÃO escreve comandos manuais
- **D-04:** Tabela `shopItems` existente precisa de migração: adicionar campos `price` (integer, centavos), `type` (rank/key/cosmetic), `rconTemplate` (template do comando), `duration` (nullable, para ranks temporários), `active` (boolean)

### Fluxo de Compra
- **D-05:** Jogador precisa estar logado (Discord) E ter Minecraft UUID vinculado (feito pelo admin em /admin/usuarios). Sem vínculo = mensagem pedindo contato com admin no Discord
- **D-06:** Fluxo: /loja → escolher item → "Comprar" → redirect MercadoPago Checkout Pro → paga Pix → retorna a /loja/pedido/[id] com status em tempo real
- **D-07:** Página de status do pedido /loja/pedido/[id] com estados: Aguardando pagamento → Pago → Entregando → Entregue (ou Falhou)
- **D-08:** Histórico de compras em /loja/meus-pedidos — lista todos os pedidos do jogador com status de cada um

### Entrega RCON
- **D-09:** Fila de entrega no banco com retry automático — pedido fica na fila, cron tenta entregar a cada 1-5 minutos até conseguir (máx 48h, depois marca como falha permanente)
- **D-10:** Cron externo (cron-job.org) dispara o endpoint `/api/cron/process-orders` a cada 1-5 minutos — Vercel Hobby plan não suporta cron com essa frequência
- **D-11:** Webhook MercadoPago NUNCA chama RCON diretamente — escreve na fila e retorna 200 imediatamente
- **D-12:** Idempotência via UNIQUE constraint no `mercadopago_payment_id` na tabela de orders
- **D-13:** Validação HMAC-SHA256 do header `x-signature` antes de qualquer escrita no banco

### Admin de Pedidos
- **D-14:** /admin/pedidos com tabela completa de todos os pedidos, filtrável por status (pendente/pago/entregue/falhou)
- **D-15:** Botão de retry manual para pedidos com entrega falhada
- **D-16:** Reembolso feito SOMENTE no painel MercadoPago — admin site só gerencia entregas, não lida com dinheiro
- **D-17:** Todas as ações de admin logadas no audit_log existente

### Claude's Discretion
- Design exato das páginas da loja (cards de produto, layout de categoria)
- Skeleton/loading states nas páginas de pedido
- Paginação e ordenação da tabela de pedidos no admin
- Formato exato do template RCON por tipo de produto
- Verificação de entrega (confirmar que LuckPerms aplicou o rank)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Pesquisa de Stack e Arquitetura
- `.planning/research/STACK.md` — Bibliotecas escolhidas: mercadopago@2.12.0, rcon-client@4.2.5, padrão de delivery queue
- `.planning/research/ARCHITECTURE.md` — Webhook handler pattern, cron worker pattern, schema design
- `.planning/research/PITFALLS.md` — Pitfalls críticos: RCON síncrono no webhook, idempotência, HMAC validation, Vercel timeout

### Schema Existente
- `src/lib/db/schema.ts` — Tabela shopItems (precisa migração), arenaPlayers, users (com minecraftUuid)
- `src/lib/admin/actions/shop-items.ts` — Server Actions existentes de CRUD da loja

### Padrões Estabelecidos
- `.planning/phases/04-painel-admin/04-CONTEXT.md` — Padrões de admin: sidebar, permissões, audit log, Server Actions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `shopItems` table (schema.ts:112): nome, descrição, categoria — precisa de migração para adicionar price, type, rconTemplate, duration, active
- `adminAuditLog` table: sistema de auditoria existente — reusar para log de ações em pedidos
- `adminPermissions`: sistema de permissões granulares — adicionar seção "pedidos"
- Admin layout + sidebar: padrão existente em `src/app/(admin)/admin/layout.tsx`
- Server Actions pattern: `src/lib/admin/actions/` — reusar para ações de pedidos
- `users.minecraftUuid` e `users.minecraftName`: campos existentes para validar vínculo antes de comprar

### Established Patterns
- Server Actions para mutações admin com revalidatePath
- ISR para páginas públicas com revalidação on-demand
- Client Component islands com Server Component wrappers
- AlertDialog para ações destrutivas (padrão de Phase 4)
- Sheet/drawer para sidebar mobile

### Integration Points
- `/loja` (public): atualmente mostra preview items — precisa virar loja funcional com preços e botão comprar
- `/admin/loja`: CRUD existente de shop items — precisa de campos extras (preço, tipo, comando)
- Navbar: adicionar link "Meus Pedidos" para jogadores logados
- Auth.js session: usar discordId + minecraftUuid para validar elegibilidade de compra
- Admin sidebar: adicionar seção "Pedidos"

</code_context>

<specifics>
## Specific Ideas

- Tipos de entrega automáticos por tipo de produto (rank → LuckPerms, key → give, cosmético → comando específico)
- Jogador vê status em tempo real do pedido (não apenas confirmação estática)
- Cron externo a cada 1-5 min pra contornar limite do Vercel Hobby
- Sem reembolso via site — sempre pelo painel MercadoPago

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-loja-funcional*
*Context gathered: 2026-03-26*
