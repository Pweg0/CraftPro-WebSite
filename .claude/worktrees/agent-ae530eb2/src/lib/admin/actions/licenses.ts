'use server'
import { auth } from '@/lib/auth'
import { isSuperAdmin, logAudit } from '@/lib/admin/permissions'
import { db } from '@/lib/db'
import { licenses } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

function generateKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const segments = 4
  const segLen = 5
  const parts: string[] = []
  for (let s = 0; s < segments; s++) {
    let seg = ''
    for (let i = 0; i < segLen; i++) {
      seg += chars[Math.floor(Math.random() * chars.length)]
    }
    parts.push(seg)
  }
  return parts.join('-')
}

export async function createLicense(data: { ownerName: string; note?: string }) {
  const session = await auth()
  if (!isSuperAdmin(session)) throw new Error('Forbidden')
  const key = generateKey()
  const [created] = await db.insert(licenses).values({
    key,
    ownerName: data.ownerName,
    note: data.note ?? null,
  }).returning()
  await logAudit(session!, 'CREATE_LICENSE', created.id.toString(), { owner: data.ownerName, key })
  revalidatePath('/admin/licencas')
  return created
}

export async function revokeLicense(id: number) {
  const session = await auth()
  if (!isSuperAdmin(session)) throw new Error('Forbidden')
  const [updated] = await db.update(licenses)
    .set({ status: 'revoked' })
    .where(eq(licenses.id, id))
    .returning()
  await logAudit(session!, 'REVOKE_LICENSE', id.toString(), { owner: updated?.ownerName })
  revalidatePath('/admin/licencas')
  return updated
}

export async function reactivateLicense(id: number) {
  const session = await auth()
  if (!isSuperAdmin(session)) throw new Error('Forbidden')
  const [updated] = await db.update(licenses)
    .set({ status: 'active' })
    .where(eq(licenses.id, id))
    .returning()
  await logAudit(session!, 'REACTIVATE_LICENSE', id.toString(), { owner: updated?.ownerName })
  revalidatePath('/admin/licencas')
  return updated
}

export async function deleteLicense(id: number) {
  const session = await auth()
  if (!isSuperAdmin(session)) throw new Error('Forbidden')
  await db.delete(licenses).where(eq(licenses.id, id))
  await logAudit(session!, 'DELETE_LICENSE', id.toString())
  revalidatePath('/admin/licencas')
}
