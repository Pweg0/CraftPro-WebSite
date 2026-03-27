import { calcWinRate } from "@/lib/utils"

describe("calcWinRate", () => {
  it("returns 0 when no matches played", () => {
    expect(calcWinRate(0, 0)).toBe(0)
  })

  it("returns 100 when all wins", () => {
    expect(calcWinRate(10, 0)).toBe(100)
  })

  it("returns 0 when all losses", () => {
    expect(calcWinRate(0, 10)).toBe(0)
  })

  it("returns rounded percentage", () => {
    expect(calcWinRate(1, 2)).toBe(33) // 33.33... rounds to 33
  })

  it("returns 50 for even split", () => {
    expect(calcWinRate(5, 5)).toBe(50)
  })
})
