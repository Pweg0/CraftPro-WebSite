import { db } from '@/lib/db'
import { shopItems } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { LojaCrud } from './LojaCrud'

export default async function AdminLojaPage() {
  const items = await db.select().from(shopItems).orderBy(desc(shopItems.createdAt))
  return <LojaCrud items={items} />
}
