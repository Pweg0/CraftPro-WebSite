import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next/cache to avoid Next.js runtime errors
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

// Mock permissions
vi.mock('@/lib/admin/permissions', () => ({
  hasPermission: vi.fn(),
  logAudit: vi.fn(),
}))

// Mock db
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    select: vi.fn(),
  },
}))

describe('Admin Server Actions', () => {
  describe('createBannedItem', () => {
    beforeEach(() => {
      vi.resetModules()
    })

    it('rejects unauthorized user with Forbidden error', async () => {
      const { auth } = await import('@/lib/auth')
      const { hasPermission } = await import('@/lib/admin/permissions')
      ;(auth as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: '1', discordId: 'some-discord-id' },
      })
      ;(hasPermission as ReturnType<typeof vi.fn>).mockResolvedValue(false)

      const { createBannedItem } = await import('@/lib/admin/actions/banned-items')
      await expect(
        createBannedItem({ name: 'TestItem', reason: 'Test reason', category: 'Bloco' })
      ).rejects.toThrow('Forbidden')
    })

    it('creates item when user has permission', async () => {
      vi.resetModules()
      const { auth } = await import('@/lib/auth')
      const { hasPermission, logAudit } = await import('@/lib/admin/permissions')
      const { db } = await import('@/lib/db')

      const mockSession = { user: { id: '1', discordId: 'admin-discord-id' } }
      const mockItem = { id: 1, name: 'Bedrock', reason: 'Admin item', category: 'Bloco' }

      ;(auth as ReturnType<typeof vi.fn>).mockResolvedValue(mockSession)
      ;(hasPermission as ReturnType<typeof vi.fn>).mockResolvedValue(true)
      ;(logAudit as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)

      const returningMock = vi.fn().mockResolvedValue([mockItem])
      const valuesMock = vi.fn().mockReturnValue({ returning: returningMock })
      ;(db.insert as ReturnType<typeof vi.fn>).mockReturnValue({ values: valuesMock })

      const { createBannedItem } = await import('@/lib/admin/actions/banned-items')
      const result = await createBannedItem({ name: 'Bedrock', reason: 'Admin item', category: 'Bloco' })

      expect(result).toEqual(mockItem)
      expect(logAudit).toHaveBeenCalledWith(mockSession, 'CREATE_BANNED_ITEM', '1', { name: 'Bedrock' })
    })
  })

  describe('createShopItem', () => {
    beforeEach(() => {
      vi.resetModules()
    })

    it('rejects unauthorized user with Forbidden error', async () => {
      const { auth } = await import('@/lib/auth')
      const { hasPermission } = await import('@/lib/admin/permissions')
      ;(auth as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: '1', discordId: 'some-id' },
      })
      ;(hasPermission as ReturnType<typeof vi.fn>).mockResolvedValue(false)

      const { createShopItem } = await import('@/lib/admin/actions/shop-items')
      await expect(
        createShopItem({ name: 'VIP Rank', description: 'VIP access', category: 'Ranks & VIP' })
      ).rejects.toThrow('Forbidden')
    })
  })

  describe('createServer', () => {
    beforeEach(() => {
      vi.resetModules()
    })

    it('rejects unauthorized user with Forbidden error', async () => {
      const { auth } = await import('@/lib/auth')
      const { hasPermission } = await import('@/lib/admin/permissions')
      ;(auth as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: '1', discordId: 'some-id' },
      })
      ;(hasPermission as ReturnType<typeof vi.fn>).mockResolvedValue(false)

      const { createServer } = await import('@/lib/admin/actions/servers')
      await expect(
        createServer({
          name: 'PokeBrawl',
          ip: 'pokebrawl.craftpro.com',
          description: 'Battle server',
          bannerPath: '/images/servers/pokebrawl.webp',
        })
      ).rejects.toThrow('Forbidden')
    })
  })

  describe('banPlayer', () => {
    beforeEach(() => {
      vi.resetModules()
    })

    it('sets banned=1 on arena_players for given uuid', async () => {
      const { auth } = await import('@/lib/auth')
      const { hasPermission, logAudit } = await import('@/lib/admin/permissions')
      const { db } = await import('@/lib/db')

      const mockSession = { user: { id: '1', discordId: 'admin-123', name: 'Admin' } }
      ;(auth as ReturnType<typeof vi.fn>).mockResolvedValue(mockSession)
      ;(hasPermission as ReturnType<typeof vi.fn>).mockResolvedValue(true)
      ;(logAudit as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)

      const whereMock = vi.fn().mockResolvedValue(undefined)
      const setMock = vi.fn().mockReturnValue({ where: whereMock })
      ;(db.update as ReturnType<typeof vi.fn>).mockReturnValue({ set: setMock })

      const { banPlayer } = await import('@/lib/admin/actions/leaderboard')
      await banPlayer('player-uuid-123')

      expect(db.update).toHaveBeenCalled()
      expect(setMock).toHaveBeenCalledWith({ banned: 1 })
      expect(whereMock).toHaveBeenCalled()
      expect(logAudit).toHaveBeenCalledWith(mockSession, 'BAN_PLAYER', 'player-uuid-123')
    })

    it('rejects non-admin user with Forbidden error', async () => {
      const { auth } = await import('@/lib/auth')
      const { hasPermission } = await import('@/lib/admin/permissions')

      ;(auth as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: '1', discordId: 'unknown-id' },
      })
      ;(hasPermission as ReturnType<typeof vi.fn>).mockResolvedValue(false)

      const { banPlayer } = await import('@/lib/admin/actions/leaderboard')
      await expect(banPlayer('some-uuid')).rejects.toThrow('Forbidden')
    })
  })

  describe('unbanPlayer', () => {
    beforeEach(() => {
      vi.resetModules()
    })

    it('sets banned=0 on arena_players for given uuid', async () => {
      const { auth } = await import('@/lib/auth')
      const { hasPermission, logAudit } = await import('@/lib/admin/permissions')
      const { db } = await import('@/lib/db')

      const mockSession = { user: { id: '1', discordId: 'admin-123', name: 'Admin' } }
      ;(auth as ReturnType<typeof vi.fn>).mockResolvedValue(mockSession)
      ;(hasPermission as ReturnType<typeof vi.fn>).mockResolvedValue(true)
      ;(logAudit as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)

      const whereMock = vi.fn().mockResolvedValue(undefined)
      const setMock = vi.fn().mockReturnValue({ where: whereMock })
      ;(db.update as ReturnType<typeof vi.fn>).mockReturnValue({ set: setMock })

      const { unbanPlayer } = await import('@/lib/admin/actions/leaderboard')
      await unbanPlayer('player-uuid-456')

      expect(setMock).toHaveBeenCalledWith({ banned: 0 })
      expect(logAudit).toHaveBeenCalledWith(mockSession, 'UNBAN_PLAYER', 'player-uuid-456')
    })
  })

  describe('deleteMatch', () => {
    beforeEach(() => {
      vi.resetModules()
    })

    it('deletes match by id', async () => {
      const { auth } = await import('@/lib/auth')
      const { hasPermission, logAudit } = await import('@/lib/admin/permissions')
      const { db } = await import('@/lib/db')

      const mockSession = { user: { id: '1', discordId: 'admin-123', name: 'Admin' } }
      ;(auth as ReturnType<typeof vi.fn>).mockResolvedValue(mockSession)
      ;(hasPermission as ReturnType<typeof vi.fn>).mockResolvedValue(true)
      ;(logAudit as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)

      const whereMock = vi.fn().mockResolvedValue(undefined)
      ;(db.delete as ReturnType<typeof vi.fn>).mockReturnValue({ where: whereMock })

      const { deleteMatch } = await import('@/lib/admin/actions/leaderboard')
      await deleteMatch(42)

      expect(db.delete).toHaveBeenCalled()
      expect(whereMock).toHaveBeenCalled()
      expect(logAudit).toHaveBeenCalledWith(mockSession, 'DELETE_MATCH', '42')
    })

    it('rejects non-admin with Forbidden error', async () => {
      const { auth } = await import('@/lib/auth')
      const { hasPermission } = await import('@/lib/admin/permissions')

      ;(auth as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: '1', discordId: 'unknown-id' },
      })
      ;(hasPermission as ReturnType<typeof vi.fn>).mockResolvedValue(false)

      const { deleteMatch } = await import('@/lib/admin/actions/leaderboard')
      await expect(deleteMatch(1)).rejects.toThrow('Forbidden')
    })
  })
})
