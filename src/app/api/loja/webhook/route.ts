// src/app/api/loja/webhook/route.ts
// MercadoPago payment webhook handler.
// Security requirements (SHOP-06):
//   1. HMAC-SHA256 signature validation on x-signature header before any DB write
//   2. Idempotency via UNIQUE mercadopagoPaymentId — duplicate webhooks are no-ops
// Delivery pattern (D-11, PITFALLS.md):
//   On payment.status = 'approved': set order.status = 'delivering' for cron worker pickup.
//   NEVER call RCON directly from webhook — return 200 fast to prevent MP retry storm.

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders, users } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { createHmac, timingSafeEqual } from 'crypto'

export const runtime = 'nodejs'

// Map MercadoPago payment status to internal order status
const MP_STATUS_MAP: Record<string, string> = {
  approved:   'delivering', // → triggers RCON delivery by cron worker
  rejected:   'failed',
  cancelled:  'failed',
  refunded:   'refunded',
  pending:    'pending',
  in_process: 'pending',
}

/**
 * Validate the MercadoPago x-signature header using HMAC-SHA256.
 * Per MercadoPago docs: signature format is "ts=<timestamp>,v1=<hash>"
 * The signed payload is "id:<paymentId>;request-id:<requestId>;ts:<timestamp>;"
 *
 * @returns true if valid or if MP_WEBHOOK_SECRET not configured (dev mode)
 */
function validateMpSignature(
  req: Request,
  paymentId: string | number,
  requestId: string | null,
  rawBody: string
): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) {
    // In development without secret configured — skip validation but log warning
    console.warn('[webhook] MP_WEBHOOK_SECRET not set — signature validation skipped')
    return true
  }

  const signatureHeader = req.headers.get('x-signature')
  if (!signatureHeader) {
    return false
  }

  // Parse "ts=<timestamp>,v1=<hash>" format
  const parts = Object.fromEntries(
    signatureHeader.split(',').map((part) => {
      const [key, value] = part.split('=', 2)
      return [key.trim(), value?.trim() ?? '']
    })
  )

  const ts = parts['ts']
  const v1 = parts['v1']

  if (!ts || !v1) {
    return false
  }

  // Build the signed string per MP docs:
  // "id:<paymentId>;request-id:<requestId>;ts:<timestamp>;"
  const requestIdPart = requestId ? `request-id:${requestId};` : ''
  const manifest = `id:${paymentId};${requestIdPart}ts:${ts};`

  const expectedHash = createHmac('sha256', secret)
    .update(manifest)
    .digest('hex')

  try {
    return timingSafeEqual(
      Buffer.from(v1, 'hex'),
      Buffer.from(expectedHash, 'hex')
    )
  } catch {
    // Buffer length mismatch — invalid hash format
    return false
  }
}

export async function POST(req: Request) {
  // Read raw body text for signature validation
  const rawBody = await req.text()
  let body: unknown
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { type, data } = body as { type?: string; data?: { id?: string | number } }

  // Only handle payment notifications
  if (type !== 'payment') {
    return NextResponse.json({ received: true, skipped: true })
  }

  const paymentId = data?.id
  if (!paymentId) {
    return NextResponse.json({ error: 'Missing payment id' }, { status: 400 })
  }

  // Extract request-id from headers (used in HMAC signature)
  const requestId = req.headers.get('x-request-id')

  // HMAC signature validation (SHOP-06) — reject forged webhooks before any DB write
  if (!validateMpSignature(req, paymentId, requestId, rawBody)) {
    console.error('[webhook] Invalid x-signature — rejecting request')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const accessToken = process.env.MP_ACCESS_TOKEN
  if (!accessToken) {
    // Return 200 anyway — MercadoPago will keep retrying on non-2xx
    console.error('[webhook] MP_ACCESS_TOKEN not configured')
    return NextResponse.json({ received: true })
  }

  // Idempotency check (SHOP-06) — if this paymentId was already processed, skip
  const existing = await db
    .select({ id: orders.id, status: orders.status })
    .from(orders)
    .where(eq(orders.mercadopagoPaymentId, String(paymentId)))
    .limit(1)

  if (existing.length > 0) {
    // Already processed this payment — return 200 silently (idempotent)
    return NextResponse.json({ received: true, orderId: existing[0].id, idempotent: true })
  }

  // Fetch payment details from MercadoPago to confirm status
  const { MercadoPagoConfig, Payment } = await import('mercadopago')
  const client = new MercadoPagoConfig({ accessToken })
  const payment = new Payment(client)
  const paymentData = await payment.get({ id: paymentId }).catch(() => null)

  if (!paymentData) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
  }

  const orderId = paymentData.external_reference
    ? parseInt(paymentData.external_reference, 10)
    : null

  if (!orderId || isNaN(orderId)) {
    return NextResponse.json({ received: true, note: 'No external_reference' })
  }

  const newStatus = MP_STATUS_MAP[paymentData.status ?? ''] ?? 'pending'

  // If payment approved, snapshot the player's Minecraft UUID for delivery
  let minecraftUuid: string | undefined
  if (newStatus === 'delivering') {
    // Fetch the user's minecraftUuid to snapshot on the order
    const [orderRow] = await db
      .select({ userId: orders.userId })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1)

    if (orderRow) {
      const [userRow] = await db
        .select({ minecraftUuid: users.minecraftUuid })
        .from(users)
        .where(orderRow.userId ? eq(users.id, orderRow.userId) : sql`false`)
        .limit(1)

      minecraftUuid = userRow?.minecraftUuid ?? undefined
    }
  }

  // Update order — store payment ID for idempotency + set new status
  await db
    .update(orders)
    .set({
      status: newStatus,
      mercadopagoPaymentId: String(paymentId),
      ...(minecraftUuid ? { minecraftUuid } : {}),
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId))

  return NextResponse.json({ received: true, orderId, status: newStatus })
}

// MercadoPago sends GET requests to verify the webhook URL is reachable
export async function GET() {
  return NextResponse.json({ ok: true })
}
