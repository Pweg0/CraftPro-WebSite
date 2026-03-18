// tests/loja.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock db to avoid real DB calls (LojaPage is now async and queries DB)
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn().mockResolvedValue([]),
    })),
  },
}))

// Dynamic import after mock setup
const getLojaPage = async () => {
  const mod = await import('@/app/(public)/loja/page')
  return mod.default
}

describe('LojaPage', () => {
  it('renders the Em Breve badge', async () => {
    const LojaPage = await getLojaPage()
    const element = await LojaPage()
    render(element)
    expect(screen.getByTestId('store-em-breve-badge')).toBeInTheDocument()
  })

  it('renders all 3 store category cards', async () => {
    const LojaPage = await getLojaPage()
    const element = await LojaPage()
    render(element)
    expect(screen.getByTestId('store-category-cosmeticos')).toBeInTheDocument()
    expect(screen.getByTestId('store-category-ranks-vip')).toBeInTheDocument()
    expect(screen.getByTestId('store-category-itens-servidor')).toBeInTheDocument()
  })

  it('renders the Discord CTA', async () => {
    const LojaPage = await getLojaPage()
    const element = await LojaPage()
    render(element)
    const discordCta = screen.getByTestId('store-discord-cta')
    expect(discordCta).toHaveAttribute('href', expect.stringContaining('discord.gg'))
  })
})
