// src/app/(public)/servidores/page.tsx
// Server Component — fetches server status server-side with revalidate built into getServerStatus
import { db } from '@/lib/db'
import { servers } from '@/lib/db/schema'
import { getServerStatus } from '@/lib/minecraft-status'
import { ServerGrid } from '@/components/server-status/ServerGrid'

export const dynamic = 'force-dynamic' // ensures status is re-fetched per request window
export const revalidate = 30 // ISR: revalidate every 30 seconds

export default async function ServidoresPage() {
  const dbServers = await db.select().from(servers)
  const serverList = dbServers.map((s) => ({
    id: s.id,
    name: s.name,
    ip: s.ip,
    description: s.description,
    bannerPath: s.bannerPath,
  }))

  const statuses = await Promise.all(
    serverList.map((server) => getServerStatus(server.ip))
  )

  const onlineCount = statuses.filter((s) => s.online).length

  return (
    <div className="min-h-screen bg-brand-primary py-16 px-4">
      <div className="container mx-auto">
        {/* Page header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-2xl text-white mb-4">Servidores</h1>
          <p className="text-white/60 max-w-xl mx-auto">
            {onlineCount} de {serverList.length} servidores online agora.
            Status atualizado a cada 30 segundos.
          </p>
        </div>

        {/* Server grid */}
        <ServerGrid servers={serverList} statuses={statuses} />
      </div>
    </div>
  )
}
