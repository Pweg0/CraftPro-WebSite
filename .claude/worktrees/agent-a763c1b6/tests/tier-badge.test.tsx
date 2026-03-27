import { render, screen } from "@testing-library/react"
import { TierBadge, DIVISION_CONFIG } from "@/components/ranking/TierBadge"

describe("TierBadge", () => {
  it("renders all 7 divisions with correct labels", () => {
    const divisions = Object.keys(DIVISION_CONFIG) as Array<keyof typeof DIVISION_CONFIG>
    for (const div of divisions) {
      const { unmount } = render(<TierBadge division={div} />)
      expect(screen.getByText(DIVISION_CONFIG[div].label)).toBeInTheDocument()
      unmount()
    }
  })

  it("renders correct color for GOLD division", () => {
    render(<TierBadge division="GOLD" />)
    const badge = screen.getByText("Ouro")
    expect(badge).toHaveStyle({ color: "#f59e0b" })
  })

  it("renders correct color for MASTER division", () => {
    render(<TierBadge division="MASTER" />)
    const badge = screen.getByText("Master")
    expect(badge).toHaveStyle({ color: "#ff4444" })
  })

  it("falls back to UNRANKED for unknown division", () => {
    render(<TierBadge division="MYTHIC" />)
    expect(screen.getByText("Em Classificacao")).toBeInTheDocument()
  })

  it("renders sm size by default", () => {
    render(<TierBadge division="BRONZE" />)
    const badge = screen.getByText("Bronze")
    expect(badge.className).toContain("text-xs")
  })

  it("renders md size when specified", () => {
    render(<TierBadge division="BRONZE" size="md" />)
    const badge = screen.getByText("Bronze")
    expect(badge.className).toContain("text-sm")
  })
})
