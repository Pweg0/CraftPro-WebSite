'use client'
import { useOptimistic, useTransition, useState } from 'react'
import { toast } from 'sonner'
import { grantPermission, revokePermission } from '@/lib/admin/actions/permissions'

type Section = 'itens-banidos' | 'servidores' | 'loja' | 'leaderboard'

const SECTIONS: { key: Section; label: string }[] = [
  { key: 'itens-banidos', label: 'Itens Banidos' },
  { key: 'servidores', label: 'Servidores' },
  { key: 'loja', label: 'Loja' },
  { key: 'leaderboard', label: 'Leaderboard' },
]

interface PermissionManagerProps {
  adminIds: string[]
  permissions: Array<{ discordId: string; section: string }>
}

export function PermissionManager({ adminIds, permissions }: PermissionManagerProps) {
  const [, startTransition] = useTransition()
  const [newAdminId, setNewAdminId] = useState('')
  const [isAddingAdmin, setIsAddingAdmin] = useState(false)

  // Build a set of "discordId:section" strings for quick lookup
  const [optimisticPerms, setOptimisticPerms] = useOptimistic(
    new Set(permissions.map(p => `${p.discordId}:${p.section}`)),
    (current, update: { type: 'add' | 'remove'; key: string }) => {
      const next = new Set(current)
      if (update.type === 'add') next.add(update.key)
      else next.delete(update.key)
      return next
    }
  )

  function hasPermission(discordId: string, section: Section): boolean {
    return optimisticPerms.has(`${discordId}:${section}`)
  }

  function handleToggle(discordId: string, section: Section, currentlyGranted: boolean) {
    const key = `${discordId}:${section}`
    startTransition(async () => {
      setOptimisticPerms({ type: currentlyGranted ? 'remove' : 'add', key })
      try {
        if (currentlyGranted) {
          await revokePermission(discordId, section)
          toast.success(`Permissao "${section}" removida.`)
        } else {
          await grantPermission(discordId, section)
          toast.success(`Permissao "${section}" concedida.`)
        }
      } catch {
        toast.error('Erro ao atualizar permissao. Tente novamente.')
      }
    })
  }

  async function handleAddAdmin() {
    const id = newAdminId.trim()
    if (!id) return
    setIsAddingAdmin(true)
    try {
      // Grant all sections to the new admin as a starting point?
      // Actually per spec, this only adds an individual permission row.
      // We'll grant the first section (itens-banidos) as placeholder — but per spec
      // the input is just for reference; actual grants happen via checkboxes.
      // So we just reset and show info toast.
      toast.info(`Para conceder acesso a ${id}, marque as permissoes na tabela acima apos adicionar o ID a ADMIN_DISCORD_IDS.`)
      setNewAdminId('')
    } finally {
      setIsAddingAdmin(false)
    }
  }

  const allIds = adminIds.length > 0 ? adminIds : []

  return (
    <div className="space-y-8">
      {allIds.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nenhum admin encontrado em ADMIN_DISCORD_IDS.
        </p>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Discord ID</th>
                {SECTIONS.map(s => (
                  <th key={s.key} className="text-center px-4 py-3 font-semibold text-muted-foreground">
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allIds.map(discordId => (
                <tr key={discordId} className="border-b border-border last:border-0 hover:bg-muted/10">
                  <td className="px-4 py-3 font-mono text-xs text-white">{discordId}</td>
                  {SECTIONS.map(s => {
                    const granted = hasPermission(discordId, s.key)
                    return (
                      <td key={s.key} className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={granted}
                          onChange={() => handleToggle(discordId, s.key, granted)}
                          className="h-4 w-4 cursor-pointer accent-brand-accent"
                          aria-label={`${granted ? 'Revogar' : 'Conceder'} permissao ${s.label} para ${discordId}`}
                        />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add admin section */}
      <div className="rounded-lg border border-border p-4 space-y-3">
        <h3 className="text-sm font-semibold text-white">Adicionar Admin</h3>
        <p className="text-xs text-muted-foreground">
          O Discord ID deve estar na lista ADMIN_DISCORD_IDS do servidor para ter acesso ao painel.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={newAdminId}
            onChange={e => setNewAdminId(e.target.value)}
            placeholder="Discord ID (ex: 123456789012345678)"
            className="flex-1 h-8 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button
            onClick={handleAddAdmin}
            disabled={isAddingAdmin || !newAdminId.trim()}
            className="h-8 px-4 rounded-md bg-brand-accent text-white text-sm font-medium disabled:opacity-50"
          >
            Conceder Acesso
          </button>
        </div>
      </div>
    </div>
  )
}
