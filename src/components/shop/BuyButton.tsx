'use client'
// src/components/shop/BuyButton.tsx

import { useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createCheckoutPreference } from '@/lib/shop/actions'

interface BuyButtonProps {
  shopItemId: number
}

export function BuyButton({ shopItemId }: BuyButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleBuy = () => {
    startTransition(async () => {
      try {
        const result = await createCheckoutPreference(shopItemId)
        window.location.href = result.checkoutUrl
      } catch (err) {
        const message = err instanceof Error ? err.message : ''
        if (message === 'NO_MINECRAFT_UUID') {
          toast.error(
            'Voce precisa vincular sua conta Minecraft antes de comprar. Fale com um admin no Discord.'
          )
        } else {
          toast.error('Erro ao iniciar compra. Tente novamente.')
        }
      }
    })
  }

  return (
    <button
      onClick={handleBuy}
      disabled={isPending}
      aria-disabled={isPending}
      aria-label={isPending ? 'Processando compra' : 'Comprar'}
      className={`w-full h-11 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
        isPending ? 'opacity-70 pointer-events-none' : ''
      }`}
    >
      {isPending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Processando...
        </>
      ) : (
        'Comprar'
      )}
    </button>
  )
}
