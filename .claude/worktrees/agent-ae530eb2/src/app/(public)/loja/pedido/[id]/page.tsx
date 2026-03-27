// src/app/(public)/loja/pedido/[id]/page.tsx
export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { orders, shopItems } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { Badge } from '@/components/ui/badge'
import { OrderStatusStepper } from '@/components/shop/OrderStatusStepper'

interface PageProps {
  params: Promise<{ id: string }>
}

const TYPE_MAP: Record<string, { label: string; className: string }> = {
  'ranks-vip': { label: 'Rank',      className: 'text-brand-accent border-brand-accent/30 bg-brand-accent/10' },
  rank:        { label: 'Rank',      className: 'text-brand-accent border-brand-accent/30 bg-brand-accent/10' },
  cosmeticos:  { label: 'Cosmetico', className: 'text-brand-yellow border-brand-yellow/30 bg-brand-yellow/10' },
  cosmetic:    { label: 'Cosmetico', className: 'text-brand-yellow border-brand-yellow/30 bg-brand-yellow/10' },
  key:         { label: 'Key',       className: 'text-brand-blue border-brand-blue/30 bg-brand-blue/10' },
}

const STATUS_COPY: Record<string, string> = {
  pending:    'Aguarde enquanto confirmamos seu pagamento via Pix. Isso pode levar alguns minutos.',
  paid:       'Pagamento confirmado! Seu item esta sendo processado para entrega no servidor.',
  delivering: 'Entregando no servidor Minecraft... O item sera aplicado automaticamente.',
  delivered:  'Entregue com sucesso! Seu item ja esta disponivel no servidor.',
  failed:     'Nao foi possivel entregar o item. Nossa equipe foi notificada. Entre em contato no Discord se precisar de ajuda.',
}

export default async function PedidoPage({ params }: PageProps) {
  const { id } = await params
  const orderId = parseInt(id, 10)

  if (isNaN(orderId)) {
    return (
      <div className="min-h-screen bg-brand-primary flex flex-col items-center justify-center py-20 px-4 text-center">
        <p className="text-white/60 text-sm mb-4">Pedido nao encontrado.</p>
        <Link href="/loja" className="text-sm text-white/45 hover:text-white transition-colors">
          ← Voltar para a Loja
        </Link>
      </div>
    )
  }

  const session = await auth()

  const [order] = await db
    .select({
      id: orders.id,
      userId: orders.userId,
      status: orders.status,
      amountCents: orders.amountCents,
      createdAt: orders.createdAt,
      itemName: shopItems.name,
      itemCategory: shopItems.category,
    })
    .from(orders)
    .leftJoin(shopItems, eq(orders.shopItemId, shopItems.id))
    .where(eq(orders.id, orderId))
    .limit(1)

  // Not found or doesn't belong to current user
  if (!order || (session?.user?.id && order.userId !== session.user.id) || !session?.user?.id) {
    return (
      <div className="min-h-screen bg-brand-primary flex flex-col items-center justify-center py-20 px-4 text-center">
        <p className="text-white/60 text-sm mb-4">Pedido nao encontrado.</p>
        <Link href="/loja" className="text-sm text-white/45 hover:text-white transition-colors">
          ← Voltar para a Loja
        </Link>
      </div>
    )
  }

  const typeInfo = TYPE_MAP[order.itemCategory ?? ''] ?? {
    label: order.itemCategory ?? 'Item',
    className: 'text-white/60 border-white/20 bg-white/5',
  }

  const priceFormatted = (order.amountCents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const statusCopy = STATUS_COPY[order.status] ?? ''

  return (
    <div className="min-h-screen bg-brand-primary grid-bg py-20 px-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-40 left-1/3 w-96 h-96 rounded-full bg-brand-accent/5 blur-3xl pointer-events-none" />

      <div className="max-w-lg mx-auto relative z-10">
        {/* Back link */}
        <Link
          href="/loja"
          className="inline-block text-sm text-white/45 hover:text-white transition-colors mb-6"
        >
          ← Voltar para a Loja
        </Link>

        {/* Order card */}
        <div className="bg-brand-card/60 rounded-2xl border border-white/[0.06] p-8">
          {/* Heading */}
          <h1 className="font-display text-xl text-white mb-6">Pedido #{order.id}</h1>

          {/* Item summary */}
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/[0.06]">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {order.itemName ?? 'Item removido'}
              </p>
              <p className="text-xs text-white/45 mt-0.5">R$ {priceFormatted}</p>
            </div>
            <Badge variant="outline" className={`text-xs shrink-0 ${typeInfo.className}`}>
              {typeInfo.label}
            </Badge>
          </div>

          {/* Status stepper */}
          <OrderStatusStepper status={order.status} />

          {/* Status copy text */}
          {statusCopy && (
            <p className="text-sm text-white/45 mt-6 leading-relaxed">{statusCopy}</p>
          )}
        </div>
      </div>
    </div>
  )
}
