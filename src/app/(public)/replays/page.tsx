// src/app/(public)/replays/page.tsx
// Stub page with preview of future replay functionality — NOT a blank page
import { Badge } from '@/components/ui/badge';
import { Film } from 'lucide-react';

export default function ReplaysPage() {
  return (
    <div className="min-h-screen bg-brand-primary py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Film className="h-12 w-12 text-brand-blue" />
          </div>
          <div className="flex justify-center mb-4">
            <Badge
              data-testid="replays-em-breve-badge"
              className="bg-brand-blue/20 text-brand-blue border-brand-blue/50 text-sm px-4 py-1"
              variant="outline"
            >
              Em Breve
            </Badge>
          </div>
          <h1 className="font-display text-2xl text-white mb-4">Replays</h1>
          <p className="text-white/60 max-w-xl mx-auto">
            Em breve você poderá assistir e compartilhar replays das suas batalhas Pokémon.
            Reviva os melhores momentos competitivos do CraftPro Brasil.
          </p>
        </div>

        {/* Preview mockup cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-12 opacity-50">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-card border border-white/10 bg-brand-surface p-4 text-center"
            >
              <div className="h-20 bg-brand-card rounded mb-3 flex items-center justify-center">
                <Film className="h-6 w-6 text-white/20" />
              </div>
              <div className="h-3 bg-white/10 rounded mb-2" />
              <div className="h-2 bg-white/5 rounded w-2/3 mx-auto" />
            </div>
          ))}
        </div>

        {/* Discord CTA */}
        <div className="text-center">
          <p className="text-white/60 mb-4">
            Fique por dentro das novidades no Discord.
          </p>
          <a
            data-testid="replays-discord-cta"
            href="https://discord.gg/craftprobrasil"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold px-6 py-3 rounded-card transition-colors duration-150"
          >
            Entrar no Discord
          </a>
        </div>
      </div>
    </div>
  );
}
