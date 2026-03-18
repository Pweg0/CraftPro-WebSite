// tests/navbar.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Navbar } from '@/components/layout/Navbar';

// Mock next/link for testing
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('Navbar', () => {
  it('renders all 7 navigation links', () => {
    render(<Navbar />);
    expect(screen.getAllByText('Início').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Servidores').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ranking').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Loja').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Itens Banidos').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Replays').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Perfil').length).toBeGreaterThan(0);
  });

  it('renders the CraftPro Brasil logo link', () => {
    render(<Navbar />);
    const logo = screen.getByText('CraftPro Brasil');
    expect(logo.closest('a')).toHaveAttribute('href', '/');
  });

  it('renders hamburger menu button for mobile', () => {
    render(<Navbar />);
    const hamburger = screen.getByRole('button', { name: /abrir menu/i });
    expect(hamburger).toBeInTheDocument();
  });
});
