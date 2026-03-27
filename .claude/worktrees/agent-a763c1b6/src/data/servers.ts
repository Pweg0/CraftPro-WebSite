// src/data/servers.ts
// Static server metadata for Phase 1.
// TODO: Replace placeholder IPs with real server addresses before launch.
// Phase 2/3 may move this to DB if server configs become dynamic.
import type { Server } from '@/types';

export const SERVERS: Server[] = [
  {
    id: 'pokebrawl',
    name: 'PokeBrawl',
    ip: 'pokebrawl.craftprobrasil.com', // TODO: replace with real IP
    description: 'Batalhas Pokémon competitivas no Minecraft. Capture, treine e batalhe!',
    bannerPath: '/images/servers/pokebrawl.webp',
  },
  {
    id: 'pokedash',
    name: 'PokeDash',
    ip: 'pokedash.craftprobrasil.com', // TODO: replace with real IP
    description: 'Corridas e desafios de velocidade com seus Pokémon favoritos.',
    bannerPath: '/images/servers/pokedash.webp',
  },
  {
    id: 'pokegold',
    name: 'PokeGold',
    ip: 'pokegold.craftprobrasil.com', // TODO: replace with real IP
    description: 'Aventura e exploração — encontre Pokémon raros no mundo aberto.',
    bannerPath: '/images/servers/pokegold.webp',
  },
];
