// src/lib/rcon/commands.ts
// RCON command generation per item type (D-03).
// Admin does NOT write commands manually — system auto-generates from product type.

export type ItemType = 'rank' | 'key' | 'cosmetic'

export interface DeliveryCommand {
  command: string
  /** Human-readable description for audit log */
  description: string
}

/**
 * Generate the RCON command to deliver an item to a player.
 * Per D-03: rank → LuckPerms parent addtemp, key → give, cosmetic → give.
 *
 * @param itemType  'rank' | 'key' | 'cosmetic'
 * @param itemName  e.g. "VIP", "Key Lootbox", "Title Campeao"
 * @param playerUuid  Minecraft UUID (without dashes) or username
 * @param duration  days — only for rank type; null for others
 * @returns DeliveryCommand with RCON command string and description
 */
export function buildDeliveryCommand(
  itemType: ItemType,
  itemName: string,
  playerUuid: string,
  duration: number | null
): DeliveryCommand {
  switch (itemType) {
    case 'rank': {
      // LuckPerms: grant temporary parent group
      // Format: lp user <uuid> parent addtemp <group> <duration>d
      const group = slugify(itemName) // e.g. "VIP 30d" → "vip-30d", "VIP" → "vip"
      const durationStr = duration ? `${duration}d` : '30d' // default 30 days if no duration set
      const cmd = `lp user ${playerUuid} parent addtemp ${group} ${durationStr} accumulate`
      return {
        command: cmd,
        description: `Grant rank ${group} for ${durationStr} to ${playerUuid}`,
      }
    }

    case 'key': {
      // Give key item — convention: item name slug = item ID in modpack
      const itemId = slugify(itemName) // e.g. "Key Lootbox" → "key-lootbox"
      const cmd = `give ${playerUuid} craftprobrasil:${itemId} 1`
      return {
        command: cmd,
        description: `Give key ${itemId} to ${playerUuid}`,
      }
    }

    case 'cosmetic': {
      // Give cosmetic item (same as key but different convention)
      const itemId = slugify(itemName) // e.g. "Title Campeao" → "title-campeao"
      const cmd = `give ${playerUuid} craftprobrasil:${itemId} 1`
      return {
        command: cmd,
        description: `Give cosmetic ${itemId} to ${playerUuid}`,
      }
    }

    default: {
      throw new Error(`Unknown item type: ${itemType as string}`)
    }
  }
}

/** Normalize a display name to a lowercase slug for use in RCON commands */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')      // spaces → dashes
    .replace(/[^a-z0-9-_]/g, '') // remove special chars
    .replace(/-+/g, '-')         // collapse multiple dashes
    .replace(/^-|-$/g, '')       // trim leading/trailing dashes
}
