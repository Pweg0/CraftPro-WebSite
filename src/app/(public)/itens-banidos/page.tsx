// src/app/(public)/itens-banidos/page.tsx
// Server Component — loads items from DB, passes to Client Component for filtering
export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { bannedItems } from '@/lib/db/schema'
import { BannedItemsTable } from '@/components/banned-items/BannedItemsTable'

export default async function ItensBanidosPage() {
  const items = await db.select({
    name: bannedItems.name,
    reason: bannedItems.reason,
    category: bannedItems.category,
  }).from(bannedItems)

  return (
    <div className="min-h-screen bg-brand-primary py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-display text-2xl text-white mb-4">Itens Banidos</h1>
          <p className="text-white/60 max-w-xl mx-auto">
            Lista completa de itens proibidos no CraftPro Brasil.
            O uso de qualquer item desta lista pode resultar em punição.
          </p>
        </div>

        <BannedItemsTable items={items} />
      </div>
    </div>
  )
}
