# Phase 5: Loja Funcional - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-26
**Phase:** 05-loja-funcional
**Areas discussed:** Tipos de produto, Fluxo de compra, Entrega RCON, Admin de pedidos

---

## Tipos de Produto

| Option | Description | Selected |
|--------|-------------|----------|
| Ranks + Keys + Cosméticos | Ranks temporários, keys para caixas, itens cosméticos — cada um com tipo de entrega diferente via RCON | ✓ |
| Só Ranks por agora | Focar em ranks/VIP temporários primeiro, expandir depois | |
| Você decide | Claude escolhe a estrutura | |

**User's choice:** Ranks + Keys + Cosméticos
**Notes:** Todos os tipos desde o início

| Option | Description | Selected |
|--------|-------------|----------|
| Duração fixa (30/60/90 dias) | Admin define durações pré-configuradas | |
| Duração única por item | Cada variante é item separado (VIP 30d = R$29,90, VIP 60d = R$49,90) | ✓ |
| Você decide | Claude escolhe | |

**User's choice:** Duração única por item

| Option | Description | Selected |
|--------|-------------|----------|
| Sim, admin define o comando | Admin escreve comando RCON no cadastro | |
| Automático por tipo | Sistema gera comando baseado no tipo (rank → LuckPerms, key → give) | ✓ |
| Você decide | Claude escolhe | |

**User's choice:** Automático por tipo

---

## Fluxo de Compra

| Option | Description | Selected |
|--------|-------------|----------|
| Sim, logado + Minecraft vinculado | Discord logado E Minecraft UUID vinculado | ✓ |
| Sim, só logado | Logado com Discord, pede nick na hora | |
| Você decide | Claude escolhe | |

**User's choice:** Logado + Minecraft vinculado

| Option | Description | Selected |
|--------|-------------|----------|
| Página de status do pedido | /loja/pedido/[id] com status em tempo real | ✓ |
| Só confirmação simples | Obrigado, pedido recebido | |
| Você decide | Claude escolhe | |

**User's choice:** Página de status do pedido

| Option | Description | Selected |
|--------|-------------|----------|
| Sim, /loja/meus-pedidos | Lista todos os pedidos do jogador com status | ✓ |
| Só o pedido atual | Sem histórico | |
| Você decide | Claude escolhe | |

**User's choice:** Histórico completo em /loja/meus-pedidos

---

## Entrega RCON

| Option | Description | Selected |
|--------|-------------|----------|
| Fila com retry automático | Cron tenta entregar a cada X minutos até 48h | ✓ |
| Notifica admin + retry manual | Admin recebe alerta, faz retry manual | |
| Você decide | Claude escolhe | |

**User's choice:** Fila com retry automático

| Option | Description | Selected |
|--------|-------------|----------|
| A cada 1-5 minutos | Quase instantâneo (cron externo necessário) | ✓ |
| A cada 1 hora | Espera até 1h | |
| 1x por dia (batch) | Limite Vercel Hobby | |

**User's choice:** A cada 1-5 minutos (cron-job.org)

---

## Admin de Pedidos

| Option | Description | Selected |
|--------|-------------|----------|
| Tabela completa + retry | Lista todos pedidos com filtro por status e retry manual | ✓ |
| Só falhas + retry | Só pedidos com problema | |
| Você decide | Claude escolhe | |

**User's choice:** Tabela completa + retry

| Option | Description | Selected |
|--------|-------------|----------|
| Não, só no MercadoPago | Reembolso direto no painel MP | ✓ |
| Sim, botão de cancelar | Cancelar via API MercadoPago | |
| Você decide | Claude escolhe | |

**User's choice:** Reembolso só no MercadoPago

---

## Claude's Discretion

- Design dos cards de produto na loja pública
- Skeleton/loading states
- Paginação da tabela admin
- Formato exato dos templates RCON
- Verificação de entrega

## Deferred Ideas

None — discussion stayed within phase scope
