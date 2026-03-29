'use client'
import { useState } from 'react'
import { CartProvider } from '@/components/shop/CartContext'
import { CartSidebar } from '@/components/shop/CartSidebar'
import { ProductCard, type ProductCardItem } from '@/components/shop/ProductCard'
import { ShoppingBag } from 'lucide-react'

const SERVERS = [
  { id: 'all-the-moons', label: 'All The Moons' },
  { id: 'all-the-mods', label: 'All The Mods' },
] as const

interface LojaClientProps {
  items: ProductCardItem[]
}

export function LojaClient({ items }: LojaClientProps) {
  const [activeServer, setActiveServer] = useState<string>(SERVERS[0].id)

  const filteredItems = items.filter((item) => item.server === activeServer)

  return (
    <CartProvider>
      {/* Server tabs */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {SERVERS.map((server) => {
          const isActive = activeServer === server.id
          const count = items.filter((i) => i.server === server.id).length
          return (
            <button
              key={server.id}
              onClick={() => setActiveServer(server.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/25'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              {server.label}
              {count > 0 && (
                <span className={`ml-2 text-xs ${isActive ? 'text-white/70' : 'text-white/40'}`}>
                  ({count})
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Product grid */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShoppingBag className="w-12 h-12 text-white/20 mb-4" />
          <h2 className="text-base font-semibold text-white mb-2">Nenhum item disponivel</h2>
          <p className="text-sm text-white/45">
            Novos itens para {SERVERS.find((s) => s.id === activeServer)?.label} serao adicionados em breve.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <CartSidebar />
    </CartProvider>
  )
}
