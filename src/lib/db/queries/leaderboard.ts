import { db } from "@/lib/db"
import { arenaPlayers } from "@/lib/db/schema"
import { desc, eq } from "drizzle-orm"

export async function getLeaderboard() {
  const ranked = await db
    .select({
      uuid: arenaPlayers.uuid,
      name: arenaPlayers.name,
      elo: arenaPlayers.elo,
      wins: arenaPlayers.wins,
      losses: arenaPlayers.losses,
      division: arenaPlayers.division,
      placementComplete: arenaPlayers.placementComplete,
    })
    .from(arenaPlayers)
    .where(eq(arenaPlayers.placementComplete, 1))
    .orderBy(desc(arenaPlayers.elo))

  const unranked = await db
    .select({
      uuid: arenaPlayers.uuid,
      name: arenaPlayers.name,
      elo: arenaPlayers.elo,
      wins: arenaPlayers.wins,
      losses: arenaPlayers.losses,
      division: arenaPlayers.division,
      placementComplete: arenaPlayers.placementComplete,
    })
    .from(arenaPlayers)
    .where(eq(arenaPlayers.placementComplete, 0))
    .orderBy(desc(arenaPlayers.elo))

  return { ranked, unranked }
}

export async function getTop10Wins() {
  return db
    .select({
      uuid: arenaPlayers.uuid,
      name: arenaPlayers.name,
      elo: arenaPlayers.elo,
      wins: arenaPlayers.wins,
      losses: arenaPlayers.losses,
      division: arenaPlayers.division,
      placementComplete: arenaPlayers.placementComplete,
    })
    .from(arenaPlayers)
    .where(eq(arenaPlayers.placementComplete, 1))
    .orderBy(desc(arenaPlayers.wins))
    .limit(10)
}
