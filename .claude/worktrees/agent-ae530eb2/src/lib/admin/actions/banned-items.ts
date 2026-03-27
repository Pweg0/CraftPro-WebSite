'use server'
import { auth } from '@/lib/auth'
import { hasPermission, logAudit } from '@/lib/admin/permissions'
import { db } from '@/lib/db'
import { bannedItems } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function createBannedItem(data: { name: string; reason: string; category: string }) {
  const session = await auth()
  if (!(await hasPermission(session, 'itens-banidos'))) throw new Error('Forbidden')
  const [newItem] = await db.insert(bannedItems).values(data).returning()
  await logAudit(session!, 'CREATE_BANNED_ITEM', String(newItem.id), { name: data.name })
  revalidatePath('/admin/itens-banidos')
  revalidatePath('/itens-banidos')
  return newItem
}

export async function updateBannedItem(id: number, data: { name: string; reason: string; category: string }) {
  const session = await auth()
  if (!(await hasPermission(session, 'itens-banidos'))) throw new Error('Forbidden')
  const [updated] = await db
    .update(bannedItems)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(bannedItems.id, id))
    .returning()
  await logAudit(session!, 'UPDATE_BANNED_ITEM', String(id), { name: data.name })
  revalidatePath('/admin/itens-banidos')
  revalidatePath('/itens-banidos')
  return updated
}

export async function deleteBannedItem(id: number) {
  const session = await auth()
  if (!(await hasPermission(session, 'itens-banidos'))) throw new Error('Forbidden')
  await db.delete(bannedItems).where(eq(bannedItems.id, id))
  await logAudit(session!, 'DELETE_BANNED_ITEM', String(id))
  revalidatePath('/admin/itens-banidos')
  revalidatePath('/itens-banidos')
}
