import { db } from '@/lib/db'
import { bannedItems } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { BannedItemsCrud } from './BannedItemsCrud'

export default async function AdminItensBanidosPage() {
  const items = await db.select().from(bannedItems).orderBy(desc(bannedItems.createdAt))
  return <BannedItemsCrud items={items} />
}
