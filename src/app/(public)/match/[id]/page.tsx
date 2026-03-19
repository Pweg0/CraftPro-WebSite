import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { getMatchById } from "@/lib/db/queries/player"
import { TierBadge } from "@/components/ranking/TierBadge"
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

// Replay log line styling
type LineType = "move" | "damage" | "switch" | "faint" | "win" | "info"

function classifyLine(line: string): LineType {
  if (line.startsWith("|win|")) return "win"
  if (line.startsWith("|faint|")) return "faint"
  if (line.startsWith("|move|")) return "move"
  if (line.startsWith("|-damage|") || line.startsWith("|-supereffective") || line.startsWith("|-crit")) return "damage"
  if (line.startsWith("|switch|") || line.startsWith("|drag|") || line.startsWith("|replace|")) return "switch"
  return "info"
}

const LINE_COLORS: Record<LineType, string> = {
  move: "text-yellow-400",
  damage: "text-red-400",
  switch: "text-blue-400",
  faint: "text-white/40",
  win: "text-green-400 font-bold",
  info: "text-white/60",
}

// Lines to filter out — internal protocol, not meaningful to players
const HIDDEN_PREFIXES = ["|request|", "|update|", "|sideupdate|", "|split|", "|"]

function shouldShow(line: string): boolean {
  if (!line || line.trim() === "" || line.trim() === "|") return false
  for (const prefix of HIDDEN_PREFIXES) {
    if (line === prefix) return false
  }
  if (line.startsWith("|request|")) return false
  if (line.startsWith("|update|")) return false
  if (line.startsWith("|sideupdate|")) return false
  if (line.startsWith("|split|")) return false
  if (line.startsWith("|callback|")) return false
  if (line.startsWith("|choice|")) return false
  return true
}

function formatLine(line: string): string {
  // Remove leading | and split
  const clean = line.startsWith("|") ? line.slice(1) : line
  const parts = clean.split("|")
  const type = parts[0]

  switch (type) {
    case "move":
      return `⚔️ ${parts[1]?.replace(/p[12]a: /, "")} usou ${parts[2]} em ${parts[3]?.replace(/p[12]a: /, "") ?? ""}`
    case "-damage":
      return `💥 ${parts[1]?.replace(/p[12]a: /, "")} sofreu dano → ${parts[2] ?? ""}`
    case "switch":
    case "drag":
      return `🔄 ${parts[1]?.replace(/p[12]a: /, "")} entrou em campo (${parts[2]?.split(",")[0] ?? ""})`
    case "faint":
      return `💀 ${parts[1]?.replace(/p[12]a: /, "")} foi derrotado`
    case "win":
      return `🏆 ${parts[1]} venceu a batalha!`
    case "-supereffective":
      return `⚡ Super efetivo!`
    case "-crit":
      return `🎯 Golpe critico!`
    case "-resisted":
      return `🛡️ Nao muito efetivo...`
    case "-immune":
      return `❌ Nao afetou...`
    case "turn":
      return `— Turno ${parts[1]} —`
    case "-heal":
      return `💚 ${parts[1]?.replace(/p[12]a: /, "")} recuperou vida → ${parts[2] ?? ""}`
    case "-status":
      return `🔥 ${parts[1]?.replace(/p[12]a: /, "")} foi afetado por ${parts[2] ?? ""}`
    case "-boost":
      return `⬆️ ${parts[1]?.replace(/p[12]a: /, "")} aumentou ${parts[2] ?? ""}`
    case "-unboost":
      return `⬇️ ${parts[1]?.replace(/p[12]a: /, "")} diminuiu ${parts[2] ?? ""}`
    case "-weather":
      return `🌤️ Clima: ${parts[1] ?? ""}`
    case "-ability":
      return `✨ Habilidade: ${parts[2] ?? ""} (${parts[1]?.replace(/p[12]a: /, "") ?? ""})`
    default:
      return clean
  }
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

  const replayLines = Array.isArray(match.replayLog)
    ? (match.replayLog as string[]).filter(shouldShow)
    : []

  return (
    <div className="min-h-screen bg-brand-primary py-16 px-4">
      <div className="container mx-auto max-w-3xl">
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

        {/* Replay Log */}
        <div className="bg-brand-surface rounded-xl border border-white/10 p-6">
          <h2 className="text-white font-semibold text-lg mb-4">Replay da Batalha</h2>

          {replayLines.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/40">Nenhum replay disponivel para esta partida.</p>
            </div>
          ) : (
            <div className="space-y-1 font-mono text-sm max-h-[600px] overflow-y-auto pr-2">
              {replayLines.map((line, i) => {
                const type = classifyLine(line)
                return (
                  <div key={i} className={`${LINE_COLORS[type]} py-0.5`}>
                    {formatLine(line)}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
