// src/app/(public)/ranking/page.tsx
// Phase 1 stub — prevents 404 from navbar. Full ranking implemented in Phase 3.
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';

export default function RankingPage() {
  return (
    <div className="min-h-screen bg-brand-primary py-16 px-4">
      <div className="container mx-auto text-center">
        <Trophy className="h-12 w-12 text-brand-yellow mx-auto mb-4" />
        <div className="flex justify-center mb-4">
          <Badge className="bg-brand-yellow/20 text-brand-yellow border-brand-yellow/50 px-4 py-1" variant="outline">
            Em Breve
          </Badge>
        </div>
        <h1 className="font-display text-2xl text-white mb-4">Ranking</h1>
        <p className="text-white/60 max-w-xl mx-auto">
          O sistema de ranking competitivo com ELO, tiers (Bronze, Silver, Gold, Diamond)
          e leaderboard global está sendo preparado.
        </p>
      </div>
    </div>
  );
}
