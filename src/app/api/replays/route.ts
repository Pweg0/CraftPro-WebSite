import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { arenaMatches, arenaPlayers } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

const API_KEY = process.env.ARENA_API_KEY

// POST /api/replays — recebe dados do mod Minecraft
export async function POST(request: Request) {
  // Autenticacao via Bearer token
  const auth = request.headers.get("authorization") ?? ""
  if (!API_KEY || auth !== `Bearer ${API_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await request.json()
  if (!data?.match_id) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  // Insert match (idempotent — ON CONFLICT DO NOTHING)
  await db.insert(arenaMatches).values({
    matchId: data.match_id,
    arenaName: data.arena_name ?? null,
    matchType: data.match_type ?? null,
    reason: data.reason ?? null,
    startedAt: data.started_at ?? null,
    durationMs: data.duration_ms ?? null,
    winnerUuid: data.winner_uuid ?? null,
    winnerName: data.winner_name ?? null,
    loserUuid: data.loser_uuid ?? null,
    loserName: data.loser_name ?? null,
    winnerEloBefore: data.winner_elo_before ?? 0,
    winnerEloAfter: data.winner_elo_after ?? 0,
    winnerDelta: data.winner_delta ?? 0,
    loserEloBefore: data.loser_elo_before ?? 0,
    loserEloAfter: data.loser_elo_after ?? 0,
    loserDelta: data.loser_delta ?? 0,
    winnerDivision: data.winner_division ?? "UNRANKED",
    loserDivision: data.loser_division ?? "UNRANKED",
    replayLog: data.replay_log ?? [],
  }).onConflictDoNothing({ target: arenaMatches.matchId })

  // Upsert ranking snapshot
  if (Array.isArray(data.ranking_snapshot)) {
    for (const record of data.ranking_snapshot) {
      await db.insert(arenaPlayers).values({
        uuid: record.uuid,
        name: record.name,
        elo: record.elo ?? 800,
        wins: record.wins ?? 0,
        losses: record.losses ?? 0,
        division: record.division ?? "UNRANKED",
        placementComplete: record.placement_complete ? 1 : 0,
      }).onConflictDoUpdate({
        target: arenaPlayers.uuid,
        set: {
          name: record.name,
          elo: record.elo ?? 800,
          wins: record.wins ?? 0,
          losses: record.losses ?? 0,
          division: record.division ?? "UNRANKED",
          placementComplete: record.placement_complete ? 1 : 0,
        },
      })
    }
  }

  return NextResponse.json({ status: "ok" }, { status: 201 })
}

// GET /api/replays?id=<match_id> — retorna dados de um replay
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const matchId = searchParams.get("id")

  if (!matchId) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 })
  }

  const [match] = await db
    .select()
    .from(arenaMatches)
    .where(eq(arenaMatches.matchId, matchId))
    .limit(1)

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 })
  }

  return NextResponse.json(match, {
    headers: { "Cache-Control": "public, max-age=3600" },
  })
}
