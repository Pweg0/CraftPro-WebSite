// tests/admin-permissions.test.ts
// Tests for admin permission utilities (ADMIN-01, ADMIN-02)
import { describe, it, expect, beforeEach, vi } from 'vitest'

// --- Schema export tests ---
describe('Admin schema tables', () => {
  it('schema exports bannedItems table', async () => {
    const schema = await import('@/lib/db/schema')
    expect(schema.bannedItems).toBeDefined()
  })

  it('schema exports servers table', async () => {
    const schema = await import('@/lib/db/schema')
    expect(schema.servers).toBeDefined()
  })

  it('schema exports shopItems table', async () => {
    const schema = await import('@/lib/db/schema')
    expect(schema.shopItems).toBeDefined()
  })

  it('schema exports adminPermissions table', async () => {
    const schema = await import('@/lib/db/schema')
    expect(schema.adminPermissions).toBeDefined()
  })

  it('schema exports adminAuditLog table', async () => {
    const schema = await import('@/lib/db/schema')
    expect(schema.adminAuditLog).toBeDefined()
  })

  it('arenaPlayers has banned column', async () => {
    const schema = await import('@/lib/db/schema')
    // Drizzle table exposes columns as direct keys on the table object
    const columns = Object.keys(schema.arenaPlayers)
    expect(columns).toContain('banned')
  })
})

// --- Permission utility tests ---
describe('isAdmin', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns true when discordId is in ADMIN_DISCORD_IDS', async () => {
    vi.stubEnv('ADMIN_DISCORD_IDS', '111222333,444555666')
    vi.stubEnv('SUPER_ADMIN_DISCORD_ID', '999000999')
    const { isAdmin } = await import('@/lib/admin/permissions')
    const session = { user: { id: '1', discordId: '111222333' } } as any
    expect(isAdmin(session)).toBe(true)
  })

  it('returns true when discordId is SUPER_ADMIN_DISCORD_ID', async () => {
    vi.stubEnv('ADMIN_DISCORD_IDS', '111222333')
    vi.stubEnv('SUPER_ADMIN_DISCORD_ID', '999000999')
    const { isAdmin } = await import('@/lib/admin/permissions')
    const session = { user: { id: '1', discordId: '999000999' } } as any
    expect(isAdmin(session)).toBe(true)
  })

  it('returns false for unknown discordId', async () => {
    vi.stubEnv('ADMIN_DISCORD_IDS', '111222333')
    vi.stubEnv('SUPER_ADMIN_DISCORD_ID', '999000999')
    const { isAdmin } = await import('@/lib/admin/permissions')
    const session = { user: { id: '1', discordId: 'unknown-id' } } as any
    expect(isAdmin(session)).toBe(false)
  })

  it('returns false for null session', async () => {
    vi.stubEnv('ADMIN_DISCORD_IDS', '111222333')
    vi.stubEnv('SUPER_ADMIN_DISCORD_ID', '999000999')
    const { isAdmin } = await import('@/lib/admin/permissions')
    expect(isAdmin(null)).toBe(false)
  })
})

describe('isSuperAdmin', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns true only for SUPER_ADMIN_DISCORD_ID', async () => {
    vi.stubEnv('SUPER_ADMIN_DISCORD_ID', '999000999')
    vi.stubEnv('ADMIN_DISCORD_IDS', '111222333')
    const { isSuperAdmin } = await import('@/lib/admin/permissions')
    const session = { user: { id: '1', discordId: '999000999' } } as any
    expect(isSuperAdmin(session)).toBe(true)
  })

  it('returns false for regular admin in ADMIN_DISCORD_IDS', async () => {
    vi.stubEnv('SUPER_ADMIN_DISCORD_ID', '999000999')
    vi.stubEnv('ADMIN_DISCORD_IDS', '111222333')
    const { isSuperAdmin } = await import('@/lib/admin/permissions')
    const session = { user: { id: '1', discordId: '111222333' } } as any
    expect(isSuperAdmin(session)).toBe(false)
  })

  it('returns false for null session', async () => {
    vi.stubEnv('SUPER_ADMIN_DISCORD_ID', '999000999')
    const { isSuperAdmin } = await import('@/lib/admin/permissions')
    expect(isSuperAdmin(null)).toBe(false)
  })
})
