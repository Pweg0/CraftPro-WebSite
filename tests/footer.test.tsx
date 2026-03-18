// tests/footer.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Footer } from '@/components/layout/Footer';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('Footer', () => {
  it('renders the Discord CTA link', () => {
    render(<Footer />);
    const discordLink = screen.getByTestId('footer-discord-link');
    expect(discordLink).toBeInTheDocument();
    expect(discordLink).toHaveAttribute('href', expect.stringContaining('discord'));
  });

  it('renders the brand name', () => {
    render(<Footer />);
    expect(screen.getByText('CraftPro Brasil')).toBeInTheDocument();
  });
});
