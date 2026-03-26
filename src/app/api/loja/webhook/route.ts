// src/app/api/loja/webhook/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const runtime = 'nodejs'

// Map MercadoPago payment status to internal order status
const MP_STATUS_MAP: Record<string, string> = {
  approved:   'paid',
  rejected:   'failed',
  cancelled:  'failed',
  refunded:   'refunded',
  pending:    'pending',
  in_process: 'pending',
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { type, data } = body

  // Only handle payment notifications
  if (type !== 'payment') {
    return NextResponse.json({ received: true, skipped: true })
  }

  const paymentId = data?.id
  if (!paymentId) {
    return NextResponse.json({ error: 'Missing payment id' }, { status: 400 })
  }

  const accessToken = process.env.MP_ACCESS_TOKEN
  if (!accessToken) {
    // Return 200 anyway — MercadoPago will keep retrying on non-2xx
    console.error('[webhook] MP_ACCESS_TOKEN not configured')
    return NextResponse.json({ received: true })
  }

  // Fetch payment details from MercadoPago
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

  await db
    .update(orders)
    .set({
      status: newStatus,
      mercadopagoId: String(paymentId),
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId))

  return NextResponse.json({ received: true, orderId, status: newStatus })
}

// MercadoPago sends GET requests to verify the webhook URL is reachable
export async function GET() {
  return NextResponse.json({ ok: true })
}
