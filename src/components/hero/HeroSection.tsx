// src/components/hero/HeroSection.tsx
'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import Image from 'next/image';
import { HeroCTAButtons } from './HeroCTAButtons';
import {
  PokeballIcon,
  DiamondIcon,
  PixelSwordIcon,
  GrassBlockIcon,
  CreeperFaceIcon,
  PixelHeartIcon,
  MegaStarIcon,
  EnderPearlIcon,
} from '@/components/ui/themed-icons';

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
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/60 to-[#0a0e1a]/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e1a]/40 via-transparent to-[#0a0e1a]/40" />

      {/* Animated accent gradient at bottom — double color */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#ff2d55]/10 via-[#4ee8e8]/5 to-transparent" />

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 grid-bg opacity-30" />

      {/* === FLOATING THEMED ELEMENTS === */}

      {/* Pokeball — top left */}
      <motion.div
        className="absolute top-[15%] left-[8%] opacity-20 hidden sm:block"
        animate={{ y: [0, -12, 0], rotate: [-12, 12, -12] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <PokeballIcon size={48} className="text-brand-accent drop-shadow-[0_0_12px_rgba(255,45,85,0.4)]" />
      </motion.div>

      {/* Diamond — top right */}
      <motion.div
        className="absolute top-[20%] right-[10%] opacity-25 hidden sm:block"
        animate={{ y: [0, -10, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      >
        <DiamondIcon size={40} className="drop-shadow-[0_0_10px_rgba(78,232,232,0.5)]" />
      </motion.div>

      {/* Pixel Sword — left middle */}
      <motion.div
        className="absolute top-[40%] left-[5%] opacity-15 hidden lg:block"
        animate={{ y: [0, -8, 0], rotate: [-5, 5, -5] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      >
        <PixelSwordIcon size={56} className="drop-shadow-[0_0_8px_rgba(78,232,232,0.3)]" />
      </motion.div>

      {/* Creeper — right middle */}
      <motion.div
        className="absolute top-[35%] right-[6%] opacity-15 hidden lg:block"
        animate={{ y: [0, -6, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      >
        <CreeperFaceIcon size={44} className="drop-shadow-[0_0_12px_rgba(76,175,80,0.4)]" />
      </motion.div>

      {/* Pixel Hearts — bottom left */}
      <motion.div
        className="absolute bottom-[25%] left-[12%] opacity-20 hidden md:block"
        animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
      >
        <PixelHeartIcon size={32} />
      </motion.div>

      {/* Grass Block — bottom right */}
      <motion.div
        className="absolute bottom-[30%] right-[12%] opacity-15 hidden md:block"
        animate={{ y: [0, -6, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
      >
        <GrassBlockIcon size={36} className="drop-shadow-[0_0_8px_rgba(91,135,49,0.3)]" />
      </motion.div>

      {/* Mega Star — top center-left */}
      <motion.div
        className="absolute top-[12%] left-[30%] opacity-20 hidden lg:block"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        <MegaStarIcon size={28} className="drop-shadow-[0_0_10px_rgba(255,214,10,0.4)]" />
      </motion.div>

      {/* Ender Pearl — bottom center-right */}
      <motion.div
        className="absolute bottom-[20%] right-[25%] opacity-15 hidden lg:block"
        animate={{ y: [0, -15, 0], scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      >
        <EnderPearlIcon size={32} className="drop-shadow-[0_0_12px_rgba(0,255,135,0.3)]" />
      </motion.div>

      {/* Ambient glow orbs — themed colors */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-brand-accent/5 blur-3xl"
        animate={{ scale: [1, 1.2, 1], x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 left-1/3 w-48 h-48 rounded-full bg-mc-diamond/5 blur-3xl"
        animate={{ scale: [1.1, 0.9, 1.1], y: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full bg-mc-emerald/5 blur-3xl"
        animate={{ scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
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

        {/* Title */}
        <motion.h1
          className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-5 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
        >
          <span className="text-gradient-neon">CraftPro</span>{' '}
          <span className="text-white">Brasil</span>
        </motion.h1>

        {/* Subtitle with themed gradient */}
        <motion.p
          className="text-lg sm:text-xl md:text-2xl text-white/80 font-body max-w-2xl mx-auto mb-3 font-light tracking-wide"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        >
          Pokemon, Tech & Magia no{' '}
          <span className="text-gradient-minecraft font-medium">Minecraft</span>
        </motion.p>

        {/* Description — improved contrast */}
        <motion.p
          className="text-sm sm:text-base text-white/60 font-body max-w-xl mx-auto font-light leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: 'easeOut' }}
        >
          Dois servidores unicos — <strong className="text-mc-diamond font-medium">All The Mods</strong> com
          magia, tech e RPG, e <strong className="text-brand-accent font-medium">All The Mons</strong> com
          tudo isso + Pokemon. Batalhas competitivas, ranking e muito mais.
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
          aria-hidden="true"
        >
          <motion.div
            className="w-5 h-8 rounded-full border-2 border-white/30 flex justify-center pt-1.5"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.div className="w-1 h-2 rounded-full bg-white/50" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
