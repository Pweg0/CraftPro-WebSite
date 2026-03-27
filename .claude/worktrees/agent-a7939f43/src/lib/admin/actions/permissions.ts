'use server'
import { auth } from '@/lib/auth'
import { isSuperAdmin, logAudit } from '@/lib/admin/permissions'
import { db } from '@/lib/db'
import { adminPermissions } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function grantPermission(discordId: string, section: string) {
  const session = await auth()
  if (!isSuperAdmin(session)) throw new Error('Forbidden — super-admin only')

  // Check if permission already exists
  const [existing] = await db.select().from(adminPermissions)
    .where(and(eq(adminPermissions.discordId, discordId), eq(adminPermissions.section, section)))
    .limit(1)
  if (existing) return // already granted

  await db.insert(adminPermissions).values({
    discordId,
    section,
    grantedBy: session!.user!.discordId!,
  })
  await logAudit(session!, 'GRANT_PERMISSION', discordId, { section })
  revalidatePath('/admin/permissoes')
}

export async function revokePermission(discordId: string, section: string) {
  const session = await auth()
  if (!isSuperAdmin(session)) throw new Error('Forbidden — super-admin only')

  await db.delete(adminPermissions)
    .where(and(eq(adminPermissions.discordId, discordId), eq(adminPermissions.section, section)))
  await logAudit(session!, 'REVOKE_PERMISSION', discordId, { section })
  revalidatePath('/admin/permissoes')
}
