// src/components/hero/HeroSection.tsx
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

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], ['0px', '80px']);

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
          alt="CraftPro Brasil — Minecraft e Pokemon fusionados num servidor epico"
          fill
          priority
          sizes="100vw"
          className="object-cover"
          data-testid="hero-image"
        />
      </motion.div>

      {/* Layered gradient overlays for cinematic depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e1a]/40 via-transparent to-[#0a0e1a]/40" />

      {/* Animated accent gradient at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#ff2d55]/10 to-transparent" />

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 grid-bg opacity-30" />

      {/* Decorative geometric elements */}
      <motion.div
        className="absolute top-1/4 left-8 w-32 h-32 border border-brand-accent/20 rotate-45 rounded-lg"
        animate={{ rotate: [45, 55, 45], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/3 right-12 w-20 h-20 border border-brand-blue/20 rotate-12 rounded-full"
        animate={{ rotate: [12, -12, 12], opacity: [0.1, 0.25, 0.1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/3 left-1/4 w-16 h-16 border border-brand-purple/20 -rotate-12"
        animate={{ rotate: [-12, 12, -12], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating orbs (ambient light effects) */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-brand-accent/5 blur-3xl"
        animate={{ scale: [1, 1.2, 1], x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 left-1/3 w-48 h-48 rounded-full bg-brand-blue/5 blur-3xl"
        animate={{ scale: [1.1, 0.9, 1.1], y: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Hero content */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-accent/30 bg-brand-accent/10 text-brand-accent text-xs font-medium tracking-wider uppercase mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-online animate-pulse" />
            Servidor Online
          </span>
        </motion.div>

        {/* Title with stagger */}
        <motion.h1
          className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-5 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
        >
          <span className="text-gradient-neon">CraftPro</span>{' '}
          <span className="text-white">Brasil</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-lg sm:text-xl md:text-2xl text-white/70 font-body max-w-2xl mx-auto mb-3 font-light tracking-wide"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        >
          Pokemon, Tech & Magia no Minecraft
        </motion.p>

        {/* Description */}
        <motion.p
          className="text-sm sm:text-base text-white/40 font-body max-w-xl mx-auto font-light"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: 'easeOut' }}
        >
          O servidor Minecraft brasileiro com batalhas Pokemon competitivas, leaderboards e muito mais.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
        >
          <HeroCTAButtons />
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <motion.div
            className="w-5 h-8 rounded-full border-2 border-white/20 flex justify-center pt-1.5"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.div className="w-1 h-2 rounded-full bg-white/40" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
