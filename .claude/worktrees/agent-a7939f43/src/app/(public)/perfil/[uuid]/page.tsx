import { notFound } from "next/navigation"
import { getPlayerProfile, getPlayerMatches, getPlayerMatchCount } from "@/lib/db/queries/player"
import { ProfileHeader } from "@/components/profile/ProfileHeader"
import { MatchHistoryTable } from "@/components/profile/MatchHistoryTable"

const PAGE_SIZE = 20

export default async function PerfilPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params
  const player = await getPlayerProfile(uuid)
  if (!player) notFound()

  const [matches, totalMatches] = await Promise.all([
    getPlayerMatches(uuid, PAGE_SIZE, 0),
    getPlayerMatchCount(uuid),
  ])

  return (
    <div className="min-h-screen bg-brand-primary py-16 px-4">
      <div className="container mx-auto max-w-4xl space-y-8">
        <ProfileHeader player={player} />
        <MatchHistoryTable
          matches={matches}
          playerUuid={uuid}
          totalMatches={totalMatches}
          pageSize={PAGE_SIZE}
        />
      </div>
    </div>
  )
}
