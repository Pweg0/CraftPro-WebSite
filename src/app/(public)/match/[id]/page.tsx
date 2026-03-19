import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { getMatchById } from "@/lib/db/queries/player"
import { TierBadge } from "@/components/ranking/TierBadge"
import { ShowdownReplayPlayer } from "@/components/replay/ShowdownReplayPlayer"
import { Swords, Clock, MapPin, Calendar, Trophy } from "lucide-react"

interface MatchPageProps {
  params: Promise<{ id: string }>
}

const REASON_LABELS: Record<string, string> = {
  VICTORY: "Vitoria",
  TIMEOUT: "Tempo Esgotado",
  DISCONNECT: "Desconexao",
  FLEE: "Fuga",
}

function formatDuration(ms: number | null): string {
  if (!ms) return "—"
  const totalSec = Math.floor(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${sec.toString().padStart(2, "0")}`
}

function formatDate(epochSeconds: number | null): string {
  if (!epochSeconds) return "—"
  return new Date(epochSeconds * 1000).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { id } = await params
  const match = await getMatchById(id)

  if (!match) notFound()

  const replayLog = Array.isArray(match.replayLog)
    ? (match.replayLog as string[])
    : []

  return (
    <div className="min-h-screen bg-brand-primary py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Match Header */}
        <div className="bg-brand-surface rounded-xl border border-white/10 p-6 md:p-8 mb-6">
          {/* VS Section */}
          <div className="flex items-center justify-center gap-6 md:gap-10 mb-6">
            {/* Winner */}
            <div className="flex flex-col items-center gap-2">
              {match.winnerUuid && (
                <Link href={`/perfil/${match.winnerUuid}`}>
                  <Image
                    src={`https://mc-heads.net/avatar/${match.winnerUuid}/64`}
                    width={64}
                    height={64}
                    alt={match.winnerName ?? "Vencedor"}
                    className="rounded-lg border-2 border-green-500/50"
                    unoptimized
                  />
                </Link>
              )}
              <Link
                href={`/perfil/${match.winnerUuid}`}
                className="text-green-400 font-semibold hover:underline text-sm md:text-base"
              >
                {match.winnerName ?? "Desconhecido"}
              </Link>
              {match.winnerDivision && <TierBadge division={match.winnerDivision} size="sm" />}
              <div className="text-sm text-white/70">
                {match.winnerEloBefore ?? "?"} → {match.winnerEloAfter ?? "?"}
                {match.winnerDelta != null && (
                  <span className="ml-1 text-green-400 font-semibold">
                    (+{match.winnerDelta})
                  </span>
                )}
              </div>
            </div>

            {/* VS */}
            <div className="flex flex-col items-center">
              <Swords className="h-8 w-8 text-white/30 mb-1" />
              <span className="text-white/30 text-xs font-bold">VS</span>
            </div>

            {/* Loser */}
            <div className="flex flex-col items-center gap-2">
              {match.loserUuid && (
                <Link href={`/perfil/${match.loserUuid}`}>
                  <Image
                    src={`https://mc-heads.net/avatar/${match.loserUuid}/64`}
                    width={64}
                    height={64}
                    alt={match.loserName ?? "Perdedor"}
                    className="rounded-lg border-2 border-red-500/50"
                    unoptimized
                  />
                </Link>
              )}
              <Link
                href={`/perfil/${match.loserUuid}`}
                className="text-red-400 font-semibold hover:underline text-sm md:text-base"
              >
                {match.loserName ?? "Desconhecido"}
              </Link>
              {match.loserDivision && <TierBadge division={match.loserDivision} size="sm" />}
              <div className="text-sm text-white/70">
                {match.loserEloBefore ?? "?"} → {match.loserEloAfter ?? "?"}
                {match.loserDelta != null && (
                  <span className="ml-1 text-red-400 font-semibold">
                    ({match.loserDelta})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Match Info */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-white/50">
            {match.arenaName && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {match.arenaName}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDuration(match.durationMs)}
            </span>
            <span className="flex items-center gap-1">
              <Trophy className="h-3.5 w-3.5" />
              {REASON_LABELS[match.reason?.toUpperCase() ?? ""] ?? match.reason ?? "—"}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(match.startedAt)}
            </span>
          </div>
        </div>

        {/* Showdown Replay Player */}
        {replayLog.length > 0 ? (
          <ShowdownReplayPlayer replayLog={replayLog} />
        ) : (
          <div className="bg-brand-surface rounded-xl border border-white/10 p-6">
            <div className="text-center py-8">
              <p className="text-white/40">Nenhum replay disponivel para esta partida.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
