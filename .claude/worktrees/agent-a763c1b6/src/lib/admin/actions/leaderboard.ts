'use server'
import { auth } from '@/lib/auth'
import { hasPermission, logAudit } from '@/lib/admin/permissions'
import { db } from '@/lib/db'
import { arenaPlayers, arenaMatches } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function banPlayer(uuid: string) {
  const session = await auth()
  if (!(await hasPermission(session, 'leaderboard'))) throw new Error('Forbidden')
  await db.update(arenaPlayers).set({ banned: 1 }).where(eq(arenaPlayers.uuid, uuid))
  await logAudit(session!, 'BAN_PLAYER', uuid)
  revalidatePath('/admin/leaderboard')
  revalidatePath('/ranking')
}

export async function unbanPlayer(uuid: string) {
  const session = await auth()
  if (!(await hasPermission(session, 'leaderboard'))) throw new Error('Forbidden')
  await db.update(arenaPlayers).set({ banned: 0 }).where(eq(arenaPlayers.uuid, uuid))
  await logAudit(session!, 'UNBAN_PLAYER', uuid)
  revalidatePath('/admin/leaderboard')
  revalidatePath('/ranking')
}

export async function deleteMatch(id: number) {
  const session = await auth()
  if (!(await hasPermission(session, 'leaderboard'))) throw new Error('Forbidden')
  await db.delete(arenaMatches).where(eq(arenaMatches.id, id))
  await logAudit(session!, 'DELETE_MATCH', String(id))
  revalidatePath('/admin/leaderboard')
  revalidatePath('/ranking')
}
