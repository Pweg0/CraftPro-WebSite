// tests/loja.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock db to avoid real DB calls
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
  },
}))

// Dynamic import after mock setup
const getLojaPage = async () => {
  const mod = await import('@/app/(public)/loja/page')
  return mod.default
}

describe('LojaPage', () => {
  describe('with no items (empty state)', () => {
    beforeEach(() => {
      vi.resetModules()
      const { db } = require('@/lib/db')
      // Mock chain: select().from().where().orderBy() => []
      ;(db.select as ReturnType<typeof vi.fn>).mockImplementation(() => {
        const chain: Record<string, unknown> = {}
        chain.from = vi.fn().mockReturnValue(chain)
        chain.where = vi.fn().mockReturnValue(chain)
        chain.orderBy = vi.fn().mockResolvedValue([])
        return chain
      })
    })

    it('renders the Em Breve badge', async () => {
      vi.resetModules()
      const LojaPage = await getLojaPage()
      const element = await LojaPage()
      render(element)
      expect(screen.getByTestId('store-em-breve-badge')).toBeInTheDocument()
    })

    it('renders empty state when no items', async () => {
      vi.resetModules()
      const LojaPage = await getLojaPage()
      const element = await LojaPage()
      render(element)
      expect(screen.getByTestId('store-empty-state')).toBeInTheDocument()
    })

    it('renders the Discord CTA', async () => {
      vi.resetModules()
      const LojaPage = await getLojaPage()
      const element = await LojaPage()
      render(element)
      const discordCta = screen.getByTestId('store-discord-cta')
      expect(discordCta).toHaveAttribute('href', expect.stringContaining('discord.gg'))
    })
  })

  describe('with items', () => {
    it('renders category sections for available items', async () => {
      vi.resetModules()
      const { db } = await import('@/lib/db')

      const mockItems = [
        { id: 1, name: 'Rank VIP', description: 'Acesso VIP', category: 'ranks-vip', price: 1990, imageUrl: null, available: 1 },
        { id: 2, name: 'Skin Pikachu', description: 'Skin exclusiva', category: 'cosmeticos', price: 2990, imageUrl: null, available: 1 },
      ]

      ;(db.select as ReturnType<typeof vi.fn>).mockImplementation(() => {
        const chain: Record<string, unknown> = {}
        chain.from = vi.fn().mockReturnValue(chain)
        chain.where = vi.fn().mockReturnValue(chain)
        chain.orderBy = vi.fn().mockResolvedValue(mockItems)
        return chain
      })

      vi.resetModules()
      const LojaPage = await getLojaPage()
      const element = await LojaPage()
      render(element)

      expect(screen.getByTestId('store-category-ranks-vip')).toBeInTheDocument()
      expect(screen.getByTestId('store-category-cosmeticos')).toBeInTheDocument()
    })

    it('renders shop item cards with prices in BRL', async () => {
      vi.resetModules()
      const { db } = await import('@/lib/db')

      const mockItems = [
        { id: 1, name: 'Rank VIP', description: 'Acesso VIP', category: 'ranks-vip', price: 1990, imageUrl: null, available: 1 },
      ]

      ;(db.select as ReturnType<typeof vi.fn>).mockImplementation(() => {
        const chain: Record<string, unknown> = {}
        chain.from = vi.fn().mockReturnValue(chain)
        chain.where = vi.fn().mockReturnValue(chain)
        chain.orderBy = vi.fn().mockResolvedValue(mockItems)
        return chain
      })

      vi.resetModules()
      const LojaPage = await getLojaPage()
      const element = await LojaPage()
      render(element)

      expect(screen.getByTestId('shop-item-1')).toBeInTheDocument()
      expect(screen.getByText('Rank VIP')).toBeInTheDocument()
    })
  })
})
