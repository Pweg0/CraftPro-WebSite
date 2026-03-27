// src/lib/rcon/client.ts
// RCON abstraction layer — wraps rcon-client@4.2.5 for Minecraft server communication.
// Per PITFALLS.md: never call RCON synchronously from webhook; use delivery queue.
// Per STACK.md: rcon-client is maintainer-unmaintained — this abstraction allows swapping.

import { Rcon } from 'rcon-client'

export interface RconConfig {
  host: string
  port: number
  password: string
  /** Connection timeout in ms — default 5000 */
  timeout?: number
}

/**
 * Execute a single RCON command on the Minecraft server.
 * Opens a connection, sends the command, returns the response, closes the connection.
 * Throws on connection failure or authentication error.
 */
export async function executeRconCommand(
  command: string,
  config?: Partial<RconConfig>
): Promise<string> {
  const host = config?.host ?? process.env.RCON_HOST ?? 'localhost'
  const port = config?.port ?? parseInt(process.env.RCON_PORT ?? '25575', 10)
  const password = config?.password ?? process.env.RCON_PASSWORD ?? ''
  const timeout = config?.timeout ?? parseInt(process.env.RCON_TIMEOUT ?? '5000', 10)

  if (!password) {
    throw new Error('RCON_PASSWORD not configured')
  }

  const rcon = await Rcon.connect({ host, port, password, timeout })
  try {
    const response = await rcon.send(command)
    return response
  } finally {
    await rcon.end().catch(() => {
      // Ignore errors on close — connection may already be gone
    })
  }
}

/**
 * Check if RCON is configured (env vars present).
 * Used to skip RCON in non-production environments without crashing.
 */
export function isRconConfigured(): boolean {
  return Boolean(process.env.RCON_HOST && process.env.RCON_PASSWORD)
}
