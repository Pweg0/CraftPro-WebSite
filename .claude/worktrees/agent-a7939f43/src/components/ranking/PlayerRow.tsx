import Image from "next/image"
import Link from "next/link"
import { TierBadge } from "@/components/ranking/TierBadge"
import { calcWinRate } from "@/lib/utils"
import { TableRow, TableCell } from "@/components/ui/table"

interface PlayerRowProps {
  player: {
    uuid: string
    name: string
    elo: number
    wins: number
    losses: number
    division: string
    placementComplete: number
  }
  position: number
}

export function PlayerRow({ player, position }: PlayerRowProps) {
  return (
    <TableRow className="border-white/10 hover:bg-white/5">
      <TableCell className="text-white/60 font-mono w-10">{position}</TableCell>
      <TableCell className="w-10">
        <Image
          src={`https://mc-heads.net/avatar/${player.uuid}/24`}
          width={24}
          height={24}
          alt={player.name}
          className="rounded"
          unoptimized
        />
      </TableCell>
      <TableCell>
        <Link
          href={`/perfil/${player.uuid}`}
          className="text-brand-blue hover:underline font-medium"
        >
          {player.name}
        </Link>
      </TableCell>
      <TableCell className="text-white font-semibold">{player.elo}</TableCell>
      <TableCell>
        <TierBadge division={player.division} />
      </TableCell>
      <TableCell className="text-white/70">
        {player.wins}V / {player.losses}D
      </TableCell>
      <TableCell className="text-white/60">
        {calcWinRate(player.wins, player.losses)}%
      </TableCell>
    </TableRow>
  )
}
