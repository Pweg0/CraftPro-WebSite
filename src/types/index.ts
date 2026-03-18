// src/types/index.ts
// Shared TypeScript interfaces for CraftPro Brasil
// All components import from here — do not define types inline in components

export interface Server {
  id: string;
  name: string;
  ip: string;
  description: string;
  bannerPath?: string; // path relative to /public, e.g. '/images/servers/pokebrawl.webp'
}

export interface ServerStatus {
  online: boolean;
  playersOnline: number;
  playersMax: number;
}

export interface ServerWithStatus {
  server: Server;
  status: ServerStatus;
}

export interface BannedItem {
  name: string;
  reason: string;
  category: string;
}
