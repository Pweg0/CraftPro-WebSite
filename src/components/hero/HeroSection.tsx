// src/components/hero/HeroSection.tsx
// Client Component — MUST have 'use client' because useScroll is a browser-only hook.
// Pitfall warning: do NOT remove 'use client' — causes SSR hydration mismatch.
'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import Image from 'next/image';
import { HeroCTAButtons } from './HeroCTAButtons';

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Parallax: background moves 30% of scroll distance (slower than foreground)
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  return (
    <section
      ref={containerRef}
      data-testid="hero-section"
      className="relative h-screen overflow-hidden"
    >
      {/* Parallax background image */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 scale-110"
      >
        <Image
          src="/images/hero-background.webp"
          alt="CraftPro Brasil — Minecraft e Pokémon fusionados num servidor épico"
          fill
          priority
          sizes="100vw"
          className="object-cover"
          data-testid="hero-image"
        />
      </motion.div>

      {/* Dark gradient overlay: bottom-to-top for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Hero content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-white mb-4 leading-tight">
            CraftPro Brasil
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/80 font-body max-w-2xl mx-auto mb-2">
            Pokémon, Tech &amp; Magia no Minecraft
          </p>
          <p className="text-sm sm:text-base text-white/60 font-body max-w-xl mx-auto">
            O servidor Minecraft brasileiro com batalhas Pokémon competitivas, leaderboards e muito mais.
          </p>
        </motion.div>

        <HeroCTAButtons />
      </div>
    </section>
  );
}
