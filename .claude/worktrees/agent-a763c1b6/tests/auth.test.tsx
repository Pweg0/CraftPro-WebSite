// tests/auth.test.tsx
// AUTH-01, AUTH-02, AUTH-03 — unit tests for AvatarDropdown component
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useSession, signIn, signOut } from "next-auth/react"
import { vi, describe, it, expect, beforeEach } from "vitest"
import { AvatarDropdown } from "../src/components/auth/AvatarDropdown"

const mockUseSession = useSession as ReturnType<typeof vi.fn>
const mockSignIn = signIn as ReturnType<typeof vi.fn>
const mockSignOut = signOut as ReturnType<typeof vi.fn>

describe("AvatarDropdown — AUTH-01: login", () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue({ data: null, status: "unauthenticated" })
  })

  it("renders login button when logged out", () => {
    render(<AvatarDropdown />)
    expect(screen.getByRole("button", { name: /entrar com discord/i })).toBeInTheDocument()
  })

  it("calls signIn('discord') when login button clicked", async () => {
    render(<AvatarDropdown />)
    await userEvent.click(screen.getByRole("button", { name: /entrar com discord/i }))
    expect(mockSignIn).toHaveBeenCalledWith("discord", expect.any(Object))
  })
})

describe("AvatarDropdown — AUTH-02: session persistence display", () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue({
      data: { user: { name: "TestUser", image: "https://cdn.discordapp.com/avatars/123/abc.png", email: "test@discord.com" } },
      status: "authenticated",
    })
  })

  it("renders avatar image when session exists", () => {
    render(<AvatarDropdown />)
    const img = screen.getByRole("img")
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute("src", expect.stringContaining("cdn.discordapp.com"))
  })

  it("hides login button when session exists", () => {
    render(<AvatarDropdown />)
    expect(screen.queryByRole("button", { name: /entrar com discord/i })).not.toBeInTheDocument()
  })
})

describe("AvatarDropdown — AUTH-03: logout", () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue({
      data: { user: { name: "TestUser", image: "https://cdn.discordapp.com/avatars/123/abc.png", email: "test@discord.com" } },
      status: "authenticated",
    })
  })

  it("renders Perfil link in dropdown", async () => {
    render(<AvatarDropdown />)
    // Open dropdown by clicking the avatar button
    const trigger = screen.getByRole("button", { name: /abrir menu do usuário/i })
    await userEvent.click(trigger)
    expect(screen.getByRole("link", { name: /perfil/i })).toHaveAttribute("href", "/perfil")
  })

  it("calls signOut when Sair is clicked", async () => {
    render(<AvatarDropdown />)
    const trigger = screen.getByRole("button", { name: /abrir menu do usuário/i })
    await userEvent.click(trigger)
    await userEvent.click(screen.getByRole("button", { name: /sair/i }))
    expect(mockSignOut).toHaveBeenCalledWith(expect.objectContaining({ callbackUrl: "/" }))
  })
})
