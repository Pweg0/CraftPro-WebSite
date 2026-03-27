// src/components/layout/Footer.tsx
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] bg-brand-surface/50 mt-auto overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 grid-bg-accent" />

      {/* Ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-brand-accent/3 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 py-14 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand column */}
          <div>
            <h3 className="font-display text-xs mb-4">
              <span className="text-gradient-neon">CraftPro</span>{' '}
              <span className="text-white/80">Brasil</span>
            </h3>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs">
              O hub central para jogadores de Pokemon no Minecraft. Batalhe, explore e compita.
            </p>
          </div>

          {/* Navigation column */}
          <div>
            <h4 className="text-xs font-semibold text-white/50 uppercase tracking-[0.15em] mb-5">Navegacao</h4>
            <ul className="space-y-2.5 list-none m-0 p-0">
              {[
                { href: '/servidores', label: 'Servidores' },
                { href: '/ranking', label: 'Ranking' },
                { href: '/loja', label: 'Loja' },
                { href: '/itens-banidos', label: 'Itens Banidos' },
                { href: '/replays', label: 'Replays' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/35 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Discord CTA column */}
          <div>
            <h4 className="text-xs font-semibold text-white/50 uppercase tracking-[0.15em] mb-5">Comunidade</h4>
            <p className="text-sm text-white/35 mb-5 leading-relaxed">
              Junte-se a nossa comunidade no Discord para novidades, eventos e suporte.
            </p>
            <a
              href="https://discord.gg/FcdR6PPjg6"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="footer-discord-link"
              className="inline-flex items-center gap-2 bg-[#5865F2]/20 hover:bg-[#5865F2] border border-[#5865F2]/30 hover:border-[#5865F2]
                text-white text-sm font-medium px-5 py-2.5 rounded-xl
                shadow-none hover:shadow-[0_0_25px_rgba(88,101,242,0.25)]
                transition-all duration-300 hover:scale-105"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
              Entrar no Discord
            </a>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/[0.04] text-center text-xs text-white/20">
          &copy; {new Date().getFullYear()} CraftPro Brasil. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
