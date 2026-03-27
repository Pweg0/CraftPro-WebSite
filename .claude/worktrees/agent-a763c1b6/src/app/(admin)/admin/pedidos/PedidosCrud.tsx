'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MoreHorizontal, ShoppingBag } from 'lucide-react'
import { forceRetryDelivery } from '@/lib/admin/actions/orders'
import type { AdminOrder } from '@/lib/admin/actions/orders'

interface PedidosCrudProps {
  orders: AdminOrder[]
  total: number
  page: number
  pageSize: number
  currentStatus: string
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendente' },
  { value: 'paid', label: 'Pago' },
  { value: 'delivering', label: 'Entregando' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'failed', label: 'Falhou' },
]

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    pending: {
      label: 'Pendente',
      className: 'text-brand-yellow border-brand-yellow/30 bg-brand-yellow/10 text-xs',
    },
    paid: {
      label: 'Pago',
      className: 'text-brand-blue border-brand-blue/30 bg-brand-blue/10 text-xs',
    },
    delivering: {
      label: 'Entregando',
      className: 'text-brand-purple border-brand-purple/30 bg-brand-purple/10 text-xs',
    },
    delivered: {
      label: 'Entregue',
      className: 'text-brand-online border-brand-online/30 bg-brand-online/10 text-xs',
    },
    failed: {
      label: 'Falhou',
      className: 'text-brand-offline border-brand-offline/30 bg-brand-offline/10 text-xs',
    },
  }
  const cfg = config[status] ?? {
    label: status,
    className: 'text-white/60 border-white/20 bg-white/5 text-xs',
  }
  return (
    <Badge variant="outline" className={cfg.className}>
      {cfg.label}
    </Badge>
  )
}

function formatBRL(cents: number): string {
  return `R$ ${(cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
}

export function PedidosCrud({
  orders,
  total,
  page,
  pageSize,
  currentStatus,
}: PedidosCrudProps) {
  const router = useRouter()
  const [retryOrderId, setRetryOrderId] = useState<number | null>(null)
  const [retryAlertOpen, setRetryAlertOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const totalPages = Math.ceil(total / pageSize)

  function handleStatusChange(value: string | null) {
    router.push(`/admin/pedidos?status=${value ?? 'all'}`)
  }

  function handleRetryClick(orderId: number) {
    setRetryOrderId(orderId)
    setRetryAlertOpen(true)
  }

  function handleConfirmRetry() {
    if (retryOrderId === null) return
    startTransition(async () => {
      try {
        await forceRetryDelivery(retryOrderId)
        toast.success('Pedido recolocado na fila para reentrega.')
      } catch {
        toast.error('Erro ao recolocar na fila. Tente novamente.')
      } finally {
        setRetryAlertOpen(false)
        setRetryOrderId(null)
      }
    })
  }

  function buildPageUrl(p: number) {
    const params = new URLSearchParams()
    if (currentStatus && currentStatus !== 'all') params.set('status', currentStatus)
    params.set('page', String(p))
    return `/admin/pedidos?${params.toString()}`
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-white">Pedidos</h1>
        <div className="w-44">
          <Select value={currentStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="bg-brand-surface border-white/20 text-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-brand-card rounded-card p-12 text-center">
          <ShoppingBag className="w-10 h-10 text-white/20 mx-auto mb-4" />
          <p className="text-white/60 font-medium mb-2">Nenhum pedido encontrado</p>
          <p className="text-sm text-white/40">
            Os pedidos aparecerão aqui após a primeira compra na loja.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-brand-card rounded-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">ID</TableHead>
                  <TableHead className="text-xs">Jogador</TableHead>
                  <TableHead className="text-xs">Item</TableHead>
                  <TableHead className="text-xs">Valor</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Data</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="text-xs text-white/45">#{order.id}</TableCell>
                    <TableCell>
                      <div>
                        {order.userName && (
                          <p className="text-sm text-white/90 font-medium">{order.userName}</p>
                        )}
                        {order.minecraftName && (
                          <p className="text-xs text-white/40">{order.minecraftName}</p>
                        )}
                        {!order.userName && !order.minecraftName && (
                          <span className="text-xs text-white/30">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-white/80">{order.itemName}</TableCell>
                    <TableCell className="text-sm font-medium text-brand-yellow">
                      {formatBRL(order.amountCents)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-xs text-white/45">
                      {order.createdAt.toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="inline-flex items-center justify-center h-7 w-7 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                          aria-label="Acoes"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              window.open(`/loja/pedido/${order.id}`, '_blank')
                            }
                          >
                            Ver Detalhes
                          </DropdownMenuItem>
                          {order.status === 'failed' && (
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => handleRetryClick(order.id)}
                            >
                              Forcar Retry
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => router.push(buildPageUrl(page - 1))}
                className="text-sm text-white/45"
              >
                ← Anterior
              </Button>
              <span className="text-sm text-white/45">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => router.push(buildPageUrl(page + 1))}
                className="text-sm text-white/45"
              >
                Proxima →
              </Button>
            </div>
          )}
        </>
      )}

      <AlertDialog open={retryAlertOpen} onOpenChange={setRetryAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Forcar reentrega?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso tentará entregar o item novamente via RCON. O pedido voltará para a fila.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRetry}
              disabled={isPending}
              className="bg-brand-accent hover:bg-brand-accent/90"
            >
              Confirmar Retry
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
