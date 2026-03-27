import { getAllShopItemsAdmin } from '@/lib/db/queries/shop'
import { LojaCrud } from './LojaCrud'

export default async function AdminLojaPage() {
  const items = await getAllShopItemsAdmin()
  return <LojaCrud items={items} />
}
