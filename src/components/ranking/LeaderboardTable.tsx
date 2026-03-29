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
        <button
          onClick={() => handleTabSwitch("elo")}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
            tab === "elo"
              ? "bg-brand-accent/15 text-brand-accent border border-brand-accent/30 shadow-[0_0_15px_rgba(255,45,85,0.1)]"
              : "bg-white/[0.03] text-white/50 border border-white/[0.06] hover:text-white hover:bg-white/[0.06]"
          }`}
        >
          <Trophy className="h-4 w-4" />
          Leaderboard (ELO)
        </button>
        <button
          onClick={() => handleTabSwitch("wins")}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
            tab === "wins"
              ? "bg-brand-yellow/15 text-brand-yellow border border-brand-yellow/30 shadow-[0_0_15px_rgba(255,214,10,0.1)]"
              : "bg-white/[0.03] text-white/50 border border-white/[0.06] hover:text-white hover:bg-white/[0.06]"
          }`}
        >
          <Medal className="h-4 w-4" />
          Top 10 Vitorias
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/[0.06] overflow-hidden bg-brand-surface/40 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-white/[0.06] hover:bg-transparent">
              <TableHead className="text-white/55 text-xs uppercase tracking-wider">#</TableHead>
              <TableHead className="text-white/55 text-xs uppercase tracking-wider w-10"></TableHead>
              <TableHead className="text-white/55 text-xs uppercase tracking-wider">Jogador</TableHead>
              <TableHead className="text-white/55 text-xs uppercase tracking-wider">ELO</TableHead>
              <TableHead className="text-white/55 text-xs uppercase tracking-wider">Divisao</TableHead>
              <TableHead className="text-white/55 text-xs uppercase tracking-wider">W/L</TableHead>
              <TableHead className="text-white/55 text-xs uppercase tracking-wider">Win Rate</TableHead>
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
                    <TableRow className="border-white/[0.06]">
                      <TableCell
                        colSpan={7}
                        className="text-center text-white/30 text-xs py-3 bg-white/[0.02] font-semibold tracking-[0.15em] uppercase"
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

      {/* Pagination */}
      {tab === "elo" && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/[0.04] disabled:opacity-25 disabled:hover:bg-transparent transition-all duration-200"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </button>
          <span className="text-white/40 text-sm tabular-nums">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/[0.04] disabled:opacity-25 disabled:hover:bg-transparent transition-all duration-200"
          >
            Proxima
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
