// src/components/layout/Footer.tsx
// Static Server Component — no interactivity needed.
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-brand-surface mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand column */}
          <div>
            <h3 className="font-display text-brand-accent text-xs mb-4">CraftPro Brasil</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              O hub central para jogadores de Pokémon no Minecraft. Batalhe, explore e compita.
            </p>
          </div>

          {/* Navigation column */}
          <div>
            <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wide mb-4">Navegação</h4>
            <ul className="space-y-2 list-none m-0 p-0">
              {[
                { href: '/servidores', label: 'Servidores' },
                { href: '/ranking', label: 'Ranking' },
                { href: '/itens-banidos', label: 'Itens Banidos' },
                { href: '/replays', label: 'Replays' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Discord CTA column */}
          <div>
            <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wide mb-4">Comunidade</h4>
            <p className="text-sm text-white/60 mb-4">
              Junte-se à nossa comunidade no Discord para novidades, eventos e suporte.
            </p>
            <a
              href="https://discord.gg/craftprobrasil"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="footer-discord-link"
              className="inline-flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-semibold px-4 py-2 rounded-card transition-colors duration-150"
            >
              Entrar no Discord
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 text-center text-xs text-white/40">
          © {new Date().getFullYear()} CraftPro Brasil. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
