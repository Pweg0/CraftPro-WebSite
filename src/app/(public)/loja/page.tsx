// src/app/(public)/loja/page.tsx
// Server Component — store teaser with category preview cards + DB-backed preview items
// Per CONTEXT.md: "Não é uma página vazia — mostra o que virá"
export const dynamic = 'force-dynamic'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, Star, Shield, Zap } from 'lucide-react'
import { db } from '@/lib/db'
import { shopItems } from '@/lib/db/schema'

const storeCategories = [
  {
    id: 'cosmeticos',
    icon: Star,
    name: 'Cosméticos',
    description: 'Skins exclusivas, partículas especiais e efeitos visuais únicos para seu personagem.',
    color: 'text-brand-yellow',
    bgColor: 'bg-brand-yellow/10',
    borderColor: 'border-brand-yellow/30',
  },
  {
    id: 'ranks-vip',
    icon: Shield,
    name: 'Ranks & VIP',
    description: 'Acesso a servidores exclusivos, comandos especiais e badges de prestígio no chat.',
    color: 'text-brand-accent',
    bgColor: 'bg-brand-accent/10',
    borderColor: 'border-brand-accent/30',
  },
  {
    id: 'itens-servidor',
    icon: Zap,
    name: 'Itens do Servidor',
    description: 'Pokébolas especiais, itens de raridade, boosters de EXP e recursos exclusivos.',
    color: 'text-brand-blue',
    bgColor: 'bg-brand-blue/10',
    borderColor: 'border-brand-blue/30',
  },
]

export default async function LojaPage() {
  const previewItems = await db.select().from(shopItems)

  return (
    <div className="min-h-screen bg-brand-primary py-16 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <ShoppingBag className="h-12 w-12 text-brand-accent" />
          </div>
          <div className="flex justify-center mb-4">
            <Badge
              data-testid="store-em-breve-badge"
              className="bg-brand-accent/20 text-brand-accent border-brand-accent/50 text-sm px-4 py-1"
              variant="outline"
            >
              Em Breve
            </Badge>
          </div>
          <h1 className="font-display text-2xl text-white mb-4">Loja</h1>
          <p className="text-white/60 max-w-xl mx-auto">
            A loja do CraftPro Brasil está chegando. Confira o que estará disponível em breve.
          </p>
        </div>

        {/* Category preview cards */}
        <div
          data-testid="store-category-cards"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {storeCategories.map((category) => {
            const Icon = category.icon
            return (
              <div
                key={category.id}
                data-testid={`store-category-${category.id}`}
                className={`rounded-card border ${category.borderColor} ${category.bgColor} p-6 text-center`}
              >
                <Icon className={`h-8 w-8 ${category.color} mx-auto mb-4`} />
                <h3 className={`font-semibold text-base ${category.color} mb-2`}>{category.name}</h3>
                <p className="text-sm text-white/60">{category.description}</p>
              </div>
            )
          })}
        </div>

        {/* DB-backed preview items — shown when admin has added items */}
        {previewItems.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-white mb-4 text-center">Itens em Destaque</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {previewItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-brand-card rounded-card p-4 border border-white/10"
                >
                  <h3 className="text-sm font-semibold text-white mb-1">{item.name}</h3>
                  <p className="text-xs text-white/60 mb-2">{item.description}</p>
                  <Badge variant="outline" className="text-xs">{item.category}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Discord CTA */}
        <div className="text-center">
          <p className="text-white/60 mb-4">
            Quer ser avisado quando a loja abrir?
          </p>
          <a
            data-testid="store-discord-cta"
            href="https://discord.gg/craftprobrasil"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold px-6 py-3 rounded-card transition-colors duration-150"
          >
            Entrar no Discord
          </a>
        </div>
      </div>
    </div>
  )
}
