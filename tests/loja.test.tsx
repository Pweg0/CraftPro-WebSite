// tests/loja.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LojaPage from '@/app/(public)/loja/page';

describe('LojaPage', () => {
  it('renders the Em Breve badge', () => {
    render(<LojaPage />);
    expect(screen.getByTestId('store-em-breve-badge')).toBeInTheDocument();
  });

  it('renders all 3 store category cards', () => {
    render(<LojaPage />);
    expect(screen.getByTestId('store-category-cosmeticos')).toBeInTheDocument();
    expect(screen.getByTestId('store-category-ranks-vip')).toBeInTheDocument();
    expect(screen.getByTestId('store-category-itens-servidor')).toBeInTheDocument();
  });

  it('renders the Discord CTA', () => {
    render(<LojaPage />);
    const discordCta = screen.getByTestId('store-discord-cta');
    expect(discordCta).toHaveAttribute('href', expect.stringContaining('discord.gg'));
  });
});
