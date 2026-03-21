export const dynamic = 'force-dynamic'

import { db } from "@/lib/db"
import { arenaMatches } from "@/lib/db/schema"
import { desc, isNotNull } from "drizzle-orm"
import Image from "next/image"
import Link from "next/link"
import { Film, Swords, ArrowRight } from "lucide-react"

export const revalidate = 60

export default async function ReplaysPage() {
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
    if (!epochSeconds) return "\u2014"
    return new Date(epochSeconds * 1000).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  function formatDuration(ms: number | null): string {
    if (!ms) return "\u2014"
    const totalSec = Math.floor(ms / 1000)
    const min = Math.floor(totalSec / 60)
    const sec = totalSec % 60
    return `${min}:${sec.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-brand-primary grid-bg py-20 px-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-20 left-1/3 w-96 h-96 rounded-full bg-brand-blue/5 blur-3xl pointer-events-none" />

      <div className="container mx-auto max-w-3xl relative z-10">
        <div className="text-center mb-14">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 mb-5">
            <Film className="h-7 w-7 text-brand-blue" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-white mb-4">Replays</h1>
          <p className="text-white/45 max-w-xl mx-auto text-sm leading-relaxed">
            Reviva as batalhas Pokemon competitivas do CraftPro Brasil.
          </p>
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-20 bg-brand-surface/40 rounded-2xl border border-white/[0.06] backdrop-blur-sm">
            <Swords className="h-10 w-10 text-white/15 mx-auto mb-4" />
            <p className="text-white/45">Nenhum replay disponivel ainda.</p>
            <p className="text-white/30 text-sm mt-2">
              Os replays aparecerao aqui quando batalhas forem registradas.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => (
              <Link
                key={match.matchId}
                href={`/match/${match.matchId}`}
                className="group block bg-brand-surface/40 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5
                  hover:border-white/15 hover:bg-white/[0.03] hover:shadow-[0_0_20px_rgba(0,212,255,0.05)]
                  transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Winner */}
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
                      <span className="text-brand-online text-sm font-medium">
                        {match.winnerName ?? "?"}
                      </span>
                    </div>

                    <span className="text-white/20 text-xs font-display">VS</span>

                    {/* Loser */}
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
                      <span className="text-brand-accent/80 text-sm font-medium">
                        {match.loserName ?? "?"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-white/30">
                    {match.arenaName && <span>{match.arenaName}</span>}
                    <span>{formatDuration(match.durationMs)}</span>
                    <span>{formatDate(match.startedAt)}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-brand-blue" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Discord CTA */}
        <div className="text-center mt-14">
          <p className="text-white/40 mb-5 text-sm">
            Fique por dentro das novidades no Discord.
          </p>
          <a
            data-testid="replays-discord-cta"
            href="https://discord.gg/craftprobrasil"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold px-7 py-3.5 rounded-xl
              shadow-[0_0_25px_rgba(88,101,242,0.25)] hover:shadow-[0_0_40px_rgba(88,101,242,0.4)]
              transition-all duration-300 hover:scale-105 active:scale-[0.98] text-sm"
          >
            Entrar no Discord
          </a>
        </div>
      </div>
    </div>
  )
}
