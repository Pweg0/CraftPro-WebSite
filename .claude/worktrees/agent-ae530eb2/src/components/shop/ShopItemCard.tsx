// src/components/shop/ShopItemCard.tsx
import { Badge } from '@/components/ui/badge'
import { ShoppingCart } from 'lucide-react'

interface ShopItemCardProps {
  id: number
  name: string
  description: string
  category: string
  price: number       // in cents (BRL), e.g. 1990 = R$19,90
  imageUrl?: string | null
}

function formatBRL(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}

const CATEGORY_STYLES: Record<string, { text: string; border: string; bg: string; label: string }> = {
  cosmeticos: {
    text: 'text-brand-yellow',
    border: 'border-brand-yellow/30',
    bg: 'bg-brand-yellow/10',
    label: 'Cosméticos',
  },
  'ranks-vip': {
    text: 'text-brand-accent',
    border: 'border-brand-accent/30',
    bg: 'bg-brand-accent/10',
    label: 'Ranks & VIP',
  },
  'itens-servidor': {
    text: 'text-brand-blue',
    border: 'border-brand-blue/30',
    bg: 'bg-brand-blue/10',
    label: 'Itens do Servidor',
  },
}

export function ShopItemCard({ id, name, description, category, price, imageUrl }: ShopItemCardProps) {
  const style = CATEGORY_STYLES[category] ?? {
    text: 'text-white/60',
    border: 'border-white/20',
    bg: 'bg-white/5',
    label: category,
  }

  return (
    <div
      data-testid={`shop-item-${id}`}
      className="card-glow bg-brand-card/60 backdrop-blur-sm rounded-2xl border border-white/[0.06] overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.12]"
    >
      {imageUrl && (
        <div className="w-full h-36 bg-brand-card/80 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold text-white leading-snug">{name}</h3>
          <Badge
            variant="outline"
            className={`text-xs shrink-0 ${style.text} ${style.border} ${style.bg}`}
          >
            {style.label}
          </Badge>
        </div>
        <p className="text-xs text-white/45 leading-relaxed mb-4 flex-1">{description}</p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-white">{formatBRL(price)}</span>
          <button
            disabled
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-brand-accent/20 text-brand-accent border border-brand-accent/30 opacity-60 cursor-not-allowed"
            title="Pagamento em breve"
            aria-label={`Comprar ${name}`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Comprar
          </button>
        </div>
      </div>
    </div>
  )
}
