// src/components/layout/Navbar.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { AvatarDropdown } from '@/components/auth/AvatarDropdown';
import { useSession } from 'next-auth/react';

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/servidores', label: 'Servidores' },
  { href: '/ranking', label: 'Ranking' },
  { href: '/loja', label: 'Loja' },
  { href: '/itens-banidos', label: 'Itens Banidos' },
  { href: '/replays', label: 'Replays' },
];

export function Navbar() {
  const { data: session } = useSession();
  const isAdminUser = !!(session?.user as any)?.isAdmin;
  const pathname = usePathname();

  return (
    <nav
      data-testid="navbar"
      className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#0a0e1a]/80 backdrop-blur-xl"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <span className="font-display text-gradient-neon text-xs tracking-tight transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(255,45,85,0.4)]">
            CraftPro
          </span>
          <span className="font-display text-white/80 text-xs">Brasil</span>
        </Link>

        {/* Desktop navigation */}
        <ul className="hidden md:flex gap-1 list-none m-0 p-0">
          {navLinks.map((link) => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`relative text-sm px-3.5 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'text-white bg-white/[0.08]'
                      : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-brand-accent" />
                  )}
                </Link>
              </li>
            );
          })}
          {isAdminUser && (
            <li>
              <Link
                href="/admin"
                className={`text-sm px-3.5 py-2 rounded-lg transition-all duration-200 ${
                  pathname.startsWith('/admin')
                    ? 'text-brand-accent bg-brand-accent/10'
                    : 'text-brand-accent/70 hover:text-brand-accent hover:bg-brand-accent/5'
                }`}
              >
                Admin
              </Link>
            </li>
          )}
        </ul>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center">
          <AvatarDropdown />
        </div>

        {/* Mobile hamburger + Sheet */}
        <Sheet>
          <SheetTrigger
            className="md:hidden inline-flex items-center justify-center text-white/60 hover:text-white rounded-lg p-2 hover:bg-white/5 transition-all duration-200"
            aria-label="Abrir menu de navegacao"
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="bg-[#0a0e1a]/95 backdrop-blur-xl border-white/[0.06] w-72">
            <nav className="flex flex-col gap-1 mt-8">
              {navLinks.map((link) => {
                const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-base px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'text-white bg-white/[0.08] border-l-2 border-brand-accent'
                        : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              {isAdminUser && (
                <Link
                  href="/admin"
                  className="text-base px-4 py-3 rounded-xl text-brand-accent hover:bg-brand-accent/5 transition-all duration-200"
                >
                  Admin
                </Link>
              )}
              <div className="pt-3 border-t border-white/[0.06] mt-3">
                <AvatarDropdown />
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
