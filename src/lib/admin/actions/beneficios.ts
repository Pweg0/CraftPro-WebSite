'use server'
import { auth } from '@/lib/auth'
import { hasPermission, logAudit } from '@/lib/admin/permissions'
import { db } from '@/lib/db'
import { orders, shopItems, users } from '@/lib/db/schema'
import { eq, desc, sql, and, isNotNull, like, gte, lte } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

const PAGE_SIZE = 20

export interface AdminBeneficio {
  id: number
  playerName: string | null
  minecraftUuid: string | null
  itemName: string
  amountCents: number
  createdAt: Date
  deliveredAt: Date | null
  expiresAt: Date | null
  revokedAt: Date | null
  status: string
  daysRemaining: number | null
}

export async function getBeneficios(
  statusFilter?: string,
  playerSearch?: string,
  page: number = 1
): Promise<{ beneficios: AdminBeneficio[]; total: number; page: number; pageSize: number }> {
  const session = await auth()
  if (!(await hasPermission(session, 'beneficios'))) throw new Error('Forbidden')

  const offset = (page - 1) * PAGE_SIZE

  // Build WHERE conditions: only orders that have been delivered (have expiresAt)
  // Active = delivered + expiresAt > now
  // Expiring = delivered + expiresAt within 14 days
  // Expired = status 'expired' or 'revoked' or expiresAt < now
  const conditions = []
  conditions.push(isNotNull(orders.expiresAt))

  if (statusFilter === 'ativo') {
    conditions.push(eq(orders.status, 'delivered'))
    conditions.push(gte(orders.expiresAt, new Date()))
  } else if (statusFilter === 'expirando') {
    conditions.push(eq(orders.status, 'delivered'))
    const fourteenDays = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    conditions.push(gte(orders.expiresAt, new Date()))
    conditions.push(lte(orders.expiresAt, fourteenDays))
  }
  // statusFilter === 'expirado' falls through — isNotNull(orders.expiresAt) covers it with no extra filter

  if (playerSearch) {
    conditions.push(like(users.minecraftName, `%${playerSearch}%`))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const rows = await db
    .select({
      id: orders.id,
      playerName: users.minecraftName,
      minecraftUuid: orders.minecraftUuid,
      itemName: shopItems.name,
      amountCents: orders.amountCents,
      createdAt: orders.createdAt,
      deliveredAt: orders.deliveredAt,
      expiresAt: orders.expiresAt,
      revokedAt: orders.revokedAt,
      status: orders.status,
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
    .leftJoin(users, eq(orders.userId, users.id))
    .where(whereClause)

  const now = Date.now()
  return {
    beneficios: rows.map((r) => {
      const daysRemaining = r.expiresAt
        ? Math.max(0, Math.ceil((r.expiresAt.getTime() - now) / (1000 * 60 * 60 * 24)))
        : null
      return {
        id: r.id,
        playerName: r.playerName ?? null,
        minecraftUuid: r.minecraftUuid,
        itemName: r.itemName ?? 'Item removido',
        amountCents: r.amountCents,
        createdAt: r.createdAt!,
        deliveredAt: r.deliveredAt,
        expiresAt: r.expiresAt,
        revokedAt: r.revokedAt,
        status: r.status,
        daysRemaining,
      }
    }),
    total: countRow?.count ?? 0,
    page,
    pageSize: PAGE_SIZE,
  }
}

export async function revogarBeneficio(orderId: number): Promise<void> {
  const session = await auth()
  if (!(await hasPermission(session, 'beneficios'))) throw new Error('Forbidden')

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1)
  if (!order) throw new Error('Pedido nao encontrado')
  if (order.status === 'revoked') throw new Error('Beneficio ja revogado')

  await db.update(orders).set({
    status: 'revoked',
    revokedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(orders.id, orderId))

  await logAudit(session!, 'REVOKE_BENEFIT', String(orderId))
  revalidatePath('/admin/beneficios')
}
