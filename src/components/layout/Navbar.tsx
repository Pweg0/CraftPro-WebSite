// src/components/layout/Navbar.tsx
// Sticky navbar — all 7 links always visible per CONTEXT.md locked decision.
// Desktop: inline links. Mobile: hamburger opens shadcn Sheet (accessible drawer).
// IMPORTANT: This is a Client Component because it needs Sheet state.
'use client';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Início' },
  { href: '/servidores', label: 'Servidores' },
  { href: '/ranking', label: 'Ranking' },
  { href: '/loja', label: 'Loja' },
  { href: '/itens-banidos', label: 'Itens Banidos' },
  { href: '/replays', label: 'Replays' },
  { href: '/perfil', label: 'Perfil' },
];

export function Navbar() {
  return (
    <nav
      data-testid="navbar"
      className="sticky top-0 z-50 w-full border-b border-white/10 bg-brand-primary/90 backdrop-blur-md"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="font-display text-brand-accent text-sm tracking-tight">
          CraftPro Brasil
        </Link>

        {/* Desktop navigation */}
        <ul className="hidden md:flex gap-6 list-none m-0 p-0">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm text-white/70 hover:text-white transition-colors duration-150"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile hamburger + Sheet */}
        <Sheet>
          <SheetTrigger
            className="md:hidden inline-flex items-center justify-center text-white hover:text-brand-accent rounded-lg p-2 transition-colors"
            aria-label="Abrir menu de navegação"
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="bg-brand-surface border-white/10">
            <nav className="flex flex-col gap-4 mt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-lg text-white hover:text-brand-accent transition-colors duration-150"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
