// tests/minecraft-status.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getServerStatus } from '@/lib/minecraft-status';

describe('getServerStatus', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns online: false when API response is not ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false });
    const result = await getServerStatus('test.example.com');
    expect(result).toEqual({ online: false, playersOnline: 0, playersMax: 0 });
  });

  it('returns online: false when fetch throws (network error)', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const result = await getServerStatus('test.example.com');
    expect(result).toEqual({ online: false, playersOnline: 0, playersMax: 0 });
  });

  it('maps players.online from API response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        online: true,
        players: { online: 42, max: 100 },
      }),
    });
    const result = await getServerStatus('pokebrawl.craftprobrasil.com');
    expect(result.online).toBe(true);
    expect(result.playersOnline).toBe(42);
    expect(result.playersMax).toBe(100);
  });

  it('defaults playersOnline to 0 when players field is missing', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ online: true }),
    });
    const result = await getServerStatus('pokebrawl.craftprobrasil.com');
    expect(result.online).toBe(true);
    expect(result.playersOnline).toBe(0);
  });

  it('calls fetch with User-Agent header', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false });
    await getServerStatus('test.example.com');
    expect(fetch).toHaveBeenCalledWith(
      'https://api.mcsrvstat.us/3/test.example.com',
      expect.objectContaining({
        headers: expect.objectContaining({
          'User-Agent': expect.stringContaining('CraftPro Brasil'),
        }),
      })
    );
  });
});
