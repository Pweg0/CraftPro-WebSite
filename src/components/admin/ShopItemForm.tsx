'use client'
import { useTransition, useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createShopItem, updateShopItem } from '@/lib/admin/actions/shop-items'

interface ShopItemFormProps {
  item?: {
    id: number
    name: string
    description: string
    category: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CATEGORY_OPTIONS = ['Cosmeticos', 'Ranks & VIP', 'Itens do Servidor']

export function ShopItemForm({ item, open, onOpenChange }: ShopItemFormProps) {
  const [isPending, startTransition] = useTransition()
  const isEditing = !!item
  const [category, setCategory] = useState(item?.category ?? '')

  async function handleSubmit(formData: FormData) {
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      category,
    }

    startTransition(async () => {
      try {
        if (isEditing) {
          await updateShopItem(item.id, data)
        } else {
          await createShopItem(data)
        }
        toast.success('Item salvo com sucesso.')
        onOpenChange(false)
      } catch {
        toast.error('Erro ao salvar. Tente novamente.')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-brand-card text-white border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">
            {isEditing ? 'Editar Item da Loja' : 'Adicionar Item da Loja'}
          </DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-white/70 block mb-1">Nome</label>
            <Input
              name="name"
              defaultValue={item?.name}
              required
              className="bg-brand-surface border-white/20 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-white/70 block mb-1">Descricao</label>
            <Textarea
              name="description"
              defaultValue={item?.description}
              required
              rows={3}
              className="bg-brand-surface border-white/20 text-white resize-none"
            />
          </div>
          <div>
            <label className="text-sm text-white/70 block mb-1">Categoria</label>
            <Select value={category} onValueChange={(v) => setCategory(v ?? '')}>
              <SelectTrigger className="w-full bg-brand-surface border-white/20 text-white">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Salvar Alteracoes' : 'Criar Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
