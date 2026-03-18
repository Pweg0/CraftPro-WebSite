// tests/copy-ip.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CopyIPButton } from '@/components/server-status/CopyIPButton';

vi.mock('sonner', () => ({
  toast: { success: vi.fn() },
}));

describe('CopyIPButton', () => {
  beforeEach(() => {
    vi.mocked(navigator.clipboard.writeText).mockResolvedValue(undefined);
  });

  it('renders the IP address', () => {
    render(<CopyIPButton ip="pokebrawl.craftprobrasil.com" />);
    expect(screen.getByText('pokebrawl.craftprobrasil.com')).toBeInTheDocument();
  });

  it('calls navigator.clipboard.writeText with the correct IP on click', async () => {
    render(<CopyIPButton ip="pokebrawl.craftprobrasil.com" />);
    const button = screen.getByTestId('copy-ip-button');
    fireEvent.click(button);
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('pokebrawl.craftprobrasil.com');
    });
  });

  it('shows "Copiado!" text after click', async () => {
    render(<CopyIPButton ip="pokebrawl.craftprobrasil.com" />);
    const button = screen.getByTestId('copy-ip-button');
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText('Copiado!')).toBeInTheDocument();
    });
  });
});
