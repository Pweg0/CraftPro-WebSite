import Image from "next/image"
import { TierBadge } from "@/components/ranking/TierBadge"
import { calcWinRate } from "@/lib/utils"

interface ProfileHeaderProps {
  player: {
    uuid: string
    name: string
    elo: number
    wins: number
    losses: number
    division: string
    placementComplete: number
  }
}

export function ProfileHeader({ player }: ProfileHeaderProps) {
  const winRate = calcWinRate(player.wins, player.losses)
  return (
    <div className="flex flex-col md:flex-row items-center gap-6 bg-brand-surface rounded-xl p-6 border border-white/10">
      {/* 3D body render from crafatar.com */}
      <Image
        src={`https://crafatar.com/renders/body/${player.uuid}?size=200`}
        width={100}
        height={200}
        alt={`${player.name} skin`}
        className="drop-shadow-lg"
        unoptimized
      />
      <div className="flex-1 text-center md:text-left">
        <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
          <Image
            src={`https://mc-heads.net/avatar/${player.uuid}/48`}
            width={48}
            height={48}
            alt={player.name}
            className="rounded"
            unoptimized
          />
          <h1 className="font-display text-3xl text-white">{player.name}</h1>
        </div>
        <div className="flex items-center gap-3 justify-center md:justify-start mb-4">
          <TierBadge division={player.division} size="md" />
          <span className="text-2xl font-bold text-brand-yellow">{player.elo} ELO</span>
        </div>
        <div className="flex gap-6 justify-center md:justify-start text-sm">
          <div>
            <span className="text-white/60">Vitorias</span>
            <p className="text-green-400 font-bold text-lg">{player.wins}</p>
          </div>
          <div>
            <span className="text-white/60">Derrotas</span>
            <p className="text-red-400 font-bold text-lg">{player.losses}</p>
          </div>
          <div>
            <span className="text-white/60">Win Rate</span>
            <p className="text-white font-bold text-lg">{winRate}%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
