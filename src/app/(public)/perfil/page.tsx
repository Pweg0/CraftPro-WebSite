// src/app/(public)/perfil/page.tsx
// Phase 1 stub — prevents 404 from navbar. Full profile requires auth (Phase 2).
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';

export default function PerfilPage() {
  return (
    <div className="min-h-screen bg-brand-primary py-16 px-4">
      <div className="container mx-auto text-center">
        <User className="h-12 w-12 text-brand-accent mx-auto mb-4" />
        <div className="flex justify-center mb-4">
          <Badge className="bg-brand-accent/20 text-brand-accent border-brand-accent/50 px-4 py-1" variant="outline">
            Login Necessário
          </Badge>
        </div>
        <h1 className="font-display text-2xl text-white mb-4">Perfil</h1>
        <p className="text-white/60 max-w-xl mx-auto">
          Para ver seu perfil com stats de batalha, wins, losses e histórico,
          faça login com sua conta Discord. Login disponível em breve.
        </p>
      </div>
    </div>
  );
}
