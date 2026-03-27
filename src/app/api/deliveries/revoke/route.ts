// src/app/api/deliveries/revoke/route.ts
// Called by admin panel to revoke an active benefit.
// Auth: session + hasPermission('beneficios') — NOT mod API key.

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { hasPermission, logAudit } from '@/lib/admin/permissions'
import { db } from '@/lib/db'
import { orders } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function POST(req: Request) {
  const session = await auth()
  if (!(await hasPermission(session, 'beneficios'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: { orderId: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { orderId } = body
  if (!orderId) {
    return NextResponse.json({ error: 'orderId is required' }, { status: 400 })
  }

  // Verify order exists
  const [order] = await db.select({ id: orders.id, status: orders.status }).from(orders).where(eq(orders.id, orderId)).limit(1)
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }
  if (order.status === 'revoked') {
    return NextResponse.json({ error: 'Beneficio ja revogado' }, { status: 400 })
  }

  await db
    .update(orders)
    .set({
      status: 'revoked',
      revokedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId))

  await logAudit(session!, 'REVOKE_BENEFIT', String(orderId))
  revalidatePath('/admin/beneficios')

  return NextResponse.json({ success: true })
}
