import React from "react"
import { render, screen } from "@testing-library/react"
import { ProfileHeader } from "@/components/profile/ProfileHeader"
import { MatchHistoryTable } from "@/components/profile/MatchHistoryTable"

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) =>
    React.createElement("a", { href, ...props }, children),
}))

function mockPlayer(overrides: Partial<{
  uuid: string; name: string; elo: number; wins: number; losses: number;
  division: string; placementComplete: number
}> = {}) {
  return {
    uuid: "profile-uuid-1",
    name: "ProfilePlayer",
    elo: 1400,
    wins: 25,
    losses: 10,
    division: "PLATINUM",
    placementComplete: 1,
    ...overrides,
  }
}

function mockMatch(overrides: Partial<{
  matchId: string; arenaName: string | null; reason: string | null;
  startedAt: number | null; durationMs: number | null;
  winnerUuid: string | null; winnerName: string | null;
  loserUuid: string | null; loserName: string | null;
  winnerEloBefore: number | null; winnerEloAfter: number | null; winnerDelta: number | null;
  loserEloBefore: number | null; loserEloAfter: number | null; loserDelta: number | null;
}> = {}) {
  return {
    matchId: "match-001",
    arenaName: "arena_1v1",
    reason: "victory",
    startedAt: 1710720000,
    durationMs: 180000,
    winnerUuid: "profile-uuid-1",
    winnerName: "ProfilePlayer",
    loserUuid: "opponent-uuid-1",
    loserName: "OpponentOne",
    winnerEloBefore: 1380,
    winnerEloAfter: 1400,
    winnerDelta: 20,
    loserEloBefore: 1420,
    loserEloAfter: 1400,
    loserDelta: -20,
    ...overrides,
  }
}

describe("ProfileHeader", () => {
  it("renders player name and ELO", () => {
    render(<ProfileHeader player={mockPlayer()} />)
    expect(screen.getByText("ProfilePlayer")).toBeInTheDocument()
    expect(screen.getByText("1400 ELO")).toBeInTheDocument()
  })

  it("renders wins, losses, and win rate", () => {
    // calcWinRate(25, 10) = round(25/35 * 100) = 71
    render(<ProfileHeader player={mockPlayer({ wins: 25, losses: 10 })} />)
    expect(screen.getByText("25")).toBeInTheDocument()
    expect(screen.getByText("10")).toBeInTheDocument()
    expect(screen.getByText("71%")).toBeInTheDocument()
  })

  it("renders TierBadge with correct division label", () => {
    render(<ProfileHeader player={mockPlayer({ division: "PLATINUM" })} />)
    // PLATINUM maps to "Platina" in DIVISION_CONFIG
    expect(screen.getByText("Platina")).toBeInTheDocument()
  })

  it("renders 3D body avatar from crafatar.com", () => {
    render(<ProfileHeader player={mockPlayer({ uuid: "test-uuid-abc", name: "SkinPlayer" })} />)
    const bodyImg = screen.getByRole("img", { name: "SkinPlayer skin" })
    expect(bodyImg).toHaveAttribute("src", "https://crafatar.com/renders/body/test-uuid-abc?size=200")
  })

  it("handles zero wins and losses without NaN", () => {
    render(<ProfileHeader player={mockPlayer({ wins: 0, losses: 0 })} />)
    expect(screen.getByText("0%")).toBeInTheDocument()
    expect(screen.queryByText("NaN")).not.toBeInTheDocument()
  })
})

describe("MatchHistoryTable", () => {
  it("renders empty state when no matches", () => {
    render(
      <MatchHistoryTable matches={[]} playerUuid="uuid-1" totalMatches={0} pageSize={20} />
    )
    expect(screen.getByText("Nenhuma batalha registrada ainda.")).toBeInTheDocument()
  })

  it("renders match with V result when player is winner", () => {
    const match = mockMatch({ winnerUuid: "uuid-1", winnerName: "Me" })
    render(
      <MatchHistoryTable matches={[match]} playerUuid="uuid-1" totalMatches={1} pageSize={20} />
    )
    expect(screen.getByText("V")).toBeInTheDocument()
  })

  it("renders match with D result when player is loser", () => {
    const match = mockMatch({ loserUuid: "uuid-1", loserName: "Me" })
    render(
      <MatchHistoryTable matches={[match]} playerUuid="uuid-1" totalMatches={1} pageSize={20} />
    )
    expect(screen.getByText("D")).toBeInTheDocument()
  })

  it("renders opponent name as link to their profile", () => {
    const match = mockMatch({
      winnerUuid: "uuid-1",
      loserUuid: "opponent-uuid",
      loserName: "RivalPlayer"
    })
    render(
      <MatchHistoryTable matches={[match]} playerUuid="uuid-1" totalMatches={1} pageSize={20} />
    )
    const link = screen.getByRole("link", { name: "RivalPlayer" })
    expect(link).toHaveAttribute("href", "/perfil/opponent-uuid")
  })

  it("renders ELO delta with + prefix for wins", () => {
    const match = mockMatch({
      winnerUuid: "uuid-1",
      winnerDelta: 20,
    })
    render(
      <MatchHistoryTable matches={[match]} playerUuid="uuid-1" totalMatches={1} pageSize={20} />
    )
    expect(screen.getByText("(+20)")).toBeInTheDocument()
  })

  it("renders ELO delta with negative sign for losses", () => {
    const match = mockMatch({
      loserUuid: "uuid-1",
      loserDelta: -15,
    })
    render(
      <MatchHistoryTable matches={[match]} playerUuid="uuid-1" totalMatches={1} pageSize={20} />
    )
    expect(screen.getByText("(-15)")).toBeInTheDocument()
  })
})
