import { getBeneficios } from '@/lib/admin/actions/beneficios'
import { BeneficiosCrud } from './BeneficiosCrud'

interface PageProps {
  searchParams: Promise<{ status?: string; player?: string; page?: string }>
}

export default async function AdminBeneficiosPage({ searchParams }: PageProps) {
  const params = await searchParams
  const status = params.status ?? 'all'
  const player = params.player ?? ''
  const page = parseInt(params.page ?? '1', 10) || 1

  const result = await getBeneficios(
    status === 'all' ? undefined : status,
    player || undefined,
    page
  )

  return (
    <BeneficiosCrud
      beneficios={result.beneficios}
      total={result.total}
      page={result.page}
      pageSize={result.pageSize}
      currentStatus={status}
      currentPlayer={player}
    />
  )
}
