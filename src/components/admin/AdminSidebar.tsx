'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  Ban,
  Server,
  ShoppingBag,
  Trophy,
  Shield,
  Users,
  Key,
  Menu,
} from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import Image from 'next/image'

interface AdminSidebarProps {
  isSuperAdmin: boolean
  sections: string[]
  userName: string
  userImage?: string
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, section: null },
  { href: '/admin/itens-banidos', label: 'Itens Banidos', icon: Ban, section: 'itens-banidos' },
  { href: '/admin/servidores', label: 'Servidores', icon: Server, section: 'servidores' },
  { href: '/admin/loja', label: 'Loja', icon: ShoppingBag, section: 'loja' },
  { href: '/admin/leaderboard', label: 'Leaderboard', icon: Trophy, section: 'leaderboard' },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users, section: 'leaderboard' },
  { href: '/admin/licencas', label: 'Licencas', icon: Key, section: 'licencas' },
  { href: '/admin/permissoes', label: 'Permissoes', icon: Shield, section: 'permissoes' },
]

function SidebarContent({
  isSuperAdmin,
  sections,
  userName,
  userImage,
  pathname,
}: AdminSidebarProps & { pathname: string }) {
  const visibleItems = navItems.filter((item) => {
    if (item.section === null) return true // Dashboard always visible
    if (item.section === 'permissoes' || item.section === 'licencas') return isSuperAdmin
    return isSuperAdmin || sections.includes(item.section)
  })

  return (
    <div className="flex flex-col h-full bg-brand-surface w-64">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10">
        <span className="font-display text-brand-accent text-xs">CraftPro Admin</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {visibleItems.map((item) => {
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'border-l-[3px] border-brand-accent text-brand-accent bg-white/5 pl-[calc(0.75rem-3px)]'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User info at bottom */}
      <div className="px-4 py-4 border-t border-white/10 flex items-center gap-3">
        {userImage ? (
          <Image
            src={userImage}
            alt={userName}
            width={28}
            height={28}
            className="rounded-full"
          />
        ) : (
          <div className="h-7 w-7 rounded-full bg-brand-card flex items-center justify-center">
            <span className="text-xs text-white/60">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <span className="text-sm text-white/60 truncate">{userName}</span>
      </div>
    </div>
  )
}

export function AdminSidebar({ isSuperAdmin, sections, userName, userImage }: AdminSidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar — fixed, visible on lg+ */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen sticky top-0">
        <SidebarContent
          isSuperAdmin={isSuperAdmin}
          sections={sections}
          userName={userName}
          userImage={userImage}
          pathname={pathname}
        />
      </aside>

      {/* Mobile hamburger + Sheet */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            aria-label="Abrir menu"
            className="inline-flex items-center justify-center w-11 h-11 text-white hover:text-brand-accent bg-brand-surface rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 bg-brand-surface border-white/10" showCloseButton={false}>
            <SidebarContent
              isSuperAdmin={isSuperAdmin}
              sections={sections}
              userName={userName}
              userImage={userImage}
              pathname={pathname}
            />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
