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
import { Badge } from '@/components/ui/badge'
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
import { ShopItemForm } from '@/components/admin/ShopItemForm'
import { deleteShopItem } from '@/lib/admin/actions/shop-items'

interface ShopItem {
  id: number
  name: string
  description: string
  category: string
  price: number
  imageUrl?: string | null
  available: number
}

interface LojaCrudProps {
  items: ShopItem[]
}

function formatBRL(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}

export function LojaCrud({ items }: LojaCrudProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<ShopItem | undefined>(undefined)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)

  function handleEdit(item: ShopItem) {
    setEditItem(item)
    setFormOpen(true)
  }

  function handleDeleteClick(id: number) {
    setDeleteId(id)
    setDeleteAlertOpen(true)
  }

  function handleAddClick() {
    setEditItem(undefined)
    setFormOpen(true)
  }

  async function handleConfirmDelete() {
    if (deleteId === null) return
    try {
      await deleteShopItem(deleteId)
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
        <h1 className="text-xl font-semibold text-white">Loja</h1>
        <Button onClick={handleAddClick} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Adicionar Item da Loja
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
            Adicionar Item da Loja
          </Button>
        </div>
      ) : (
        <div className="bg-brand-card rounded-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="text-sm text-white/90 font-medium">{item.name}</p>
                      <p className="text-xs text-white/40 truncate max-w-xs">{item.description}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-white/60">{item.category}</TableCell>
                  <TableCell className="text-sm font-medium text-white/80">
                    {item.price > 0 ? formatBRL(item.price) : <span className="text-white/30">—</span>}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        item.available === 1
                          ? 'text-brand-green border-brand-green/30 bg-brand-green/10 text-xs'
                          : 'text-white/40 border-white/20 bg-white/5 text-xs'
                      }
                    >
                      {item.available === 1 ? 'Visível' : 'Oculto'}
                    </Badge>
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
                        <DropdownMenuItem onClick={() => handleEdit(item)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => handleDeleteClick(item.id)}
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

      <ShopItemForm
        key={editItem?.id ?? 'new'}
        item={editItem}
        open={formOpen}
        onOpenChange={setFormOpen}
      />

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Item da Loja</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Tem certeza?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleConfirmDelete}>
              Confirmar Exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
