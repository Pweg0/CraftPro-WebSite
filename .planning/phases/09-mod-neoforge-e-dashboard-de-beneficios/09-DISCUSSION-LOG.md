# Phase 9: Mod NeoForge e Dashboard de Benefícios - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-27
**Phase:** 09-mod-neoforge-e-dashboard-de-beneficios
**Areas discussed:** Entrega via Mod, Gerenciamento de Expiração, Dashboard de Benefícios, Log de Vendas

---

## Entrega via Mod

| Option | Description | Selected |
|--------|-------------|----------|
| API Key fixa | Chave secreta configurada no mod e na Vercel | ✓ |
| Token JWT rotativo | Mod faz login com credenciais e recebe token temporário | |
| Você decide | Claude escolhe | |

**User's choice:** API Key fixa
**Notes:** Simples e suficiente para um servidor só.

| Option | Description | Selected |
|--------|-------------|----------|
| Entregar mesmo offline | Executa /ftbranks add mesmo com player offline | |
| Esperar ficar online | Mod guarda na fila local e só executa quando detectar o player | ✓ |
| Você decide | Claude escolhe | |

**User's choice:** Esperar ficar online

| Option | Description | Selected |
|--------|-------------|----------|
| A cada 30 segundos | Entrega rápida após pagamento | ✓ |
| A cada 1 minuto | Balanço entre velocidade e carga | |
| A cada 5 minutos | Mais leve, jogador espera mais | |

**User's choice:** A cada 30 segundos

| Option | Description | Selected |
|--------|-------------|----------|
| NeoForge 1.21.1 | Mesma versão do AllTheMods V6 | ✓ |
| NeoForge 1.21.4+ | Versão mais recente | |

**User's choice:** NeoForge 1.21.1

| Option | Description | Selected |
|--------|-------------|----------|
| Sim, comandos básicos | /craftpro status, /craftpro reload | ✓ |
| Não, só funciona silencioso | Sem comandos in-game | |
| Você decide | Claude escolhe | |

**User's choice:** Sim, comandos básicos

| Option | Description | Selected |
|--------|-------------|----------|
| Console do servidor | Logs no terminal | |
| Arquivo de log separado | Grava em logs/craftpro.log | ✓ |
| Você decide | Claude escolhe | |

**User's choice:** Arquivo de log separado

---

## Gerenciamento de Expiração

| Option | Description | Selected |
|--------|-------------|----------|
| Restaurar do JSON local | Recarrega arquivo JSON com benefícios | ✓ |
| Sincronizar com o site | Busca no site os benefícios ativos | |
| Ambos | JSON local + sincronização em background | |

**User's choice:** Restaurar do JSON local

| Option | Description | Selected |
|--------|-------------|----------|
| Não, tempo real | Data de expiração fixa, sem graça | ✓ |
| Sim, só conta online | Timer só conta com servidor ligado | |
| Você decide | Claude escolhe | |

**User's choice:** Não, tempo real

| Option | Description | Selected |
|--------|-------------|----------|
| Sim, mensagem no chat | Jogador recebe mensagem no Minecraft | ✓ |
| Não, só remove | Remove silenciosamente | |
| Você decide | Claude escolhe | |

**User's choice:** Sim, mensagem no chat

---

## Dashboard de Benefícios

**Colunas selecionadas (multi-select):** Player + Benefício + Expira, Valor pago, Data de compra, Status do servidor

| Option | Description | Selected |
|--------|-------------|----------|
| Verde >7d, Amarelo 3-7d, Vermelho <3d | Thresholds padrão | |
| Verde >14d, Amarelo 7-14d, Vermelho <7d | Mais generoso | ✓ |
| Você decide | Claude escolhe | |

**User's choice:** Verde >14d, Amarelo 7-14d, Vermelho <7d

| Option | Description | Selected |
|--------|-------------|----------|
| Sim | Botão de revogar manual | ✓ |
| Não | Só expira naturalmente | |

**User's choice:** Sim

---

## Log de Vendas

**Colunas selecionadas (multi-select):** Básico (#, Player, Item, Valor, Status, Data), Método de pagamento, ID MercadoPago, Status de entrega

| Option | Description | Selected |
|--------|-------------|----------|
| Sim | Botão pra baixar CSV | |
| Não, só a tabela | Visão no site basta | |
| Futuro | Anotar pra implementar depois | ✓ |

**User's choice:** Futuro (export CSV adiado)

| Option | Description | Selected |
|--------|-------------|----------|
| Status + data | Filtrar por status e intervalo de datas | ✓ |
| Só status | Filtrar só por status | |
| Você decide | Claude escolhe | |

**User's choice:** Status + data

---

## Claude's Discretion

- Estrutura interna do projeto Java do mod
- Design do JSON de benefícios
- Formato da mensagem de expiração no chat
- Skeleton/loading states
- Paginação na tabela de vendas
- Tratamento de erros HTTP no mod

## Deferred Ideas

- Export CSV em /admin/vendas — implementar em fase futura
- Sincronização site→mod de benefícios após restart
