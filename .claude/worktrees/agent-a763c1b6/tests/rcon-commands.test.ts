// tests/rcon-commands.test.ts
// Unit tests for RCON command generation (buildDeliveryCommand).
// These are pure unit tests — no TCP connections, no Minecraft server required.

import { describe, it, expect } from 'vitest'
import { buildDeliveryCommand } from '@/lib/rcon/commands'

describe('buildDeliveryCommand', () => {
  const uuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

  describe('rank type', () => {
    it('generates LuckPerms parent addtemp command', () => {
      const result = buildDeliveryCommand('rank', 'VIP', uuid, 30)
      expect(result.command).toBe(
        `lp user ${uuid} parent addtemp vip 30d accumulate`
      )
    })

    it('defaults duration to 30d when null', () => {
      const result = buildDeliveryCommand('rank', 'VIP', uuid, null)
      expect(result.command).toContain('30d')
    })

    it('includes "accumulate" flag for stacking', () => {
      const result = buildDeliveryCommand('rank', 'VIP', uuid, 30)
      expect(result.command).toContain('accumulate')
    })

    it('slugifies item name with spaces', () => {
      const result = buildDeliveryCommand('rank', 'Super VIP Plus', uuid, 60)
      expect(result.command).toContain('super-vip-plus')
    })

    it('returns a description string', () => {
      const result = buildDeliveryCommand('rank', 'VIP', uuid, 30)
      expect(result.description).toBeTruthy()
      expect(typeof result.description).toBe('string')
    })
  })

  describe('key type', () => {
    it('generates give command with craftprobrasil namespace', () => {
      const result = buildDeliveryCommand('key', 'Key Lootbox', uuid, null)
      expect(result.command).toBe(`give ${uuid} craftprobrasil:key-lootbox 1`)
    })

    it('slugifies key name correctly', () => {
      const result = buildDeliveryCommand('key', 'Key Rare Box', uuid, null)
      expect(result.command).toContain('key-rare-box')
    })
  })

  describe('cosmetic type', () => {
    it('generates give command with craftprobrasil namespace', () => {
      const result = buildDeliveryCommand('cosmetic', 'Title Campeao', uuid, null)
      expect(result.command).toBe(`give ${uuid} craftprobrasil:title-campeao 1`)
    })
  })

  describe('slug generation', () => {
    it('converts to lowercase', () => {
      const result = buildDeliveryCommand('rank', 'VIP', uuid, 30)
      expect(result.command).not.toMatch(/[A-Z]/)
    })

    it('removes special characters', () => {
      const result = buildDeliveryCommand('key', 'Key (Special!)', uuid, null)
      expect(result.command).not.toMatch(/[()!]/)
    })

    it('collapses multiple spaces to single dash', () => {
      const result = buildDeliveryCommand('key', 'Key  Double  Space', uuid, null)
      // Should not have double dashes
      expect(result.command).not.toMatch(/--/)
    })
  })

  describe('error handling', () => {
    it('throws for unknown item type', () => {
      expect(() =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        buildDeliveryCommand('unknown' as any, 'Item', uuid, null)
      ).toThrow('Unknown item type: unknown')
    })
  })
})
