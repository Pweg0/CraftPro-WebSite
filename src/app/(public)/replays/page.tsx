import { db } from "@/lib/db"
import { arenaMatches } from "@/lib/db/schema"
import { desc, isNotNull } from "drizzle-orm"
import Image from "next/image"
import Link from "next/link"
import { Film, Swords } from "lucide-react"

export const revalidate = 60

export default async function ReplaysPage() {
  // Fetch recent matches that have replay logs
  const matches = await db
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
      winnerDelta: arenaMatches.winnerDelta,
      loserDelta: arenaMatches.loserDelta,
    })
    .from(arenaMatches)
    .where(isNotNull(arenaMatches.replayLog))
    .orderBy(desc(arenaMatches.startedAt))
    .limit(20)

  function formatDate(epochSeconds: number | null): string {
    if (!epochSeconds) return "—"
    return new Date(epochSeconds * 1000).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  function formatDuration(ms: number | null): string {
    if (!ms) return "—"
    const totalSec = Math.floor(ms / 1000)
    const min = Math.floor(totalSec / 60)
    const sec = totalSec % 60
    return `${min}:${sec.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-brand-primary py-16 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Film className="h-12 w-12 text-brand-blue" />
          </div>
          <h1 className="font-display text-2xl text-white mb-4">Replays</h1>
          <p className="text-white/60 max-w-xl mx-auto">
            Reviva as batalhas Pokemon competitivas do CraftPro Brasil.
          </p>
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-12 bg-brand-surface rounded-xl border border-white/10">
            <Swords className="h-10 w-10 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">Nenhum replay disponivel ainda.</p>
            <p className="text-white/40 text-sm mt-2">
              Os replays aparecerao aqui quando batalhas forem registradas.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => (
              <Link
                key={match.matchId}
                href={`/match/${match.matchId}`}
                className="block bg-brand-surface rounded-xl border border-white/10 p-4 hover:border-white/20 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Winner avatar */}
                    <div className="flex items-center gap-2">
                      {match.winnerUuid && (
                        <Image
                          src={`https://mc-heads.net/avatar/${match.winnerUuid}/24`}
                          width={24}
                          height={24}
                          alt={match.winnerName ?? ""}
                          className="rounded"
                          unoptimized
                        />
                      )}
                      <span className="text-green-400 text-sm font-medium">
                        {match.winnerName ?? "?"}
                      </span>
                    </div>

                    <span className="text-white/30 text-xs">vs</span>

                    {/* Loser avatar */}
                    <div className="flex items-center gap-2">
                      {match.loserUuid && (
                        <Image
                          src={`https://mc-heads.net/avatar/${match.loserUuid}/24`}
                          width={24}
                          height={24}
                          alt={match.loserName ?? ""}
                          className="rounded"
                          unoptimized
                        />
                      )}
                      <span className="text-red-400 text-sm font-medium">
                        {match.loserName ?? "?"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-white/40">
                    {match.arenaName && <span>{match.arenaName}</span>}
                    <span>{formatDuration(match.durationMs)}</span>
                    <span>{formatDate(match.startedAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Discord CTA */}
        <div className="text-center mt-12">
          <p className="text-white/60 mb-4">
            Fique por dentro das novidades no Discord.
          </p>
          <a
            data-testid="replays-discord-cta"
            href="https://discord.gg/craftprobrasil"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold px-6 py-3 rounded-card transition-colors duration-150"
          >
            Entrar no Discord
          </a>
        </div>
      </div>
    </div>
  )
}
