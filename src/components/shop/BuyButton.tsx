'use client'
// src/components/shop/BuyButton.tsx

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface BuyButtonProps {
  itemId: number
  itemName: string
}

export function BuyButton({ itemId, itemName }: BuyButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Show login CTA when not authenticated
  if (!session) {
    return (
      <button
        onClick={() => router.push('/login')}
        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white/10 text-white/60 border border-white/20 hover:bg-white/15 hover:text-white/80 transition-all"
      >
        <ShoppingCart className="w-3.5 h-3.5" />
        Login para comprar
      </button>
    )
  }

  const handleBuy = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/loja/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Erro ao iniciar compra')
        return
      }

      if (data.initPoint) {
        // Redirect to MercadoPago checkout page
        window.location.href = data.initPoint
      } else {
        toast.error('Pagamentos temporariamente indisponíveis')
      }
    } catch {
      toast.error('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-brand-accent text-white border border-brand-accent/30 hover:bg-brand-accent/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
      aria-label={`Comprar ${itemName}`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <ShoppingCart className="w-3.5 h-3.5" />
      )}
      {loading ? 'Aguarde...' : 'Comprar'}
    </button>
  )
}
