import { Trophy } from "lucide-react"
import { getLeaderboard, getTop10Wins } from "@/lib/db/queries/leaderboard"
import { LeaderboardTable } from "@/components/ranking/LeaderboardTable"

export const dynamic = 'force-dynamic'

export default async function RankingPage() {
  const { ranked, unranked } = await getLeaderboard()
  const top10Wins = await getTop10Wins()

  return (
    <div className="min-h-screen bg-brand-primary grid-bg py-20 px-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-20 right-1/4 w-96 h-96 rounded-full bg-brand-yellow/5 blur-3xl pointer-events-none" />

      <div className="container mx-auto max-w-5xl relative z-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-brand-yellow/10 border border-brand-yellow/20">
              <Trophy className="h-5 w-5 text-brand-yellow" />
            </div>
            <div>
              <h1 className="font-display text-2xl text-white">Ranking</h1>
              <p className="text-white/40 text-sm">
                Classificacao global dos jogadores de Pokemon
              </p>
            </div>
          </div>
        </div>

        {ranked.length === 0 && unranked.length === 0 ? (
          <div className="text-center py-24 bg-brand-surface/40 rounded-2xl border border-white/[0.06] backdrop-blur-sm">
            <Trophy className="h-10 w-10 text-white/15 mx-auto mb-4" />
            <p className="text-white/40">
              Nenhum jogador registrado ainda. As batalhas no servidor populam o ranking automaticamente.
            </p>
          </div>
        ) : (
          <LeaderboardTable ranked={ranked} unranked={unranked} top10Wins={top10Wins} />
        )}
      </div>
    </div>
  )
}
