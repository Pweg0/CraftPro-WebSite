import { getOrders } from '@/lib/admin/actions/orders'
import { PedidosCrud } from './PedidosCrud'

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>
}

export default async function AdminPedidosPage({ searchParams }: PageProps) {
  const params = await searchParams
  const status = params.status ?? 'all'
  const page = parseInt(params.page ?? '1', 10) || 1

  const result = await getOrders(status, page)

  return (
    <PedidosCrud
      orders={result.orders}
      total={result.total}
      page={result.page}
      pageSize={result.pageSize}
      currentStatus={status}
    />
  )
}
