// src/app/api/cron/process-orders/route.ts
// Cron worker: poll for orders in 'delivering' status and execute RCON delivery.
// Called by Vercel Cron (daily) or cron-job.org at custom frequency (D-10).
// Per PITFALLS.md: never call RCON from payment webhook — only from this worker.

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders, shopItems } from '@/lib/db/schema'
import { and, eq, isNull, lte, or, sql } from 'drizzle-orm'
import { executeRconCommand, isRconConfigured } from '@/lib/rcon/client'
import { buildDeliveryCommand, type ItemType } from '@/lib/rcon/commands'

export const runtime = 'nodejs'
// Vercel cron config (Hobby: daily; cron-job.org can call more frequently)
export const maxDuration = 55 // Vercel max for hobby plan

const MAX_RETRIES = 10        // fail permanently after 10 attempts (~48h with backoff)
const BATCH_SIZE = 20         // process at most 20 orders per invocation
const CRON_SECRET = process.env.CRON_SECRET

/**
 * GET /api/cron/process-orders
 * Called by Vercel Cron scheduler or external cron service.
 * Auth: Authorization: Bearer <CRON_SECRET> header required when CRON_SECRET is set.
 */
export async function GET(req: Request) {
  // Validate cron secret if configured
  if (CRON_SECRET) {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const now = new Date()

  // Fetch orders that need delivery:
  // - status = 'delivering' (paid webhook triggered delivery OR admin forced retry)
  // - retryCount < MAX_RETRIES (not permanently failed)
  // - nextRetryAt is null (first attempt) OR nextRetryAt <= now (backoff expired)
  const pendingOrders = await db
    .select({
      id: orders.id,
      minecraftUuid: orders.minecraftUuid,
      retryCount: orders.retryCount,
      itemId: orders.shopItemId,
      itemName: shopItems.name,
      itemType: shopItems.type,
      itemDuration: shopItems.duration,
    })
    .from(orders)
    .leftJoin(shopItems, eq(orders.shopItemId, shopItems.id))
    .where(
      and(
        eq(orders.status, 'delivering'),
        // nextRetryAt is null (first attempt) OR nextRetryAt <= now
        or(
          isNull(orders.nextRetryAt),
          lte(orders.nextRetryAt, now)
        ),
        // retryCount < MAX_RETRIES — SQL comparison
        sql`${orders.retryCount} < ${MAX_RETRIES}`
      )
    )
    .limit(BATCH_SIZE)

  if (pendingOrders.length === 0) {
    return NextResponse.json({ processed: 0, message: 'No orders to deliver' })
  }

  const results: Array<{ orderId: number; result: 'delivered' | 'failed' | 'skipped'; reason?: string }> = []

  // Check RCON configuration once — if not configured, skip all RCON calls
  const rconEnabled = isRconConfigured()

  for (const order of pendingOrders) {
    try {
      // Validate required fields
      if (!order.minecraftUuid) {
        // Cannot deliver without player UUID — mark as permanently failed
        await markFailed(order.id, 'No Minecraft UUID on order')
        results.push({ orderId: order.id, result: 'failed', reason: 'No Minecraft UUID' })
        continue
      }

      if (!order.itemType) {
        await markFailed(order.id, 'Item has no type — cannot generate RCON command')
        results.push({ orderId: order.id, result: 'failed', reason: 'Item type missing' })
        continue
      }

      if (!rconEnabled) {
        // RCON not configured — skip but don't fail permanently
        // This allows the worker to run in dev/staging without a Minecraft server
        results.push({ orderId: order.id, result: 'skipped', reason: 'RCON not configured' })
        continue
      }

      // Build RCON command for this item type
      const delivery = buildDeliveryCommand(
        order.itemType as ItemType,
        order.itemName ?? 'unknown',
        order.minecraftUuid,
        order.itemDuration
      )

      // Execute RCON command
      const response = await executeRconCommand(delivery.command)

      // Mark as delivered
      await db
        .update(orders)
        .set({
          status: 'delivered',
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id))

      console.log(`[cron] Delivered order ${order.id}: ${delivery.description} — RCON response: "${response}"`)
      results.push({ orderId: order.id, result: 'delivered' })

    } catch (err) {
      const error = err instanceof Error ? err.message : String(err)
      const newRetryCount = (order.retryCount ?? 0) + 1

      if (newRetryCount >= MAX_RETRIES) {
        // Permanently failed — too many retries
        await markFailed(order.id, `Max retries (${MAX_RETRIES}) exceeded: ${error}`)
        results.push({ orderId: order.id, result: 'failed', reason: `Max retries: ${error}` })
      } else {
        // Retry with exponential backoff: 2^n minutes, capped at 240 min (4h)
        const delayMinutes = Math.min(Math.pow(2, newRetryCount), 240)
        const nextRetryAt = new Date(Date.now() + delayMinutes * 60 * 1000)

        await db
          .update(orders)
          .set({
            retryCount: newRetryCount,
            nextRetryAt,
            updatedAt: new Date(),
          })
          .where(eq(orders.id, order.id))

        console.warn(`[cron] Order ${order.id} delivery failed (attempt ${newRetryCount}/${MAX_RETRIES}): ${error}. Next retry: ${nextRetryAt.toISOString()}`)
        results.push({ orderId: order.id, result: 'failed', reason: `Retry ${newRetryCount}: ${error}` })
      }
    }
  }

  const delivered = results.filter((r) => r.result === 'delivered').length
  const failed = results.filter((r) => r.result === 'failed').length
  const skipped = results.filter((r) => r.result === 'skipped').length

  return NextResponse.json({
    processed: pendingOrders.length,
    delivered,
    failed,
    skipped,
    results,
  })
}

async function markFailed(orderId: number, reason: string) {
  console.error(`[cron] Permanently failed order ${orderId}: ${reason}`)
  await db
    .update(orders)
    .set({ status: 'failed', updatedAt: new Date() })
    .where(eq(orders.id, orderId))
}
