// src/components/shop/ProductCard.tsx
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { BuyButton } from '@/components/shop/BuyButton'
import { NoMinecraftWarning } from '@/components/shop/NoMinecraftWarning'
import type { Session } from 'next-auth'

interface ProductCardProps {
  item: {
    id: number
    name: string
    description: string
    category: string
    price: number  // in cents (BRL)
  }
  session: Session | null
}

// Map category → brand color token suffix and badge label
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

export function ProductCard({ item, session }: ProductCardProps) {
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
    <div
      className={`bg-brand-card/60 rounded-2xl border border-white/[0.06] p-5 backdrop-blur-sm transition-all duration-300 ${hoverBorderClass} hover:-translate-y-1 flex flex-col`}
    >
      {/* Type badge */}
      <div className="mb-3">
        <Badge variant="outline" className={`text-xs ${badgeColorClass}`}>
          {label}
        </Badge>
      </div>

      {/* Item name */}
      <h3 className="text-sm font-semibold text-white mb-2">{item.name}</h3>

      {/* Description */}
      <p className="text-xs text-white/45 leading-relaxed flex-1">{item.description}</p>

      {/* Price */}
      <div className="mt-4">
        <span className="text-lg font-semibold text-brand-yellow">R$ {priceFormatted}</span>
      </div>

      {/* Action area */}
      <div className="mt-4 w-full">
        {!session ? (
          <Link
            href="/login?callbackUrl=/loja"
            className="flex items-center justify-center w-full h-11 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-white font-semibold text-sm transition-all duration-200"
          >
            Entrar para Comprar
          </Link>
        ) : !session.user.minecraftUuid ? (
          <NoMinecraftWarning />
        ) : (
          <BuyButton shopItemId={item.id} />
        )}
      </div>
    </div>
  )
}
