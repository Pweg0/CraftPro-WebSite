'use client'
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export interface CartItem {
  id: number
  name: string
  price: number // cents
  category: string
  imageUrl: string | null
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: number) => void
  clearCart: () => void
  totalCents: number
  itemCount: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      // Don't add duplicates
      if (prev.some((i) => i.id === item.id)) return prev
      return [...prev, item]
    })
  }, [])

  const removeItem = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const totalCents = items.reduce((sum, i) => sum + i.price, 0)

  return (
    <CartContext value={{
      items,
      addItem,
      removeItem,
      clearCart,
      totalCents,
      itemCount: items.length,
    }}>
      {children}
    </CartContext>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
