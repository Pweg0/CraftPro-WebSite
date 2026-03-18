// tests/navbar.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Navbar } from '@/components/layout/Navbar';

// Mock next/link for testing
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock next-auth/react — AvatarDropdown (now in Navbar) calls useSession
vi.mock('next-auth/react', () => ({
  useSession: vi.fn().mockReturnValue({ data: null, status: 'unauthenticated' }),
  signIn: vi.fn(),
  signOut: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('Navbar', () => {
  it('renders all 6 navigation links', () => {
    render(<Navbar />);
    expect(screen.getAllByText('Início').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Servidores').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ranking').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Loja').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Itens Banidos').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Replays').length).toBeGreaterThan(0);
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
