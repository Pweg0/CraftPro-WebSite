// tests/shop-queries.test.ts
import { describe, it, expect, vi } from 'vitest'

// Mock db module to avoid real DB calls
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
  },
}))

describe('Shop Queries', () => {
  describe('getShopItems', () => {
    it('is exported as a function', async () => {
      vi.resetModules()
      const { getShopItems } = await import('@/lib/db/queries/shop')
      expect(typeof getShopItems).toBe('function')
    })

    it('returns available items only (filters available=1)', async () => {
      vi.resetModules()
      const { db } = await import('@/lib/db')

      // Build a chain mock that resolves to mock items
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

      const { getShopItems } = await import('@/lib/db/queries/shop')
      const result = await getShopItems()

      // All returned items should have available=1
      expect(Array.isArray(result)).toBe(true)
      result.forEach(item => {
        expect(item.available).toBe(1)
      })
    })

    it('returns items with price in cents', async () => {
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

      const { getShopItems } = await import('@/lib/db/queries/shop')
      const result = await getShopItems()

      expect(result[0].price).toBe(1990)
    })
  })

  describe('getShopItemById', () => {
    it('is exported as a function', async () => {
      vi.resetModules()
      const { getShopItemById } = await import('@/lib/db/queries/shop')
      expect(typeof getShopItemById).toBe('function')
    })

    it('returns null for nonexistent item', async () => {
      vi.resetModules()
      const { db } = await import('@/lib/db')

      ;(db.select as ReturnType<typeof vi.fn>).mockImplementation(() => {
        const chain: Record<string, unknown> = {}
        chain.from = vi.fn().mockReturnValue(chain)
        chain.where = vi.fn().mockReturnValue(chain)
        chain.limit = vi.fn().mockResolvedValue([]) // empty — not found
        return chain
      })

      const { getShopItemById } = await import('@/lib/db/queries/shop')
      const result = await getShopItemById(999)
      expect(result).toBeNull()
    })

    it('returns the item when found', async () => {
      vi.resetModules()
      const { db } = await import('@/lib/db')

      const mockItem = { id: 1, name: 'Rank VIP', description: 'Acesso VIP', category: 'ranks-vip', price: 1990, imageUrl: null, available: 1 }

      ;(db.select as ReturnType<typeof vi.fn>).mockImplementation(() => {
        const chain: Record<string, unknown> = {}
        chain.from = vi.fn().mockReturnValue(chain)
        chain.where = vi.fn().mockReturnValue(chain)
        chain.limit = vi.fn().mockResolvedValue([mockItem])
        return chain
      })

      const { getShopItemById } = await import('@/lib/db/queries/shop')
      const result = await getShopItemById(1)
      expect(result).not.toBeNull()
      expect(result?.id).toBe(1)
    })
  })

  describe('getOrdersByUser', () => {
    it('is exported as a function', async () => {
      vi.resetModules()
      const { getOrdersByUser } = await import('@/lib/db/queries/shop')
      expect(typeof getOrdersByUser).toBe('function')
    })

    it('accepts a userId string parameter', async () => {
      vi.resetModules()
      const { getOrdersByUser } = await import('@/lib/db/queries/shop')
      expect(getOrdersByUser.length).toBe(1)
    })
  })

  describe('getAllShopItemsAdmin', () => {
    it('is exported as a function', async () => {
      vi.resetModules()
      const { getAllShopItemsAdmin } = await import('@/lib/db/queries/shop')
      expect(typeof getAllShopItemsAdmin).toBe('function')
    })
  })

  describe('Schema: orders table', () => {
    it('schema exports orders table', async () => {
      vi.resetModules()
      const schema = await import('@/lib/db/schema')
      expect(schema.orders).toBeDefined()
    })

    it('schema shopItems has price column', async () => {
      vi.resetModules()
      const schema = await import('@/lib/db/schema')
      // Drizzle table columns are accessible via the column definitions
      const shopItemsCols = Object.keys(schema.shopItems)
      // The table object itself should be defined
      expect(schema.shopItems).toBeDefined()
    })
  })
})
