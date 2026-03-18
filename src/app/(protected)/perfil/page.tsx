import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default async function PerfilPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login?callbackUrl=/perfil')
  }

  return (
    <div className="min-h-screen bg-brand-primary py-16 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="bg-brand-surface rounded-xl p-8 border border-white/10 text-center">
          {session.user.image ? (
            <Image
              src={session.user.image}
              width={80}
              height={80}
              alt={session.user.name ?? 'Avatar'}
              className="rounded-full mx-auto mb-4"
            />
          ) : (
            <User className="h-16 w-16 text-brand-accent mx-auto mb-4" />
          )}
          <h1 className="font-display text-2xl text-white mb-2">
            {session.user.name ?? 'Jogador'}
          </h1>
          <p className="text-white/40 text-sm mb-6">Conectado via Discord</p>
          <div className="border-t border-white/10 pt-6">
            <p className="text-white/60 mb-4">
              Para ver seu perfil competitivo, encontre seu nome no ranking:
            </p>
            <Link
              href="/ranking"
              className="inline-flex items-center gap-2 bg-brand-accent hover:bg-brand-accent/80 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Ver Ranking
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
