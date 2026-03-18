// src/app/(protected)/perfil/page.tsx
// Protected profile page — redirects to login if not authenticated
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { User } from 'lucide-react';

export default async function PerfilPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/perfil');
  }

  return (
    <div className="min-h-screen bg-brand-primary py-16 px-4">
      <div className="container mx-auto text-center">
        <User className="h-12 w-12 text-brand-accent mx-auto mb-4" />
        <h1 className="font-display text-2xl text-white mb-4">Perfil</h1>
        <p className="text-white/60 max-w-xl mx-auto">
          Bem-vindo, {session.user.name ?? 'Jogador'}! Seus stats de batalha, wins, losses e histórico aparecerão aqui em breve.
        </p>
      </div>
    </div>
  );
}
