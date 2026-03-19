"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Player name mapping: UUID → display name.
 * Extracted from |player| lines so we can show names everywhere.
 */
interface PlayerNames {
  winnerName: string | null
  loserName: string | null
  winnerUuid: string | null
  loserUuid: string | null
}

/**
 * Filter Cobblemon's showdownMessages into clean Showdown protocol
 * that replay-embed.js can understand.
 */
function filterLogForEmbed(lines: string[], names?: PlayerNames): string {
  const filtered: string[] = []

  for (const raw of lines) {
    const l = raw.trim()
    if (!l) continue

    // Skip Cobblemon-internal lines the embed doesn't understand
    if (l.startsWith("sideupdate") || l.startsWith("|sideupdate")) continue
    if (l.startsWith("update") || l.startsWith("|update")) continue
    if (l.includes("|request|")) continue
    if (l.startsWith("|callback|") || l.startsWith("callback|")) continue
    if (l.startsWith("|choice|") || l.startsWith("choice|")) continue
    if (l.startsWith("seed|") || l.startsWith("|seed|")) continue

    // Skip input commands (>start, >player, >p1 move, etc.)
    if (l.startsWith(">")) continue

    // Skip the giant "end" JSON blob (end + JSON with battle result data)
    if (l === "end" || l.startsWith("end\n") || l.startsWith("end{") || l.startsWith("end {")) continue
    // Also skip if the line is just a giant JSON object (team data, etc.)
    if (l.startsWith("{") && l.length > 200) continue

    filtered.push(l)
  }

  // Replace UUIDs with player names in protocol lines
  let result = filtered.join("\n")
  if (names) {
    if (names.winnerUuid && names.winnerName) {
      result = result.replaceAll(names.winnerUuid, names.winnerName)
    }
    if (names.loserUuid && names.loserName) {
      result = result.replaceAll(names.loserUuid, names.loserName)
    }
  }

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

    const names: PlayerNames = { winnerName: winnerName ?? null, loserName: loserName ?? null, winnerUuid: winnerUuid ?? null, loserUuid: loserUuid ?? null }
    const logData = filterLogForEmbed(replayLog, names)

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
