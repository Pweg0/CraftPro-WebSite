// tests/banned-items.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BannedItemsTable } from '@/components/banned-items/BannedItemsTable';

const sampleItems = [
  { name: 'Bedrock', reason: 'Item de admin', category: 'Bloco' },
  { name: 'Command Block', reason: 'Executa comandos', category: 'Mecanismo' },
  { name: 'TNT Minecart', reason: 'Dano massivo', category: 'Veículo' },
];

describe('BannedItemsTable', () => {
  it('renders all items when search is empty', () => {
    render(<BannedItemsTable items={sampleItems} />);
    expect(screen.getByText('Bedrock')).toBeInTheDocument();
    expect(screen.getByText('Command Block')).toBeInTheDocument();
    expect(screen.getByText('TNT Minecart')).toBeInTheDocument();
  });

  it('filters items by name on search input', () => {
    render(<BannedItemsTable items={sampleItems} />);
    const search = screen.getByTestId('banned-items-search');
    fireEvent.change(search, { target: { value: 'Bedrock' } });
    expect(screen.getByText('Bedrock')).toBeInTheDocument();
    expect(screen.queryByText('Command Block')).not.toBeInTheDocument();
    expect(screen.queryByText('TNT Minecart')).not.toBeInTheDocument();
  });

  it('filters items by category', () => {
    render(<BannedItemsTable items={sampleItems} />);
    const search = screen.getByTestId('banned-items-search');
    fireEvent.change(search, { target: { value: 'Mecanismo' } });
    expect(screen.getByText('Command Block')).toBeInTheDocument();
    expect(screen.queryByText('Bedrock')).not.toBeInTheDocument();
  });

  it('shows empty state when no items match the query', () => {
    render(<BannedItemsTable items={sampleItems} />);
    const search = screen.getByTestId('banned-items-search');
    fireEvent.change(search, { target: { value: 'xyz-item-que-nao-existe' } });
    expect(screen.getByTestId('banned-items-empty')).toBeInTheDocument();
  });

  it('search is case-insensitive', () => {
    render(<BannedItemsTable items={sampleItems} />);
    const search = screen.getByTestId('banned-items-search');
    fireEvent.change(search, { target: { value: 'bedrock' } });
    expect(screen.getByText('Bedrock')).toBeInTheDocument();
  });
});
