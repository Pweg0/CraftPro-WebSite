'use server'
import { auth } from '@/lib/auth'
import { hasPermission, logAudit } from '@/lib/admin/permissions'
import { db } from '@/lib/db'
import { shopItems } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

interface ShopItemData {
  name: string
  description: string
  category: string
  price: number        // in cents (BRL)
  imageUrl?: string | null
  available: number    // 1 = visible, 0 = hidden
}

export async function createShopItem(data: ShopItemData) {
  const session = await auth()
  if (!(await hasPermission(session, 'loja'))) throw new Error('Forbidden')
  const [newItem] = await db.insert(shopItems).values({
    name: data.name,
    description: data.description,
    category: data.category,
    price: data.price,
    imageUrl: data.imageUrl ?? null,
    available: data.available,
  }).returning()
  await logAudit(session!, 'CREATE_SHOP_ITEM', String(newItem.id), { name: data.name, price: data.price })
  revalidatePath('/admin/loja')
  revalidatePath('/loja')
  return newItem
}

export async function updateShopItem(id: number, data: ShopItemData) {
  const session = await auth()
  if (!(await hasPermission(session, 'loja'))) throw new Error('Forbidden')
  const [updated] = await db
    .update(shopItems)
    .set({
      name: data.name,
      description: data.description,
      category: data.category,
      price: data.price,
      imageUrl: data.imageUrl ?? null,
      available: data.available,
      updatedAt: new Date(),
    })
    .where(eq(shopItems.id, id))
    .returning()
  await logAudit(session!, 'UPDATE_SHOP_ITEM', String(id), { name: data.name, price: data.price })
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
