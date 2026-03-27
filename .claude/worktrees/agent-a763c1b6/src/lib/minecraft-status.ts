// src/lib/minecraft-status.ts
// mcsrvstat.us v3 API client — ALWAYS called server-side with revalidate: 30
// NEVER import this in a Client Component ('use client' files)
import type { ServerStatus } from '@/types';

interface McsrvstatResponse {
  online: boolean;
  players?: {
    online: number;
    max: number;
  };
}

export async function getServerStatus(address: string): Promise<ServerStatus> {
  try {
    const res = await fetch(`https://api.mcsrvstat.us/3/${address}`, {
      next: { revalidate: 30 },
      headers: {
        'User-Agent': 'CraftPro Brasil Website (craftprobrasil.com)',
      },
    });
    if (!res.ok) {
      return { online: false, playersOnline: 0, playersMax: 0 };
    }
    const data: McsrvstatResponse = await res.json();
    return {
      online: data.online ?? false,
      playersOnline: data.players?.online ?? 0,
      playersMax: data.players?.max ?? 0,
    };
  } catch {
    return { online: false, playersOnline: 0, playersMax: 0 };
  }
}
