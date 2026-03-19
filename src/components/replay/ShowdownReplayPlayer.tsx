"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Cobblemon's battle.getShowdownMessages() returns an array where each entry
 * is a multi-line block starting with a header: "update", "sideupdate", or "end".
 *
 * - "update" blocks contain the actual Showdown protocol lines we need
 *   (|move|, |switch|, |-damage|, |player|, |start|, |win|, etc.)
 * - "sideupdate" blocks contain private per-player data (|request|, |error|)
 * - "end" blocks contain a giant JSON blob with battle results
 *
 * Pokemon names in Cobblemon are UUIDs — we build a mapping from the
 * |switch| lines (which contain "UUID|Species, UUID, ...") and replace them.
 */

/**
 * Extract protocol lines from "update" blocks, skip sideupdate/end blocks.
 * Also builds a UUID→species name mapping from |switch| lines.
 */
function filterLogForEmbed(
  blocks: string[],
  playerNames?: { winnerUuid?: string | null; winnerName?: string | null; loserUuid?: string | null; loserName?: string | null }
): string {
  const protocolLines: string[] = []
  // Map Pokemon UUIDs to species names (extracted from |switch| lines)
  const pokemonNames = new Map<string, string>()

  // First pass: extract Pokemon UUID→species mapping from ALL update blocks
  // (needed because some Pokemon may only appear in |pp_update| before entering battle)
  for (const block of blocks) {
    const trimmed = block.trim()
    if (!trimmed) continue
    const firstNewline = trimmed.indexOf("\n")
    if (firstNewline === -1) continue
    const header = trimmed.substring(0, firstNewline).trim()
    if (header !== "update") continue

    const body = trimmed.substring(firstNewline + 1)
    for (const line of body.split("\n")) {
      const l = line.trim()
      // |switch|p1a: UUID|Species, UUID, L50, M|HP/MaxHP
      const switchMatch = l.match(/\|switch\|p[12]a: ([a-f0-9-]{36})\|(\w[\w\s-]*),/)
      if (switchMatch) {
        pokemonNames.set(switchMatch[1], switchMatch[2].trim())
      }
      const formeMatch = l.match(/\|-formechange\|p[12]a: ([a-f0-9-]{36})\|(\w[\w\s-]*)/)
      if (formeMatch) {
        pokemonNames.set(formeMatch[1], formeMatch[2].trim())
      }
    }
  }

  // Track whether we're inside a |split| section (to skip duplicate lines)
  let inSplit = false
  let splitSkipNext = false

  for (const block of blocks) {
    const trimmed = block.trim()
    if (!trimmed) continue

    const firstNewline = trimmed.indexOf("\n")
    if (firstNewline === -1) continue

    const header = trimmed.substring(0, firstNewline).trim()

    // Only process "update" blocks — skip "sideupdate" and "end"
    if (header !== "update") continue

    const body = trimmed.substring(firstNewline + 1)
    const bodyLines = body.split("\n")

    for (let i = 0; i < bodyLines.length; i++) {
      const l = bodyLines[i].trim()
      if (!l) {
        // Empty lines reset split state and are kept (turn separators)
        inSplit = false
        splitSkipNext = false
        protocolLines.push("")
        continue
      }

      // Skip Cobblemon-specific protocol extensions
      if (l.startsWith("|request|")) continue
      if (l.startsWith("|callback|")) continue
      if (l.startsWith("|choice|")) continue
      if (l.startsWith("|seed|")) continue
      if (l.startsWith(">")) continue
      if (l.startsWith("|pp_update|")) continue
      if (l.startsWith("|t:|")) continue

      // Handle |split| — keep first copy, skip the duplicate
      // Cobblemon emits: |split|p1 → line_for_p1 → line_for_p2
      // We want to keep only the public (second) version
      if (l.startsWith("|split|")) {
        inSplit = true
        splitSkipNext = true // skip the next line (private), keep the one after
        continue
      }

      if (inSplit && splitSkipNext) {
        splitSkipNext = false // skipped private line, next is public
        continue
      }

      if (inSplit && !splitSkipNext) {
        inSplit = false // public line, keep it and exit split mode
      }

      protocolLines.push(l)
    }
  }

  let result = protocolLines.join("\n")

  // Replace player UUIDs with display names
  if (playerNames?.winnerUuid && playerNames?.winnerName) {
    result = result.replaceAll(playerNames.winnerUuid, playerNames.winnerName)
  }
  if (playerNames?.loserUuid && playerNames?.loserName) {
    result = result.replaceAll(playerNames.loserUuid, playerNames.loserName)
  }

  // Replace Pokemon UUIDs with species names
  for (const [uuid, species] of pokemonNames) {
    result = result.replaceAll(uuid, species)
  }

  // Fix duplicate species names from UUID replacement in |switch| lines
  // "Tentacruel, Tentacruel, L45" → "Tentacruel, L45"
  result = result.replace(
    /\|switch\|([^|]+)\|(\w[\w\s-]*), \2,/g,
    "|switch|$1|$2,"
  )

  return result
}

interface ShowdownReplayPlayerProps {
  replayLog: string[]
  winnerName?: string | null
  loserName?: string | null
  winnerUuid?: string | null
  loserUuid?: string | null
}

export function ShowdownReplayPlayer({
  replayLog,
  winnerName,
  loserName,
  winnerUuid,
  loserUuid,
}: ShowdownReplayPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const loadedRef = useRef(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (loadedRef.current || !containerRef.current) return
    loadedRef.current = true

    const logData = filterLogForEmbed(replayLog, { winnerUuid, winnerName, loserUuid, loserName })

    if (!logData.trim()) {
      setError("Replay log vazio após filtro — dados de protocolo Showdown não encontrados.")
      return
    }

    // Build the replay DOM structure that replay-embed.js expects
    const wrapper = containerRef.current

    const battleDiv = document.createElement("div")
    battleDiv.className = "battle"
    wrapper.appendChild(battleDiv)

    const battleLogDiv = document.createElement("div")
    battleLogDiv.className = "battle-log"
    wrapper.appendChild(battleLogDiv)

    const controlsDiv = document.createElement("div")
    controlsDiv.className = "replay-controls"
    wrapper.appendChild(controlsDiv)

    const controls2Div = document.createElement("div")
    controls2Div.className = "replay-controls-2"
    wrapper.appendChild(controls2Div)

    const logScript = document.createElement("script")
    logScript.type = "text/plain"
    logScript.className = "battle-log-data"
    logScript.textContent = logData
    wrapper.appendChild(logScript)

    // Load external scripts
    const loadScript = (src: string): Promise<void> =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve()
          return
        }
        const s = document.createElement("script")
        s.src = src
        s.onload = () => resolve()
        s.onerror = reject
        document.head.appendChild(s)
      })

    const loadCSS = (href: string): void => {
      if (document.querySelector(`link[href="${href}"]`)) return
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = href
      document.head.appendChild(link)
    }

    async function loadEmbed() {
      try {
        // Load replay-embed CSS (required for layout/sprites)
        loadCSS("https://play.pokemonshowdown.com/style/battle.css")
        loadCSS("https://play.pokemonshowdown.com/style/replay.css")
        loadCSS("https://play.pokemonshowdown.com/style/utilichart.css")

        await loadScript("https://code.jquery.com/jquery-3.7.1.min.js")
        await loadScript("https://code.jquery.com/ui/1.13.2/jquery-ui.min.js")

        // Set the global flag the embed expects
        ;(window as unknown as Record<string, unknown>).Pokemon_Showdown_Replay_Embed = true

        const daily = Math.floor(Date.now() / (1000 * 60 * 60 * 24))
        await loadScript(
          `https://play.pokemonshowdown.com/js/replay-embed.js?version${daily}`
        )
      } catch (err) {
        console.error("[ShowdownReplayPlayer] Failed to load embed:", err)
        setError("Erro ao carregar o player de replay.")
      }
    }

    loadEmbed()
  }, [replayLog, winnerName, loserName, winnerUuid, loserUuid])

  if (error) {
    return (
      <div className="bg-brand-surface rounded-xl border border-white/10 p-6">
        <p className="text-yellow-400 text-center">{error}</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="wrapper replay-wrapper"
      style={{ maxWidth: 1180, margin: "0 auto" }}
    />
  )
}
