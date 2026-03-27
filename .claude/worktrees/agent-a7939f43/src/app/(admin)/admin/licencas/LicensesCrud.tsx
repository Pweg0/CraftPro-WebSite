'use client'

import { useState } from 'react'
import { createLicense, revokeLicense, reactivateLicense, deleteLicense } from '@/lib/admin/actions/licenses'
import { useRouter } from 'next/navigation'
import { Key, Trash2, Ban, RefreshCw, Copy, Check } from 'lucide-react'

interface License {
  id: number
  key: string
  ownerName: string
  status: string
  serverIp: string | null
  lastValidatedAt: Date | null
  createdAt: Date | null
  note: string | null
}

export function LicensesCrud({ licenses }: { licenses: License[] }) {
  const router = useRouter()
  const [ownerName, setOwnerName] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  async function handleCreate() {
    if (!ownerName.trim()) return
    setLoading(true)
    try {
      await createLicense({ ownerName: ownerName.trim(), note: note.trim() || undefined })
      setOwnerName('')
      setNote('')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleRevoke(id: number) {
    if (!confirm('Revogar esta licenca? O mod vai parar de funcionar no servidor.')) return
    await revokeLicense(id)
    router.refresh()
  }

  async function handleReactivate(id: number) {
    await reactivateLicense(id)
    router.refresh()
  }

  async function handleDelete(id: number) {
    if (!confirm('Deletar permanentemente esta licenca?')) return
    await deleteLicense(id)
    router.refresh()
  }

  function copyKey(id: number, key: string) {
    navigator.clipboard.writeText(key)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function formatDate(d: Date | null) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* Create form */}
      <div className="bg-brand-card rounded-xl border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Key className="h-5 w-5 text-brand-accent" />
          Gerar Nova Licenca
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/60 mb-1">Nome do Comprador *</label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Ex: ServerBR_João"
              className="w-full bg-brand-surface border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-accent"
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Nota (opcional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Comprou via Discord em 19/03"
              className="w-full bg-brand-surface border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-accent"
            />
          </div>
        </div>
        <button
          onClick={handleCreate}
          disabled={loading || !ownerName.trim()}
          className="mt-4 px-6 py-2 bg-brand-accent text-white font-semibold rounded-lg hover:bg-brand-accent/80 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Gerando...' : 'Gerar Licenca'}
        </button>
      </div>

      {/* Licenses table */}
      <div className="bg-brand-card rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/50">
                <th className="text-left px-4 py-3 font-medium">Key</th>
                <th className="text-left px-4 py-3 font-medium">Dono</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Server IP</th>
                <th className="text-left px-4 py-3 font-medium">Ultimo Check</th>
                <th className="text-left px-4 py-3 font-medium">Criada</th>
                <th className="text-right px-4 py-3 font-medium">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {licenses.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-white/40">
                    Nenhuma licenca gerada ainda.
                  </td>
                </tr>
              )}
              {licenses.map((lic) => (
                <tr key={lic.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-brand-blue">{lic.key}</code>
                      <button
                        onClick={() => copyKey(lic.id, lic.key)}
                        className="text-white/30 hover:text-white transition-colors"
                        title="Copiar key"
                      >
                        {copiedId === lic.id
                          ? <Check className="h-3.5 w-3.5 text-green-400" />
                          : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white">{lic.ownerName}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      lic.status === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {lic.status === 'active' ? 'Ativa' : 'Revogada'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/60 text-xs font-mono">
                    {lic.serverIp ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-white/50 text-xs">{formatDate(lic.lastValidatedAt)}</td>
                  <td className="px-4 py-3 text-white/50 text-xs">{formatDate(lic.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {lic.status === 'active' ? (
                        <button
                          onClick={() => handleRevoke(lic.id)}
                          className="p-1.5 rounded hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Revogar"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivate(lic.id)}
                          className="p-1.5 rounded hover:bg-green-500/20 text-green-400 transition-colors"
                          title="Reativar"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(lic.id)}
                        className="p-1.5 rounded hover:bg-red-500/20 text-red-400/60 hover:text-red-400 transition-colors"
                        title="Deletar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes */}
      {licenses.some(l => l.note) && (
        <div className="text-xs text-white/30 space-y-1">
          {licenses.filter(l => l.note).map(l => (
            <p key={l.id}><span className="text-white/50">{l.ownerName}:</span> {l.note}</p>
          ))}
        </div>
      )}
    </div>
  )
}
