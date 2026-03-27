export const DIVISION_CONFIG = {
  UNRANKED:  { label: "Em Classificacao", color: "#888888" },
  BRONZE:    { label: "Bronze",           color: "#cd7f32" },
  SILVER:    { label: "Prata",            color: "#c0c0c0" },
  GOLD:      { label: "Ouro",             color: "#f59e0b" },
  PLATINUM:  { label: "Platina",          color: "#00d4ff" },
  DIAMOND:   { label: "Diamante",         color: "#b9f2ff" },
  MASTER:    { label: "Master",           color: "#ff4444" },
} as const

export type Division = keyof typeof DIVISION_CONFIG

interface TierBadgeProps {
  division: string
  size?: "sm" | "md"
}

export function TierBadge({ division, size = "sm" }: TierBadgeProps) {
  const key = (division?.toUpperCase() ?? "UNRANKED") as Division
  const config = DIVISION_CONFIG[key] ?? DIVISION_CONFIG.UNRANKED
  const sizeClasses = size === "sm"
    ? "px-2 py-0.5 text-xs"
    : "px-3 py-1 text-sm"

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold border whitespace-nowrap ${sizeClasses}`}
      style={{
        color: config.color,
        borderColor: `${config.color}60`,
        backgroundColor: `${config.color}15`,
      }}
    >
      {config.label}
    </span>
  )
}
