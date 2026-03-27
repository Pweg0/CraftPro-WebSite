// src/app/api/deliveries/pending/route.ts
// Mod polling endpoint — returns orders that need delivery + revocations to process.
// Auth: Authorization: Bearer <MOD_API_KEY> header required.

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders, shopItems, users } from '@/lib/db/schema'
import { eq, and, isNotNull, sql } from 'drizzle-orm'

function verifyModApiKey(req: Request): boolean {
  const authHeader = req.headers.get('authorization')
  const modApiKey = process.env.MOD_API_KEY
  if (!modApiKey) return false
  return authHeader === `Bearer ${modApiKey}`
}

export async function GET(req: Request) {
  if (!verifyModApiKey(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Query paid orders — mod needs to deliver these
  // Use orders.minecraftName (guest checkout) with fallback to users.minecraftName (logged-in)
  const pendingOrders = await db
    .select({
      orderId: orders.id,
      minecraftUuid: orders.minecraftUuid,
      minecraftName: sql<string>`COALESCE(${orders.minecraftName}, ${users.minecraftName})`.as('minecraft_name'),
      itemName: shopItems.name,
      itemType: shopItems.type,
      itemDuration: shopItems.duration,
      amountCents: orders.amountCents,
    })
    .from(orders)
    .leftJoin(shopItems, eq(orders.shopItemId, shopItems.id))
    .leftJoin(users, eq(orders.userId, users.id))
    .where(eq(orders.status, 'paid'))

  // Query revoked orders that were previously delivered — mod needs to remove the rank/benefit
  const revocations = await db
    .select({
      orderId: orders.id,
      minecraftUuid: orders.minecraftUuid,
      minecraftName: sql<string>`COALESCE(${orders.minecraftName}, ${users.minecraftName})`.as('minecraft_name'),
      itemName: shopItems.name,
      itemType: shopItems.type,
    })
    .from(orders)
    .leftJoin(shopItems, eq(orders.shopItemId, shopItems.id))
    .leftJoin(users, eq(orders.userId, users.id))
    .where(and(eq(orders.status, 'revoked'), isNotNull(orders.deliveredAt)))

  return NextResponse.json({ orders: pendingOrders, revocations })
}
