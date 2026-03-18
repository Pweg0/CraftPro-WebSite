import { getDashboardStats, getRecentAuditLogs } from '@/lib/db/queries/admin'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { Users, Swords, Ban, Server } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()
  const recentLogs = await getRecentAuditLogs(10)

  return (
    <div>
      <h1 className="font-display text-base text-white mb-8">Dashboard</h1>

      {/* Stat cards grid: 2 cols mobile, 4 cols desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <AdminStatCard
          icon={Users}
          label="Total de Jogadores"
          value={stats.totalPlayers}
          accentColor="border-brand-accent"
        />
        <AdminStatCard
          icon={Swords}
          label="Partidas Hoje"
          value={stats.matchesToday}
          accentColor="border-brand-blue"
        />
        <AdminStatCard
          icon={Ban}
          label="Itens Banidos"
          value={stats.totalBannedItems}
          accentColor="border-brand-yellow"
        />
        <AdminStatCard
          icon={Server}
          label="Servidores"
          value={stats.totalServers}
          accentColor="border-brand-online"
        />
      </div>

      {/* Recent audit logs */}
      <h2 className="text-xl font-semibold text-white mb-4">Logs Recentes</h2>
      {recentLogs.length === 0 ? (
        <p className="text-white/60 text-sm">Nenhuma acao registrada ainda.</p>
      ) : (
        <div className="bg-brand-card rounded-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin</TableHead>
                <TableHead>Acao</TableHead>
                <TableHead>Alvo</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm text-white/80">
                    {log.discordName ?? 'Desconhecido'}
                  </TableCell>
                  <TableCell className="text-sm text-white/80">{log.action}</TableCell>
                  <TableCell className="text-sm text-white/60">{log.targetId ?? '—'}</TableCell>
                  <TableCell className="text-sm text-brand-blue">
                    {log.createdAt ? new Date(log.createdAt).toLocaleString('pt-BR') : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
