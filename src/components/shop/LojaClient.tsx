'use client'
import { CartProvider } from '@/components/shop/CartContext'
import { CartSidebar } from '@/components/shop/CartSidebar'
import { ProductCard, type ProductCardItem } from '@/components/shop/ProductCard'

interface LojaClientProps {
  items: ProductCardItem[]
}

export function LojaClient({ items }: LojaClientProps) {
  return (
    <CartProvider>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {items.map((item) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </div>
      <CartSidebar />
    </CartProvider>
  )
}
