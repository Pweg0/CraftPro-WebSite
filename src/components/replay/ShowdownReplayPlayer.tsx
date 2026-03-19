"use client"

import { useEffect, useRef } from "react"

/**
 * Lines that are internal Cobblemon/Showdown protocol and should NOT
 * be passed to the replay embed player.
 */
function filterLogForEmbed(lines: string[]): string {
  return lines
    .filter((line) => {
      const l = line.trim()
      if (!l) return false
      // Cobblemon-specific internal lines the embed doesn't understand
      if (l.startsWith("sideupdate") || l.startsWith("|sideupdate")) return false
      if (l.startsWith("update") || l.startsWith("|update")) return false
      if (l.includes("|request|")) return false
      if (l.startsWith("|callback|") || l.startsWith("callback|")) return false
      if (l.startsWith("|choice|") || l.startsWith("choice|")) return false
      if (l.startsWith("seed|") || l.startsWith("|seed|")) return false
      return true
    })
    .join("\n")
}

interface ShowdownReplayPlayerProps {
  replayLog: string[]
}

export function ShowdownReplayPlayer({ replayLog }: ShowdownReplayPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const loadedRef = useRef(false)

  useEffect(() => {
    if (loadedRef.current || !containerRef.current) return
    loadedRef.current = true

    const logData = filterLogForEmbed(replayLog)

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

    // Load jQuery (required by replay-embed.js)
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

    async function loadEmbed() {
      try {
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
      }
    }

    loadEmbed()
  }, [replayLog])

  return (
    <div
      ref={containerRef}
      className="wrapper replay-wrapper"
      style={{ maxWidth: 1180, margin: "0 auto" }}
    />
  )
}
