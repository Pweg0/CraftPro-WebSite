import { db } from '@/lib/db'
import { arenaPlayers, arenaMatches, bannedItems, servers, adminAuditLog } from '@/lib/db/schema'
import { count, gte, desc } from 'drizzle-orm'

export async function getDashboardStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayEpoch = Math.floor(today.getTime() / 1000)

  const [playersResult] = await db.select({ total: count() }).from(arenaPlayers)
  const [matchesTodayResult] = await db
    .select({ total: count() })
    .from(arenaMatches)
    .where(gte(arenaMatches.startedAt, todayEpoch))
  const [bannedItemsResult] = await db.select({ total: count() }).from(bannedItems)
  const [serversResult] = await db.select({ total: count() }).from(servers)

  return {
    totalPlayers: playersResult.total,
    matchesToday: matchesTodayResult.total,
    totalBannedItems: bannedItemsResult.total,
    totalServers: serversResult.total,
  }
}

export async function getRecentAuditLogs(limit = 10) {
  return db
    .select({
      id: adminAuditLog.id,
      discordName: adminAuditLog.discordName,
      action: adminAuditLog.action,
      targetId: adminAuditLog.targetId,
      createdAt: adminAuditLog.createdAt,
    })
    .from(adminAuditLog)
    .orderBy(desc(adminAuditLog.createdAt))
    .limit(limit)
}
