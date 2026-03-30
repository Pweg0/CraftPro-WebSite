// src/app/(public)/servidores/page.tsx
import { db } from '@/lib/db'
import { servers } from '@/lib/db/schema'
import { getServerStatus } from '@/lib/minecraft-status'
import { ServerGrid } from '@/components/server-status/ServerGrid'
import { Wifi } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 30

export default async function ServidoresPage() {
  const dbServers = await db.select().from(servers)
  const serverList = dbServers.map((s) => ({
    id: s.id,
    name: s.name,
    ip: s.ip,
    description: s.description,
    bannerPath:
      s.bannerPath && (s.bannerPath.startsWith('/') || s.bannerPath.startsWith('http'))
        ? s.bannerPath
        : undefined,
  }))

  const statuses = await Promise.all(
    serverList.map((server) => getServerStatus(server.ip))
  )

  const onlineCount = statuses.filter((s) => s.online).length

  return (
    <div className="min-h-screen bg-brand-primary grid-bg py-20 px-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-brand-accent/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 rounded-full bg-brand-blue/5 blur-3xl pointer-events-none" />

      <div className="container mx-auto relative z-10">
        {/* Page header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-online/20 bg-brand-online/5 text-brand-online text-xs font-medium mb-5">
            <Wifi className="w-3 h-3" />
            {onlineCount} de {serverList.length} online
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-white mb-4">Servidores</h1>
          <p className="text-white/45 max-w-xl mx-auto text-sm leading-relaxed">
            Status atualizado a cada 30 segundos. Clique no IP para copiar e entrar.
          </p>
        </div>

        <ServerGrid servers={serverList} statuses={statuses} />
      </div>
    </div>
  )
}
