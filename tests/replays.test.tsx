// tests/replays.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ReplaysPage from '@/app/(public)/replays/page';

describe('ReplaysPage', () => {
  it('renders without errors', () => {
    render(<ReplaysPage />);
    expect(screen.getByTestId('replays-em-breve-badge')).toBeInTheDocument();
  });

  it('renders the Discord CTA', () => {
    render(<ReplaysPage />);
    const discordCta = screen.getByTestId('replays-discord-cta');
    expect(discordCta).toHaveAttribute('href', expect.stringContaining('discord.gg'));
  });

  it('renders the page heading', () => {
    render(<ReplaysPage />);
    expect(screen.getByText('Replays')).toBeInTheDocument();
  });
});
