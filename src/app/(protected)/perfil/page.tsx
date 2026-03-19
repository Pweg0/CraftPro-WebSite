import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export default async function PerfilPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login?callbackUrl=/perfil')
  }

  // Check if user has linked Minecraft account
  const [dbUser] = await db
    .select({ minecraftUuid: users.minecraftUuid, minecraftName: users.minecraftName })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  // If linked, redirect to public profile
  if (dbUser?.minecraftUuid) {
    redirect(`/perfil/${dbUser.minecraftUuid}`)
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
              Sua conta Minecraft ainda nao foi vinculada. Fale com o admin do servidor para vincular.
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
