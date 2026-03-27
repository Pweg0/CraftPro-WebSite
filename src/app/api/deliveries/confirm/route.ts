// src/app/api/deliveries/confirm/route.ts
// Called by mod after successfully delivering a rank/benefit to confirm it's done.
// Auth: Authorization: Bearer <MOD_API_KEY> header required.

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

function verifyModApiKey(req: Request): boolean {
  const authHeader = req.headers.get('authorization')
  const modApiKey = process.env.MOD_API_KEY
  if (!modApiKey) return false
  return authHeader === `Bearer ${modApiKey}`
}

export async function POST(req: Request) {
  if (!verifyModApiKey(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { orderId: number; expiresAt: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { orderId, expiresAt } = body
  if (!orderId || !expiresAt) {
    return NextResponse.json({ error: 'orderId and expiresAt are required' }, { status: 400 })
  }

  // Verify order exists
  const [order] = await db.select({ id: orders.id }).from(orders).where(eq(orders.id, orderId)).limit(1)
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  await db
    .update(orders)
    .set({
      status: 'delivered',
      deliveredAt: new Date(),
      expiresAt: new Date(expiresAt),
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId))

  return NextResponse.json({ success: true })
}
