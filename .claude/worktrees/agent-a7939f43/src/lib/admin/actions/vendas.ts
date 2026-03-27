'use server'
import { auth } from '@/lib/auth'
import { hasPermission } from '@/lib/admin/permissions'
import { db } from '@/lib/db'
import { orders, shopItems, users } from '@/lib/db/schema'
import { eq, desc, sql, and, gte, lte } from 'drizzle-orm'

const PAGE_SIZE = 20

export interface AdminVenda {
  id: number
  playerName: string | null
  itemName: string
  amountCents: number
  status: string
  paymentMethod: string | null
  mercadopagoPaymentId: string | null
  deliveredAt: Date | null
  expiresAt: Date | null
  revokedAt: Date | null
  createdAt: Date
}

export async function getVendas(
  statusFilter?: string,
  dateFrom?: string,
  dateTo?: string,
  page: number = 1
): Promise<{ vendas: AdminVenda[]; total: number; page: number; pageSize: number }> {
  const session = await auth()
  if (!(await hasPermission(session, 'vendas'))) throw new Error('Forbidden')

  const offset = (page - 1) * PAGE_SIZE
  const conditions = []

  if (statusFilter && statusFilter !== 'all') {
    conditions.push(eq(orders.status, statusFilter))
  }
  if (dateFrom) {
    conditions.push(gte(orders.createdAt, new Date(dateFrom)))
  }
  if (dateTo) {
    const endDate = new Date(dateTo)
    endDate.setHours(23, 59, 59, 999)
    conditions.push(lte(orders.createdAt, endDate))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const rows = await db
    .select({
      id: orders.id,
      playerName: users.minecraftName,
      itemName: shopItems.name,
      amountCents: orders.amountCents,
      status: orders.status,
      mercadopagoPaymentId: orders.mercadopagoPaymentId,
      deliveredAt: orders.deliveredAt,
      expiresAt: orders.expiresAt,
      revokedAt: orders.revokedAt,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .leftJoin(shopItems, eq(orders.shopItemId, shopItems.id))
    .leftJoin(users, eq(orders.userId, users.id))
    .where(whereClause)
    .orderBy(desc(orders.createdAt))
    .limit(PAGE_SIZE)
    .offset(offset)

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orders)
    .where(whereClause)

  return {
    vendas: rows.map((r) => ({
      id: r.id,
      playerName: r.playerName ?? null,
      itemName: r.itemName ?? 'Item removido',
      amountCents: r.amountCents,
      status: r.status,
      paymentMethod: 'Pix',
      mercadopagoPaymentId: r.mercadopagoPaymentId,
      deliveredAt: r.deliveredAt,
      expiresAt: r.expiresAt,
      revokedAt: r.revokedAt,
      createdAt: r.createdAt!,
    })),
    total: countRow?.count ?? 0,
    page,
    pageSize: PAGE_SIZE,
  }
}
