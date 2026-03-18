'use client'

import { useState } from "react"
import { Trophy, Medal, ChevronLeft, ChevronRight } from "lucide-react"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { PlayerRow } from "@/components/ranking/PlayerRow"

type Player = {
  uuid: string
  name: string
  elo: number
  wins: number
  losses: number
  division: string
  placementComplete: number
}

interface LeaderboardTableProps {
  ranked: Player[]
  unranked: Player[]
  top10Wins: Player[]
}

const PAGE_SIZE = 20

export function LeaderboardTable({ ranked, unranked, top10Wins }: LeaderboardTableProps) {
  const [tab, setTab] = useState<"elo" | "wins">("elo")
  const [page, setPage] = useState(1)

  const totalPages = Math.ceil(ranked.length / PAGE_SIZE)

  function handleTabSwitch(newTab: "elo" | "wins") {
    setTab(newTab)
    setPage(1)
  }

  const rankedOnPage = ranked.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const isLastPage = page >= totalPages || totalPages === 0
  const showUnranked = tab === "elo" && isLastPage

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex gap-2 mb-6">
        <Button
          onClick={() => handleTabSwitch("elo")}
          className={
            tab === "elo"
              ? "bg-brand-accent text-white border-brand-accent"
              : "bg-brand-card text-white/60 hover:text-white border-transparent"
          }
        >
          <Trophy className="mr-2 h-4 w-4" />
          Leaderboard (ELO)
        </Button>
        <Button
          onClick={() => handleTabSwitch("wins")}
          className={
            tab === "wins"
              ? "bg-brand-accent text-white border-brand-accent"
              : "bg-brand-card text-white/60 hover:text-white border-transparent"
          }
        >
          <Medal className="mr-2 h-4 w-4" />
          Top 10 Vitorias
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-white/10 overflow-hidden bg-brand-surface">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white/60">#</TableHead>
              <TableHead className="text-white/60 w-10"></TableHead>
              <TableHead className="text-white/60">Jogador</TableHead>
              <TableHead className="text-white/60">ELO</TableHead>
              <TableHead className="text-white/60">Divisao</TableHead>
              <TableHead className="text-white/60">W/L</TableHead>
              <TableHead className="text-white/60">Win Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tab === "elo" && (
              <>
                {rankedOnPage.map((player, idx) => (
                  <PlayerRow
                    key={player.uuid}
                    player={player}
                    position={(page - 1) * PAGE_SIZE + idx + 1}
                  />
                ))}
                {showUnranked && unranked.length > 0 && (
                  <>
                    <TableRow className="border-white/10">
                      <TableCell
                        colSpan={7}
                        className="text-center text-white/40 text-xs py-2 bg-white/5 font-semibold tracking-widest uppercase"
                      >
                        Em Classificacao
                      </TableCell>
                    </TableRow>
                    {unranked.map((player, idx) => (
                      <PlayerRow
                        key={player.uuid}
                        player={player}
                        position={ranked.length + idx + 1}
                      />
                    ))}
                  </>
                )}
              </>
            )}
            {tab === "wins" &&
              top10Wins.map((player, idx) => (
                <PlayerRow key={player.uuid} player={player} position={idx + 1} />
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination — only for ELO tab */}
      {tab === "elo" && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="text-white/60 hover:text-white disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <span className="text-white/60 text-sm">
            Pagina {page} de {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="text-white/60 hover:text-white disabled:opacity-30"
          >
            Proxima
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
