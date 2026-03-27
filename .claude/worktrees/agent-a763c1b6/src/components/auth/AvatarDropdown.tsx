// src/components/auth/AvatarDropdown.tsx
// Client Component — renders login button or avatar dropdown based on Discord session state
// AUTH-01: login button → signIn("discord")
// AUTH-02: avatar visible when session exists
// AUTH-03: dropdown "Sair" → signOut()
'use client'
import { useSession, signIn, signOut } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { LogOut, User } from "lucide-react"

export function AvatarDropdown() {
  const { data: session, status } = useSession()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutside)
    return () => document.removeEventListener("mousedown", handleOutside)
  }, [open])

  // Loading state — show skeleton to prevent layout shift
  if (status === "loading") {
    return (
      <div
        className="h-8 w-8 rounded-full bg-white/20 animate-pulse"
        aria-hidden="true"
      />
    )
  }

  // Logged out — show Discord login button
  if (!session) {
    return (
      <button
        onClick={() => signIn("discord", { callbackUrl: window.location.pathname })}
        className="text-sm font-medium text-white bg-[#5865F2] hover:bg-[#4752C4] px-4 py-1.5 rounded-lg transition-colors duration-150 whitespace-nowrap"
        aria-label="Entrar com Discord"
      >
        Entrar com Discord
      </button>
    )
  }

  // Logged in — show avatar with dropdown
  const avatarSrc = session.user?.image
    ?? `https://cdn.discordapp.com/embed/avatars/0.png`

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative h-8 w-8 rounded-full border-2 border-brand-accent hover:opacity-90 transition-opacity duration-150 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
        aria-label="Abrir menu do usuário"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Image
          src={avatarSrc}
          alt={session.user?.name ?? "Avatar do usuário"}
          fill
          className="object-cover"
          sizes="32px"
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 z-50 min-w-[160px] rounded-lg bg-brand-surface border border-white/10 text-white shadow-lg p-1"
        >
          {session.user?.name && (
            <>
              <div className="px-2 py-1.5 text-xs text-white/50 truncate">
                {session.user.name}
              </div>
              <div className="-mx-1 my-1 h-px bg-white/10" />
            </>
          )}
          <Link
            href="/perfil"
            className="flex items-center gap-2 px-2 py-1.5 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-md cursor-pointer"
            onClick={() => setOpen(false)}
          >
            <User className="h-4 w-4" />
            Perfil
          </Link>
          <div className="-mx-1 my-1 h-px bg-white/10" />
          <button
            onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }) }}
            className="flex w-full items-center gap-2 px-2 py-1.5 text-sm text-white/80 hover:text-red-400 hover:bg-white/5 rounded-md cursor-pointer"
            aria-label="Sair"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      )}
    </div>
  )
}
