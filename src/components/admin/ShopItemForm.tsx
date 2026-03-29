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
    price: number | null
    imageUrl?: string | null
    available: number
    type: string | null
    duration: number | null
    active: boolean | null
    server: string | null
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CATEGORY_OPTIONS = [
  { value: 'cosmeticos', label: 'Cosméticos' },
  { value: 'ranks-vip', label: 'Ranks & VIP' },
  { value: 'itens-servidor', label: 'Itens do Servidor' },
]

const TYPE_OPTIONS = [
  { value: 'rank', label: 'Rank' },
  { value: 'key', label: 'Key' },
  { value: 'cosmetic', label: 'Cosmetico' },
]

const SERVER_OPTIONS = [
  { value: 'all-the-moons', label: 'All The Moons' },
  { value: 'all-the-mods', label: 'All The Mods' },
]

export function ShopItemForm({ item, open, onOpenChange }: ShopItemFormProps) {
  const [isPending, startTransition] = useTransition()
  const isEditing = !!item
  const [category, setCategory] = useState(item?.category ?? '')
  const [available, setAvailable] = useState(String(item?.available ?? 1))
  const [type, setType] = useState(item?.type ?? '')
  const [active, setActive] = useState(item?.active ?? true)
  const [server, setServer] = useState(item?.server ?? '')

  async function handleSubmit(formData: FormData) {
    const priceReais = parseFloat(formData.get('price') as string || '0')
    const priceCents = Math.round(priceReais * 100)
    const imageUrlRaw = ((formData.get('imageUrl') as string) || '').trim()
    const durationRaw = formData.get('duration') as string
    const duration = durationRaw && durationRaw !== '' ? parseInt(durationRaw, 10) : null

    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      category,
      price: priceCents,
      imageUrl: imageUrlRaw || null,
      available: parseInt(available, 10),
      type,
      duration: type === 'rank' ? duration : null,
      active,
      server: server || null,
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

  // Convert price from cents to BRL string for display in input
  const defaultPriceValue = item?.price ? (item.price / 100).toFixed(2) : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-brand-card text-white border-white/10 max-h-[90vh] overflow-y-auto">
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
            <label className="text-sm text-white/70 block mb-1">Descrição</label>
            <Textarea
              name="description"
              defaultValue={item?.description}
              required
              rows={3}
              className="bg-brand-surface border-white/20 text-white resize-none"
            />
          </div>
          <div>
            <label className="text-sm text-white/70 block mb-1">Servidor</label>
            <Select value={server} onValueChange={(v) => setServer(v ?? '')}>
              <SelectTrigger className="w-full bg-brand-surface border-white/20 text-white">
                <SelectValue placeholder="Selecione o servidor" />
              </SelectTrigger>
              <SelectContent>
                {SERVER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-white/70 block mb-1">Categoria</label>
            <Select value={category} onValueChange={(v) => setCategory(v ?? '')}>
              <SelectTrigger className="w-full bg-brand-surface border-white/20 text-white">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-white/70 block mb-1">Tipo</label>
            <Select value={type} onValueChange={(v) => setType(v ?? '')}>
              <SelectTrigger className="w-full bg-brand-surface border-white/20 text-white">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {type === 'rank' && (
            <div>
              <label className="text-sm text-white/70 block mb-1">Duracao (dias)</label>
              <Input
                name="duration"
                type="number"
                min="1"
                defaultValue={item?.duration ?? ''}
                placeholder="Ex: 30"
                className="bg-brand-surface border-white/20 text-white"
              />
              <p className="text-xs text-white/40 mt-1">Quantidade de dias de acesso ao rank</p>
            </div>
          )}
          <div>
            <label className="text-sm text-white/70 block mb-1">
              Preco (R$)
            </label>
            <Input
              name="price"
              type="number"
              min="0.01"
              step="0.01"
              defaultValue={defaultPriceValue}
              placeholder="0.00"
              required
              className="bg-brand-surface border-white/20 text-white"
            />
            <p className="text-xs text-white/40 mt-1">Ex: 19.90 para R$19,90</p>
          </div>
          <div>
            <label className="text-sm text-white/70 block mb-1">
              URL da Imagem <span className="text-white/30">(opcional)</span>
            </label>
            <Input
              name="imageUrl"
              type="url"
              defaultValue={item?.imageUrl ?? ''}
              placeholder="https://..."
              className="bg-brand-surface border-white/20 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-white/70 block mb-1">Visibilidade</label>
            <Select value={available} onValueChange={(v) => setAvailable(v ?? '1')}>
              <SelectTrigger className="w-full bg-brand-surface border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Visível na loja</SelectItem>
                <SelectItem value="0">Oculto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-brand-surface accent-brand-accent cursor-pointer"
            />
            <label htmlFor="active" className="text-sm text-white/70 cursor-pointer">
              Ativo <span className="text-white/40 text-xs">(disponível para compra)</span>
            </label>
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
              {isEditing ? 'Salvar Alterações' : 'Criar Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
