'use client'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { banPlayer, unbanPlayer, deleteMatch } from '@/lib/admin/actions/leaderboard'

interface BanPlayerButtonProps {
  uuid: string
  isBanned: boolean
}

export function BanPlayerButton({ uuid, isBanned }: BanPlayerButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    startTransition(async () => {
      try {
        if (isBanned) {
          await unbanPlayer(uuid)
          toast.success('Ban revertido com sucesso.')
        } else {
          await banPlayer(uuid)
          toast.success('Jogador banido com sucesso.')
        }
      } catch {
        toast.error('Erro ao executar acao. Tente novamente.')
      }
    })
  }

  if (isBanned) {
    return (
      <AlertDialog>
        <AlertDialogTrigger render={<Button variant="ghost" size="sm" className="text-xs" />}>
          Reverter Ban
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reverter Ban</AlertDialogTitle>
            <AlertDialogDescription>
              O jogador voltara a aparecer no leaderboard. Confirmar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isPending}
            >
              {isPending ? 'Processando...' : 'Confirmar Reversao'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive" />}>
        Banir Jogador
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Banir Jogador</AlertDialogTitle>
          <AlertDialogDescription>
            O jogador sumira do leaderboard publico. O ban e reversivel. Confirmar?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? 'Processando...' : 'Confirmar Ban'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

interface DeleteMatchButtonProps {
  id: number
}

export function DeleteMatchButton({ id }: DeleteMatchButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    startTransition(async () => {
      try {
        await deleteMatch(id)
        toast.success('Partida deletada com sucesso.')
      } catch {
        toast.error('Erro ao deletar partida. Tente novamente.')
      }
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive" />}>
        Deletar
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deletar Partida</AlertDialogTitle>
          <AlertDialogDescription>
            Esta partida sera removida permanentemente. O ELO NAO sera revertido automaticamente. Confirmar?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? 'Deletando...' : 'Confirmar Exclusao'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
