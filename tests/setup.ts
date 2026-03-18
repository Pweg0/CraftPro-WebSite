// tests/setup.ts
import '@testing-library/jest-dom';
import React from 'react';

// Mock navigator.clipboard for SERV-03 copy IP tests
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

// Mock next/image to avoid Next.js image optimization in test env
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => {
    return React.createElement('img', { src, alt, ...props });
  },
}));

// Mock next-auth/react — prevents real OAuth calls in tests
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}))
