// src/app/(public)/loja/page.tsx
export const dynamic = 'force-dynamic'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, Star, Shield, Zap, ArrowRight } from 'lucide-react'
import { db } from '@/lib/db'
import { shopItems } from '@/lib/db/schema'

const storeCategories = [
  {
    id: 'cosmeticos',
    icon: Star,
    name: 'Cosmeticos',
    description: 'Skins exclusivas, particulas especiais e efeitos visuais unicos para seu personagem.',
    color: 'text-brand-yellow',
    bgColor: 'bg-brand-yellow/5',
    borderColor: 'border-brand-yellow/15',
    glowHover: 'hover:shadow-[0_0_30px_rgba(255,214,10,0.1)] hover:border-brand-yellow/30',
  },
  {
    id: 'ranks-vip',
    icon: Shield,
    name: 'Ranks & VIP',
    description: 'Acesso a servidores exclusivos, comandos especiais e badges de prestigio no chat.',
    color: 'text-brand-accent',
    bgColor: 'bg-brand-accent/5',
    borderColor: 'border-brand-accent/15',
    glowHover: 'hover:shadow-[0_0_30px_rgba(255,45,85,0.1)] hover:border-brand-accent/30',
  },
  {
    id: 'itens-servidor',
    icon: Zap,
    name: 'Itens do Servidor',
    description: 'Pokebolas especiais, itens de raridade, boosters de EXP e recursos exclusivos.',
    color: 'text-brand-blue',
    bgColor: 'bg-brand-blue/5',
    borderColor: 'border-brand-blue/15',
    glowHover: 'hover:shadow-[0_0_30px_rgba(0,212,255,0.1)] hover:border-brand-blue/30',
  },
]

export default async function LojaPage() {
  const previewItems = await db.select().from(shopItems)

  return (
    <div className="min-h-screen bg-brand-primary grid-bg py-20 px-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-40 left-1/3 w-96 h-96 rounded-full bg-brand-accent/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 rounded-full bg-brand-yellow/5 blur-3xl pointer-events-none" />

      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 mb-5">
            <ShoppingBag className="h-7 w-7 text-brand-accent" />
          </div>
          <div className="flex justify-center mb-4">
            <Badge
              data-testid="store-em-breve-badge"
              className="bg-brand-accent/10 text-brand-accent border-brand-accent/30 text-xs px-4 py-1.5 font-medium tracking-wider"
              variant="outline"
            >
              Em Breve
            </Badge>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-white mb-4">Loja</h1>
          <p className="text-white/45 max-w-xl mx-auto text-sm leading-relaxed">
            A loja do CraftPro Brasil esta chegando. Confira o que estara disponivel em breve.
          </p>
        </div>

        {/* Category cards */}
        <div
          data-testid="store-category-cards"
          className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14"
        >
          {storeCategories.map((category) => {
            const Icon = category.icon
            return (
              <div
                key={category.id}
                data-testid={`store-category-${category.id}`}
                className={`rounded-2xl border ${category.borderColor} ${category.bgColor} p-7 text-center backdrop-blur-sm transition-all duration-400 ${category.glowHover} hover:-translate-y-1`}
              >
                <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white/5 mb-5 ${category.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className={`font-semibold text-base ${category.color} mb-2`}>{category.name}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{category.description}</p>
              </div>
            )
          })}
        </div>

        {/* DB-backed preview items */}
        {previewItems.length > 0 && (
          <div className="mb-14">
            <h2 className="text-lg font-semibold text-white mb-5 text-center">Itens em Destaque</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {previewItems.map((item) => (
                <div
                  key={item.id}
                  className="card-glow bg-brand-card/60 backdrop-blur-sm rounded-2xl p-5 border border-white/[0.06]"
                >
                  <h3 className="text-sm font-semibold text-white mb-1.5">{item.name}</h3>
                  <p className="text-xs text-white/45 mb-3 leading-relaxed">{item.description}</p>
                  <Badge variant="outline" className="text-xs border-white/15 text-white/50">{item.category}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Discord CTA */}
        <div className="text-center">
          <p className="text-white/45 mb-5 text-sm">
            Quer ser avisado quando a loja abrir?
          </p>
          <a
            data-testid="store-discord-cta"
            href="https://discord.gg/craftprobrasil"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold px-7 py-3.5 rounded-xl
              shadow-[0_0_25px_rgba(88,101,242,0.25)] hover:shadow-[0_0_40px_rgba(88,101,242,0.4)]
              transition-all duration-300 hover:scale-105 active:scale-[0.98] text-sm"
          >
            Entrar no Discord
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  )
}
