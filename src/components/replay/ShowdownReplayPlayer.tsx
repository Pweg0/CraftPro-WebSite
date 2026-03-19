"use client"

import { useMemo, useState } from "react"
import { ChevronDown, ChevronRight, Globe } from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────

type Lang = "pt-br" | "en-us"

interface BattleEvent {
  type: string
  pokemon?: string
  target?: string
  move?: string
  hp?: string
  ability?: string
  stat?: string
  amount?: string
  species?: string
  details?: string
  player?: string
  name?: string
  winner?: string
  item?: string
  effect?: string
  raw: string
}

interface Turn {
  number: number
  events: BattleEvent[]
}

interface BattleData {
  players: { p1: string; p2: string }
  turns: Turn[]
  winner: string | null
  startEvents: BattleEvent[]
}

// ─── Protocol Filter (from Cobblemon multi-line blocks) ──────────────

function filterBlocks(
  blocks: string[],
  playerNames?: {
    winnerUuid?: string | null; winnerName?: string | null
    loserUuid?: string | null; loserName?: string | null
  }
): string[] {
  const protocolLines: string[] = []
  const pokemonNames = new Map<string, string>()

  // First pass: extract Pokemon UUID→species
  for (const block of blocks) {
    const trimmed = block.trim()
    if (!trimmed) continue
    const nl = trimmed.indexOf("\n")
    if (nl === -1) continue
    if (trimmed.substring(0, nl).trim() !== "update") continue
    for (const line of trimmed.substring(nl + 1).split("\n")) {
      const l = line.trim()
      const sw = l.match(/\|switch\|p[12]a: ([a-f0-9-]{36})\|(\w[\w\s-]*),/)
      if (sw) pokemonNames.set(sw[1], sw[2].trim())
      const fm = l.match(/\|-formechange\|p[12]a: ([a-f0-9-]{36})\|(\w[\w\s-]*)/)
      if (fm) pokemonNames.set(fm[1], fm[2].trim())
    }
  }

  let inSplit = false, skipNext = false

  for (const block of blocks) {
    const trimmed = block.trim()
    if (!trimmed) continue
    const nl = trimmed.indexOf("\n")
    if (nl === -1) continue
    if (trimmed.substring(0, nl).trim() !== "update") continue

    for (const raw of trimmed.substring(nl + 1).split("\n")) {
      const l = raw.trim()
      if (!l) { inSplit = false; skipNext = false; protocolLines.push(""); continue }
      if (l.startsWith("|request|") || l.startsWith("|callback|") || l.startsWith("|choice|") ||
          l.startsWith("|seed|") || l.startsWith(">") || l.startsWith("|pp_update|") ||
          l.startsWith("|t:|")) continue
      if (l.startsWith("|split|")) { inSplit = true; skipNext = true; continue }
      if (inSplit && skipNext) { skipNext = false; continue }
      if (inSplit) inSplit = false
      protocolLines.push(l)
    }
  }

  // Replace UUIDs
  let joined = protocolLines.join("\n")
  if (playerNames?.winnerUuid && playerNames?.winnerName)
    joined = joined.replaceAll(playerNames.winnerUuid, playerNames.winnerName)
  if (playerNames?.loserUuid && playerNames?.loserName)
    joined = joined.replaceAll(playerNames.loserUuid, playerNames.loserName)
  for (const [uuid, species] of pokemonNames)
    joined = joined.replaceAll(uuid, species)
  // Fix duplicate species: "Tentacruel, Tentacruel, L45" → "Tentacruel, L45"
  joined = joined.replace(/\|switch\|([^|]+)\|(\w[\w\s-]*), \2,/g, "|switch|$1|$2,")

  return joined.split("\n")
}

// ─── Protocol Parser ─────────────────────────────────────────────────

function extractPokemon(raw: string): string {
  // "p1a: Tentacruel" → "Tentacruel"
  const m = raw.match(/p[12]a: (.+)/)
  return m ? m[1] : raw
}

function parseLine(line: string): BattleEvent | null {
  const parts = line.split("|").filter(Boolean)
  if (parts.length === 0) return null
  const type = parts[0]

  switch (type) {
    case "player":
      return { type: "player", player: parts[1], name: parts[2] ?? "", raw: line }
    case "gametype":
    case "gen":
    case "tier":
    case "teamsize":
      return { type, raw: line }
    case "start":
      return { type: "start", raw: line }
    case "turn":
      return { type: "turn", amount: parts[1], raw: line }
    case "move":
      return { type: "move", pokemon: extractPokemon(parts[1]), move: parts[2], target: parts[3] ? extractPokemon(parts[3]) : undefined, raw: line }
    case "switch":
    case "drag": {
      const details = parts[2] ?? ""
      const species = details.split(",")[0].trim()
      return { type: "switch", pokemon: extractPokemon(parts[1]), species, details, hp: parts[3], raw: line }
    }
    case "-damage":
    case "-heal":
      return { type, pokemon: extractPokemon(parts[1]), hp: parts[2], raw: line }
    case "faint":
      return { type: "faint", pokemon: extractPokemon(parts[1]), raw: line }
    case "-supereffective":
      return { type: "supereffective", target: extractPokemon(parts[1]), raw: line }
    case "-resisted":
      return { type: "resisted", target: extractPokemon(parts[1]), raw: line }
    case "-immune":
      return { type: "immune", target: extractPokemon(parts[1]), raw: line }
    case "-crit":
      return { type: "crit", target: extractPokemon(parts[1]), raw: line }
    case "-miss":
      return { type: "miss", pokemon: extractPokemon(parts[1]), target: parts[2] ? extractPokemon(parts[2]) : undefined, raw: line }
    case "-boost":
    case "-unboost":
      return { type, pokemon: extractPokemon(parts[1]), stat: parts[2], amount: parts[3], raw: line }
    case "-ability":
      return { type: "ability", pokemon: extractPokemon(parts[1]), ability: parts[2], raw: line }
    case "-status":
      return { type: "status", pokemon: extractPokemon(parts[1]), effect: parts[2], raw: line }
    case "-curestatus":
      return { type: "curestatus", pokemon: extractPokemon(parts[1]), effect: parts[2], raw: line }
    case "-weather":
      return { type: "weather", effect: parts[1], raw: line }
    case "-item":
    case "-enditem":
      return { type, pokemon: extractPokemon(parts[1]), item: parts[2], raw: line }
    case "-activate":
      return { type: "activate", pokemon: extractPokemon(parts[1]), effect: parts[2], raw: line }
    case "win":
      return { type: "win", winner: parts[1], raw: line }
    case "upkeep":
      return null
    default:
      return { type: "unknown", raw: line }
  }
}

function parseProtocol(lines: string[]): BattleData {
  const data: BattleData = {
    players: { p1: "Player 1", p2: "Player 2" },
    turns: [],
    winner: null,
    startEvents: [],
  }

  let currentTurn: Turn | null = null

  for (const line of lines) {
    if (!line.trim()) continue
    const event = parseLine(line)
    if (!event) continue

    if (event.type === "player") {
      if (event.player === "p1") data.players.p1 = event.name ?? "Player 1"
      else if (event.player === "p2") data.players.p2 = event.name ?? "Player 2"
      continue
    }

    if (event.type === "turn") {
      currentTurn = { number: parseInt(event.amount ?? "0"), events: [] }
      data.turns.push(currentTurn)
      continue
    }

    if (event.type === "win") {
      data.winner = event.winner ?? null
      if (currentTurn) currentTurn.events.push(event)
      continue
    }

    if (currentTurn) {
      currentTurn.events.push(event)
    } else {
      data.startEvents.push(event)
    }
  }

  return data
}

// ─── Translations ────────────────────────────────────────────────────

const STAT_NAMES: Record<string, Record<Lang, string>> = {
  atk: { "pt-br": "Ataque", "en-us": "Attack" },
  def: { "pt-br": "Defesa", "en-us": "Defense" },
  spa: { "pt-br": "Ataque Esp.", "en-us": "Sp. Atk" },
  spd: { "pt-br": "Defesa Esp.", "en-us": "Sp. Def" },
  spe: { "pt-br": "Velocidade", "en-us": "Speed" },
  accuracy: { "pt-br": "Precisão", "en-us": "Accuracy" },
  evasion: { "pt-br": "Evasão", "en-us": "Evasion" },
}

const STATUS_NAMES: Record<string, Record<Lang, string>> = {
  brn: { "pt-br": "queimadura", "en-us": "burn" },
  par: { "pt-br": "paralisia", "en-us": "paralysis" },
  psn: { "pt-br": "envenenamento", "en-us": "poison" },
  tox: { "pt-br": "envenenamento grave", "en-us": "bad poison" },
  slp: { "pt-br": "sono", "en-us": "sleep" },
  frz: { "pt-br": "congelamento", "en-us": "freeze" },
  confusion: { "pt-br": "confusão", "en-us": "confusion" },
}

function renderEvent(event: BattleEvent, lang: Lang): string | null {
  switch (event.type) {
    case "move":
      return lang === "pt-br"
        ? `${event.pokemon} usou **${event.move}**${event.target ? ` em ${event.target}` : ""}!`
        : `${event.pokemon} used **${event.move}**${event.target ? ` on ${event.target}` : ""}!`

    case "-damage": {
      const hp = event.hp?.replace(" fnt", "")
      const fainted = event.hp?.includes("fnt")
      if (fainted) return null // faint event handles this
      return lang === "pt-br"
        ? `${event.pokemon} ficou com **${hp}** de HP`
        : `${event.pokemon} dropped to **${hp}** HP`
    }

    case "-heal":
      return lang === "pt-br"
        ? `${event.pokemon} recuperou HP (**${event.hp}**)`
        : `${event.pokemon} recovered HP (**${event.hp}**)`

    case "switch":
      return lang === "pt-br"
        ? `${event.pokemon} entrou em campo! (${event.details})`
        : `${event.pokemon} was sent out! (${event.details})`

    case "faint":
      return lang === "pt-br"
        ? `**${event.pokemon}** desmaiou!`
        : `**${event.pokemon}** fainted!`

    case "supereffective":
      return lang === "pt-br" ? "É super efetivo!" : "It's super effective!"

    case "resisted":
      return lang === "pt-br" ? "Não é muito efetivo..." : "It's not very effective..."

    case "immune":
      return lang === "pt-br"
        ? `Não afetou ${event.target}...`
        : `It doesn't affect ${event.target}...`

    case "crit":
      return lang === "pt-br" ? "Golpe crítico!" : "A critical hit!"

    case "miss":
      return lang === "pt-br"
        ? `${event.pokemon} errou o ataque!`
        : `${event.pokemon}'s attack missed!`

    case "-boost": {
      const stat = STAT_NAMES[event.stat ?? ""]?.[lang] ?? event.stat
      const n = parseInt(event.amount ?? "1")
      const mod = n > 1
        ? (lang === "pt-br" ? "muito" : "sharply")
        : ""
      return lang === "pt-br"
        ? `${stat} de ${event.pokemon} ${mod ? mod + " " : ""}subiu!`
        : `${event.pokemon}'s ${stat} rose${mod ? " " + mod : ""}!`
    }

    case "-unboost": {
      const stat = STAT_NAMES[event.stat ?? ""]?.[lang] ?? event.stat
      const n = parseInt(event.amount ?? "1")
      const mod = n > 1
        ? (lang === "pt-br" ? "muito" : "harshly")
        : ""
      return lang === "pt-br"
        ? `${stat} de ${event.pokemon} ${mod ? mod + " " : ""}caiu!`
        : `${event.pokemon}'s ${stat} ${mod ? mod + " " : ""}fell!`
    }

    case "ability":
      return lang === "pt-br"
        ? `**${event.ability}** de ${event.pokemon} ativou!`
        : `${event.pokemon}'s **${event.ability}** activated!`

    case "status": {
      const status = STATUS_NAMES[event.effect ?? ""]?.[lang] ?? event.effect
      return lang === "pt-br"
        ? `${event.pokemon} sofreu ${status}!`
        : `${event.pokemon} was afflicted with ${status}!`
    }

    case "curestatus": {
      const status = STATUS_NAMES[event.effect ?? ""]?.[lang] ?? event.effect
      return lang === "pt-br"
        ? `${event.pokemon} se curou de ${status}!`
        : `${event.pokemon} was cured of ${status}!`
    }

    case "-weather":
      return lang === "pt-br"
        ? `O clima mudou: **${event.effect}**`
        : `The weather changed to **${event.effect}**`

    case "-item":
      return lang === "pt-br"
        ? `${event.pokemon} revelou **${event.item}**!`
        : `${event.pokemon} revealed **${event.item}**!`

    case "-enditem":
      return lang === "pt-br"
        ? `**${event.item}** de ${event.pokemon} foi consumido!`
        : `${event.pokemon}'s **${event.item}** was consumed!`

    case "activate":
      return lang === "pt-br"
        ? `**${event.effect}** de ${event.pokemon} ativou!`
        : `${event.pokemon}'s **${event.effect}** activated!`

    case "win":
      return lang === "pt-br"
        ? `**${event.winner}** venceu a batalha!`
        : `**${event.winner}** won the battle!`

    case "start":
    case "gametype":
    case "gen":
    case "tier":
    case "teamsize":
    case "unknown":
      return null

    default:
      return null
  }
}

// ─── Event styling ───────────────────────────────────────────────────

function getEventStyle(event: BattleEvent): string {
  switch (event.type) {
    case "move": return "text-yellow-300"
    case "-damage": return "text-red-400"
    case "-heal": return "text-green-400"
    case "switch": return "text-blue-400"
    case "faint": return "text-gray-400 italic"
    case "supereffective": return "text-orange-400 font-semibold"
    case "resisted": return "text-gray-500"
    case "crit": return "text-orange-300"
    case "miss": return "text-gray-500 italic"
    case "-boost": return "text-cyan-400"
    case "-unboost": return "text-pink-400"
    case "ability": return "text-purple-400"
    case "status": return "text-red-300"
    case "curestatus": return "text-green-300"
    case "win": return "text-green-400 font-bold text-lg"
    case "immune": return "text-gray-500"
    case "-weather": return "text-sky-300"
    default: return "text-white/60"
  }
}

// ─── Component ───────────────────────────────────────────────────────

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
  const [lang, setLang] = useState<Lang>("pt-br")
  const [collapsedTurns, setCollapsedTurns] = useState<Set<number>>(new Set())

  const battleData = useMemo(() => {
    const lines = filterBlocks(replayLog, { winnerUuid, winnerName, loserUuid, loserName })
    return parseProtocol(lines)
  }, [replayLog, winnerUuid, winnerName, loserUuid, loserName])

  const toggleTurn = (n: number) => {
    setCollapsedTurns((prev) => {
      const next = new Set(prev)
      if (next.has(n)) next.delete(n)
      else next.add(n)
      return next
    })
  }

  if (battleData.turns.length === 0) {
    return (
      <div className="bg-brand-surface rounded-xl border border-white/10 p-6">
        <p className="text-yellow-400 text-center">
          {lang === "pt-br"
            ? "Nenhum dado de replay encontrado."
            : "No replay data found."}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-brand-surface rounded-xl border border-white/10 overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <span className="font-semibold text-white">{battleData.players.p1}</span>
          <span>vs</span>
          <span className="font-semibold text-white">{battleData.players.p2}</span>
          <span className="text-white/30 mx-1">·</span>
          <span>{battleData.turns.length} {lang === "pt-br" ? "turnos" : "turns"}</span>
        </div>

        {/* Language toggle */}
        <button
          onClick={() => setLang((l) => (l === "pt-br" ? "en-us" : "pt-br"))}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 transition-colors text-sm text-white/80 hover:text-white"
          title={lang === "pt-br" ? "Switch to English" : "Mudar para Português"}
        >
          <Globe className="h-3.5 w-3.5" />
          {lang === "pt-br" ? "PT-BR" : "EN-US"}
        </button>
      </div>

      {/* Battle log */}
      <div className="p-4 max-h-[600px] overflow-y-auto space-y-1 font-mono text-sm">
        {/* Start events (initial switches) */}
        {battleData.startEvents.map((event, i) => {
          const text = renderEvent(event, lang)
          if (!text) return null
          return (
            <div key={`start-${i}`} className={getEventStyle(event)}>
              <FormattedText text={text} />
            </div>
          )
        })}

        {/* Turns */}
        {battleData.turns.map((turn) => {
          const isCollapsed = collapsedTurns.has(turn.number)
          const hasFaint = turn.events.some((e) => e.type === "faint")
          const hasWin = turn.events.some((e) => e.type === "win")

          return (
            <div key={turn.number} className="mt-3">
              {/* Turn header */}
              <button
                onClick={() => toggleTurn(turn.number)}
                className={`flex items-center gap-1 w-full text-left px-2 py-1 rounded hover:bg-white/5 transition-colors ${
                  hasWin ? "text-green-400" : hasFaint ? "text-red-400/80" : "text-white/50"
                }`}
              >
                {isCollapsed
                  ? <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                  : <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                }
                <span className="font-bold text-xs uppercase tracking-wider">
                  {lang === "pt-br" ? `Turno ${turn.number}` : `Turn ${turn.number}`}
                </span>
                {isCollapsed && (
                  <span className="text-white/30 text-xs ml-2">
                    {turnSummary(turn, lang)}
                  </span>
                )}
              </button>

              {/* Turn events */}
              {!isCollapsed && (
                <div className="ml-5 mt-1 space-y-0.5 border-l border-white/10 pl-3">
                  {turn.events.map((event, i) => {
                    const text = renderEvent(event, lang)
                    if (!text) return null
                    return (
                      <div key={i} className={getEventStyle(event)}>
                        <FormattedText text={text} />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Quick summary for collapsed turns
function turnSummary(turn: Turn, lang: Lang): string {
  const moves = turn.events.filter((e) => e.type === "move").map((e) => e.move)
  const fainted = turn.events.filter((e) => e.type === "faint").map((e) => e.pokemon)
  const parts: string[] = []
  if (moves.length > 0) parts.push(moves.join(", "))
  if (fainted.length > 0) {
    parts.push(
      lang === "pt-br"
        ? `${fainted.join(", ")} desmaiou`
        : `${fainted.join(", ")} fainted`
    )
  }
  return parts.join(" · ")
}

// Render **bold** markdown in text
function FormattedText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}
