// tests/hero.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HeroCTAButtons } from '@/components/hero/HeroCTAButtons';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: { success: vi.fn() },
}));

// Mock motion/react to avoid scroll API in jsdom
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
      <div {...props}>{children}</div>
    ),
  },
  useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
  useTransform: () => '0%',
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

describe('HeroCTAButtons', () => {
  it('renders all 4 CTA buttons', () => {
    render(<HeroCTAButtons />);
    expect(screen.getByTestId('cta-jogar-agora')).toBeInTheDocument();
    expect(screen.getByTestId('cta-discord')).toBeInTheDocument();
    expect(screen.getByTestId('cta-ver-servidores')).toBeInTheDocument();
    expect(screen.getByTestId('cta-loja')).toBeInTheDocument();
  });

  it('Discord CTA points to discord.gg', () => {
    render(<HeroCTAButtons />);
    const discordLink = screen.getByTestId('cta-discord');
    expect(discordLink).toHaveAttribute('href', expect.stringContaining('discord.gg'));
  });

  it('Loja CTA links to /loja', () => {
    render(<HeroCTAButtons />);
    const lojaLink = screen.getByTestId('cta-loja');
    expect(lojaLink).toHaveAttribute('href', '/loja');
  });

  it('Jogar Agora button calls navigator.clipboard.writeText on click', async () => {
    render(<HeroCTAButtons />);
    const jogarButton = screen.getByTestId('cta-jogar-agora');
    fireEvent.click(jogarButton);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('craftprobrasil.com')
    );
  });
});
