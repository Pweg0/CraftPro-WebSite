import { getVendas } from '@/lib/admin/actions/vendas'
import { VendasCrud } from './VendasCrud'

interface PageProps {
  searchParams: Promise<{ status?: string; dateFrom?: string; dateTo?: string; page?: string }>
}

export default async function AdminVendasPage({ searchParams }: PageProps) {
  const params = await searchParams
  const status = params.status ?? 'all'
  const dateFrom = params.dateFrom ?? ''
  const dateTo = params.dateTo ?? ''
  const page = parseInt(params.page ?? '1', 10) || 1

  const result = await getVendas(
    status === 'all' ? undefined : status,
    dateFrom || undefined,
    dateTo || undefined,
    page
  )

  return (
    <VendasCrud
      vendas={result.vendas}
      total={result.total}
      page={result.page}
      pageSize={result.pageSize}
      currentStatus={status}
      currentDateFrom={dateFrom}
      currentDateTo={dateTo}
    />
  )
}
