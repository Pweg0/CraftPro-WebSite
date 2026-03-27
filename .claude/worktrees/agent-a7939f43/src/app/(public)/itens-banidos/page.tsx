// src/app/(public)/itens-banidos/page.tsx
export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { bannedItems } from '@/lib/db/schema'
import { BannedItemsTable } from '@/components/banned-items/BannedItemsTable'
import { Ban } from 'lucide-react'

export default async function ItensBanidosPage() {
  const items = await db.select({
    name: bannedItems.name,
    reason: bannedItems.reason,
    category: bannedItems.category,
  }).from(bannedItems)

  return (
    <div className="min-h-screen bg-brand-primary grid-bg py-20 px-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-20 right-1/3 w-96 h-96 rounded-full bg-brand-accent/5 blur-3xl pointer-events-none" />

      <div className="container mx-auto relative z-10">
        <div className="text-center mb-14">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 mb-5">
            <Ban className="h-7 w-7 text-brand-accent" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-white mb-4">Itens Banidos</h1>
          <p className="text-white/45 max-w-xl mx-auto text-sm leading-relaxed">
            Lista completa de itens proibidos no CraftPro Brasil.
            O uso de qualquer item desta lista pode resultar em punicao.
          </p>
        </div>

        <BannedItemsTable items={items} />
      </div>
    </div>
  )
}
