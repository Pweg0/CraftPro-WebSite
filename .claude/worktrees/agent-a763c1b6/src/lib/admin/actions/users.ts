'use server'
import { auth } from '@/lib/auth'
import { hasPermission, logAudit } from '@/lib/admin/permissions'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

async function fetchMojangUuid(username: string): Promise<{ uuid: string; name: string } | null> {
  try {
    const res = await fetch(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(username)}`)
    if (!res.ok) return null
    const data = await res.json()
    // Mojang returns id without dashes, format it
    const id = data.id as string
    const uuid = `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`
    return { uuid, name: data.name as string }
  } catch {
    return null
  }
}

export async function linkMinecraftAccount(userId: string, minecraftUsername: string) {
  const session = await auth()
  if (!(await hasPermission(session, 'leaderboard'))) throw new Error('Forbidden')

  const mojang = await fetchMojangUuid(minecraftUsername)
  if (!mojang) throw new Error(`Username "${minecraftUsername}" nao encontrado na Mojang API`)

  await db
    .update(users)
    .set({ minecraftUuid: mojang.uuid, minecraftName: mojang.name })
    .where(eq(users.id, userId))

  await logAudit(session!, 'LINK_MINECRAFT', userId, {
    minecraftName: mojang.name,
    minecraftUuid: mojang.uuid,
  })

  revalidatePath('/admin/usuarios')
  revalidatePath('/perfil')
  return { uuid: mojang.uuid, name: mojang.name }
}

export async function unlinkMinecraftAccount(userId: string) {
  const session = await auth()
  if (!(await hasPermission(session, 'leaderboard'))) throw new Error('Forbidden')

  await db
    .update(users)
    .set({ minecraftUuid: null, minecraftName: null })
    .where(eq(users.id, userId))

  await logAudit(session!, 'UNLINK_MINECRAFT', userId)

  revalidatePath('/admin/usuarios')
  revalidatePath('/perfil')
}
