# Phase 9: Mod NeoForge e Dashboard de Beneficios - Research

**Researched:** 2026-03-27
**Domain:** NeoForge 1.21.1 Java mod + Next.js 16 API routes + Drizzle ORM schema migration
**Confidence:** HIGH (site side) / MEDIUM (mod Java side — verified against MDK and event docs)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Entrega via Mod**
- D-01: Autenticacao via API Key fixa — chave secreta configurada no mod (config file) e na Vercel (env var MOD_API_KEY). Header `Authorization: Bearer {key}` em todos os requests.
- D-02: Mod faz polling de `GET /api/deliveries/pending` a cada 30 segundos para buscar pedidos com status 'paid'.
- D-03: Quando jogador esta offline, mod guarda o pedido na fila local e so executa `/ftbranks add` quando detectar o player online no servidor. Confirma entrega pro site apenas apos execucao.
- D-04: Mod para NeoForge 1.21.1 (mesma versao do AllTheMods V6 do servidor).
- D-05: Comandos in-game basicos: `/craftpro status` (mostra fila pendente e beneficios ativos) e `/craftpro reload` (recarrega config).
- D-06: Logs gravados em arquivo separado `logs/craftpro.log` alem do console do servidor. Registra entregas, expiracoes e erros.
- D-07: Endpoints da API no site:
  - `GET /api/deliveries/pending` — retorna orders com status 'paid' (autenticado por MOD_API_KEY)
  - `POST /api/deliveries/confirm` — mod confirma entrega, envia expiresAt
  - `POST /api/deliveries/expired` — mod notifica que beneficio expirou
  - `POST /api/deliveries/revoke` — site notifica mod para revogar beneficio (admin action)

**Gerenciamento de Expiracao**
- D-08: Mod salva beneficios ativos em JSON local (`config/craftpro/benefits.json`): `{player, rank, deliveredAt, expiresAt, orderId}`
- D-09: Ao reiniciar, mod restaura do JSON local — nao depende do site estar online.
- D-10: Contador usa tempo real (data de expiracao fixa). Sem periodo de graca.
- D-11: Mod verifica expirados a cada minuto — executa `/ftbranks remove <player> <rank>` e notifica site via POST.
- D-12: Quando rank expira, jogador online recebe mensagem no chat do Minecraft informando que o beneficio expirou.

**Dashboard Admin — Beneficios (/admin/beneficios)**
- D-13: Tabela com colunas: Player, Beneficio, Data de compra, Valor pago, Expira em (countdown), Status do servidor (entregue/pendente)
- D-14: Indicador visual de countdown: Verde >14d, Amarelo 7-14d, Vermelho <7d
- D-15: Filtros por player, tipo de beneficio, status (ativo/expirando/expirado)
- D-16: Botao de revogar manual — marca como expirado no banco e notifica o mod para remover o rank via endpoint `/api/deliveries/revoke`
- D-17: Secao "beneficios" adicionada ao sistema de permissoes admin existente

**Log de Vendas (/admin/vendas)**
- D-18: Tabela com colunas: # (pedido ID), Player, Item, Valor (R$), Status do pagamento, Metodo de pagamento, ID MercadoPago, Status de entrega, Data
- D-19: Filtros por status do pedido e intervalo de datas
- D-20: Export CSV — feature futura (NAO implementar agora)
- D-21: Secao "vendas" adicionada ao sistema de permissoes admin existente

**Remocao do RCON**
- D-22: Remover `src/lib/rcon/client.ts` e `src/lib/rcon/commands.ts`
- D-23: Remover `/api/cron/process-orders` (cron worker)
- D-24: Remover dependencia `rcon-client` do package.json
- D-25: Limpar referencias a RCON em schema, STATE.md e documentacao

### Claude's Discretion
- Estrutura interna do projeto Java do mod (packages, classes)
- Design exato do JSON de beneficios
- Formato da mensagem de expiracao no chat do Minecraft
- Skeleton/loading states nas paginas admin
- Paginacao na tabela de vendas
- Tratamento de erros HTTP no mod (retry, backoff)

### Deferred Ideas (OUT OF SCOPE)
- Export CSV em /admin/vendas — para fase futura
- Sincronizacao site→mod de beneficios no restart — mod carrega do JSON local
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MOD-01 | Mod NeoForge faz polling do endpoint /api/deliveries/pending e entrega ranks/itens via /ftbranks add quando pedido esta pago | NeoForge ServerTickEvent.Post + java.net.http.HttpClient + FTB Ranks command syntax verified |
| MOD-02 | Mod salva beneficios ativos em JSON local e remove automaticamente via /ftbranks remove quando o prazo expira | Gson file I/O pattern + expiresAt timestamp comparison on tick counter |
| MOD-03 | Mod confirma entrega e expiracao pro site via POST, atualizando status do pedido | Schema needs `expiresAt` + `deliveredAt` columns on orders; API routes pattern from webhook handler |
| MOD-04 | Admin acessa /admin/beneficios e /admin/vendas com tabelas, countdown e acoes de revogacao | Pattern directly cloned from /admin/pedidos (PedidosCrud); AdminSection type extension; sidebar update |
</phase_requirements>

---

## Summary

Esta fase tem dois componentes completamente distintos: (1) um mod Java para NeoForge 1.21.1 que substitui o worker RCON e (2) melhorias no painel admin do site Next.js. Os dois se comunicam via API REST autenticada por API Key fixa.

O lado do **site** e simples e bem pavimentado — o projeto ja tem todos os padroes necessarios em /admin/pedidos, AdminSection, permissoes granulares e audit log. A extensao requer: 2 novas colunas no schema (expiresAt, deliveredAt), 4 novos endpoints de API, 2 novas paginas admin e expansao do AdminSection type. Remocao do RCON e limpeza direta.

O lado do **mod Java** e o componente mais novo. O mod usa NeoForge 1.21.1 (Java 21), NeoGradle 7.1.21 como build plugin, e a API padrao do Java 11+ (`java.net.http.HttpClient`) para HTTP — sem dependencias extras. O scheduler usa `ServerTickEvent.Post` + contador de ticks (20 ticks/seg no Minecraft). A entrega de ranks usa `/ftbranks add <player> <rank>` e remocao usa `/ftbranks remove <player> <rank>` — sintaxe confirmada na documentacao oficial do FTB.

**Primary recommendation:** Estruturar em 4 ondas — schema+API (site), mod Java skeleton+polling, mod expiracao+comandos, admin dashboard+remocao RCON.

---

## Standard Stack

### Core — Site (Next.js)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| drizzle-orm | ^0.45.1 | ORM — schema migration + queries | Ja em uso no projeto |
| next | 16.2.0 | Framework — API routes + Server Actions | Ja em uso |
| next-auth | ^5.0.0-beta.30 | Auth — protecao das paginas admin | Ja em uso |
| drizzle-kit | ^0.31.10 | Migrations SQL geradas | Ja em uso |

### Core — Mod Java (NeoForge)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| net.neoforged:neoforge | 21.1.x (1.21.1) | NeoForge API — eventos, comandos, chat | Versao do servidor AllTheMods V6 |
| Gradle plugin net.neoforged.gradle.userdev | 7.1.21 | Build plugin NeoGradle | MDK oficial NeoForge 1.21.1 |
| java.net.http.HttpClient | Java 21 stdlib | HTTP polling e confirmacoes | Sem dependencia extra; disponivel no JDK |
| com.google.gson:gson | incluido no Minecraft | Parse/serialize JSON (benefits.json) | Disponivel no classpath Minecraft/NeoForge |
| java.util.logging / FileHandler | Java stdlib | Log em `logs/craftpro.log` | Sem dependencia extra |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | ^0.577.0 | Icones na UI admin | Ja em uso — Clock, Shield, AlertTriangle para countdown |
| sonner | ^2.0.7 | Toast de confirmacao de revogacao | Ja em uso no PedidosCrud |
| shadcn Badge | existente | Indicador de cor (verde/amarelo/vermelho) | Ja em uso no PedidosCrud — mesmo padrao |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| java.net.http.HttpClient | OkHttp, Retrofit | OkHttp e popular mas adiciona dependencia externa ao mod; HttpClient stdlib e suficiente para polling simples |
| java.util.logging FileHandler | Log4j (ja em Minecraft) | Log4j ja esta no classpath via Minecraft/NeoForge e pode ser usado — mas FileHandler stdlib evita conflito de versao |
| Gson (incluida) | Jackson | Jackson nao esta incluso no classpath padrao Minecraft; Gson esta |

**Verificacao de versoes (npm):**
Dependencias do mod sao Java/Gradle, nao npm. No lado site, todas as versoes ja estao no package.json e sao as versoes em uso.

---

## Architecture Patterns

### Recommended Project Structure

```
mod/                          # Projeto Java separado (diretorio na raiz do repo)
├── build.gradle
├── gradle.properties         # mod_id, mod_version, neo_version, etc.
├── settings.gradle
├── src/main/java/
│   └── com/craftprobrasil/craftpro/
│       ├── CraftProMod.java         # @Mod entrypoint
│       ├── config/
│       │   └── CraftProConfig.java  # TOML config (api_url, api_key, poll_interval)
│       ├── delivery/
│       │   ├── PendingDelivery.java # POJO para resposta da API
│       │   ├── ActiveBenefit.java   # POJO para benefits.json
│       │   ├── DeliveryQueue.java   # Fila em memoria (player offline)
│       │   └── BenefitManager.java  # Load/save benefits.json, expiracao
│       ├── api/
│       │   └── SiteApiClient.java   # HttpClient wrapper — pending, confirm, expired, revoke
│       ├── scheduler/
│       │   └── TickScheduler.java   # ServerTickEvent.Post — contador para 30s poll e 60s check
│       └── command/
│           └── CraftProCommand.java # /craftpro status | reload
└── src/main/resources/
    └── META-INF/
        └── neoforge.mods.toml

src/
├── app/
│   ├── api/
│   │   └── deliveries/
│   │       ├── pending/route.ts     # GET — retorna orders 'paid'
│   │       ├── confirm/route.ts     # POST — atualiza para 'delivered' + expiresAt
│   │       ├── expired/route.ts     # POST — atualiza para 'expired'
│   │       └── revoke/route.ts      # POST — marca como revoked + notifica mod (fire-and-forget)
│   └── (admin)/admin/
│       ├── beneficios/
│       │   ├── page.tsx             # Server Component — carrega dados
│       │   └── BeneficiosCrud.tsx   # Client Component — tabela + countdown + revogar
│       └── vendas/
│           ├── page.tsx
│           └── VendasCrud.tsx
└── lib/
    ├── admin/
    │   ├── actions/
    │   │   ├── beneficios.ts        # getBeneficios, revogarBeneficio
    │   │   └── vendas.ts            # getVendas
    │   └── permissions.ts           # adicionar 'beneficios' | 'vendas' ao AdminSection type
    └── db/
        └── schema.ts                # adicionar expiresAt, deliveredAt em orders
```

### Pattern 1: NeoForge ServerTickEvent para Polling

**What:** Usar `ServerTickEvent.Post` + contador de ticks para executar codigo periodicamente sem thread separada.
**When to use:** Qualquer operacao periodica no servidor Minecraft.

```java
// Source: NeoForge JavaDocs — net.neoforged.neoforge.event.tick.ServerTickEvent
@SubscribeEvent
public static void onServerTick(ServerTickEvent.Post event) {
    pollTickCounter++;
    expiryTickCounter++;

    // 20 ticks/sec * 30 sec = 600 ticks para polling
    if (pollTickCounter >= 600) {
        pollTickCounter = 0;
        CompletableFuture.runAsync(() -> DeliveryScheduler.pollAndDeliver(event.getServer()));
    }

    // 20 ticks/sec * 60 sec = 1200 ticks para verificacao de expirados
    if (expiryTickCounter >= 1200) {
        expiryTickCounter = 0;
        BenefitManager.checkExpirations(event.getServer());
    }
}
```

**Importante:** Chamadas HTTP NUNCA devem bloquear o tick do servidor. Usar `CompletableFuture.runAsync()` para executar em thread separada.

### Pattern 2: Executar Comando Minecraft do Mod

**What:** Usar `CommandSourceStack` do servidor para executar comandos `/ftbranks add` e `/ftbranks remove`.
**When to use:** Quando o mod precisa acionar um comando de outro mod (FTB Ranks).

```java
// Source: NeoForge API — MinecraftServer.getCommands()
MinecraftServer server = event.getServer();
CommandSourceStack source = server.createCommandSourceStack();
server.getCommands().performPrefixedCommand(source, "ftbranks add " + playerName + " " + rankName);
```

**Nota:** `/ftbranks` aceita nome do jogador (string), nao UUID. O mod precisa ter o nome do jogador disponivel (vem do endpoint pending junto com o UUID).

### Pattern 3: Detectar Player Online no Servidor

**What:** Verificar se um jogador esta online antes de tentar entrega.
**When to use:** D-03 — so entrega quando jogador esta online.

```java
// Verificar se player esta online pelo nome de usuario Minecraft
ServerPlayer onlinePlayer = server.getPlayerList().getPlayerByName(playerName);
if (onlinePlayer != null) {
    // Jogador esta online — pode entregar
    executeDelivery(server, orderId, playerName, rankName);
} else {
    // Mantém na fila local — tenta no proximo poll
}
```

### Pattern 4: API Route com Bearer Token (Site)

**What:** Autenticar requests do mod via header `Authorization: Bearer {MOD_API_KEY}`.
**When to use:** Todos os 4 endpoints `/api/deliveries/*`.

```typescript
// Padrao identico ao usado em /api/cron/process-orders
function verifyModApiKey(req: Request): boolean {
  const authHeader = req.headers.get('authorization')
  const modApiKey = process.env.MOD_API_KEY
  if (!modApiKey) return false
  return authHeader === `Bearer ${modApiKey}`
}

export async function GET(req: Request) {
  if (!verifyModApiKey(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ...
}
```

### Pattern 5: Schema Extension — orders table

**What:** Adicionar `expiresAt` e `deliveredAt` ao schema existente de `orders`.
**When to use:** Necessario para o dashboard de beneficios mostrar countdown.

```typescript
// Adicionar ao objeto orders em src/lib/db/schema.ts
deliveredAt: timestamp("delivered_at", { mode: "date" }),   // setado em /api/deliveries/confirm
expiresAt: timestamp("expires_at", { mode: "date" }),       // setado em /api/deliveries/confirm (deliveredAt + duration dias)
revokedAt: timestamp("revoked_at", { mode: "date" }),       // setado em /api/deliveries/revoke
```

Status adicional: `'revoked'` — adicionado ao fluxo do campo `status` existente.

### Pattern 6: AdminSection Type Extension

**What:** Adicionar `'beneficios'` e `'vendas'` ao union type `AdminSection`.
**When to use:** Necessario para controle granular de permissoes.

```typescript
// src/lib/admin/permissions.ts — linha 5
export type AdminSection =
  'itens-banidos' | 'servidores' | 'loja' | 'leaderboard' |
  'licencas' | 'permissoes' | 'pedidos' | 'beneficios' | 'vendas'
```

Tambem atualizar no `AdminSidebar.tsx` (array `navItems`) e no `AdminLayout` (hardcoded sections para superAdmin).

### Pattern 7: Countdown Visual no Cliente

**What:** Calcular dias restantes no servidor e passar como numero para o componente — sem `Date.now()` no render para evitar hydration mismatch.
**When to use:** /admin/beneficios coluna "Expira em".

```typescript
// Calcular no Server Component (page.tsx) antes de passar para o Client Component
function getDaysRemaining(expiresAt: Date): number {
  const diffMs = expiresAt.getTime() - Date.now()
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
}

function getCountdownColor(days: number): 'green' | 'yellow' | 'red' {
  if (days > 14) return 'green'
  if (days >= 7) return 'yellow'
  return 'red'
}
```

### Anti-Patterns to Avoid

- **Chamadas HTTP bloqueando o tick:** Nunca `httpClient.send()` sincrono dentro de `ServerTickEvent`. Sempre `CompletableFuture.runAsync()`.
- **Confirmar entrega antes de executar o comando:** O mod so chama `/api/deliveries/confirm` DEPOIS de executar `/ftbranks add` com sucesso.
- **Date.now() em Server Component passado para Client Component sem serializar:** Calcular `daysRemaining` como numero no server, nao como Date — evita hydration mismatch.
- **Usar `Thread.sleep()` no mod:** Nunca sleep na thread do game loop. Usar tick counter ou CompletableFuture.
- **Reutilizar `orders.status = 'delivering'` para o novo fluxo:** O mod lida com `'paid'` diretamente. O status `'delivering'` e legado do RCON worker e deve ser removido do fluxo.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Countdown timer persistente no cliente | JavaScript setInterval com `Date.now()` | Calcular `daysRemaining` no server e renderizar estatico | SSR nao tem `setInterval`; hidration mismatch; countdown nao precisa ser real-time — revalida na proxima navegacao |
| HTTP client no mod | OkHttp custom | `java.net.http.HttpClient` (Java 21 stdlib) | Disponivel no JDK sem adicionar JAR ao mod |
| JSON serialize/deserialize no mod | Parser manual | Gson (ja no classpath Minecraft) | Gson esta disponivel como transitive dependency do NeoForge |
| Verificar se player esta online | Armazenar estado manual | `server.getPlayerList().getPlayerByName()` | API nativa do Minecraft |
| Executar comandos de outros mods | Reflection/hooks | `server.getCommands().performPrefixedCommand()` | API publica do NeoForge para executar comandos console |
| Agendador de tarefas periodicas | Thread separada com `Thread.sleep()` | ServerTickEvent.Post + contador de ticks | Thread separada pode causar crash em operacoes nao thread-safe do Minecraft |

**Key insight:** O NeoForge fornece todas as APIs necessarias para interacao com o servidor sem bibliotecas externas. O Java 21 stdlib tem HTTP client completo. Adicionar dependencias externas em mods aumenta risco de conflito com outras mods no modpack AllTheMods.

---

## Runtime State Inventory

> Esta fase remove o sistema RCON e adiciona o mod como substituto. Avaliar estado em runtime.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | Tabela `orders` — pedidos existentes com status 'delivering' ou 'failed' que o cron RCON tentava processar | Decidir tratamento: reset para 'paid' para o mod pegar, ou deixar como 'failed' com nota no admin. Recomendar: nao migrar automaticamente — admin pode forcar manualmente via /admin/pedidos |
| Live service config | Vercel Cron Job para `/api/cron/process-orders` — configurado em vercel.json ou Vercel Dashboard | Remover o cron job da configuracao Vercel ao deletar a rota |
| OS-registered state | Nenhum — mod roda no servidor de jogo, nao no Vercel; servidor de jogo nao tem estado registrado no OS para este feature | None |
| Secrets/env vars | `RCON_HOST`, `RCON_PORT`, `RCON_PASSWORD`, `CRON_SECRET` em Vercel env vars — deixam de ser necessarias; adicionar `MOD_API_KEY` | Adicionar `MOD_API_KEY` no Vercel; remover vars RCON opcionalmente (nao quebra se ficar) |
| Build artifacts | `rcon-client` em node_modules apos `npm uninstall` — `package-lock.json` atualiza automaticamente | `npm uninstall rcon-client` remove o pacote; sem acao manual adicional |

**Verificar antes de deletar o cron:** Checar `vercel.json` na raiz — se existir com configuracao de cron, remover a entrada. Verificar tambem Vercel Dashboard > Settings > Cron Jobs.

---

## Common Pitfalls

### Pitfall 1: Chamada HTTP sincrona bloqueando o tick do servidor

**What goes wrong:** O game loop do Minecraft roda em thread unica a 20 TPS. Qualquer operacao I/O sincrona (HTTP, disk read) dentro de `ServerTickEvent` causa lag ou timeout.
**Why it happens:** Desenvolvedores novos em NeoForge tratam eventos como handlers normais sem considerar threading.
**How to avoid:** Sempre `CompletableFuture.runAsync()` para chamadas HTTP. Resultado processado com `.thenAccept()` que agenda a entrega para o proximo tick seguro usando a thread do servidor.
**Warning signs:** TPS do servidor cai para menos de 20 durante o intervalo de polling.

### Pitfall 2: Confirmar entrega antes do comando executar

**What goes wrong:** Mod chama `POST /api/deliveries/confirm` mas `/ftbranks add` falhou silenciosamente — jogador nao recebe o rank mas banco marca como 'delivered'.
**Why it happens:** Logica de confirmacao fora de ordem.
**How to avoid:** Estrutura obrigatoria: (1) executar `/ftbranks add`, (2) verificar ausencia de excecao, (3) so entao chamar `confirm`. Em caso de falha, manter na fila local para nova tentativa.
**Warning signs:** Jogador reclama de nao ter recebido rank, mas admin ve status 'delivered' no dashboard.

### Pitfall 3: Race condition entre polling e expiracoes concorrentes

**What goes wrong:** TickScheduler dispara polling e verificacao de expiracao ao mesmo tempo (ticks diferentes mas proximos). Dois `CompletableFuture.runAsync()` concorrentes modificam o mesmo `benefits.json`.
**Why it happens:** CompletableFuture usa thread pool compartilhado; acesso concorrente ao arquivo JSON sem sincronizacao.
**How to avoid:** Usar `synchronized` no `BenefitManager` ou serializar acesso ao arquivo com um `ReentrantLock`. Alternativa simples: usar `synchronized` em todos os metodos de BenefitManager que lem/escrevem o JSON.
**Warning signs:** `JsonSyntaxException` ou arquivo `benefits.json` corrompido.

### Pitfall 4: Status 'delivering' legado do RCON conflitando com novo fluxo

**What goes wrong:** Ao remover o cron RCON, pedidos com status 'delivering' ficam presos — nenhum worker processa mais. O mod so busca status 'paid'.
**Why it happens:** Transicao de sistema sem migrar dados.
**How to avoid:** No momento da remocao do RCON, executar update SQL: pedidos `delivering` viram `paid` (mod vai pegar) ou `failed` (admin decide). Documenter na task de remocao.
**Warning signs:** Pedidos presos em 'delivering' para sempre, sem nenhum sistema processando.

### Pitfall 5: Hydration mismatch no countdown

**What goes wrong:** Componente Client Component calcula `Date.now()` no render inicial (SSR) e depois no cliente — valores diferentes causam erro de hydration.
**Why it happens:** `Date.now()` retorna valores diferentes no servidor e no cliente.
**How to avoid:** Calcular `daysRemaining: number` no Server Component (page.tsx) e passar como prop serializada para o Client Component. O Client Component recebe o numero e exibe — nao faz calculo de data.
**Warning signs:** Warning de hydration no console: "Text content did not match".

### Pitfall 6: FTB Ranks usa nome do jogador, nao UUID

**What goes wrong:** Mod tenta `/ftbranks add <uuid> <rank>` com UUID — FTB Ranks nao aceita UUID.
**Why it happens:** Confusao com LuckPerms que aceita UUID.
**How to avoid:** Endpoint `GET /api/deliveries/pending` deve retornar `minecraftName` (nome atual) alem do `minecraftUuid`. O mod usa o nome para o comando FTB Ranks. Confirmar que `orders` joina `users` e retorna `minecraftName`.
**Warning signs:** Comando `/ftbranks add` retorna erro de "jogador nao encontrado".

---

## Code Examples

Verified patterns from existing codebase and official docs:

### Endpoint GET /api/deliveries/pending (site)

```typescript
// Padrao de auth via Bearer token — identico ao /api/cron/process-orders existente
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders, shopItems, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(req: Request) {
  const modApiKey = process.env.MOD_API_KEY
  if (!modApiKey || req.headers.get('authorization') !== `Bearer ${modApiKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const pendingOrders = await db
    .select({
      orderId: orders.id,
      minecraftUuid: orders.minecraftUuid,
      minecraftName: users.minecraftName,   // FTB Ranks precisa do nome
      itemName: shopItems.name,
      itemType: shopItems.type,
      itemDuration: shopItems.duration,
      amountCents: orders.amountCents,
    })
    .from(orders)
    .leftJoin(shopItems, eq(orders.shopItemId, shopItems.id))
    .leftJoin(users, eq(orders.userId, users.id))
    .where(eq(orders.status, 'paid'))

  return NextResponse.json({ orders: pendingOrders })
}
```

### Schema Migration — orders table (site)

```typescript
// Adicionar ao objeto orders em src/lib/db/schema.ts
// Novos campos para suporte ao mod de delivery
deliveredAt: timestamp("delivered_at", { mode: "date" }),
expiresAt: timestamp("expires_at", { mode: "date" }),
revokedAt: timestamp("revoked_at", { mode: "date" }),
// Status adicional: 'revoked' (adicionado ao fluxo existente: pending|paid|delivering|delivered|failed|refunded)
```

### revogarBeneficio Server Action (site)

```typescript
// Padrao identico a forceRetryDelivery em src/lib/admin/actions/orders.ts
export async function revogarBeneficio(orderId: number): Promise<void> {
  const session = await auth()
  if (!(await hasPermission(session, 'beneficios'))) throw new Error('Forbidden')

  // Atualizar DB
  await db.update(orders).set({
    status: 'revoked',
    revokedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(orders.id, orderId))

  // Notificar mod (fire-and-forget — nao bloquear se mod estiver offline)
  const [order] = await db.select({ minecraftUuid: orders.minecraftUuid, itemName: shopItems.name })
    .from(orders).leftJoin(shopItems, eq(orders.shopItemId, shopItems.id))
    .where(eq(orders.id, orderId)).limit(1)

  fetch(`${process.env.MOD_API_REVOKE_URL ?? ''}`, { /* ... */ }).catch(() => {})

  await logAudit(session!, 'REVOKE_BENEFIT', String(orderId))
  revalidatePath('/admin/beneficios')
}
```

**Nota:** O endpoint `/api/deliveries/revoke` e um endpoint NO SITE que o admin aciona — o mod faz polling periodico e quando ve um pedido com status 'revoked' pode executar o `/ftbranks remove`. Alternativamente, o site pode ter um endpoint separado que o mod consulta para revogacoes pendentes (mais simples que push). Ver Open Questions abaixo.

### NeoForge build.gradle (mod)

```gradle
// Source: https://github.com/NeoForgeMDKs/MDK-1.21.1-NeoGradle
plugins {
    id 'java-library'
    id 'net.neoforged.gradle.userdev' version '7.1.21'
}

java {
    toolchain { languageVersion = JavaLanguageVersion.of(21) }
}

dependencies {
    implementation "net.neoforged:neoforge:${neo_version}"
    // Gson e inclusa transitivamente — nao precisa declarar
}
```

### NeoForge @Mod entrypoint (mod)

```java
// Source: NeoForged docs — https://docs.neoforged.net/docs/1.21.1/gettingstarted/
@Mod("craftpro")
public class CraftProMod {
    public static final Logger LOGGER = LogManager.getLogger("craftpro");

    public CraftProMod(IEventBus modEventBus, ModContainer modContainer) {
        NeoForge.EVENT_BUS.register(TickScheduler.class);
        LOGGER.info("CraftPro mod inicializado.");
    }
}
```

### FTB Ranks comandos verificados (mod)

```java
// Source: https://docs.feed-the-beast.com/mod-docs/mods/suite/Ranks/Commands/
// Adicionar rank ao jogador:
server.getCommands().performPrefixedCommand(source, "ftbranks add " + playerName + " " + rankSlug);

// Remover rank do jogador:
server.getCommands().performPrefixedCommand(source, "ftbranks remove " + playerName + " " + rankSlug);
```

### BenefitManager — load/save JSON (mod)

```java
// Gson para serializar/deserializar benefits.json
// Gson esta no classpath do NeoForge como transitive dependency
private static final Gson GSON = new GsonBuilder().setPrettyPrinting().create();
private static final Path BENEFITS_FILE = FMLPaths.CONFIGDIR.get().resolve("craftpro/benefits.json");

public static synchronized void saveBenefits(List<ActiveBenefit> benefits) throws IOException {
    Files.createDirectories(BENEFITS_FILE.getParent());
    Files.writeString(BENEFITS_FILE, GSON.toJson(benefits));
}

public static synchronized List<ActiveBenefit> loadBenefits() {
    if (!Files.exists(BENEFITS_FILE)) return new ArrayList<>();
    try {
        String json = Files.readString(BENEFITS_FILE);
        Type listType = new TypeToken<List<ActiveBenefit>>(){}.getType();
        return GSON.fromJson(json, listType);
    } catch (IOException | JsonSyntaxException e) {
        LOGGER.error("Falha ao carregar benefits.json: " + e.getMessage());
        return new ArrayList<>();
    }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| LuckPerms para ranks | FTB Ranks (especifico do AllTheMods V6) | Decisao do servidor | Comandos sao `/ftbranks add/remove`, nao `/lp user parent addtemp` |
| RCON para entrega (site → servidor) | Mod fazendo polling (servidor → site) | Esta fase | Site nao precisa mais de acesso de rede ao servidor; firewall do servidor nao precisa expor porta RCON |
| Cron worker Vercel (serverless) | Mod sempre-em-execucao no servidor | Esta fase | Sem limitacoes de frequencia de Vercel Hobby; polling a cada 30s e totalmente viavel |
| LuckPerms addtemp (TTL gerenciado pelo LP) | FTB Ranks + timer proprio no mod | Esta fase | Mod controla expiracao — beneficio expira mesmo se LP nao gerenciar TTL |

**Deprecated/outdated:**
- `rcon-client@4.2.5`: removido do package.json
- `src/lib/rcon/client.ts` e `src/lib/rcon/commands.ts`: deletados
- `/api/cron/process-orders/route.ts`: deletado
- Status `'delivering'` no fluxo de orders: legado do RCON, migrar pedidos presos

---

## Open Questions

1. **Mecanismo de revogacao push vs pull**
   - What we know: D-16 diz que admin clica "revogar" no site e site "notifica o mod para remover o rank via endpoint `/api/deliveries/revoke`". Porem o mod nao tem IP/porta exposta — o site nao pode fazer push para o mod.
   - What's unclear: Como o site "notifica" o mod? O mod e servidor de jogo sem endpoint HTTP publico.
   - Recommendation: Usar modelo pull — adicionar campo `status = 'revoked'` na orders table. Endpoint `GET /api/deliveries/pending` retorna tanto 'paid' quanto 'revoked' (ou criar `GET /api/deliveries/revocations` separado). Mod faz polling e executa `/ftbranks remove` quando ve revogado. Confirma via `POST /api/deliveries/expired`. Isso e consistente com o modelo de polling ja adotado.

2. **Nome do jogador vs UUID no endpoint pending**
   - What we know: FTB Ranks aceita nome do jogador (verificado na doc). Schema de `orders` salva `minecraftUuid` mas nao `minecraftName` separado.
   - What's unclear: O `minecraftName` pode mudar? Jogadores podem trocar nick no Minecraft.
   - Recommendation: Endpoint `GET /api/deliveries/pending` deve fazer JOIN com `users` e retornar `minecraftName`. O mod usa o nome para o comando FTB Ranks. Para expiracao, o JSON local salva o nome no momento da entrega — se o nick mudar, o remove pode falhar; mas isso e edge case raro.

3. **Tratamento de pedidos 'delivering' legados no momento da remocao RCON**
   - What we know: Pedidos com status 'delivering' foram criados pelo RCON worker (webhook mudava para 'delivering' antes de remover esse comportamento).
   - What's unclear: Quantos pedidos podem estar em 'delivering' no momento do deploy.
   - Recommendation: Task de remocao RCON deve incluir SQL migration: `UPDATE orders SET status = 'paid' WHERE status = 'delivering'` — assim o mod pega esses pedidos no proximo poll. Documentar isso no plano.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js / npm | Site build e tests | Verificado (projeto em execucao) | — | — |
| Neon DB (PostgreSQL) | Schema migration | Verificado (deploy existente) | — | — |
| Java 21 JDK | Compilar o mod | Nao verificado neste ambiente WSL | — | Desenvolvedor instala localmente |
| Gradle | Build do mod | Nao verificado | — | Gradle wrapper (gradlew) incluido no MDK |
| AllTheMods V6 server | Testar o mod | Servidor de jogo do operador | — | Sem fallback — mod so pode ser testado no servidor real ou copia local |
| FTB Ranks mod | Comandos /ftbranks | Assumido presente no AllTheMods V6 | — | Sem fallback — fase depende do FTB Ranks estar instalado |

**Missing dependencies with no fallback:**
- Java 21 JDK: necessario para compilar o mod. O desenvolvedor precisa ter instalado localmente (nao verificavel neste ambiente WSL).
- AllTheMods V6 + FTB Ranks: mod so pode ser testado no servidor real. Nao ha fallback para testes de integracao.

**Missing dependencies with fallback:**
- Nenhum — dependencias do site (Node, Neon) ja verificadas em fases anteriores.

---

## Validation Architecture

> nyquist_validation: true (config.json)

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 + jsdom |
| Config file | vitest.config.ts (raiz) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MOD-01 | GET /api/deliveries/pending retorna orders 'paid' e valida Bearer token | unit | `npx vitest run tests/deliveries-pending.test.ts -x` | Wave 0 |
| MOD-01 | POST /api/deliveries/confirm atualiza status para 'delivered' e seta expiresAt | unit | `npx vitest run tests/deliveries-confirm.test.ts -x` | Wave 0 |
| MOD-02 | POST /api/deliveries/expired atualiza status para 'expired' | unit | `npx vitest run tests/deliveries-expired.test.ts -x` | Wave 0 |
| MOD-03 | revogarBeneficio Server Action verifica permissao 'beneficios' e atualiza status | unit | `npx vitest run tests/admin-actions.test.ts -x` | Parcial (adicionar describe) |
| MOD-04 | getBeneficios retorna apenas ordens com expiresAt preenchido (beneficios ativos) | unit | `npx vitest run tests/admin-queries.test.ts -x` | Parcial (adicionar describe) |
| MOD-04 | getVendas retorna todas as ordens com filtro por status e datas | unit | `npx vitest run tests/admin-queries.test.ts -x` | Parcial (adicionar describe) |

**Nota:** O mod Java em si nao tem testes automatizados neste projeto (nao ha setup de JUnit). Testes do mod sao manuais (deploy no servidor de jogo). Os testes acima cobrem apenas o lado do site.

### Sampling Rate

- **Per task commit:** `npx vitest run tests/deliveries-pending.test.ts tests/deliveries-confirm.test.ts tests/deliveries-expired.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green antes de `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/deliveries-pending.test.ts` — cobre GET /api/deliveries/pending (auth + query)
- [ ] `tests/deliveries-confirm.test.ts` — cobre POST /api/deliveries/confirm (status update + expiresAt)
- [ ] `tests/deliveries-expired.test.ts` — cobre POST /api/deliveries/expired (status update)
- [ ] Adicionar `describe('getBeneficios')` em `tests/admin-queries.test.ts`
- [ ] Adicionar `describe('getVendas')` em `tests/admin-queries.test.ts`
- [ ] Adicionar `describe('revogarBeneficio')` em `tests/admin-actions.test.ts`

---

## Sources

### Primary (HIGH confidence)
- [FTB Ranks Commands docs](https://docs.feed-the-beast.com/mod-docs/mods/suite/Ranks/Commands/) — sintaxe `/ftbranks add`, `/ftbranks remove` confirmada
- [NeoForgeMDKs/MDK-1.21.1-NeoGradle](https://github.com/NeoForgeMDKs/MDK-1.21.1-NeoGradle) — build.gradle, gradle.properties, Java 21 toolchain
- [NeoForge JavaDocs 1.21.x — net.neoforged.neoforge.event.tick](https://nekoyue.github.io/ForgeJavaDocs-NG/javadoc/1.21.x-neoforge/net/neoforged/neoforge/event/tick/package-summary.html) — ServerTickEvent.Post/Pre
- Codebase existente — `src/lib/admin/permissions.ts`, `src/lib/admin/actions/orders.ts`, `src/app/(admin)/admin/pedidos/PedidosCrud.tsx`, `src/lib/db/schema.ts`

### Secondary (MEDIUM confidence)
- [NeoForged docs — Getting Started 1.21.1](https://docs.neoforged.net/docs/1.21.1/gettingstarted/) — @Mod annotation, IEventBus, estrutura de pacotes
- [NeoForged docs — Events](https://docs.neoforged.net/docs/concepts/events/) — @SubscribeEvent, NeoForge.EVENT_BUS
- [ServerStartingEvent JavaDocs](https://nekoyue.github.io/ForgeJavaDocs-NG/javadoc/1.21.x-neoforge/net/neoforged/neoforge/event/server/ServerStartingEvent.html) — lifecycle events

### Tertiary (LOW confidence)
- Gson disponivel no classpath do Minecraft/NeoForge — assumido por convencao da comunidade modding; nao verificado diretamente em lista de dependencias do NeoForge MDK

---

## Metadata

**Confidence breakdown:**
- Standard Stack (site): HIGH — todas as libs ja em uso no projeto
- Standard Stack (mod Java): MEDIUM — MDK oficial verificado, Gson disponibilidade assumida por convencao
- Architecture (site): HIGH — clona diretamente padroes existentes em /admin/pedidos
- Architecture (mod Java): MEDIUM — ServerTickEvent verificado em JavaDocs; threading pattern (CompletableFuture) e pratica padrao Java, nao especifica do NeoForge
- FTB Ranks sintaxe: HIGH — verificado na documentacao oficial
- Pitfalls: HIGH — baseados em analise do codigo existente e conhecimento de threading Minecraft

**Research date:** 2026-03-27
**Valid until:** 2026-04-27 (NeoForge 1.21.1 e estavel; FTB Ranks docs nao devem mudar)
