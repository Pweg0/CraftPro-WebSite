'use server'
// src/lib/shop/actions.ts
import { db } from '@/lib/db'
import { shopItems, orders } from '@/lib/db/schema'
import { and, eq, inArray } from 'drizzle-orm'
import { auth } from '@/lib/auth'

/**
 * Creates a MercadoPago checkout for one or more items (cart).
 * Does NOT require login — only a Minecraft name.
 */
export async function createCartCheckout(
  itemIds: number[],
  minecraftName: string
): Promise<{ orderId: number; checkoutUrl: string }> {
  if (!minecraftName || minecraftName.trim().length < 3) {
    throw new Error('INVALID_MINECRAFT_NAME')
  }

  if (!itemIds.length) {
    throw new Error('EMPTY_CART')
  }

  const accessToken = process.env.MP_ACCESS_TOKEN
  if (!accessToken) {
    throw new Error('PAYMENTS_UNAVAILABLE')
  }

  // Fetch all items
  const items = await db
    .select()
    .from(shopItems)
    .where(and(eq(shopItems.available, 1), inArray(shopItems.id, itemIds)))

  if (items.length === 0) {
    throw new Error('NO_VALID_ITEMS')
  }

  // Get session if logged in (optional)
  const session = await auth()
  const userId = session?.user?.id ?? null

  // Calculate total
  const totalCents = items.reduce((sum, item) => sum + item.price, 0)

  // Create one order per item
  const orderIds: number[] = []
  for (const item of items) {
    const [order] = await db
      .insert(orders)
      .values({
        userId,
        shopItemId: item.id,
        status: 'pending',
        amountCents: item.price,
        minecraftName: minecraftName.trim(),
        minecraftUuid: session?.user?.minecraftUuid ?? null,
      })
      .returning({ id: orders.id })
    orderIds.push(order.id)
  }

  // Create MercadoPago preference with all items
  const { MercadoPagoConfig, Preference } = await import('mercadopago')
  const client = new MercadoPagoConfig({ accessToken })
  const preference = new Preference(client)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://craftprobrasil.com.br'

  // Use first order ID as reference (webhook handles all via external_reference)
  const primaryOrderId = orderIds[0]

  const result = await preference.create({
    body: {
      items: items.map((item) => ({
        id: String(item.id),
        title: item.name,
        description: item.description,
        quantity: 1,
        unit_price: item.price / 100,
        currency_id: 'BRL',
      })),
      back_urls: {
        success: `${baseUrl}/loja/pedido/${primaryOrderId}`,
        failure: `${baseUrl}/loja/pedido/${primaryOrderId}`,
        pending: `${baseUrl}/loja/pedido/${primaryOrderId}`,
      },
      auto_return: 'approved',
      external_reference: orderIds.join(','),
      notification_url: `${baseUrl}/api/loja/webhook`,
    },
  })

  // Update all orders with MP preference ID
  if (result.id) {
    for (const oid of orderIds) {
      await db
        .update(orders)
        .set({ mercadopagoId: result.id })
        .where(eq(orders.id, oid))
    }
  }

  return {
    orderId: primaryOrderId,
    checkoutUrl: result.init_point ?? `${baseUrl}/loja/pedido/${primaryOrderId}`,
  }
}
