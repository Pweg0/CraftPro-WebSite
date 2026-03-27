// src/app/api/loja/checkout/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { shopItems, orders } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  // Auth gate — must be logged in
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  // Validate request body
  const body = await req.json().catch(() => null)
  const itemId = body?.itemId
  if (!itemId || typeof itemId !== 'number') {
    return NextResponse.json({ error: 'itemId obrigatório' }, { status: 400 })
  }

  // Fetch the item (only available items)
  const [item] = await db
    .select()
    .from(shopItems)
    .where(and(eq(shopItems.id, itemId), eq(shopItems.available, 1)))
    .limit(1)

  if (!item) {
    return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
  }

  // Check MP token
  const accessToken = process.env.MP_ACCESS_TOKEN
  if (!accessToken) {
    return NextResponse.json(
      { error: 'Pagamentos temporariamente indisponíveis' },
      { status: 503 }
    )
  }

  // Create order record in pending state
  const [order] = await db
    .insert(orders)
    .values({
      userId: session.user.id,
      shopItemId: item.id,
      status: 'pending',
      amountCents: item.price,
    })
    .returning({ id: orders.id })

  // Create MercadoPago preference
  const { MercadoPagoConfig, Preference } = await import('mercadopago')
  const client = new MercadoPagoConfig({ accessToken })
  const preference = new Preference(client)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://craftprobrasil.com.br'

  const result = await preference.create({
    body: {
      items: [
        {
          id: String(item.id),
          title: item.name,
          description: item.description,
          quantity: 1,
          unit_price: item.price / 100,
          currency_id: 'BRL',
        },
      ],
      back_urls: {
        success: `${baseUrl}/pedidos?status=success`,
        failure: `${baseUrl}/pedidos?status=failure`,
        pending: `${baseUrl}/pedidos?status=pending`,
      },
      auto_return: 'approved',
      external_reference: String(order.id),
      notification_url: `${baseUrl}/api/loja/webhook`,
    },
  })

  // Update order with MP preference ID
  if (result.id) {
    await db
      .update(orders)
      .set({ mercadopagoId: result.id })
      .where(eq(orders.id, order.id))
  }

  return NextResponse.json({
    preferenceId: result.id,
    initPoint: result.init_point,
    orderId: order.id,
  })
}
