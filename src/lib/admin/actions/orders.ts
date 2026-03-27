'use server'
import { auth } from '@/lib/auth'
import { hasPermission, logAudit } from '@/lib/admin/permissions'
import { db } from '@/lib/db'
import { orders, shopItems, users } from '@/lib/db/schema'
import { eq, desc, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

const PAGE_SIZE = 25

export interface AdminOrder {
  id: number
  status: string
  amountCents: number
  createdAt: Date
  itemName: string
  userName: string | null
  minecraftName: string | null
}

export async function getOrders(
  status?: string,
  page: number = 1
): Promise<{ orders: AdminOrder[]; total: number; page: number; pageSize: number }> {
  const session = await auth()
  if (!(await hasPermission(session, 'pedidos'))) throw new Error('Forbidden')

  const offset = (page - 1) * PAGE_SIZE

  // Build conditions
  const conditions =
    status && status !== 'all'
      ? eq(orders.status, status)
      : undefined

  // Get paginated orders joined with shopItems and users
  const rows = await db
    .select({
      id: orders.id,
      status: orders.status,
      amountCents: orders.amountCents,
      createdAt: orders.createdAt,
      itemName: shopItems.name,
      userName: users.name,
      minecraftName: users.minecraftName,
    })
    .from(orders)
    .leftJoin(shopItems, eq(orders.shopItemId, shopItems.id))
    .leftJoin(users, eq(orders.userId, users.id))
    .where(conditions)
    .orderBy(desc(orders.createdAt))
    .limit(PAGE_SIZE)
    .offset(offset)

  // Get total count
  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orders)
    .where(conditions)

  return {
    orders: rows.map((r) => ({
      id: r.id,
      status: r.status,
      amountCents: r.amountCents,
      createdAt: r.createdAt!,
      itemName: r.itemName ?? 'Item removido',
      userName: r.userName ?? null,
      minecraftName: r.minecraftName ?? null,
    })),
    total: countRow?.count ?? 0,
    page,
    pageSize: PAGE_SIZE,
  }
}

export async function forceRetryDelivery(orderId: number): Promise<void> {
  const session = await auth()
  if (!(await hasPermission(session, 'pedidos'))) throw new Error('Forbidden')

  // Fetch the order and verify it's in a failed state
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1)

  if (!order) throw new Error('Pedido nao encontrado')
  // Allow retry from 'failed' or legacy 'delivering' status
  if (order.status !== 'failed' && order.status !== 'delivering') throw new Error('Pedido nao esta em estado de falha')

  // Re-snapshot minecraftUuid in case it was missing or updated since purchase
  const [userRow] = await db
    .select({ minecraftUuid: users.minecraftUuid })
    .from(users)
    .where(order.userId ? eq(users.id, order.userId) : sql`false`)
    .limit(1)

  // Reset order status to 'paid' so the mod can pick it up via /api/deliveries/pending
  // (RCON cron removed — mod polls and delivers directly)
  await db
    .update(orders)
    .set({
      status: 'paid',
      retryCount: 0,
      nextRetryAt: null,
      minecraftUuid: userRow?.minecraftUuid ?? order.minecraftUuid,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId))

  await logAudit(session!, 'FORCE_RETRY_ORDER', String(orderId))
  revalidatePath('/admin/pedidos')
}
