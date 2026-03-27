'use client'
// src/components/shop/ProductCard.tsx
import { useState } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { ProductDetailSheet } from '@/components/shop/ProductDetailSheet'

export interface ProductCardItem {
  id: number
  name: string
  description: string
  category: string
  price: number  // in cents (BRL)
  imageUrl: string | null
}

interface ProductCardProps {
  item: ProductCardItem
}

const TYPE_MAP: Record<string, { color: string; label: string }> = {
  'ranks-vip':      { color: 'brand-accent',  label: 'Rank' },
  rank:             { color: 'brand-accent',  label: 'Rank' },
  key:              { color: 'brand-blue',    label: 'Key' },
  cosmeticos:       { color: 'brand-yellow',  label: 'Cosmetico' },
  cosmetic:         { color: 'brand-yellow',  label: 'Cosmetico' },
  'itens-servidor': { color: 'brand-blue',    label: 'Item' },
}

function getTypeInfo(category: string) {
  return TYPE_MAP[category] ?? { color: 'brand-blue', label: category }
}

export function ProductCard({ item }: ProductCardProps) {
  const [open, setOpen] = useState(false)
  const { color, label } = getTypeInfo(item.category)
  const priceFormatted = (item.price / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const hoverBorderClass =
    color === 'brand-accent'
      ? 'hover:border-brand-accent/30 hover:shadow-[0_0_30px_rgba(255,45,85,0.10)]'
      : color === 'brand-blue'
      ? 'hover:border-brand-blue/30 hover:shadow-[0_0_30px_rgba(0,212,255,0.10)]'
      : 'hover:border-brand-yellow/30 hover:shadow-[0_0_30px_rgba(255,214,10,0.10)]'

  const badgeColorClass =
    color === 'brand-accent'
      ? 'text-brand-accent border-brand-accent/30 bg-brand-accent/10'
      : color === 'brand-blue'
      ? 'text-brand-blue border-brand-blue/30 bg-brand-blue/10'
      : 'text-brand-yellow border-brand-yellow/30 bg-brand-yellow/10'

  return (
    <>
      <div
        className={`bg-brand-card/60 rounded-2xl border border-white/[0.06] p-5 backdrop-blur-sm transition-all duration-300 ${hoverBorderClass} hover:-translate-y-1 flex flex-col`}
      >
        {/* Image */}
        {item.imageUrl && (
          <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-4 bg-white/5">
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-cover"
              unoptimized={item.imageUrl.startsWith('http')}
            />
          </div>
        )}

        {/* Type badge */}
        <div className="mb-3">
          <Badge variant="outline" className={`text-xs ${badgeColorClass}`}>
            {label}
          </Badge>
        </div>

        {/* Item name */}
        <h3 className="text-sm font-semibold text-white mb-2">{item.name}</h3>

        {/* Price */}
        <div className="mt-auto pt-4">
          <span className="text-lg font-semibold text-brand-yellow">R$ {priceFormatted}</span>
        </div>

        {/* Action */}
        <button
          onClick={() => setOpen(true)}
          className="mt-4 w-full h-11 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center"
        >
          Mais Detalhes
        </button>
      </div>

      <ProductDetailSheet item={item} open={open} onOpenChange={setOpen} />
    </>
  )
}
