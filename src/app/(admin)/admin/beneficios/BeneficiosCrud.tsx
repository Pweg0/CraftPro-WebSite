'use client'
import { useState, useTransition, useEffect, useRef } from 'react'
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
import { Input } from '@/components/ui/input'
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
import { MoreHorizontal, Package, AlertTriangle, Ban } from 'lucide-react'
import { revogarBeneficio } from '@/lib/admin/actions/beneficios'
import type { AdminBeneficio } from '@/lib/admin/actions/beneficios'

interface BeneficiosCrudProps {
  beneficios: AdminBeneficio[]
  total: number
  page: number
  pageSize: number
  currentStatus: string
  currentPlayer: string
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'ativo', label: 'Ativo' },
  { value: 'expirando', label: 'Expirando' },
  { value: 'expirado', label: 'Expirado' },
]

function CountdownBadge({
  daysRemaining,
  status,
}: {
  daysRemaining: number | null
  status: string
}) {
  if (
    status === 'expired' ||
    status === 'revoked' ||
    daysRemaining === null ||
    daysRemaining === 0
  ) {
    return (
      <Badge
        variant="outline"
        className="text-white/40 border-white/20 bg-white/5 text-xs"
      >
        Expirado
      </Badge>
    )
  }

  if (daysRemaining > 14) {
    return (
      <Badge
        variant="outline"
        className="text-brand-online border-brand-online/30 bg-brand-online/10 text-xs"
      >
        {daysRemaining} dias restantes
      </Badge>
    )
  }

  if (daysRemaining >= 7) {
    return (
      <Badge
        variant="outline"
        className="text-brand-yellow border-brand-yellow/30 bg-brand-yellow/10 text-xs"
      >
        <AlertTriangle className="h-3 w-3 mr-1" />
        {daysRemaining} dias restantes
      </Badge>
    )
  }

  return (
    <Badge
      variant="outline"
      className="text-brand-accent border-brand-accent/30 bg-brand-accent/10 text-xs"
    >
      <AlertTriangle className="h-3 w-3 mr-1" />
      {daysRemaining} dias restantes
    </Badge>
  )
}

function DeliveryStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    delivered: {
      label: 'Entregue',
      className: 'text-brand-online border-brand-online/30 bg-brand-online/10 text-xs',
    },
    paid: {
      label: 'Pendente',
      className: 'text-brand-blue border-brand-blue/30 bg-brand-blue/10 text-xs',
    },
    revoked: {
      label: 'Revogado',
      className: 'text-brand-accent border-brand-accent/30 bg-brand-accent/10 text-xs',
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

export function BeneficiosCrud({
  beneficios,
  total,
  page,
  pageSize,
  currentStatus,
  currentPlayer,
}: BeneficiosCrudProps) {
  const router = useRouter()
  const [revogarId, setRevogarId] = useState<number | null>(null)
  const [revogarAlertOpen, setRevogarAlertOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [searchInput, setSearchInput] = useState(currentPlayer)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const totalPages = Math.ceil(total / pageSize)

  function handleStatusChange(value: string | null) {
    const params = new URLSearchParams()
    if (value && value !== 'all') params.set('status', value)
    if (currentPlayer) params.set('player', currentPlayer)
    router.push(`/admin/beneficios?${params.toString()}`)
  }

  function handleSearchChange(value: string) {
    setSearchInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams()
      if (value) params.set('player', value)
      if (currentStatus !== 'all') params.set('status', currentStatus)
      router.push(`/admin/beneficios?${params.toString()}`)
    }, 300)
  }

  function handleRevogarClick(orderId: number) {
    setRevogarId(orderId)
    setRevogarAlertOpen(true)
  }

  function handleConfirmRevogar() {
    if (revogarId === null) return
    startTransition(async () => {
      try {
        await revogarBeneficio(revogarId)
        toast.success('Beneficio revogado com sucesso.')
      } catch {
        toast.error('Erro ao revogar. Tente novamente.')
      } finally {
        setRevogarAlertOpen(false)
        setRevogarId(null)
      }
    })
  }

  function buildPageUrl(p: number) {
    const params = new URLSearchParams()
    if (currentStatus !== 'all') params.set('status', currentStatus)
    if (currentPlayer) params.set('player', currentPlayer)
    params.set('page', String(p))
    return `/admin/beneficios?${params.toString()}`
  }

  // Sync search input when props change (e.g., after navigation)
  useEffect(() => {
    setSearchInput(currentPlayer)
  }, [currentPlayer])

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-white">Beneficios Ativos</h1>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Buscar player..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-48 bg-brand-surface border-white/20 text-white text-sm"
          />
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
        </div>
      </div>

      {beneficios.length === 0 ? (
        <div className="bg-brand-card rounded-card p-12 text-center">
          <Package className="w-10 h-10 text-white/20 mx-auto mb-4" />
          <p className="text-white/60 font-medium mb-2">Nenhum beneficio ativo</p>
          <p className="text-sm text-white/40">
            Os beneficios aparecerão aqui apos a primeira compra confirmada na loja.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-brand-card rounded-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Player</TableHead>
                  <TableHead className="text-xs">Beneficio</TableHead>
                  <TableHead className="text-xs">Data de compra</TableHead>
                  <TableHead className="text-xs">Valor pago</TableHead>
                  <TableHead className="text-xs">Expira em</TableHead>
                  <TableHead className="text-xs">Status servidor</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {beneficios.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="text-sm text-white/90">
                      {b.playerName ?? <span className="text-white/30">—</span>}
                    </TableCell>
                    <TableCell className="text-sm text-white/80">{b.itemName}</TableCell>
                    <TableCell className="text-xs text-white/45">
                      {b.createdAt.toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-brand-yellow">
                      {formatBRL(b.amountCents)}
                    </TableCell>
                    <TableCell>
                      <CountdownBadge
                        daysRemaining={b.daysRemaining}
                        status={b.status}
                      />
                    </TableCell>
                    <TableCell>
                      <DeliveryStatusBadge status={b.status} />
                    </TableCell>
                    <TableCell>
                      {b.status !== 'expired' && b.status !== 'revoked' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="inline-flex items-center justify-center h-7 w-7 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                            aria-label="Acoes do beneficio"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => handleRevogarClick(b.id)}
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Revogar Beneficio
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
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

      <AlertDialog open={revogarAlertOpen} onOpenChange={setRevogarAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revogar beneficio?</AlertDialogTitle>
            <AlertDialogDescription>
              O rank sera removido do jogador imediatamente. Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRevogar}
              disabled={isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              Sim, revogar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
