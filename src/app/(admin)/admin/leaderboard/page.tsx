import { db } from '@/lib/db'
import { arenaPlayers, arenaMatches } from '@/lib/db/schema'
import { desc, ilike, or } from 'drizzle-orm'
import { Badge } from '@/components/ui/badge'
import { TierBadge } from '@/components/ranking/TierBadge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BanPlayerButton, DeleteMatchButton } from '@/components/admin/LeaderboardActions'
import Link from 'next/link'

const PAGE_SIZE = 20

interface LeaderboardPageProps {
  searchParams: Promise<{ page?: string; q?: string; matchPage?: string; matchQ?: string }>
}

export default async function LeaderboardPage({ searchParams }: LeaderboardPageProps) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10))
  const q = params.q?.trim() ?? ''
  const matchPage = Math.max(1, parseInt(params.matchPage ?? '1', 10))
  const matchQ = params.matchQ?.trim() ?? ''

  // Players query — show ALL players (including banned) for admin view
  const playersQuery = db
    .select()
    .from(arenaPlayers)
    .orderBy(desc(arenaPlayers.elo))

  const allPlayers = q
    ? (await playersQuery).filter(p => p.name.toLowerCase().includes(q.toLowerCase()))
    : await playersQuery

  const playerTotal = allPlayers.length
  const playerTotalPages = Math.max(1, Math.ceil(playerTotal / PAGE_SIZE))
  const playerCurrentPage = Math.min(page, playerTotalPages)
  const players = allPlayers.slice((playerCurrentPage - 1) * PAGE_SIZE, playerCurrentPage * PAGE_SIZE)

  // Matches query
  const matchesQuery = db
    .select()
    .from(arenaMatches)
    .orderBy(desc(arenaMatches.startedAt))

  const allMatches = matchQ
    ? (await matchesQuery).filter(m =>
        m.winnerName?.toLowerCase().includes(matchQ.toLowerCase()) ||
        m.loserName?.toLowerCase().includes(matchQ.toLowerCase())
      )
    : await matchesQuery

  const matchTotal = allMatches.length
  const matchTotalPages = Math.max(1, Math.ceil(matchTotal / PAGE_SIZE))
  const matchCurrentPage = Math.min(matchPage, matchTotalPages)
  const matches = allMatches.slice((matchCurrentPage - 1) * PAGE_SIZE, matchCurrentPage * PAGE_SIZE)

  function buildUrl(updates: Record<string, string | undefined>) {
    const current: Record<string, string> = {}
    if (q) current.q = q
    if (page > 1) current.page = String(page)
    if (matchQ) current.matchQ = matchQ
    if (matchPage > 1) current.matchPage = String(matchPage)
    const merged = { ...current, ...updates }
    const filtered = Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== undefined && v !== ''))
    const qs = new URLSearchParams(filtered as Record<string, string>).toString()
    return `/admin/leaderboard${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-white">Leaderboard</h1>

      {/* Players section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Jogadores ({playerTotal})</h2>
          <form method="get" action="/admin/leaderboard" className="flex gap-2">
            <input
              type="hidden" name="matchPage" value={String(matchCurrentPage)}
            />
            {matchQ && <input type="hidden" name="matchQ" value={matchQ} />}
            <input
              name="q"
              defaultValue={q}
              placeholder="Buscar jogador..."
              className="h-8 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button type="submit" className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium">
              Buscar
            </button>
          </form>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>ELO</TableHead>
                <TableHead>Divisao</TableHead>
                <TableHead>V/D</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nenhum jogador registrado ainda.
                  </TableCell>
                </TableRow>
              ) : (
                players.map(player => (
                  <TableRow key={player.uuid} className={player.banned ? 'opacity-60' : ''}>
                    <TableCell className="font-medium text-white">{player.name}</TableCell>
                    <TableCell className="text-[#4cc9f0] font-mono">{player.elo}</TableCell>
                    <TableCell>
                      <TierBadge division={player.division} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {player.wins}V / {player.losses}D
                    </TableCell>
                    <TableCell>
                      {player.banned ? (
                        <Badge variant="destructive">Banido</Badge>
                      ) : (
                        <Badge variant="secondary">Ativo</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <BanPlayerButton uuid={player.uuid} isBanned={!!player.banned} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Player pagination */}
        {playerTotalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-muted-foreground">
              Pagina {playerCurrentPage} de {playerTotalPages}
            </span>
            <div className="flex gap-2">
              {playerCurrentPage > 1 && (
                <Link
                  href={buildUrl({ page: String(playerCurrentPage - 1) })}
                  className="h-8 px-3 inline-flex items-center rounded-md border border-border text-sm hover:bg-muted"
                >
                  Anterior
                </Link>
              )}
              {playerCurrentPage < playerTotalPages && (
                <Link
                  href={buildUrl({ page: String(playerCurrentPage + 1) })}
                  className="h-8 px-3 inline-flex items-center rounded-md border border-border text-sm hover:bg-muted"
                >
                  Proximo
                </Link>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Matches section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Partidas ({matchTotal})</h2>
          <form method="get" action="/admin/leaderboard" className="flex gap-2">
            <input type="hidden" name="page" value={String(playerCurrentPage)} />
            {q && <input type="hidden" name="q" value={q} />}
            <input
              name="matchQ"
              defaultValue={matchQ}
              placeholder="Buscar por jogador..."
              className="h-8 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button type="submit" className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium">
              Buscar
            </button>
          </form>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vencedor</TableHead>
                <TableHead>Perdedor</TableHead>
                <TableHead>Arena</TableHead>
                <TableHead>ELO Delta</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nenhuma partida encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                matches.map(match => (
                  <TableRow key={match.id}>
                    <TableCell className="text-white font-medium">{match.winnerName ?? '-'}</TableCell>
                    <TableCell className="text-muted-foreground">{match.loserName ?? '-'}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{match.arenaName ?? '-'}</TableCell>
                    <TableCell className="text-[#4cc9f0] font-mono">
                      {match.winnerDelta != null ? `+${match.winnerDelta}` : '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {match.startedAt
                        ? new Date(match.startedAt * 1000).toLocaleDateString('pt-BR')
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DeleteMatchButton id={match.id} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Match pagination */}
        {matchTotalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-muted-foreground">
              Pagina {matchCurrentPage} de {matchTotalPages}
            </span>
            <div className="flex gap-2">
              {matchCurrentPage > 1 && (
                <Link
                  href={buildUrl({ matchPage: String(matchCurrentPage - 1) })}
                  className="h-8 px-3 inline-flex items-center rounded-md border border-border text-sm hover:bg-muted"
                >
                  Anterior
                </Link>
              )}
              {matchCurrentPage < matchTotalPages && (
                <Link
                  href={buildUrl({ matchPage: String(matchCurrentPage + 1) })}
                  className="h-8 px-3 inline-flex items-center rounded-md border border-border text-sm hover:bg-muted"
                >
                  Proximo
                </Link>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
