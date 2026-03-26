# Phase 5: Loja Funcional - Research

**Researched:** 2026-03-26
**Domain:** MercadoPago Checkout Pro + RCON delivery queue + LuckPerms + Drizzle schema migration
**Confidence:** HIGH (locked decisions pre-researched in STACK.md/ARCHITECTURE.md/PITFALLS.md; code audit complete)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Tipos de Produto**
- D-01: Três tipos de produto: Ranks temporários (VIP 30d, etc.), Keys para caixas, Cosméticos (titles, tags)
- D-02: Duração única por item — cada variante é um item separado (ex: VIP 30d = R$29,90, VIP 60d = R$49,90 são itens distintos na tabela)
- D-03: Comando RCON automático por tipo — sistema gera o comando baseado no tipo do produto (rank → LuckPerms `lp user {player} parent addtemp`, key → `give {player}`, cosmético → comando específico). Admin NÃO escreve comandos manuais
- D-04: Tabela `shopItems` existente precisa de migração: adicionar campos `price` (integer, centavos), `type` (rank/key/cosmetic), `rconTemplate` (template do comando), `duration` (nullable, para ranks temporários), `active` (boolean)

**Fluxo de Compra**
- D-05: Jogador precisa estar logado (Discord) E ter Minecraft UUID vinculado. Sem vínculo = mensagem pedindo contato com admin no Discord
- D-06: Fluxo: /loja → escolher item → "Comprar" → redirect MercadoPago Checkout Pro → paga Pix → retorna a /loja/pedido/[id] com status em tempo real
- D-07: Página de status do pedido /loja/pedido/[id] com estados: Aguardando pagamento → Pago → Entregando → Entregue (ou Falhou)
- D-08: Histórico de compras em /loja/meus-pedidos — lista todos os pedidos do jogador com status de cada um

**Entrega RCON**
- D-09: Fila de entrega no banco com retry automático — pedido fica na fila, cron tenta entregar a cada 1-5 minutos até conseguir (máx 48h, depois marca como falha permanente)
- D-10: Cron externo (cron-job.org) dispara o endpoint `/api/cron/process-orders` a cada 1-5 minutos — Vercel Hobby plan não suporta cron com essa frequência
- D-11: Webhook MercadoPago NUNCA chama RCON diretamente — escreve na fila e retorna 200 imediatamente
- D-12: Idempotência via UNIQUE constraint no `mercadopago_payment_id` na tabela de orders
- D-13: Validação HMAC-SHA256 do header `x-signature` antes de qualquer escrita no banco

**Admin de Pedidos**
- D-14: /admin/pedidos com tabela completa de todos os pedidos, filtrável por status (pendente/pago/entregue/falhou)
- D-15: Botão de retry manual para pedidos com entrega falhada
- D-16: Reembolso feito SOMENTE no painel MercadoPago — admin site só gerencia entregas, não lida com dinheiro
- D-17: Todas as ações de admin logadas no audit_log existente

### Claude's Discretion
- Design exato das páginas da loja (cards de produto, layout de categoria)
- Skeleton/loading states nas páginas de pedido
- Paginação e ordenação da tabela de pedidos no admin
- Formato exato do template RCON por tipo de produto
- Verificação de entrega (confirmar que LuckPerms aplicou o rank)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SHOP-01 | Jogador pode navegar a loja e ver itens disponíveis (ranks, cosméticos, itens in-game, keys) com preços em BRL | schema migration (price field) + /loja page overhaul |
| SHOP-02 | Jogador pode comprar item via Pix (MercadoPago Checkout Pro) e ver QR code/código para pagamento | MercadoPago Preference API → redirect URL; /loja/pedido/[id] polling |
| SHOP-03 | Após pagamento confirmado, rank/item é entregue automaticamente no servidor via RCON + LuckPerms | Webhook → deliveryQueue insert → cron worker → rcon-client.send() |
| SHOP-04 | Jogador pode acompanhar status do pedido (pendente/entregue/falhou) em /loja/pedido/[id] | orders table status column + periodic polling or refresh |
| SHOP-05 | Sistema de fila de entrega com retry automático quando servidor estava offline no momento da compra | deliveryQueue table + cron-job.org trigger + retry_count + max 48h window |
| SHOP-06 | Webhook MercadoPago valida assinatura HMAC e garante idempotência (sem entrega duplicada) | x-signature HMAC-SHA256 validation + UNIQUE(mpPaymentId) in orders |
| SHOP-07 | Admin pode ver todos os pedidos em /admin/pedidos, filtrar por status, e forçar retry manual | /admin/pedidos page + Server Action forceRetry() + audit log |
</phase_requirements>

---

## Summary

Phase 5 builds the functional store for CraftPro Brasil from end to end: schema migration, product catalog with pricing, MercadoPago Checkout Pro payment flow, delivery queue with RCON, and admin order management. The phase is almost entirely additive — no existing routes are deleted, only extended.

The milestone-level research (STACK.md, ARCHITECTURE.md, PITFALLS.md) already covered the core technical domains thoroughly. This phase-level research focuses on three things the milestone research left unresolved: (1) the exact schema delta between what exists today vs. what must exist, (2) the specific Checkout Pro flow (locked in D-06 as redirect-based, not transparent Checkout API), and (3) the precise integration points between existing code and the new features.

Critical insight from code audit: The existing `/loja` page is a pure "Em Breve" preview; the existing `/admin/loja` is a minimal CRUD with no price, type, or RCON fields. Both must be substantially rewritten — not lightly extended. The `AdminSection` type in `permissions.ts` must gain a `'pedidos'` entry. The `AdminSidebar` `navItems` must gain a "Pedidos" entry.

**Primary recommendation:** Build in strict wave order — (1) schema migration, (2) admin/loja extension with new fields, (3) public /loja catalog, (4) checkout flow + webhook, (5) RCON cron worker, (6) /admin/pedidos. Do not attempt to parallelize across waves because each depends on the previous.

---

## Standard Stack

### Core (Phase 5 additions)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `mercadopago` | 2.12.0 | Server-side: create Checkout Pro preference, verify payment status via API re-fetch | Official MercadoPago Node.js SDK; TypeScript types included; ES Module compatible; verified current via npm |
| `rcon-client` | 4.2.5 | TCP RCON connection to Minecraft server; send LuckPerms commands | Most-used Minecraft RCON npm package; async/await; verified current via npm |

### Already in Stack (no install needed)

| Library | Version | Purpose |
|---------|---------|---------|
| `drizzle-orm` | 0.45.x | Schema migration + DB queries |
| `drizzle-kit` | 0.31.x | Generate + apply migrations |
| `@neondatabase/serverless` | 1.0.x | HTTP driver for serverless Neon queries |
| `next-auth` | 5.0.0-beta.30 | Session auth — `auth()` call to get userId + minecraftUuid |
| `sonner` | 2.0.x | Toast notifications (used in existing admin CRUD) |
| shadcn/ui components | existing | Table, Button, Badge, AlertDialog, Sheet — all already installed |

### Installation

```bash
npm install mercadopago rcon-client
```

**Version verification (confirmed 2026-03-26):**
- `mercadopago`: 2.12.0 (npm verified)
- `rcon-client`: 4.2.5 (npm verified)

---

## Architecture Patterns

### Phase 5 Route Structure

```
src/app/
├── (public)/
│   └── loja/
│       ├── page.tsx                  REWRITE — product catalog with prices
│       ├── pedido/
│       │   └── [id]/
│       │       └── page.tsx          NEW — order status page
│       └── meus-pedidos/
│           └── page.tsx              NEW — player order history
├── (admin)/
│   └── admin/
│       ├── loja/
│       │   ├── page.tsx              EXTEND — pass new fields to LojaCrud
│       │   └── LojaCrud.tsx          REWRITE — add price, type, rconTemplate, duration, active fields
│       └── pedidos/
│           ├── page.tsx              NEW — order table + filter by status
│           └── PedidosCrud.tsx       NEW — client component with status filter + retry button
└── api/
    ├── webhooks/
    │   └── mercadopago/
    │       └── route.ts              NEW — POST handler: HMAC verify + queue insert
    └── cron/
        └── process-orders/
            └── route.ts              NEW — GET handler: RCON delivery batch

src/lib/
├── db/
│   └── schema.ts                     EXTEND — add orders, deliveryQueue tables; migrate shopItems
├── admin/
│   ├── permissions.ts                EXTEND — add 'pedidos' to AdminSection type
│   └── actions/
│       ├── shop-items.ts             EXTEND — update/create accept new fields
│       └── orders.ts                 NEW — forceRetryDelivery(), getOrders()
└── shop/
    └── actions.ts                    NEW — createCheckoutPreference(), getOrder()
```

### Pattern 1: Schema Migration (Drizzle)

**What:** `shopItems` gains new columns; two new tables (`orders`, `deliveryQueue`) are added.
**When to use:** Run this as the very first task — all other tasks depend on these tables existing.

```typescript
// schema.ts additions — extend shopItems
export const shopItems = pgTable("shop_items", {
  // ... existing fields unchanged ...
  price: integer("price"),               // centavos BRL, nullable during migration (existing rows)
  type: text("type"),                    // 'rank' | 'key' | 'cosmetic'
  rconTemplate: text("rcon_template"),   // e.g. "lp user {player} parent addtemp {group} {duration}d"
  duration: integer("duration"),         // days, nullable for permanent items
  active: boolean("active").default(true),
})

// NEW: orders table
export const orders = pgTable("orders", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").notNull().references(() => users.id),
  shopItemId: integer("shop_item_id").notNull().references(() => shopItems.id),
  mpPaymentId: text("mp_payment_id").unique(),        // UNIQUE — idempotency key (D-12)
  mpPreferenceId: text("mp_preference_id"),            // MP preference (pre-payment)
  status: text("status").notNull().default("pending"), // pending|paid|delivering|delivered|failed
  amountCentavos: integer("amount_centavos").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  paidAt: timestamp("paid_at", { mode: "date" }),
  deliveredAt: timestamp("delivered_at", { mode: "date" }),
})

// NEW: deliveryQueue table
export const deliveryQueue = pgTable("delivery_queue", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  minecraftUuid: text("minecraft_uuid").notNull(),
  rconCommand: text("rcon_command").notNull(),         // fully resolved command string
  status: text("status").notNull().default("pending"), // pending|delivered|failed
  retryCount: integer("retry_count").notNull().default(0),
  lockedAt: timestamp("locked_at", { mode: "date" }), // prevents concurrent processing
  lastAttemptAt: timestamp("last_attempt_at", { mode: "date" }),
  deliveredAt: timestamp("delivered_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
})
```

Apply migration:
```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

### Pattern 2: MercadoPago Checkout Pro Preference (Server Action)

**What:** Creates a MP preference (not Checkout API — this is redirect-based per D-06), returns the `init_point` URL.
**When to use:** Called when player clicks "Comprar" on a shop item.

```typescript
// src/lib/shop/actions.ts
'use server'
import { MercadoPagoConfig, Preference } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

export async function createCheckoutPreference(shopItemId: number) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')
  if (!session.user.minecraftUuid) throw new Error('NO_MINECRAFT_UUID')

  // Fetch item, validate active + price
  const [item] = await db.select().from(shopItems)
    .where(and(eq(shopItems.id, shopItemId), eq(shopItems.active, true)))
    .limit(1)
  if (!item || !item.price) throw new Error('Item not found')

  // Create order row first (status: pending)
  const [order] = await db.insert(orders).values({
    userId: session.user.id,
    shopItemId: item.id,
    amountCentavos: item.price,
    status: 'pending',
  }).returning()

  // Create MP preference
  const preference = new Preference(client)
  const result = await preference.create({
    body: {
      items: [{
        id: String(item.id),
        title: item.name,
        quantity: 1,
        unit_price: item.price / 100,  // MP expects BRL, not centavos
        currency_id: 'BRL',
      }],
      external_reference: String(order.id),  // our order ID for webhook lookup
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_URL}/loja/pedido/${order.id}`,
        failure: `${process.env.NEXT_PUBLIC_URL}/loja/pedido/${order.id}`,
        pending: `${process.env.NEXT_PUBLIC_URL}/loja/pedido/${order.id}`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.NEXT_PUBLIC_URL}/api/webhooks/mercadopago`,
    }
  })

  // Store preference ID against the order
  await db.update(orders)
    .set({ mpPreferenceId: result.id })
    .where(eq(orders.id, order.id))

  return { orderId: order.id, checkoutUrl: result.init_point! }
}
```

### Pattern 3: MercadoPago Webhook Handler (Route Handler)

**What:** Receives MP payment notifications, validates HMAC, re-fetches payment to confirm status, inserts to deliveryQueue.
**When to use:** All MercadoPago payment events arrive here.

```typescript
// src/app/api/webhooks/mercadopago/route.ts
import crypto from 'crypto'
import { MercadoPagoConfig, Payment } from 'mercadopago'

export async function POST(request: Request) {
  const body = await request.text()
  const xSignature = request.headers.get('x-signature') ?? ''
  const xRequestId = request.headers.get('x-request-id') ?? ''

  // D-13: HMAC-SHA256 validation BEFORE any DB write
  if (!verifyMercadoPagoSignature(body, xSignature, xRequestId)) {
    return new Response('Unauthorized', { status: 401 })
  }

  const event = JSON.parse(body)
  if (event.type === 'payment') {
    await handlePaymentEvent(event.data.id)
  }

  return new Response('OK', { status: 200 })  // always return 200 after signature check
}

async function verifyMercadoPagoSignature(
  body: string,
  xSignature: string,
  requestId: string
): Promise<boolean> {
  // x-signature format: "ts=<timestamp>,v1=<hash>"
  const parts = Object.fromEntries(xSignature.split(',').map(p => p.split('=')))
  const ts = parts['ts']
  const v1 = parts['v1']
  if (!ts || !v1) return false

  const manifest = `id:${JSON.parse(body)?.data?.id};request-id:${requestId};ts:${ts};`
  const expected = crypto
    .createHmac('sha256', process.env.MP_WEBHOOK_SECRET!)
    .update(manifest)
    .digest('hex')
  return crypto.timingSafeEqual(Buffer.from(v1), Buffer.from(expected))
}

async function handlePaymentEvent(paymentId: string) {
  const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })
  const payment = new Payment(client)
  const paymentData = await payment.get({ id: paymentId })  // always re-fetch, never trust webhook body

  if (paymentData.status !== 'approved') return

  const orderId = Number(paymentData.external_reference)

  // D-12: UNIQUE constraint on mpPaymentId handles duplicates automatically
  // If insert fails with unique violation, silently skip (idempotency)
  const [existing] = await db.select().from(orders)
    .where(eq(orders.mpPaymentId, paymentId)).limit(1)
  if (existing) return  // already processed

  await db.transaction(async (tx) => {
    await tx.update(orders)
      .set({ mpPaymentId: paymentId, status: 'paid', paidAt: new Date() })
      .where(eq(orders.id, orderId))

    const [order] = await tx.select({
      id: orders.id,
      shopItemId: orders.shopItemId,
      userId: orders.userId,
    }).from(orders).where(eq(orders.id, orderId)).limit(1)

    const [item] = await tx.select().from(shopItems)
      .where(eq(shopItems.id, order.shopItemId)).limit(1)

    const [user] = await tx.select({ minecraftUuid: users.minecraftUuid, minecraftName: users.minecraftName })
      .from(users).where(eq(users.id, order.userId)).limit(1)

    const rconCommand = resolveRconCommand(item, user.minecraftName!)

    await tx.insert(deliveryQueue).values({
      orderId: order.id,
      minecraftUuid: user.minecraftUuid!,
      rconCommand,
      status: 'pending',
    })
  })
}
```

### Pattern 4: RCON Delivery Cron Worker

**What:** Reads pending deliveryQueue rows, attempts RCON, marks delivered or increments retryCount.
**When to use:** Called by cron-job.org every 1-5 minutes at `/api/cron/process-orders`.

```typescript
// src/app/api/cron/process-orders/route.ts
import { Rcon } from 'rcon-client'

export const maxDuration = 60  // claim full 60s on Vercel Hobby

export async function GET(request: Request) {
  const auth = request.headers.get('Authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  // 48-hour cutoff (D-09: max 48h, then permanent failure)
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000)

  // Mark expired items as failed
  await db.update(deliveryQueue)
    .set({ status: 'failed' })
    .where(and(
      eq(deliveryQueue.status, 'pending'),
      lt(deliveryQueue.createdAt, cutoff)
    ))

  // Lock and fetch up to 5 pending items (Pitfall 7: batch limit)
  const pending = await db.select().from(deliveryQueue)
    .where(and(
      eq(deliveryQueue.status, 'pending'),
      isNull(deliveryQueue.lockedAt)
    ))
    .limit(5)

  // Lock them to prevent concurrent processing
  if (pending.length > 0) {
    await db.update(deliveryQueue)
      .set({ lockedAt: new Date() })
      .where(inArray(deliveryQueue.id, pending.map(p => p.id)))
  }

  let delivered = 0
  let failed = 0

  for (const item of pending) {
    try {
      const rcon = await Rcon.connect({
        host: process.env.MC_RCON_HOST!,
        port: Number(process.env.MC_RCON_PORT ?? 25575),
        password: process.env.MC_RCON_PASSWORD!,
        timeout: 5000,  // 5s timeout (Pitfall 1: don't hang indefinitely)
      })
      await rcon.send(item.rconCommand)
      await rcon.end()

      await db.update(deliveryQueue)
        .set({ status: 'delivered', deliveredAt: new Date(), lockedAt: null })
        .where(eq(deliveryQueue.id, item.id))

      await db.update(orders)
        .set({ status: 'delivered', deliveredAt: new Date() })
        .where(eq(orders.id, item.orderId))

      delivered++
    } catch {
      await db.update(deliveryQueue)
        .set({
          retryCount: sql`${deliveryQueue.retryCount} + 1`,
          lastAttemptAt: new Date(),
          lockedAt: null,  // unlock for next attempt
        })
        .where(eq(deliveryQueue.id, item.id))
      failed++
    }
  }

  return Response.json({ processed: pending.length, delivered, failed })
}
```

`vercel.json` (create if missing — cron-job.org is primary, but this is a fallback):
```json
{
  "crons": [{ "path": "/api/cron/process-orders", "schedule": "0 * * * *" }]
}
```

### Pattern 5: RCON Command Resolution by Product Type

**What:** Resolves the final RCON command string from a shopItem + player name. Admin does not write raw commands (D-03).
**When to use:** Called in the webhook handler when building the deliveryQueue row.

```typescript
// src/lib/shop/rcon.ts
export function resolveRconCommand(
  item: { type: string | null; rconTemplate: string | null; name: string; duration: number | null },
  minecraftName: string
): string {
  // Use admin-provided template if set; otherwise generate from type
  if (item.rconTemplate) {
    return item.rconTemplate
      .replace('{player}', minecraftName)
      .replace('{duration}', String(item.duration ?? 30))
  }

  // Auto-generate by type
  switch (item.type) {
    case 'rank':
      if (item.duration) {
        // LuckPerms temporary group: lp user <player> parent addtemp <group> <duration>d
        const group = item.name.toLowerCase().replace(/\s+/g, '-')
        return `lp user ${minecraftName} parent addtemp ${group} ${item.duration}d`
      } else {
        const group = item.name.toLowerCase().replace(/\s+/g, '-')
        return `lp user ${minecraftName} parent add ${group}`
      }
    case 'key':
      return `give ${minecraftName} minecraft:tripwire_hook 1`  // placeholder — admin configures template
    case 'cosmetic':
      return `lp user ${minecraftName} permission set craftpro.cosmetic.${item.name.toLowerCase().replace(/\s+/g, '-')} true`
    default:
      throw new Error(`Unknown item type: ${item.type}`)
  }
}
```

### Pattern 6: Admin Permissions Extension

**What:** Add 'pedidos' to AdminSection type; add sidebar nav item.
**When to use:** Required before /admin/pedidos can be permission-gated.

```typescript
// src/lib/admin/permissions.ts — extend AdminSection type
export type AdminSection =
  | 'itens-banidos' | 'servidores' | 'loja' | 'leaderboard'
  | 'licencas' | 'permissoes'
  | 'pedidos'  // NEW
```

Admin sidebar `navItems` addition:
```typescript
{ href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart, section: 'pedidos' },
```

`AdminLayout` superAdmin sections array must include `'pedidos'`.

### Anti-Patterns to Avoid

- **RCON in webhook handler:** Webhook must return 200 in milliseconds. Never open TCP in webhook. Always use deliveryQueue.
- **Trust webhook body for payment status:** Always re-fetch from MP API via `payment.get({ id })`. Webhook is only a trigger.
- **No lockedAt on deliveryQueue rows:** Without locking, two concurrent cron invocations process the same row twice, causing double delivery.
- **Using Server Action for the webhook endpoint:** Server Actions require browser CSRF tokens. MercadoPago has none. Use Route Handler.
- **Calling `auth()` inside the webhook route handler:** MP webhooks have no session. The handler is unauthenticated by design — security comes from HMAC.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Payment processing | Custom Pix integration | `mercadopago` SDK + Checkout Pro | Pix keys, QR code generation, webhook retry logic — all handled by MP |
| RCON TCP protocol | Raw `net.Socket` RCON | `rcon-client` | RCON packet framing (length prefix, request ID matching) is tricky; rcon-client handles it |
| HMAC-SHA256 signature | Custom crypto | Node.js built-in `crypto.createHmac('sha256', ...)` | Already available in Node.js — no library needed |
| Delivery queue | Redis/BullMQ | Neon PostgreSQL `deliveryQueue` table | No Redis on Vercel Hobby; Neon already exists; queue volume is tiny |
| Status polling on /loja/pedido/[id] | WebSocket | Simple polling (setInterval + router.refresh()) or Next.js route refresh | Order status changes rarely; polling every 5-10s is sufficient |

**Key insight:** The entire payment-to-delivery pipeline can be built with only two new npm packages (mercadopago + rcon-client) and the existing Neon PostgreSQL infrastructure.

---

## Common Pitfalls

### Pitfall 1: RCON Synchronous in Webhook
**What goes wrong:** RCON TCP call inside webhook handler times out; MercadoPago retries → double delivery.
**How to avoid:** Webhook writes to `deliveryQueue` table, returns 200. Cron reads queue.
**Warning signs:** `rcon-client` import anywhere in `/api/webhooks/`.

### Pitfall 2: Missing HMAC Validation
**What goes wrong:** Anyone who discovers the webhook URL can POST fake approvals → free rank delivery.
**How to avoid:** First two lines of webhook handler: parse x-signature, verify HMAC, return 401 if invalid.
**Warning signs:** No `x-signature` header check before DB writes.

### Pitfall 3: Missing Idempotency (UNIQUE constraint)
**What goes wrong:** MP retries the same webhook 8 times. Without UNIQUE on `mpPaymentId`, order is processed 8 times.
**How to avoid:** `mpPaymentId: text("mp_payment_id").unique()` in schema + early-exit if order already has mpPaymentId set.
**Warning signs:** No UNIQUE constraint on orders table.

### Pitfall 4: No lockedAt on deliveryQueue
**What goes wrong:** cron-job.org fires twice within seconds (network retry). Both executions read the same pending row. Double RCON execution.
**How to avoid:** Lock rows with `lockedAt = now()` before processing; unlock on completion or failure.
**Warning signs:** deliveryQueue table has no `locked_at` column.

### Pitfall 5: Vercel 60-second Function Limit
**What goes wrong:** Cron worker tries to process 50 items at 3s each = 150s → times out mid-delivery, leaving rows in ambiguous locked state.
**How to avoid:** Batch limit of 5 per invocation. `export const maxDuration = 60` in route file. lockedAt prevents retry of in-progress rows.
**Warning signs:** No LIMIT clause on the pending deliveryQueue SELECT.

### Pitfall 6: LuckPerms RCON Silent Failure
**What goes wrong:** LuckPerms returns empty string for both success AND failure. Worker marks as delivered. Player has no rank.
**How to avoid:** After `lp user X parent addtemp`, send follow-up `lp user X group list` and check response contains the group name. (Per Claude's Discretion — implement the verification step.)
**Warning signs:** Delivery marked as successful but player reports missing rank.

### Pitfall 7: Checkout Pro vs Checkout API Confusion
**What goes wrong:** STACK.md recommended Checkout API (transparent); CONTEXT.md locked D-06 as Checkout Pro (redirect). Using the wrong flow creates wrong UX.
**How to avoid:** Use `Preference.create()` and return `result.init_point` for the redirect URL. Do NOT use `Payment.create()` with a Pix QR code — that is Checkout API (transparent).
**Warning signs:** Code uses `Payment.create()` with `payment_method_id: 'pix'` instead of `Preference.create()`.

### Pitfall 8: minecraftUuid not nullable check before purchase
**What goes wrong:** User without linked Minecraft UUID completes checkout. Order is created, payment goes through, delivery fails permanently (no UUID to send RCON to).
**How to avoid:** Check `session.user.minecraftUuid` in `createCheckoutPreference()` Server Action before creating any MP preference. Return a typed error `'NO_MINECRAFT_UUID'` so the UI can show the right message (D-05).
**Warning signs:** `createCheckoutPreference()` proceeds without checking minecraftUuid.

---

## Code Examples

### Creating a Checkout Pro Preference (from official SDK)

```typescript
// Source: https://github.com/mercadopago/sdk-nodejs + official docs
import { MercadoPagoConfig, Preference } from 'mercadopago'

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })
const preference = new Preference(client)

const result = await preference.create({
  body: {
    items: [{ id: '1', title: 'VIP 30d', quantity: 1, unit_price: 29.90, currency_id: 'BRL' }],
    external_reference: 'order-123',
    back_urls: { success: '...', failure: '...', pending: '...' },
    auto_return: 'approved',
    notification_url: 'https://yoursite.com/api/webhooks/mercadopago',
  }
})

// result.init_point = the URL to redirect the user to (Checkout Pro page)
redirect(result.init_point!)
```

### Connecting RCON with rcon-client

```typescript
// Source: https://github.com/janispritzkau/rcon-client
import { Rcon } from 'rcon-client'

const rcon = await Rcon.connect({
  host: process.env.MC_RCON_HOST!,
  port: Number(process.env.MC_RCON_PORT ?? 25575),
  password: process.env.MC_RCON_PASSWORD!,
  timeout: 5000,
})
const response = await rcon.send('lp user PlayerName parent addtemp vip 30d')
await rcon.end()
// response is a string — empty string is common for LP commands even on success
```

### HMAC Signature Verification (x-signature format)

```typescript
// Source: https://www.mercadopago.com.br/developers/en/news/2024/02/27/Ensure-the-validity-of-notifications-sent-by-Mercado-Pago
// x-signature header format: "ts=<timestamp>,v1=<hex_hash>"
// Manifest: "id:<paymentId>;request-id:<x-request-id>;ts:<timestamp>;"
import crypto from 'crypto'

function verifyMercadoPagoSignature(
  paymentId: string,
  xRequestId: string,
  xSignature: string
): boolean {
  const parts = Object.fromEntries(xSignature.split(',').map(p => p.split('=')))
  const ts = parts['ts']
  const v1 = parts['v1']
  if (!ts || !v1) return false
  const manifest = `id:${paymentId};request-id:${xRequestId};ts:${ts};`
  const expected = crypto.createHmac('sha256', process.env.MP_WEBHOOK_SECRET!)
    .update(manifest).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(v1), Buffer.from(expected))
}
```

---

## Existing Code: What Changes vs What Stays

### Files Requiring Significant Changes

| File | Change Type | What Changes |
|------|-------------|--------------|
| `src/lib/db/schema.ts` | EXTEND | Add `orders`, `deliveryQueue` tables; add columns to `shopItems` |
| `src/lib/admin/permissions.ts` | EXTEND | Add `'pedidos'` to `AdminSection` type; add to superAdmin sections in layout |
| `src/app/(admin)/layout.tsx` | EXTEND | Add `'pedidos'` to superAdmin sections array |
| `src/components/admin/AdminSidebar.tsx` | EXTEND | Add "Pedidos" nav item to `navItems` array |
| `src/app/(admin)/admin/loja/LojaCrud.tsx` | REWRITE | ShopItem interface and form must include price, type, rconTemplate, duration, active fields |
| `src/lib/admin/actions/shop-items.ts` | EXTEND | `createShopItem`/`updateShopItem` must accept and persist new fields |
| `src/app/(public)/loja/page.tsx` | REWRITE | Remove "Em Breve" banner; show real items with prices; add "Comprar" button |

### Files That Stay Unchanged

| File | Reason |
|------|--------|
| `src/lib/auth.ts` | Auth session already has `user.minecraftUuid` — no changes needed |
| `src/app/(admin)/admin/page.tsx` | Dashboard stats don't need orders yet |
| Existing admin CRUD components (banned-items, servers, etc.) | Unrelated to Phase 5 |

### Key Type Gap: ShopItem in LojaCrud

The existing `ShopItem` interface in `LojaCrud.tsx` is:
```typescript
interface ShopItem { id: number; name: string; description: string; category: string }
```

This must expand to:
```typescript
interface ShopItem {
  id: number; name: string; description: string; category: string;
  price: number | null; type: string | null; rconTemplate: string | null;
  duration: number | null; active: boolean | null;
}
```

The `ShopItemForm` component referenced in `LojaCrud.tsx` also needs to be updated to include the new fields.

---

## Environment Variables Required

```
# MercadoPago
MP_ACCESS_TOKEN=          # production (or sandbox) access token
MP_WEBHOOK_SECRET=        # webhook signature secret (set in MP dev dashboard)
MP_PUBLIC_KEY=            # optional — only needed if adding browser SDK later

# Minecraft RCON
MC_RCON_HOST=             # server IP or hostname
MC_RCON_PORT=25575        # default RCON port
MC_RCON_PASSWORD=         # RCON password (from server.properties)

# Cron security
CRON_SECRET=              # random secret; sent as Bearer token from cron-job.org

# App URL (for MP back_urls and notification_url)
NEXT_PUBLIC_URL=          # e.g. https://craftprobrasil.com.br
```

**cron-job.org setup:** Create a free job at cron-job.org. Schedule: every 2 minutes. URL: `https://craftprobrasil.com.br/api/cron/process-orders`. Add custom header: `Authorization: Bearer <CRON_SECRET>`.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 + Testing Library |
| Config file | vitest.config.ts (inferred from devDependencies) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SHOP-01 | /loja renders items with prices in BRL | unit | `npx vitest run src/app/(public)/loja/` | ❌ Wave 0 |
| SHOP-02 | createCheckoutPreference returns checkoutUrl | unit (mock MP SDK) | `npx vitest run src/lib/shop/` | ❌ Wave 0 |
| SHOP-03 | resolveRconCommand generates correct LP command by type | unit | `npx vitest run src/lib/shop/rcon.test.ts` | ❌ Wave 0 |
| SHOP-04 | /loja/pedido/[id] renders correct status | unit | `npx vitest run src/app/(public)/loja/pedido/` | ❌ Wave 0 |
| SHOP-05 | Cron worker marks items failed after 48h cutoff | unit (mock DB) | `npx vitest run src/app/api/cron/` | ❌ Wave 0 |
| SHOP-06 | Webhook rejects invalid x-signature with 401 | unit | `npx vitest run src/app/api/webhooks/` | ❌ Wave 0 |
| SHOP-06 | Webhook duplicate payment_id is ignored (idempotency) | unit (mock DB) | `npx vitest run src/app/api/webhooks/` | ❌ Wave 0 |
| SHOP-07 | /admin/pedidos renders order table with status filter | unit | `npx vitest run src/app/(admin)/admin/pedidos/` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose` (affected test file only)
- **Per wave merge:** `npx vitest run` (full suite)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/lib/shop/rcon.test.ts` — covers SHOP-03 (resolveRconCommand logic)
- [ ] `src/app/api/webhooks/mercadopago/route.test.ts` — covers SHOP-06 (HMAC validation, idempotency)
- [ ] `src/app/api/cron/process-orders/route.test.ts` — covers SHOP-05 (48h cutoff, batch limit)
- [ ] `src/lib/shop/actions.test.ts` — covers SHOP-02 (MP preference creation with mocked SDK)

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| MercadoPago SDK v1 (mercadopago@1.x) | SDK v2 (`import { MercadoPagoConfig, Preference }`) | 2023 | v1 API incompatible; use v2 import style |
| Checkout Pro redirect | Same (Checkout Pro is still redirect-based) | N/A | D-06 locks this; not Checkout API |
| Webhook signature: plain secret comparison | HMAC-SHA256 `x-signature` header | Feb 2024 MP announcement | Old integrations using raw secret comparison are now broken |

**Deprecated patterns:**
- `mercadopago.configure({...})` global config call (v1 style): replaced by `new MercadoPagoConfig({ accessToken })` per-client instantiation
- `mercadopago.payment.create(...)` global method (v1 style): replaced by `new Payment(client).create(...)` instance method

---

## Open Questions

1. **cron-job.org configuration**
   - What we know: cron-job.org is free, supports custom HTTP headers, can fire every 1 minute
   - What's unclear: Whether the project operator has a cron-job.org account set up, or will use the Vercel cron fallback
   - Recommendation: Planner adds a Wave 0 task to document cron-job.org setup steps; implementation task adds the vercel.json fallback cron as a backup

2. **MercadoPago sandbox credentials**
   - What we know: STATE.md flags "MercadoPago sandbox historically inconsistent — test end-to-end before building the full flow"
   - What's unclear: Whether sandbox credentials are available in .env.local
   - Recommendation: Planner adds an environment check task in Wave 0; implementation can proceed with mock, but end-to-end test requires sandbox

3. **Vercel outbound IPs + game server firewall**
   - What we know: STATE.md flags "Vercel outbound IP ranges must be whitelisted on game server firewall at port 25575 — unverified"
   - What's unclear: Whether the firewall allows Vercel egress to port 25575
   - Recommendation: RCON delivery task notes this as a prerequisite to verify with the server operator; plan includes a manual verification step before the cron worker goes live

4. **LuckPerms version on the server**
   - What we know: PITFALLS.md documents LuckPerms Issue #2948 — RCON commands silently ignored in builds between 5.3.3 and the fix
   - What's unclear: Which LuckPerms version is running on the CraftPro Brasil server
   - Recommendation: Include a Wave 0 task to verify LP version; if affected version, either upgrade or use follow-up verification query in the delivery worker

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All server code | Yes | 24.14.0 (local WSL) | — |
| `mercadopago` npm package | Payment flow | Not yet installed | 2.12.0 (to install) | — |
| `rcon-client` npm package | Delivery worker | Not yet installed | 4.2.5 (to install) | — |
| Neon PostgreSQL | Schema migration | Yes (existing) | — | — |
| MercadoPago sandbox credentials | End-to-end payment test | Unverified | — | Mock SDK in unit tests |
| Minecraft RCON (MC_RCON_HOST:25575) | Delivery worker | Unverified | — | Unit tests with mock; manual verify with server operator |
| cron-job.org account | Delivery cron | Unverified | — | Vercel cron fallback (once/hour) |

**Missing dependencies with no fallback:**
- MercadoPago `MP_ACCESS_TOKEN` + `MP_WEBHOOK_SECRET` — required for payment flow; plan must include env setup step

**Missing dependencies with fallback:**
- Minecraft RCON access — unit tests use mock; delivery worker can be deployed and tested manually
- cron-job.org — Vercel cron serves as fallback (hourly frequency instead of per-minute)

---

## Sources

### Primary (HIGH confidence)
- `npm view mercadopago version` — 2.12.0 confirmed 2026-03-26
- `npm view rcon-client version` — 4.2.5 confirmed 2026-03-26
- `.planning/research/STACK.md` — milestone-level stack research (HIGH confidence, researched same day)
- `.planning/research/ARCHITECTURE.md` — data flow diagrams, schema design, code patterns
- `.planning/research/PITFALLS.md` — critical failure modes with official source links
- `src/lib/db/schema.ts` — exact current schema (direct code read)
- `src/lib/admin/permissions.ts` — AdminSection type, hasPermission pattern
- `src/components/admin/AdminSidebar.tsx` — navItems array, section gating pattern
- `src/app/(admin)/layout.tsx` — superAdmin sections array, layout guard pattern

### Secondary (MEDIUM confidence)
- MercadoPago x-signature validation docs (Feb 2024): referenced via PITFALLS.md
- rcon-client GitHub README: documented in STACK.md
- LuckPerms command usage (luckperms.net/wiki): documented in ARCHITECTURE.md

### Tertiary (LOW confidence)
- LuckPerms RCON silent failure (Issue #2948): exact affected version range unclear; recommend verifying on the actual server

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — npm versions verified, existing project dependencies audited
- Architecture: HIGH — patterns from ARCHITECTURE.md + direct code read of integration points
- Schema migration: HIGH — existing schema read directly; delta precisely specified
- Pitfalls: HIGH — milestone PITFALLS.md covers all major failure modes with official sources
- RCON command templates: MEDIUM — exact LP command format is correct per luckperms.net; specific cosmetic command depends on what plugins the server uses

**Research date:** 2026-03-26
**Valid until:** 2026-04-26 (30 days — MercadoPago API is stable; rcon-client is pinned version)
