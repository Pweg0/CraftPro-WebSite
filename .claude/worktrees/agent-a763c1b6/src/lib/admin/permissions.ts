// src/lib/admin/permissions.ts
// Admin permission utilities — used in middleware, layouts, and Server Actions
import type { Session } from 'next-auth'

export type AdminSection = 'itens-banidos' | 'servidores' | 'loja' | 'leaderboard' | 'licencas' | 'permissoes' | 'pedidos'

export function isSuperAdmin(session: Session | null): boolean {
  const superAdminId = process.env.SUPER_ADMIN_DISCORD_ID
  return !!session?.user && session.user.discordId === superAdminId
}

export function isAdmin(session: Session | null): boolean {
  if (!session?.user?.discordId) return false
  if (isSuperAdmin(session)) return true
  const adminIds = (process.env.ADMIN_DISCORD_IDS ?? '').split(',').map(s => s.trim())
  return adminIds.includes(session.user.discordId)
}

export async function hasPermission(session: Session | null, section: AdminSection): Promise<boolean> {
  if (isSuperAdmin(session)) return true
  if (!isAdmin(session)) return false
  const { db } = await import('@/lib/db')
  const { adminPermissions } = await import('@/lib/db/schema')
  const { eq, and } = await import('drizzle-orm')
  const [row] = await db.select()
    .from(adminPermissions)
    .where(and(
      eq(adminPermissions.discordId, session!.user!.discordId!),
      eq(adminPermissions.section, section)
    ))
    .limit(1)
  return !!row
}

export async function getAdminSections(discordId: string): Promise<AdminSection[]> {
  const { db } = await import('@/lib/db')
  const { adminPermissions } = await import('@/lib/db/schema')
  const { eq } = await import('drizzle-orm')
  const rows = await db.select({ section: adminPermissions.section })
    .from(adminPermissions)
    .where(eq(adminPermissions.discordId, discordId))
  return rows.map(r => r.section as AdminSection)
}

export async function logAudit(
  session: Session,
  action: string,
  targetId?: string,
  metadata?: Record<string, unknown>
) {
  const { db } = await import('@/lib/db')
  const { adminAuditLog } = await import('@/lib/db/schema')
  await db.insert(adminAuditLog).values({
    discordId: session.user!.discordId!,
    discordName: session.user?.name ?? null,
    action,
    targetId: targetId ?? null,
    metadata: metadata ?? null,
  })
}
