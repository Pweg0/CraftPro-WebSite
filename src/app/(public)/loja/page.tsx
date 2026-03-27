// src/app/(public)/loja/page.tsx
export const dynamic = 'force-dynamic'
import { ShoppingBag } from 'lucide-react'
import { db } from '@/lib/db'
import { shopItems } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { LojaClient } from '@/components/shop/LojaClient'

export default async function LojaPage() {
  const items = await db
    .select()
    .from(shopItems)
    .where(eq(shopItems.available, 1))
    .orderBy(asc(shopItems.category))

  return (
    <div className="min-h-screen bg-brand-primary grid-bg py-20 px-4 relative overflow-hidden">
      {/* Ambient glow blobs */}
      <div className="absolute top-40 left-1/3 w-96 h-96 rounded-full bg-brand-accent/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 rounded-full bg-brand-yellow/5 blur-3xl pointer-events-none" />

      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 mb-5">
            <ShoppingBag className="h-7 w-7 text-brand-accent" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-white mb-4">Loja</h1>
          <p className="text-white/45 max-w-xl mx-auto text-sm leading-relaxed">
            Compre ranks, cosmeticos e itens para usar no servidor.
          </p>
        </div>

        {/* Product grid */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShoppingBag className="w-12 h-12 text-white/20 mb-4" />
            <h2 className="text-base font-semibold text-white mb-2">Nenhum item disponivel</h2>
            <p className="text-sm text-white/45">Novos itens serao adicionados em breve.</p>
          </div>
        ) : (
          <LojaClient
            items={items.map((item) => ({
              id: item.id,
              name: item.name,
              description: item.description,
              category: item.category,
              price: item.price,
              imageUrl: item.imageUrl,
            }))}
          />
        )}
      </div>
    </div>
  )
}
