// src/app/(public)/loja/meus-pedidos/page.tsx
export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { orders, shopItems } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ShoppingBag } from 'lucide-react'

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  pending:    { label: 'Pendente',   className: 'text-brand-yellow border-brand-yellow/30 bg-brand-yellow/10'  },
  paid:       { label: 'Pago',       className: 'text-brand-blue border-brand-blue/30 bg-brand-blue/10'        },
  delivering: { label: 'Entregando', className: 'text-brand-purple border-brand-purple/30 bg-brand-purple/10'  },
  delivered:  { label: 'Entregue',   className: 'text-brand-online border-brand-online/30 bg-brand-online/10'  },
  failed:     { label: 'Falhou',     className: 'text-brand-offline border-brand-offline/30 bg-brand-offline/10' },
  refunded:   { label: 'Reembolso',  className: 'text-white/50 border-white/20 bg-white/5'                     },
}

export default async function MeusPedidosPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/loja/meus-pedidos')
  }

  const userOrders = await db
    .select({
      id: orders.id,
      status: orders.status,
      amountCents: orders.amountCents,
      createdAt: orders.createdAt,
      itemName: shopItems.name,
    })
    .from(orders)
    .leftJoin(shopItems, eq(orders.shopItemId, shopItems.id))
    .where(eq(orders.userId, session.user.id))
    .orderBy(desc(orders.createdAt))

  return (
    <div className="min-h-screen bg-brand-primary grid-bg py-16 px-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-40 left-1/3 w-96 h-96 rounded-full bg-brand-accent/5 blur-3xl pointer-events-none" />

      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-lg font-semibold text-white">Meus Pedidos</h1>
          <p className="text-sm text-white/45 mt-1">Historico de todas as suas compras.</p>
        </div>

        {userOrders.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShoppingBag className="w-12 h-12 text-white/20 mb-4" />
            <h2 className="text-base font-semibold text-white mb-2">Nenhuma compra ainda</h2>
            <p className="text-sm text-white/45 mb-6">
              Seus pedidos aparecerão aqui apos a primeira compra.
            </p>
            <Link
              href="/loja"
              className="inline-flex items-center justify-center h-11 px-6 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-xl font-semibold text-sm transition-all duration-200"
            >
              Ir para a Loja
            </Link>
          </div>
        ) : (
          <div className="bg-brand-card/40 rounded-2xl border border-white/[0.06] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-white/[0.06] hover:bg-transparent">
                  <TableHead className="hidden md:table-cell text-white/45 text-xs font-medium">Pedido</TableHead>
                  <TableHead className="text-white/45 text-xs font-medium">Item</TableHead>
                  <TableHead className="text-white/45 text-xs font-medium">Valor</TableHead>
                  <TableHead className="text-white/45 text-xs font-medium">Status</TableHead>
                  <TableHead className="text-white/45 text-xs font-medium">Data</TableHead>
                  <TableHead className="text-white/45 text-xs font-medium">Acao</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userOrders.map((order) => {
                  const statusInfo = STATUS_MAP[order.status] ?? STATUS_MAP.pending
                  const priceFormatted = (order.amountCents / 100).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                  const dateFormatted = order.createdAt
                    ? order.createdAt.toLocaleDateString('pt-BR')
                    : '—'

                  return (
                    <TableRow key={order.id} className="border-white/[0.06] hover:bg-white/[0.02]">
                      <TableCell className="hidden md:table-cell text-xs text-white/45">
                        #{order.id}
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-white">
                        {order.itemName ?? 'Item removido'}
                      </TableCell>
                      <TableCell className="text-sm text-brand-yellow">
                        R$ {priceFormatted}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${statusInfo.className}`}>
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-white/45">{dateFormatted}</TableCell>
                      <TableCell>
                        <Link
                          href={`/loja/pedido/${order.id}`}
                          className="text-xs text-brand-blue hover:text-brand-blue/80 transition-colors underline"
                        >
                          Ver detalhes
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
