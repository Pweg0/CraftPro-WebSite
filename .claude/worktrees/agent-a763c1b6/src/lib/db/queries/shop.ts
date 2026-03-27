// src/lib/db/queries/shop.ts
import { db } from '@/lib/db'
import { shopItems, orders } from '@/lib/db/schema'
import { eq, and, asc, desc } from 'drizzle-orm'

/**
 * Get all available shop items for the public store page.
 * Filters to available=1 only, ordered by category then name.
 */
export async function getShopItems() {
  return db
    .select()
    .from(shopItems)
    .where(eq(shopItems.available, 1))
    .orderBy(asc(shopItems.category), asc(shopItems.name))
}

/**
 * Get a single available shop item by ID.
 * Returns null if not found or not available.
 */
export async function getShopItemById(id: number) {
  const [item] = await db
    .select()
    .from(shopItems)
    .where(and(eq(shopItems.id, id), eq(shopItems.available, 1)))
    .limit(1)
  return item ?? null
}

/**
 * Get all orders for a specific user (most recent first).
 */
export async function getOrdersByUser(userId: string) {
  return db
    .select({
      id: orders.id,
      shopItemId: orders.shopItemId,
      status: orders.status,
      amountCents: orders.amountCents,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt))
}

/**
 * Get ALL shop items (including unavailable) for admin panel.
 */
export async function getAllShopItemsAdmin() {
  return db
    .select()
    .from(shopItems)
    .orderBy(asc(shopItems.category), asc(shopItems.name))
}
