import type { LucideIcon } from 'lucide-react'

interface AdminStatCardProps {
  icon: LucideIcon
  label: string
  value: number
  accentColor?: string // Tailwind border-color class for top accent bar
}

export function AdminStatCard({ icon: Icon, label, value, accentColor = 'border-brand-accent' }: AdminStatCardProps) {
  return (
    <div className={`bg-brand-card rounded-card p-6 border-t-[3px] ${accentColor}`}>
      <div className="flex items-center gap-3 mb-3">
        <Icon className="h-5 w-5 text-white/60" />
        <span className="text-sm text-white/60">{label}</span>
      </div>
      <p className="text-3xl font-semibold text-white">{value}</p>
    </div>
  )
}
