'use client'
import { useRouter } from 'next/navigation'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ShoppingBag } from 'lucide-react'
import type { AdminVenda } from '@/lib/admin/actions/vendas'

interface VendasCrudProps {
  vendas: AdminVenda[]
  total: number
  page: number
  pageSize: number
  currentStatus: string
  currentDateFrom: string
  currentDateTo: string
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendente' },
  { value: 'paid', label: 'Pago' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'failed', label: 'Falhou' },
  { value: 'revoked', label: 'Revogado' },
  { value: 'expired', label: 'Expirado' },
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
    revoked: {
      label: 'Revogado',
      className: 'text-brand-accent border-brand-accent/30 bg-brand-accent/10 text-xs',
    },
    expired: {
      label: 'Expirado',
      className: 'text-white/40 border-white/20 bg-white/5 text-xs',
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

function DeliveryStatusBadge({
  deliveredAt,
  revokedAt,
}: {
  deliveredAt: Date | null
  revokedAt: Date | null
}) {
  if (revokedAt) {
    return (
      <Badge
        variant="outline"
        className="text-brand-accent border-brand-accent/30 bg-brand-accent/10 text-xs"
      >
        Revogado
      </Badge>
    )
  }
  if (deliveredAt) {
    return (
      <Badge
        variant="outline"
        className="text-brand-online border-brand-online/30 bg-brand-online/10 text-xs"
      >
        Entregue
      </Badge>
    )
  }
  return (
    <Badge
      variant="outline"
      className="text-brand-yellow border-brand-yellow/30 bg-brand-yellow/10 text-xs"
    >
      Pendente
    </Badge>
  )
}

function formatBRL(cents: number): string {
  return `R$ ${(cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
}

export function VendasCrud({
  vendas,
  total,
  page,
  pageSize,
  currentStatus,
  currentDateFrom,
  currentDateTo,
}: VendasCrudProps) {
  const router = useRouter()

  const totalPages = Math.ceil(total / pageSize)

  function buildParams(overrides: Record<string, string>) {
    const params = new URLSearchParams()
    if (currentStatus !== 'all') params.set('status', currentStatus)
    if (currentDateFrom) params.set('dateFrom', currentDateFrom)
    if (currentDateTo) params.set('dateTo', currentDateTo)
    for (const [key, value] of Object.entries(overrides)) {
      if (value) params.set(key, value)
      else params.delete(key)
    }
    return params.toString()
  }

  function handleStatusChange(value: string | null) {
    const params = new URLSearchParams()
    if (value && value !== 'all') params.set('status', value)
    if (currentDateFrom) params.set('dateFrom', currentDateFrom)
    if (currentDateTo) params.set('dateTo', currentDateTo)
    router.push(`/admin/vendas?${params.toString()}`)
  }

  function handleDateFromChange(e: React.ChangeEvent<HTMLInputElement>) {
    const params = new URLSearchParams()
    if (currentStatus !== 'all') params.set('status', currentStatus)
    if (e.target.value) params.set('dateFrom', e.target.value)
    if (currentDateTo) params.set('dateTo', currentDateTo)
    router.push(`/admin/vendas?${params.toString()}`)
  }

  function handleDateToChange(e: React.ChangeEvent<HTMLInputElement>) {
    const params = new URLSearchParams()
    if (currentStatus !== 'all') params.set('status', currentStatus)
    if (currentDateFrom) params.set('dateFrom', currentDateFrom)
    if (e.target.value) params.set('dateTo', e.target.value)
    router.push(`/admin/vendas?${params.toString()}`)
  }

  function buildPageUrl(p: number) {
    const qs = buildParams({ page: String(p) })
    return `/admin/vendas?${qs}`
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-white">Log de Vendas</h1>
        <div className="flex items-center gap-3">
          <Select value={currentStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-40 bg-brand-surface border-white/20 text-white text-sm">
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
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/45">De</span>
            <Input
              type="date"
              value={currentDateFrom}
              onChange={handleDateFromChange}
              className="w-36 bg-brand-surface border-white/20 text-white text-sm"
            />
            <span className="text-xs text-white/45">Ate</span>
            <Input
              type="date"
              value={currentDateTo}
              onChange={handleDateToChange}
              className="w-36 bg-brand-surface border-white/20 text-white text-sm"
            />
          </div>
        </div>
      </div>

      {vendas.length === 0 ? (
        <div className="bg-brand-card rounded-card p-12 text-center">
          <ShoppingBag className="w-10 h-10 text-white/20 mx-auto mb-4" />
          <p className="text-white/60 font-medium mb-2">Nenhuma venda registrada</p>
          <p className="text-sm text-white/40">
            O historico de vendas aparecera aqui apos o primeiro pagamento confirmado.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-brand-card rounded-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs text-right">#</TableHead>
                  <TableHead className="text-xs">Player</TableHead>
                  <TableHead className="text-xs">Item</TableHead>
                  <TableHead className="text-xs">Valor</TableHead>
                  <TableHead className="text-xs">Status pagamento</TableHead>
                  <TableHead className="text-xs">Metodo</TableHead>
                  <TableHead className="text-xs">ID MercadoPago</TableHead>
                  <TableHead className="text-xs">Status entrega</TableHead>
                  <TableHead className="text-xs">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendas.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="text-xs text-white/45 text-right">
                      #{v.id}
                    </TableCell>
                    <TableCell className="text-sm text-white/90">
                      {v.playerName ?? <span className="text-white/30">—</span>}
                    </TableCell>
                    <TableCell className="text-sm text-white/80">{v.itemName}</TableCell>
                    <TableCell className="text-sm font-medium text-brand-yellow">
                      {formatBRL(v.amountCents)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={v.status} />
                    </TableCell>
                    <TableCell className="text-xs text-white/60">
                      {v.paymentMethod ?? '—'}
                    </TableCell>
                    <TableCell
                      className="text-xs text-white/40 font-mono"
                      title={v.mercadopagoPaymentId ?? undefined}
                    >
                      {v.mercadopagoPaymentId
                        ? v.mercadopagoPaymentId.slice(0, 12) +
                          (v.mercadopagoPaymentId.length > 12 ? '...' : '')
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <DeliveryStatusBadge
                        deliveredAt={v.deliveredAt}
                        revokedAt={v.revokedAt}
                      />
                    </TableCell>
                    <TableCell className="text-xs text-white/45">
                      {v.createdAt.toLocaleDateString('pt-BR')}
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
                Pagina {page} de {totalPages}
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
    </>
  )
}
