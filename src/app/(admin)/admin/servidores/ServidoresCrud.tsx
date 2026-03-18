'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { MoreHorizontal, Plus } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
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
import { ServerForm } from '@/components/admin/ServerForm'
import { deleteServer } from '@/lib/admin/actions/servers'

interface ServerItem {
  id: string
  name: string
  ip: string
  description: string
  bannerPath: string
}

interface ServidoresCrudProps {
  items: ServerItem[]
}

export function ServidoresCrud({ items }: ServidoresCrudProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<ServerItem | undefined>(undefined)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)

  function handleEdit(item: ServerItem) {
    setEditItem(item)
    setFormOpen(true)
  }

  function handleDeleteClick(id: string) {
    setDeleteId(id)
    setDeleteAlertOpen(true)
  }

  function handleAddClick() {
    setEditItem(undefined)
    setFormOpen(true)
  }

  async function handleConfirmDelete() {
    if (!deleteId) return
    try {
      await deleteServer(deleteId)
      toast.success('Item deletado.')
    } catch {
      toast.error('Erro ao deletar. Tente novamente.')
    } finally {
      setDeleteAlertOpen(false)
      setDeleteId(null)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-white">Servidores</h1>
        <Button onClick={handleAddClick} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Adicionar Servidor
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="bg-brand-card rounded-card p-12 text-center">
          <p className="text-white/60 mb-4">Nenhum item encontrado</p>
          <p className="text-sm text-white/40 mb-6">
            Clique em &apos;Adicionar&apos; para criar o primeiro registro.
          </p>
          <Button onClick={handleAddClick} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Adicionar Servidor
          </Button>
        </div>
      ) : (
        <div className="bg-brand-card rounded-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Descricao</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-xs text-white/50 font-mono">{item.id}</TableCell>
                  <TableCell className="text-sm text-white/90 font-medium">{item.name}</TableCell>
                  <TableCell className="text-sm text-white/60">{item.ip}</TableCell>
                  <TableCell className="text-sm text-white/60 max-w-xs truncate">
                    {item.description}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="inline-flex items-center justify-center h-7 w-7 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                        aria-label="Acoes"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => handleEdit(item)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => handleDeleteClick(item.id)}
                        >
                          Deletar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ServerForm
        key={editItem?.id ?? 'new'}
        item={editItem}
        open={formOpen}
        onOpenChange={setFormOpen}
      />

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Servidor</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acao nao pode ser desfeita. Tem certeza?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleConfirmDelete}>
              Confirmar Exclusao
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
