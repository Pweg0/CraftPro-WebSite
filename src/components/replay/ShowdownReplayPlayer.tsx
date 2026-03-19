"use client"

import { useEffect, useMemo, useRef, useState } from "react"

/**
 * Cobblemon's battle.getShowdownMessages() returns an array where each entry
 * is a multi-line block starting with a header: "update", "sideupdate", or "end".
 *
 * - "update" blocks contain the actual Showdown protocol lines we need
 * - "sideupdate" blocks contain private per-player data (|request|, |error|)
 * - "end" blocks contain a giant JSON blob with battle results
 *
 * Pokemon names in Cobblemon are UUIDs — we build a mapping from the
 * |switch| lines (which contain "UUID|Species, UUID, ...") and replace them.
 */
function filterLogForEmbed(
  blocks: string[],
  playerNames?: { winnerUuid?: string | null; winnerName?: string | null; loserUuid?: string | null; loserName?: string | null }
): string {
  const protocolLines: string[] = []
  const pokemonNames = new Map<string, string>()

  // First pass: extract Pokemon UUID→species mapping
  for (const block of blocks) {
    const trimmed = block.trim()
    if (!trimmed) continue
    const firstNewline = trimmed.indexOf("\n")
    if (firstNewline === -1) continue
    if (trimmed.substring(0, firstNewline).trim() !== "update") continue

    for (const line of trimmed.substring(firstNewline + 1).split("\n")) {
      const l = line.trim()
      const switchMatch = l.match(/\|switch\|p[12]a: ([a-f0-9-]{36})\|(\w[\w\s-]*),/)
      if (switchMatch) pokemonNames.set(switchMatch[1], switchMatch[2].trim())
      const formeMatch = l.match(/\|-formechange\|p[12]a: ([a-f0-9-]{36})\|(\w[\w\s-]*)/)
      if (formeMatch) pokemonNames.set(formeMatch[1], formeMatch[2].trim())
    }
  }

  let inSplit = false
  let splitSkipNext = false

  for (const block of blocks) {
    const trimmed = block.trim()
    if (!trimmed) continue
    const firstNewline = trimmed.indexOf("\n")
    if (firstNewline === -1) continue
    if (trimmed.substring(0, firstNewline).trim() !== "update") continue

    for (const rawLine of trimmed.substring(firstNewline + 1).split("\n")) {
      const l = rawLine.trim()
      if (!l) { inSplit = false; splitSkipNext = false; protocolLines.push(""); continue }
      if (l.startsWith("|request|") || l.startsWith("|callback|") || l.startsWith("|choice|") ||
          l.startsWith("|seed|") || l.startsWith(">") || l.startsWith("|pp_update|") ||
          l.startsWith("|t:|")) continue
      if (l.startsWith("|split|")) { inSplit = true; splitSkipNext = true; continue }
      if (inSplit && splitSkipNext) { splitSkipNext = false; continue }
      if (inSplit) inSplit = false
      protocolLines.push(l)
    }
  }

  let result = protocolLines.join("\n")

  if (playerNames?.winnerUuid && playerNames?.winnerName)
    result = result.replaceAll(playerNames.winnerUuid, playerNames.winnerName)
  if (playerNames?.loserUuid && playerNames?.loserName)
    result = result.replaceAll(playerNames.loserUuid, playerNames.loserName)
  for (const [uuid, species] of pokemonNames)
    result = result.replaceAll(uuid, species)

  // Fix duplicate species: "Tentacruel, Tentacruel, L45" → "Tentacruel, L45"
  result = result.replace(/\|switch\|([^|]+)\|(\w[\w\s-]*), \2,/g, "|switch|$1|$2,")

  return result
}

/**
 * Build a self-contained HTML document that loads the Showdown replay embed.
 * Rendered inside an iframe to isolate jQuery/Showdown globals from the React app.
 */
function buildEmbedHTML(logData: string): string {
  const daily = Math.floor(Date.now() / (1000 * 60 * 60 * 24))
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="https://play.pokemonshowdown.com/style/battle.css">
<link rel="stylesheet" href="https://play.pokemonshowdown.com/style/replay.css">
<link rel="stylesheet" href="https://play.pokemonshowdown.com/style/utilichart.css">
<style>
  body { margin: 0; padding: 0; background: transparent; overflow-x: hidden; }
  .wrapper { max-width: 1180px; margin: 0 auto; }
</style>
</head>
<body>
<div class="wrapper replay-wrapper">
  <div class="battle"></div>
  <div class="battle-log"></div>
  <div class="replay-controls"></div>
  <div class="replay-controls-2"></div>
  <script type="text/plain" class="battle-log-data">${logData.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</script>
</div>
<script src="https://code.jquery.com/jquery-3.7.1.min.js"><\/script>
<script src="https://code.jquery.com/ui/1.13.2/jquery-ui.min.js"><\/script>
<script>window.Pokemon_Showdown_Replay_Embed = true;<\/script>
<script src="https://play.pokemonshowdown.com/js/replay-embed.js?version${daily}"><\/script>
<script>
// Auto-resize iframe height to content
function notifyHeight() {
  var h = document.body.scrollHeight;
  window.parent.postMessage({ type: 'replay-height', height: h }, '*');
}
// Observe DOM changes to resize
var observer = new MutationObserver(notifyHeight);
observer.observe(document.body, { childList: true, subtree: true, attributes: true });
setTimeout(notifyHeight, 500);
setTimeout(notifyHeight, 2000);
setTimeout(notifyHeight, 5000);
<\/script>
</body>
</html>`
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
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(500)
  const [error, setError] = useState<string | null>(null)

  const logData = useMemo(
    () => filterLogForEmbed(replayLog, { winnerUuid, winnerName, loserUuid, loserName }),
    [replayLog, winnerUuid, winnerName, loserUuid, loserName]
  )

  // Listen for height messages from the iframe
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.type === "replay-height" && typeof e.data.height === "number") {
        setHeight(Math.max(400, e.data.height + 16))
      }
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [])

  // Write the HTML into the iframe after mount
  useEffect(() => {
    if (!iframeRef.current || !logData.trim()) {
      if (!logData.trim()) setError("Replay log vazio — dados de protocolo Showdown não encontrados.")
      return
    }

    const html = buildEmbedHTML(logData)
    const doc = iframeRef.current.contentDocument
    if (doc) {
      doc.open()
      doc.write(html)
      doc.close()
    }
  }, [logData])

  if (error) {
    return (
      <div className="bg-brand-surface rounded-xl border border-white/10 p-6">
        <p className="text-yellow-400 text-center">{error}</p>
      </div>
    )
  }

  return (
    <iframe
      ref={iframeRef}
      title="Replay da Batalha"
      sandbox="allow-scripts allow-same-origin"
      className="w-full border-0 rounded-xl"
      style={{ height, maxWidth: 1180, margin: "0 auto", display: "block", background: "transparent" }}
    />
  )
}
