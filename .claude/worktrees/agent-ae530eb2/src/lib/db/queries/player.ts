import { db } from "@/lib/db"
import { arenaPlayers, arenaMatches } from "@/lib/db/schema"
import { eq, or, desc, count } from "drizzle-orm"

export async function getPlayerProfile(uuid: string) {
  const [player] = await db
    .select()
    .from(arenaPlayers)
    .where(eq(arenaPlayers.uuid, uuid))
    .limit(1)
  return player ?? null
}

export async function getPlayerMatches(uuid: string, limit = 20, offset = 0) {
  return db
    .select({
      matchId: arenaMatches.matchId,
      arenaName: arenaMatches.arenaName,
      reason: arenaMatches.reason,
      startedAt: arenaMatches.startedAt,
      durationMs: arenaMatches.durationMs,
      winnerUuid: arenaMatches.winnerUuid,
      winnerName: arenaMatches.winnerName,
      loserUuid: arenaMatches.loserUuid,
      loserName: arenaMatches.loserName,
      winnerEloBefore: arenaMatches.winnerEloBefore,
      winnerEloAfter: arenaMatches.winnerEloAfter,
      winnerDelta: arenaMatches.winnerDelta,
      loserEloBefore: arenaMatches.loserEloBefore,
      loserEloAfter: arenaMatches.loserEloAfter,
      loserDelta: arenaMatches.loserDelta,
      winnerDivision: arenaMatches.winnerDivision,
      loserDivision: arenaMatches.loserDivision,
    })
    .from(arenaMatches)
    .where(or(
      eq(arenaMatches.winnerUuid, uuid),
      eq(arenaMatches.loserUuid, uuid)
    ))
    .orderBy(desc(arenaMatches.startedAt))
    .limit(limit)
    .offset(offset)
}

export async function getMatchById(matchId: string) {
  const [match] = await db
    .select()
    .from(arenaMatches)
    .where(eq(arenaMatches.matchId, matchId))
    .limit(1)
  return match ?? null
}

export async function getPlayerMatchCount(uuid: string) {
  const [result] = await db
    .select({ total: count() })
    .from(arenaMatches)
    .where(or(
      eq(arenaMatches.winnerUuid, uuid),
      eq(arenaMatches.loserUuid, uuid)
    ))
  return result?.total ?? 0
}
