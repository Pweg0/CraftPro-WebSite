'use client'
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Match {
  matchId: string
  arenaName: string | null
  reason: string | null
  startedAt: number | null
  durationMs: number | null
  winnerUuid: string | null
  winnerName: string | null
  loserUuid: string | null
  loserName: string | null
  winnerEloBefore: number | null
  winnerEloAfter: number | null
  winnerDelta: number | null
  loserEloBefore: number | null
  loserEloAfter: number | null
  loserDelta: number | null
}

interface MatchHistoryTableProps {
  matches: Match[]
  playerUuid: string
  totalMatches: number
  pageSize: number
}

export function MatchHistoryTable({ matches, playerUuid, totalMatches, pageSize }: MatchHistoryTableProps) {
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(totalMatches / pageSize)

  // Note: page state is client-only; all matches for current view are passed from Server Component.
  // For true server-side pagination, this would need searchParams. For v1, all data is passed as props.

  if (matches.length === 0) {
    return (
      <div className="text-center py-12 bg-brand-surface rounded-xl border border-white/10">
        <p className="text-white/60 text-lg">Nenhuma batalha registrada ainda.</p>
        <p className="text-white/40 text-sm mt-2">As batalhas aparecerao aqui apos a primeira partida.</p>
      </div>
    )
  }

  function formatDate(epochSeconds: number | null): string {
    if (!epochSeconds) return "—"
    return new Date(epochSeconds * 1000).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric"
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
    <div>
      <h2 className="font-display text-xl text-white mb-4">Historico de Batalhas</h2>
      <div className="bg-brand-surface rounded-xl border border-white/10 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10">
              <TableHead className="text-white/60">Resultado</TableHead>
              <TableHead className="text-white/60">Adversario</TableHead>
              <TableHead className="text-white/60">ELO</TableHead>
              <TableHead className="text-white/60">Razao</TableHead>
              <TableHead className="text-white/60">Data</TableHead>
              <TableHead className="text-white/60">Duracao</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.map((match) => {
              const isWinner = match.winnerUuid === playerUuid
              const opponentUuid = isWinner ? match.loserUuid : match.winnerUuid
              const opponentName = isWinner ? match.loserName : match.winnerName
              const eloBefore = isWinner ? match.winnerEloBefore : match.loserEloBefore
              const eloAfter = isWinner ? match.winnerEloAfter : match.loserEloAfter
              const delta = isWinner ? match.winnerDelta : match.loserDelta

              return (
                <TableRow key={match.matchId} className="border-white/10 hover:bg-white/5">
                  <TableCell>
                    <Link href={`/match/${match.matchId}`} className={`font-bold hover:underline ${isWinner ? "text-green-400" : "text-red-400"}`}>
                      {isWinner ? "V" : "D"}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {opponentUuid && (
                        <Image
                          src={`https://mc-heads.net/avatar/${opponentUuid}/24`}
                          width={24}
                          height={24}
                          alt={opponentName ?? "Adversario"}
                          className="rounded"
                          unoptimized
                        />
                      )}
                      {opponentUuid ? (
                        <Link href={`/perfil/${opponentUuid}`} className="text-brand-blue hover:underline">
                          {opponentName ?? "Desconhecido"}
                        </Link>
                      ) : (
                        <span className="text-white/60">{opponentName ?? "Desconhecido"}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-white/70">
                    {eloBefore ?? "?"} → {eloAfter ?? "?"}
                    {delta != null && (
                      <span className={`ml-1 text-xs ${delta >= 0 ? "text-green-400" : "text-red-400"}`}>
                        ({delta >= 0 ? "+" : ""}{delta})
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-white/60 capitalize">{match.reason ?? "—"}</TableCell>
                  <TableCell className="text-white/60">{formatDate(match.startedAt)}</TableCell>
                  <TableCell className="text-white/60">{formatDuration(match.durationMs)}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="border-white/20 text-white/60"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-white/60 text-sm">
            Pagina {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="border-white/20 text-white/60"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
