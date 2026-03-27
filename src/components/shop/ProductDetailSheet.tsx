'use client'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { ShoppingCart, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/components/shop/CartContext'
import type { ProductCardItem } from '@/components/shop/ProductCard'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface ProductDetailSheetProps {
  item: ProductCardItem
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductDetailSheet({ item, open, onOpenChange }: ProductDetailSheetProps) {
  const { items, addItem } = useCart()
  const isInCart = items.some((i) => i.id === item.id)

  const priceFormatted = (item.price / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const handleAddToCart = () => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      category: item.category,
      imageUrl: item.imageUrl,
    })
    toast.success(`${item.name} adicionado ao carrinho`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-brand-primary border-white/[0.06] max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-lg">{item.name}</DialogTitle>
          <DialogDescription className="text-brand-yellow text-base font-semibold">
            R$ {priceFormatted}
          </DialogDescription>
        </DialogHeader>

        {/* Image */}
        {item.imageUrl && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-white/5 my-2">
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-cover"
              unoptimized={item.imageUrl.startsWith('http')}
            />
          </div>
        )}

        {/* Markdown description */}
        <div className="prose prose-invert prose-sm max-w-none text-white/70 [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_strong]:text-white [&_li]:text-white/70 [&_ul]:list-disc [&_ol]:list-decimal [&_a]:text-brand-blue">
          <ReactMarkdown>{item.description}</ReactMarkdown>
        </div>

        {/* Buy button */}
        <div className="mt-4 pt-4 border-t border-white/[0.06]">
          {isInCart ? (
            <button
              disabled
              className="w-full h-11 rounded-xl bg-brand-online/20 text-brand-online font-semibold text-sm flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              No carrinho
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              className="w-full h-11 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Comprar
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
