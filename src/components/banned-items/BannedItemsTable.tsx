// src/components/banned-items/BannedItemsTable.tsx
// Client Component — uses useState for search filter
'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
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
    <div className="space-y-4">
      <Input
        data-testid="banned-items-search"
        placeholder="Buscar item, categoria ou razão..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="bg-brand-surface border-white/20 text-white placeholder:text-white/40 max-w-sm"
      />

      {filtered.length === 0 ? (
        <div
          data-testid="banned-items-empty"
          className="text-center py-12 text-white/50"
        >
          Nenhum item encontrado para &quot;{query}&quot;.
        </div>
      ) : (
        <div className="rounded-card border border-white/10 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-white/70">Item</TableHead>
                <TableHead className="text-white/70">Categoria</TableHead>
                <TableHead className="text-white/70">Razão do Ban</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow
                  key={item.name}
                  data-testid={`banned-item-row-${item.name.replace(/\s+/g, '-').toLowerCase()}`}
                  className="border-white/10 hover:bg-brand-surface"
                >
                  <TableCell className="font-medium text-white">{item.name}</TableCell>
                  <TableCell>
                    <span className="text-xs bg-brand-card text-brand-blue px-2 py-1 rounded-full">
                      {item.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-white/70 text-sm">{item.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Item count */}
      <p className="text-xs text-white/40">
        {filtered.length} {filtered.length === 1 ? 'item' : 'itens'} encontrado{filtered.length !== 1 ? 's' : ''}
        {query && ` para "${query}"`}
      </p>
    </div>
  );
}
