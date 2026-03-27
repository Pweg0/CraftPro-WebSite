import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { LeaderboardTable } from "@/components/ranking/LeaderboardTable"
import { PlayerRow } from "@/components/ranking/PlayerRow"

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) =>
    React.createElement("a", { href, ...props }, children),
}))

function mockPlayer(overrides: Partial<{
  uuid: string
  name: string
  elo: number
  wins: number
  losses: number
  division: string
  placementComplete: number
}> = {}) {
  return {
    uuid: "test-uuid-1",
    name: "TestPlayer",
    elo: 1200,
    wins: 10,
    losses: 5,
    division: "GOLD",
    placementComplete: 1,
    ...overrides,
  }
}

describe("LeaderboardTable", () => {
  it("renders ranked players", () => {
    const players = [
      mockPlayer({ uuid: "uuid-1", name: "PlayerAlpha", elo: 1500 }),
      mockPlayer({ uuid: "uuid-2", name: "PlayerBeta", elo: 1300 }),
      mockPlayer({ uuid: "uuid-3", name: "PlayerGamma", elo: 1100 }),
    ]
    render(<LeaderboardTable ranked={players} unranked={[]} top10Wins={[]} />)
    expect(screen.getByText("PlayerAlpha")).toBeInTheDocument()
    expect(screen.getByText("PlayerBeta")).toBeInTheDocument()
    expect(screen.getByText("PlayerGamma")).toBeInTheDocument()
  })

  it("shows ELO tab by default with active styling", () => {
    render(
      <LeaderboardTable
        ranked={[mockPlayer()]}
        unranked={[]}
        top10Wins={[]}
      />
    )
    // The ELO tab button should have bg-brand-accent class
    const eloButton = screen.getByText(/Leaderboard \(ELO\)/).closest("button")
    expect(eloButton?.className).toContain("bg-brand-accent")
  })

  it("switches to wins tab and shows top10Wins players", () => {
    const winsPlayers = [
      mockPlayer({ uuid: "wins-uuid-1", name: "WinsKing", wins: 50 }),
      mockPlayer({ uuid: "wins-uuid-2", name: "WinsQueen", wins: 40 }),
    ]
    render(
      <LeaderboardTable
        ranked={[mockPlayer({ name: "EloPlayer" })]}
        unranked={[]}
        top10Wins={winsPlayers}
      />
    )
    // Click the wins tab
    fireEvent.click(screen.getByText(/Top 10 Vitorias/))
    expect(screen.getByText("WinsKing")).toBeInTheDocument()
    expect(screen.getByText("WinsQueen")).toBeInTheDocument()
    // EloPlayer should not be visible
    expect(screen.queryByText("EloPlayer")).not.toBeInTheDocument()
  })

  it("shows Em Classificacao separator with unranked players", () => {
    const rankedPlayer = mockPlayer({ uuid: "r-1", name: "RankedOne", placementComplete: 1 })
    const unrankedPlayer = mockPlayer({
      uuid: "u-1",
      name: "UnrankedOne",
      placementComplete: 0,
      division: "UNRANKED",
    })
    render(
      <LeaderboardTable
        ranked={[rankedPlayer]}
        unranked={[unrankedPlayer]}
        top10Wins={[]}
      />
    )
    // The separator row AND the TierBadge both show "Em Classificacao" for UNRANKED players
    const separators = screen.getAllByText("Em Classificacao")
    expect(separators.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText("UnrankedOne")).toBeInTheDocument()
  })

  it("paginates at 20 players per page", () => {
    const players = Array.from({ length: 25 }, (_, i) =>
      mockPlayer({ uuid: `uuid-${i}`, name: `Player${i}`, elo: 2000 - i })
    )
    render(<LeaderboardTable ranked={players} unranked={[]} top10Wins={[]} />)
    // Page 1: only first 20 should appear
    for (let i = 0; i < 20; i++) {
      expect(screen.getByText(`Player${i}`)).toBeInTheDocument()
    }
    // Players 20-24 should not appear on page 1
    for (let i = 20; i < 25; i++) {
      expect(screen.queryByText(`Player${i}`)).not.toBeInTheDocument()
    }
  })
})

describe("PlayerRow", () => {
  it("renders player name as link to profile", () => {
    const player = mockPlayer({ uuid: "test-uuid-1", name: "LinkPlayer" })
    render(
      <table>
        <tbody>
          <PlayerRow player={player} position={1} />
        </tbody>
      </table>
    )
    const link = screen.getByRole("link", { name: "LinkPlayer" })
    expect(link).toHaveAttribute("href", "/perfil/test-uuid-1")
  })

  it("shows win rate percentage", () => {
    // calcWinRate(10, 5) = round(10/15 * 100) = 67
    const player = mockPlayer({ wins: 10, losses: 5 })
    render(
      <table>
        <tbody>
          <PlayerRow player={player} position={1} />
        </tbody>
      </table>
    )
    expect(screen.getByText("67%")).toBeInTheDocument()
  })

  it("renders TierBadge with correct division label", () => {
    const player = mockPlayer({ division: "GOLD" })
    render(
      <table>
        <tbody>
          <PlayerRow player={player} position={1} />
        </tbody>
      </table>
    )
    // GOLD maps to "Ouro" in DIVISION_CONFIG
    expect(screen.getByText("Ouro")).toBeInTheDocument()
  })
})
