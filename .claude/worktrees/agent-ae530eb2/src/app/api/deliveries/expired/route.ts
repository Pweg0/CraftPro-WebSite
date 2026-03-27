// src/app/api/deliveries/expired/route.ts
// Called by mod when a rank/benefit has expired on the server side.
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
  const [order] = await db.select({ id: orders.id }).from(orders).where(eq(orders.id, orderId)).limit(1)
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  await db
    .update(orders)
    .set({
      status: 'expired',
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId))

  return NextResponse.json({ success: true })
}
