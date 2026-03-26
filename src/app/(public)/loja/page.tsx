// src/app/(public)/loja/page.tsx
export const dynamic = 'force-dynamic'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, ArrowRight, PackageSearch } from 'lucide-react'
import { getShopItems } from '@/lib/db/queries/shop'
import { ShopItemCard } from '@/components/shop/ShopItemCard'

const CATEGORY_ORDER = ['cosmeticos', 'ranks-vip', 'itens-servidor']
const CATEGORY_LABELS: Record<string, string> = {
  cosmeticos: 'Cosméticos',
  'ranks-vip': 'Ranks & VIP',
  'itens-servidor': 'Itens do Servidor',
}

export default async function LojaPage() {
  const items = await getShopItems()

  // Group items by category, maintaining defined order
  const grouped: Record<string, typeof items> = {}
  for (const item of items) {
    if (!grouped[item.category]) grouped[item.category] = []
    grouped[item.category].push(item)
  }

  // Categories in order, only those that have items
  const orderedCategories = CATEGORY_ORDER.filter(cat => grouped[cat]?.length > 0)
  // Include any categories not in the predefined order
  const extraCategories = Object.keys(grouped).filter(cat => !CATEGORY_ORDER.includes(cat))
  const allCategories = [...orderedCategories, ...extraCategories]

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
            A loja do CraftPro Brasil está chegando. Confira os itens que estarão disponíveis em breve.
          </p>
        </div>

        {/* Product catalog */}
        {items.length === 0 ? (
          <div
            data-testid="store-empty-state"
            className="text-center py-20 text-white/40"
          >
            <PackageSearch className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="text-sm">Nenhum item disponível ainda.</p>
            <p className="text-xs mt-1 text-white/30">Volte em breve!</p>
          </div>
        ) : (
          <div className="space-y-12 mb-14">
            {allCategories.map((category) => (
              <div key={category}>
                <h2 className="text-base font-semibold text-white/70 mb-5 uppercase tracking-wider text-center">
                  {CATEGORY_LABELS[category] ?? category}
                </h2>
                <div
                  data-testid={`store-category-${category}`}
                  className="grid grid-cols-1 md:grid-cols-3 gap-5"
                >
                  {grouped[category].map((item) => (
                    <ShopItemCard
                      key={item.id}
                      id={item.id}
                      name={item.name}
                      description={item.description}
                      category={item.category}
                      price={item.price}
                      imageUrl={item.imageUrl}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Discord CTA */}
        <div className="text-center">
          <p className="text-white/45 mb-5 text-sm">
            Quer ser avisado quando a loja abrir?
          </p>
          <a
            data-testid="store-discord-cta"
            href="https://discord.gg/FcdR6PPjg6"
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
