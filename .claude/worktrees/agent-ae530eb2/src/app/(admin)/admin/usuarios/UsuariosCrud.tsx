'use client'
import { useState, useTransition } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Gamepad2, Unlink, Link2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { linkMinecraftAccount, unlinkMinecraftAccount } from '@/lib/admin/actions/users'

interface UserRow {
  id: string
  name: string | null
  email: string | null
  image: string | null
  discordId: string | null
  minecraftUuid: string | null
  minecraftName: string | null
  createdAt: Date | null
}

interface UsuariosCrudProps {
  users: UserRow[]
}

export function UsuariosCrud({ users }: UsuariosCrudProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [unlinkAlertOpen, setUnlinkAlertOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null)
  const [minecraftInput, setMinecraftInput] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleLinkClick(user: UserRow) {
    setSelectedUser(user)
    setMinecraftInput(user.minecraftName ?? '')
    setLinkDialogOpen(true)
  }

  function handleUnlinkClick(user: UserRow) {
    setSelectedUser(user)
    setUnlinkAlertOpen(true)
  }

  function handleLinkSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedUser || !minecraftInput.trim()) return
    startTransition(async () => {
      try {
        const result = await linkMinecraftAccount(selectedUser.id, minecraftInput.trim())
        toast.success(`Vinculado: ${result.name} (${result.uuid})`)
        setLinkDialogOpen(false)
        setMinecraftInput('')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao vincular.')
      }
    })
  }

  function handleConfirmUnlink() {
    if (!selectedUser) return
    startTransition(async () => {
      try {
        await unlinkMinecraftAccount(selectedUser.id)
        toast.success('Vinculo removido.')
        setUnlinkAlertOpen(false)
      } catch {
        toast.error('Erro ao desvincular.')
      }
    })
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-white">Usuarios</h1>
        <p className="text-sm text-white/40">{users.length} usuarios registrados</p>
      </div>

      {users.length === 0 ? (
        <div className="bg-brand-card rounded-card p-12 text-center">
          <p className="text-white/60">Nenhum usuario registrado ainda.</p>
        </div>
      ) : (
        <div className="bg-brand-card rounded-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Discord</TableHead>
                <TableHead>Minecraft</TableHead>
                <TableHead>Discord ID</TableHead>
                <TableHead className="w-24">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.image ? (
                        <Image
                          src={user.image}
                          width={28}
                          height={28}
                          alt={user.name ?? ''}
                          className="rounded-full"
                          unoptimized
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-white/10" />
                      )}
                      <span className="text-sm text-white/90">{user.name ?? 'Sem nome'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.minecraftName ? (
                      <div className="flex items-center gap-2">
                        <Image
                          src={`https://mc-heads.net/avatar/${user.minecraftUuid}/20`}
                          width={20}
                          height={20}
                          alt={user.minecraftName}
                          className="rounded"
                          unoptimized
                        />
                        <span className="text-sm text-green-400">{user.minecraftName}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-white/30">Nao vinculado</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-white/40 font-mono">
                    {user.discordId ?? '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleLinkClick(user)}
                      >
                        <Gamepad2 className="h-3.5 w-3.5 mr-1" />
                        {user.minecraftName ? 'Editar' : 'Vincular'}
                      </Button>
                      {user.minecraftName && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-destructive hover:text-destructive"
                          onClick={() => handleUnlinkClick(user)}
                        >
                          <Unlink className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="bg-brand-card text-white border-white/10 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Vincular Minecraft — {selectedUser?.name}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLinkSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-white/70 block mb-1">Username Minecraft</label>
              <Input
                value={minecraftInput}
                onChange={(e) => setMinecraftInput(e.target.value)}
                required
                placeholder="Ex: Steve"
                className="bg-brand-surface border-white/20 text-white"
              />
              <p className="text-xs text-white/40 mt-1">
                O UUID sera buscado automaticamente na API da Mojang.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLinkDialogOpen(false)}
                disabled={isPending}
              >
                Fechar
              </Button>
              <Button type="submit" disabled={isPending || !minecraftInput.trim()}>
                {isPending ? 'Buscando...' : 'Vincular Conta'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Unlink Confirmation */}
      <AlertDialog open={unlinkAlertOpen} onOpenChange={setUnlinkAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desvincular Minecraft</AlertDialogTitle>
            <AlertDialogDescription>
              Remover vinculo de {selectedUser?.minecraftName} da conta Discord {selectedUser?.name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Fechar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleConfirmUnlink}>
              {isPending ? 'Removendo...' : 'Desvincular'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
