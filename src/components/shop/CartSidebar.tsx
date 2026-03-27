'use client'
import { useState, useTransition } from 'react'
import { ShoppingCart, Trash2, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/components/shop/CartContext'
import { createCartCheckout } from '@/lib/shop/actions'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export function CartSidebar() {
  const { items, removeItem, clearCart, totalCents, itemCount } = useCart()
  const [minecraftName, setMinecraftName] = useState('')
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)

  const totalFormatted = (totalCents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const handleCheckout = () => {
    if (minecraftName.trim().length < 3) {
      toast.error('Digite um nome do Minecraft valido (minimo 3 caracteres)')
      return
    }

    startTransition(async () => {
      try {
        const result = await createCartCheckout(
          items.map((i) => i.id),
          minecraftName.trim()
        )
        clearCart()
        window.location.href = result.checkoutUrl
      } catch (err) {
        const msg = err instanceof Error ? err.message : ''
        if (msg === 'PAYMENTS_UNAVAILABLE') {
          toast.error('Pagamentos temporariamente indisponiveis.')
        } else {
          toast.error('Erro ao iniciar compra. Tente novamente.')
        }
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="fixed bottom-6 right-6 z-50 inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-accent hover:bg-brand-accent/90 text-white shadow-lg shadow-brand-accent/25 transition-all duration-200"
        aria-label="Abrir carrinho"
      >
        <ShoppingCart className="w-5 h-5" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-yellow text-brand-primary text-xs font-bold flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </SheetTrigger>

      <SheetContent side="right" className="w-80 sm:w-96 bg-brand-primary border-white/[0.06] p-0" showCloseButton={false}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <h2 className="text-base font-semibold text-white">Carrinho</h2>
            <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-5">
              <ShoppingCart className="w-10 h-10 text-white/20 mb-3" />
              <p className="text-sm text-white/45">Carrinho vazio</p>
              <p className="text-xs text-white/30 mt-1">Adicione itens da loja</p>
            </div>
          ) : (
            <>
              {/* Items */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {items.map((item) => {
                  const price = (item.price / 100).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 bg-brand-card/40 rounded-xl p-3 border border-white/[0.06]"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                        <p className="text-xs text-brand-yellow">R$ {price}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-white/30 hover:text-brand-accent transition-colors shrink-0"
                        aria-label={`Remover ${item.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Checkout */}
              <div className="px-5 py-4 border-t border-white/[0.06] space-y-4">
                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Total</span>
                  <span className="text-lg font-bold text-brand-yellow">R$ {totalFormatted}</span>
                </div>

                {/* Minecraft name input */}
                <div>
                  <label htmlFor="mc-name" className="block text-xs text-white/45 mb-1.5">
                    Nome do Minecraft (para entrega)
                  </label>
                  <input
                    id="mc-name"
                    type="text"
                    value={minecraftName}
                    onChange={(e) => setMinecraftName(e.target.value)}
                    placeholder="Ex: Steve123"
                    className="w-full h-10 rounded-lg bg-white/5 border border-white/10 px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-accent/50 transition-colors"
                  />
                </div>

                {/* Checkout button */}
                <button
                  onClick={handleCheckout}
                  disabled={isPending || minecraftName.trim().length < 3}
                  className={`w-full h-11 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                    isPending || minecraftName.trim().length < 3 ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    'Finalizar Compra'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
