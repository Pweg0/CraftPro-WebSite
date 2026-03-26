'use server'
// src/lib/shop/actions.ts
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { shopItems, orders } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'

/**
 * Creates a MercadoPago checkout preference and an order record.
 * Returns orderId and the MercadoPago checkout URL.
 *
 * Throws:
 *   'Unauthorized'       — not logged in
 *   'NO_MINECRAFT_UUID'  — user has no linked Minecraft account
 *   'Item not found'     — item doesn't exist or is not available
 *   'PAYMENTS_UNAVAILABLE' — MP_ACCESS_TOKEN not set
 */
export async function createCheckoutPreference(
  shopItemId: number
): Promise<{ orderId: number; checkoutUrl: string }> {
  // Auth gate
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  // Minecraft UUID gate
  if (!session.user.minecraftUuid) {
    throw new Error('NO_MINECRAFT_UUID')
  }

  // Fetch item (only available ones)
  const [item] = await db
    .select()
    .from(shopItems)
    .where(and(eq(shopItems.id, shopItemId), eq(shopItems.available, 1)))
    .limit(1)

  if (!item) {
    throw new Error('Item not found')
  }

  // Check MP token
  const accessToken = process.env.MP_ACCESS_TOKEN
  if (!accessToken) {
    throw new Error('PAYMENTS_UNAVAILABLE')
  }

  // Create order in pending state
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
        success: `${baseUrl}/loja/pedido/${order.id}`,
        failure: `${baseUrl}/loja/pedido/${order.id}`,
        pending: `${baseUrl}/loja/pedido/${order.id}`,
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

  return {
    orderId: order.id,
    checkoutUrl: result.init_point ?? `${baseUrl}/loja/pedido/${order.id}`,
  }
}
