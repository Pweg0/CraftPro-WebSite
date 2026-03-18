// scripts/seed-admin-data.ts
// Idempotent seed for banned_items and servers tables.
// Run with: npx tsx scripts/seed-admin-data.ts
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../src/lib/db/schema'

async function seed() {
  const sql = neon(process.env.DATABASE_URL!)
  const db = drizzle(sql, { schema })

  // Seed banned_items (idempotent — only if empty)
  const existingBanned = await db.select().from(schema.bannedItems).limit(1)
  if (existingBanned.length === 0) {
    await db.insert(schema.bannedItems).values([
      { name: 'Bedrock', reason: 'Item nao sobrevivencia — nao obtivel legitimamente', category: 'Bloco' },
      { name: 'Barrier', reason: 'Item de administracao — abuso para trapping', category: 'Bloco' },
      { name: 'Command Block', reason: 'Executa comandos arbitrarios — risco de exploits', category: 'Mecanismo' },
      { name: 'Structure Block', reason: 'Pode duplicar itens e estruturas', category: 'Mecanismo' },
      { name: 'Debug Stick', reason: 'Manipula estados de blocos de forma nao intencional', category: 'Ferramenta' },
      { name: 'Knowledge Book', reason: 'Crash de servidor em certas versoes', category: 'Item' },
      { name: 'Spawn Egg (qualquer)', reason: 'Spamming de mobs — lag de servidor', category: 'Item' },
      { name: 'TNT Minecart', reason: 'Dano massivo a construcoes de outros jogadores', category: 'Veiculo' },
      { name: 'Obsidian (> 64)', reason: 'Griefing de warp areas — limite por stack', category: 'Bloco' },
      { name: 'Lava Bucket (PvP zones)', reason: 'Uso anti-jogo em zonas de batalha Pokemon', category: 'Liquido' },
      { name: 'Elytra com Rockets', reason: 'Speed hacking via exploracao de mecanicas de voo', category: 'Equipamento' },
      { name: 'Piston (sticky, em redstone clock)', reason: 'Lag machine — banido em construcoes automaticas', category: 'Mecanismo' },
    ])
    console.log('Seeded 12 banned_items')
  } else {
    console.log('banned_items already seeded, skipping')
  }

  // Seed servers (idempotent — only if empty)
  const existingServers = await db.select().from(schema.servers).limit(1)
  if (existingServers.length === 0) {
    await db.insert(schema.servers).values([
      { id: 'pokebrawl', name: 'PokeBrawl', ip: 'pokebrawl.craftprobrasil.com', description: 'Batalhas Pokemon competitivas no Minecraft. Capture, treine e batalhe!', bannerPath: '/images/servers/pokebrawl.webp' },
      { id: 'pokedash', name: 'PokeDash', ip: 'pokedash.craftprobrasil.com', description: 'Corridas e desafios de velocidade com seus Pokemon favoritos.', bannerPath: '/images/servers/pokedash.webp' },
      { id: 'pokegold', name: 'PokeGold', ip: 'pokegold.craftprobrasil.com', description: 'Aventura e exploracao — encontre Pokemon raros no mundo aberto.', bannerPath: '/images/servers/pokegold.webp' },
    ])
    console.log('Seeded 3 servers')
  } else {
    console.log('servers already seeded, skipping')
  }

  console.log('Seed complete.')
}

seed().catch(console.error)
