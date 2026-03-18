import { db } from '@/lib/db'
import { servers } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { ServidoresCrud } from './ServidoresCrud'

export default async function AdminServidoresPage() {
  const items = await db.select().from(servers).orderBy(desc(servers.createdAt))
  return <ServidoresCrud items={items} />
}
