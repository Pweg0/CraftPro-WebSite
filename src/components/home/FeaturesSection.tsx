// src/components/home/FeaturesSection.tsx
'use client';
import { motion } from 'motion/react';
import { Trophy, Shield, Users } from 'lucide-react';
import {
  PokeballIcon,
  DiamondIcon,
  PixelSwordIcon,
  RedstoneIcon,
  MegaStarIcon,
  GrassBlockIcon,
} from '@/components/ui/themed-icons';
import type { ComponentType, ReactNode } from 'react';

interface FeatureConfig {
  icon: ReactNode;
  title: string;
  description: string;
  color: string;
  glowColor: string;
  borderHover: string;
  bgAccent: string;
}

const features: FeatureConfig[] = [
  {
    icon: <PokeballIcon size={22} className="text-brand-accent" />,
    title: 'Batalhas Pokemon',
    description: 'Sistema competitivo com ELO, divisoes de Bronze a Master e leaderboards em tempo real.',
    color: 'text-brand-accent',
    glowColor: 'group-hover:shadow-[0_0_40px_rgba(255,45,85,0.15)]',
    borderHover: 'group-hover:border-brand-accent/40',
    bgAccent: 'bg-brand-accent/10',
  },
  {
    icon: <MegaStarIcon size={22} />,
    title: 'Ranking Global',
    description: 'Escale de Bronze a Master. Cada vitoria conta para sua classificacao global.',
    color: 'text-brand-yellow',
    glowColor: 'group-hover:shadow-[0_0_40px_rgba(255,214,10,0.15)]',
    borderHover: 'group-hover:border-brand-yellow/40',
    bgAccent: 'bg-brand-yellow/10',
  },
  {
    icon: <PixelSwordIcon size={22} />,
    title: 'Replays ao Vivo',
    description: 'Reviva cada batalha com nosso sistema de replay integrado. Analise e aprenda.',
    color: 'text-brand-blue',
    glowColor: 'group-hover:shadow-[0_0_40px_rgba(0,212,255,0.15)]',
    borderHover: 'group-hover:border-brand-blue/40',
    bgAccent: 'bg-brand-blue/10',
  },
  {
    icon: <RedstoneIcon size={22} />,
    title: 'Anti-Cheat Robusto',
    description: 'Itens banidos monitorados e sistema de fair-play para competicao justa.',
    color: 'text-brand-purple',
    glowColor: 'group-hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]',
    borderHover: 'group-hover:border-brand-purple/40',
    bgAccent: 'bg-brand-purple/10',
  },
  {
    icon: <Users className="w-5 h-5 text-[#5865F2]" />,
    title: 'Comunidade Ativa',
    description: 'Discord vibrante com eventos semanais, torneios e suporte em portugues.',
    color: 'text-[#5865F2]',
    glowColor: 'group-hover:shadow-[0_0_40px_rgba(88,101,242,0.15)]',
    borderHover: 'group-hover:border-[#5865F2]/40',
    bgAccent: 'bg-[#5865F2]/10',
  },
  {
    icon: <DiamondIcon size={22} />,
    title: 'Loja Exclusiva',
    description: 'Cosmeticos, ranks VIP e itens especiais. Apoie o servidor e desbloqueie vantagens.',
    color: 'text-mc-diamond',
    glowColor: 'group-hover:shadow-[0_0_40px_rgba(78,232,232,0.15)]',
    borderHover: 'group-hover:border-mc-diamond/40',
    bgAccent: 'bg-mc-diamond/10',
  },
];

export function FeaturesSection() {
  return (
    <section className="relative py-24 px-4 bg-brand-primary grid-bg overflow-hidden">
      {/* Top gradient blend from hero */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#0a0e1a] to-transparent z-10" />

      {/* Accent orbs — dual themed */}
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-brand-accent/3 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-mc-diamond/3 blur-3xl pointer-events-none" />

      {/* Floating decorative elements */}
      <motion.div
        className="absolute top-20 right-[15%] opacity-10 hidden lg:block"
        animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      >
        <GrassBlockIcon size={32} />
      </motion.div>
      <motion.div
        className="absolute bottom-20 left-[10%] opacity-10 hidden lg:block"
        animate={{ y: [0, -8, 0], rotate: [-8, 8, -8] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <PokeballIcon size={28} className="text-brand-accent" />
      </motion.div>

      <div className="container mx-auto relative z-10">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-brand-accent text-xs font-semibold tracking-[0.2em] uppercase mb-3 block">
            Por que jogar aqui
          </span>
          <h2 className="font-display text-xl sm:text-2xl text-white mb-4">
            O Melhor de{' '}
            <span className="text-gradient-minecraft">Minecraft</span>
            {' + '}
            <span className="text-gradient-pokemon">Pokemon</span>
          </h2>
          <p className="text-white/60 max-w-lg mx-auto text-sm leading-relaxed">
            Tudo que voce precisa para a experiencia definitiva de Minecraft com Pokemon, em um so lugar.
          </p>
        </motion.div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className={`group relative bg-brand-surface/60 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-7 transition-all duration-500 ${feature.glowColor} ${feature.borderHover}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.bgAccent} mb-5 transition-transform duration-300 group-hover:scale-110`}
              >
                {feature.icon}
              </div>
              <h3 className="text-white font-semibold text-base mb-2">{feature.title}</h3>
              <p className="text-white/55 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
