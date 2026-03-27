// src/app/(protected)/pedidos/page.tsx
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { orders, shopItems } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, PackageSearch } from 'lucide-react'

export const dynamic = 'force-dynamic'

function formatBRL(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}

function formatDate(date: Date | null): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  pending:   { label: 'Pendente',  className: 'text-brand-yellow border-brand-yellow/30 bg-brand-yellow/10' },
  paid:      { label: 'Pago',      className: 'text-green-400 border-green-400/30 bg-green-400/10' },
  delivered: { label: 'Entregue',  className: 'text-brand-blue border-brand-blue/30 bg-brand-blue/10' },
  failed:    { label: 'Falhou',    className: 'text-brand-accent border-brand-accent/30 bg-brand-accent/10' },
  refunded:  { label: 'Reembolso', className: 'text-white/50 border-white/20 bg-white/5' },
}

export default async function PedidosPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=/pedidos')

  const userOrders = await db
    .select({
      id: orders.id,
      status: orders.status,
      amountCents: orders.amountCents,
      createdAt: orders.createdAt,
      mercadopagoId: orders.mercadopagoId,
      itemName: shopItems.name,
      itemCategory: shopItems.category,
    })
    .from(orders)
    .leftJoin(shopItems, eq(orders.shopItemId, shopItems.id))
    .where(eq(orders.userId, session.user.id))
    .orderBy(desc(orders.createdAt))

  return (
    <div className="min-h-screen bg-brand-primary grid-bg py-20 px-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-40 left-1/3 w-96 h-96 rounded-full bg-brand-accent/5 blur-3xl pointer-events-none" />

      <div className="container mx-auto max-w-3xl relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-accent/10 border border-brand-accent/20">
            <ShoppingBag className="h-5 w-5 text-brand-accent" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-white">Meus Pedidos</h1>
            <p className="text-white/40 text-sm">Histórico de compras na loja</p>
          </div>
        </div>

        {userOrders.length === 0 ? (
          /* Empty state */
          <div
            data-testid="pedidos-empty-state"
            className="text-center py-20"
          >
            <PackageSearch className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/40 text-sm">Você ainda não fez nenhum pedido.</p>
            <a
              href="/loja"
              className="inline-block mt-5 text-brand-accent text-sm hover:underline"
            >
              Ver a loja
            </a>
          </div>
        ) : (
          /* Orders list */
          <div
            data-testid="pedidos-list"
            className="space-y-3"
          >
            {userOrders.map((order) => {
              const statusStyle = STATUS_STYLES[order.status] ?? STATUS_STYLES.pending
              return (
                <div
                  key={order.id}
                  data-testid={`pedido-${order.id}`}
                  className="card-glow bg-brand-card/60 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5"
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {order.itemName ?? 'Item removido'}
                      </p>
                      <p className="text-xs text-white/40 mt-0.5">
                        Pedido #{order.id} — {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-base font-bold text-white">
                        {formatBRL(order.amountCents)}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${statusStyle.className}`}
                      >
                        {statusStyle.label}
                      </Badge>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
