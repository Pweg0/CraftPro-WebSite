'use server'
import { auth } from '@/lib/auth'
import { hasPermission, logAudit } from '@/lib/admin/permissions'
import { db } from '@/lib/db'
import { servers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export async function createServer(data: {
  name: string
  ip: string
  description: string
  bannerPath: string
}) {
  const session = await auth()
  if (!(await hasPermission(session, 'servidores'))) throw new Error('Forbidden')
  const id = generateSlug(data.name)
  // Validate slug uniqueness
  const [existing] = await db.select({ id: servers.id }).from(servers).where(eq(servers.id, id)).limit(1)
  if (existing) throw new Error(`Servidor com slug '${id}' ja existe. Escolha um nome diferente.`)
  const [newServer] = await db.insert(servers).values({ id, ...data }).returning()
  await logAudit(session!, 'CREATE_SERVER', id, { name: data.name })
  revalidatePath('/admin/servidores')
  revalidatePath('/servidores')
  return newServer
}

export async function updateServer(
  id: string,
  data: { name: string; ip: string; description: string; bannerPath: string }
) {
  const session = await auth()
  if (!(await hasPermission(session, 'servidores'))) throw new Error('Forbidden')
  const [updated] = await db
    .update(servers)
    .set(data)
    .where(eq(servers.id, id))
    .returning()
  await logAudit(session!, 'UPDATE_SERVER', id, { name: data.name })
  revalidatePath('/admin/servidores')
  revalidatePath('/servidores')
  return updated
}

export async function deleteServer(id: string) {
  const session = await auth()
  if (!(await hasPermission(session, 'servidores'))) throw new Error('Forbidden')
  await db.delete(servers).where(eq(servers.id, id))
  await logAudit(session!, 'DELETE_SERVER', id)
  revalidatePath('/admin/servidores')
  revalidatePath('/servidores')
}
