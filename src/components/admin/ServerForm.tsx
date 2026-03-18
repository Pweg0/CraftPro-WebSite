'use client'
import { useTransition } from 'react'
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
import { createServer, updateServer } from '@/lib/admin/actions/servers'

interface ServerFormProps {
  item?: {
    id: string
    name: string
    ip: string
    description: string
    bannerPath: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ServerForm({ item, open, onOpenChange }: ServerFormProps) {
  const [isPending, startTransition] = useTransition()
  const isEditing = !!item

  async function handleSubmit(formData: FormData) {
    const data = {
      name: formData.get('name') as string,
      ip: formData.get('ip') as string,
      description: formData.get('description') as string,
      bannerPath: formData.get('bannerPath') as string,
    }

    startTransition(async () => {
      try {
        if (isEditing) {
          await updateServer(item.id, data)
        } else {
          await createServer(data)
        }
        toast.success('Item salvo com sucesso.')
        onOpenChange(false)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao salvar. Tente novamente.'
        toast.error(message.startsWith('Servidor com slug') ? message : 'Erro ao salvar. Tente novamente.')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-brand-card text-white border-white/10 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">
            {isEditing ? 'Editar Servidor' : 'Adicionar Servidor'}
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
          {isEditing && (
            <div>
              <label className="text-sm text-white/70 block mb-1">ID (slug)</label>
              <Input
                value={item.id}
                disabled
                className="bg-brand-surface border-white/20 text-white/50"
              />
            </div>
          )}
          <div>
            <label className="text-sm text-white/70 block mb-1">IP</label>
            <Input
              name="ip"
              defaultValue={item?.ip}
              required
              placeholder="play.craftprobrasil.com"
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
            <label className="text-sm text-white/70 block mb-1">Caminho do Banner</label>
            <Input
              name="bannerPath"
              defaultValue={item?.bannerPath}
              required
              placeholder="/images/servers/slug.webp"
              className="bg-brand-surface border-white/20 text-white"
            />
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
              {isEditing ? 'Salvar Alteracoes' : 'Adicionar Servidor'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
