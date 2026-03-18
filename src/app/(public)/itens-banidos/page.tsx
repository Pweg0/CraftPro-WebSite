// src/app/(public)/itens-banidos/page.tsx
// Server Component — loads static data, passes to Client Component for filtering
import { BANNED_ITEMS } from '@/data/banned-items';
import { BannedItemsTable } from '@/components/banned-items/BannedItemsTable';

export default function ItensBanidosPage() {
  return (
    <div className="min-h-screen bg-brand-primary py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-display text-2xl text-white mb-4">Itens Banidos</h1>
          <p className="text-white/60 max-w-xl mx-auto">
            Lista completa de itens proibidos no CraftPro Brasil.
            O uso de qualquer item desta lista pode resultar em punição.
          </p>
        </div>

        <BannedItemsTable items={BANNED_ITEMS} />
      </div>
    </div>
  );
}
