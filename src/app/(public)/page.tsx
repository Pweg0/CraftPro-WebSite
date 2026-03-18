// src/app/(public)/page.tsx
// Landing page — Server Component (no client state needed here)
// HeroSection is a Client Component — the 'use client' boundary is inside it
import { HeroSection } from '@/components/hero/HeroSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      {/* Placeholder anchor for "Ver Servidores" smooth scroll CTA */}
      <section id="servidores-section" className="py-16 px-4 bg-brand-primary">
        <div className="container mx-auto text-center">
          <h2 className="font-display text-xl text-white mb-4">Nossos Servidores</h2>
          <p className="text-white/60">
            Veja a página de{' '}
            <a href="/servidores" className="text-brand-accent hover:underline">
              Servidores
            </a>{' '}
            para status ao vivo e detalhes de cada server.
          </p>
        </div>
      </section>
    </>
  );
}
