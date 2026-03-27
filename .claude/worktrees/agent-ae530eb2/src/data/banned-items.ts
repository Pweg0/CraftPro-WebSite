// src/data/banned-items.ts
// Static seed data for Phase 1. In production, this can be moved to DB.
import type { BannedItem } from '@/types';

export const BANNED_ITEMS: BannedItem[] = [
  { name: 'Bedrock', reason: 'Item não sobrevivência — não obtível legitimamente', category: 'Bloco' },
  { name: 'Barrier', reason: 'Item de administração — abuso para trapping', category: 'Bloco' },
  { name: 'Command Block', reason: 'Executa comandos arbitrários — risco de exploits', category: 'Mecanismo' },
  { name: 'Structure Block', reason: 'Pode duplicar itens e estruturas', category: 'Mecanismo' },
  { name: 'Debug Stick', reason: 'Manipula estados de blocos de forma não intencional', category: 'Ferramenta' },
  { name: 'Knowledge Book', reason: 'Crash de servidor em certas versões', category: 'Item' },
  { name: 'Spawn Egg (qualquer)', reason: 'Spamming de mobs — lag de servidor', category: 'Item' },
  { name: 'TNT Minecart', reason: 'Dano massivo a construções de outros jogadores', category: 'Veículo' },
  { name: 'Obsidian (> 64)', reason: 'Griefing de warp areas — limite por stack', category: 'Bloco' },
  { name: 'Lava Bucket (PvP zones)', reason: 'Uso anti-jogo em zonas de batalha Pokémon', category: 'Líquido' },
  { name: 'Elytra com Rockets', reason: 'Speed hacking via exploração de mecânicas de voo', category: 'Equipamento' },
  { name: 'Piston (sticky, em redstone clock)', reason: 'Lag machine — banido em construções automáticas', category: 'Mecanismo' },
];
