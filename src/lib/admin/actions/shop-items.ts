'use server'
import { auth } from '@/lib/auth'
import { hasPermission, logAudit } from '@/lib/admin/permissions'
import { db } from '@/lib/db'
import { shopItems } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function createShopItem(data: { name: string; description: string; category: string }) {
  const session = await auth()
  if (!(await hasPermission(session, 'loja'))) throw new Error('Forbidden')
  const [newItem] = await db.insert(shopItems).values(data).returning()
  await logAudit(session!, 'CREATE_SHOP_ITEM', String(newItem.id), { name: data.name })
  revalidatePath('/admin/loja')
  revalidatePath('/loja')
  return newItem
}

export async function updateShopItem(
  id: number,
  data: { name: string; description: string; category: string }
) {
  const session = await auth()
  if (!(await hasPermission(session, 'loja'))) throw new Error('Forbidden')
  const [updated] = await db
    .update(shopItems)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(shopItems.id, id))
    .returning()
  await logAudit(session!, 'UPDATE_SHOP_ITEM', String(id), { name: data.name })
  revalidatePath('/admin/loja')
  revalidatePath('/loja')
  return updated
}

export async function deleteShopItem(id: number) {
  const session = await auth()
  if (!(await hasPermission(session, 'loja'))) throw new Error('Forbidden')
  await db.delete(shopItems).where(eq(shopItems.id, id))
  await logAudit(session!, 'DELETE_SHOP_ITEM', String(id))
  revalidatePath('/admin/loja')
  revalidatePath('/loja')
}
