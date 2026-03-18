import { Trophy } from "lucide-react"
import { getLeaderboard, getTop10Wins } from "@/lib/db/queries/leaderboard"
import { LeaderboardTable } from "@/components/ranking/LeaderboardTable"

export const revalidate = 60

export default async function RankingPage() {
  const { ranked, unranked } = await getLeaderboard()
  const top10Wins = await getTop10Wins()

  return (
    <div className="min-h-screen bg-brand-primary py-16 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="h-8 w-8 text-brand-yellow flex-shrink-0" />
          <h1 className="font-display text-2xl text-white">Ranking Competitivo</h1>
        </div>
        <p className="text-white/60 mb-8 ml-11">
          Classificacao global dos jogadores de Pokemon
        </p>

        {ranked.length === 0 && unranked.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            Nenhum jogador registrado ainda. As batalhas no servidor populam o ranking
            automaticamente.
          </div>
        ) : (
          <LeaderboardTable ranked={ranked} unranked={unranked} top10Wins={top10Wins} />
        )}
      </div>
    </div>
  )
}
