// src/components/banned-items/BannedItemsTable.tsx
'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { BannedItem } from '@/types';

interface BannedItemsTableProps {
  items: BannedItem[];
}

export function BannedItemsTable({ items }: BannedItemsTableProps) {
  const [query, setQuery] = useState('');

  const filtered = items.filter(
    (item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase()) ||
      item.reason.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <Input
          data-testid="banned-items-search"
          placeholder="Buscar item, categoria ou razao..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-brand-surface/60 border-white/[0.08] text-white placeholder:text-white/30 pl-10 rounded-xl backdrop-blur-sm
            focus:border-brand-accent/30 focus:ring-brand-accent/10 transition-all duration-200"
        />
      </div>

      {filtered.length === 0 ? (
        <div
          data-testid="banned-items-empty"
          className="text-center py-16 text-white/40 bg-brand-surface/30 rounded-2xl border border-white/[0.06]"
        >
          Nenhum item encontrado para &quot;{query}&quot;.
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.06] overflow-hidden bg-brand-surface/40 backdrop-blur-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.06] hover:bg-transparent">
                <TableHead className="text-white/40 text-xs uppercase tracking-wider">Item</TableHead>
                <TableHead className="text-white/40 text-xs uppercase tracking-wider">Categoria</TableHead>
                <TableHead className="text-white/40 text-xs uppercase tracking-wider">Razao do Ban</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow
                  key={item.name}
                  data-testid={`banned-item-row-${item.name.replace(/\s+/g, '-').toLowerCase()}`}
                  className="border-white/[0.04] hover:bg-white/[0.02] transition-colors duration-150"
                >
                  <TableCell className="font-medium text-white">{item.name}</TableCell>
                  <TableCell>
                    <span className="text-xs bg-brand-blue/10 text-brand-blue/80 px-2.5 py-1 rounded-full border border-brand-blue/15">
                      {item.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-white/50 text-sm">{item.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <p className="text-xs text-white/30">
        {filtered.length} {filtered.length === 1 ? 'item' : 'itens'} encontrado{filtered.length !== 1 ? 's' : ''}
        {query && ` para "${query}"`}
      </p>
    </div>
  );
}
