// src/components/home/FeaturesSection.tsx
'use client';
import { motion } from 'motion/react';
import { Swords, Trophy, Shield, Zap, Users, Gamepad2 } from 'lucide-react';

const features = [
  {
    icon: Swords,
    title: 'Batalhas Pokemon',
    description: 'Sistema competitivo de batalhas com ELO, divisoes e leaderboards em tempo real.',
    color: 'text-brand-accent',
    glow: 'group-hover:shadow-[0_0_40px_rgba(255,45,85,0.15)]',
    borderHover: 'group-hover:border-brand-accent/40',
  },
  {
    icon: Trophy,
    title: 'Ranking Global',
    description: 'Escale de Bronze a Master. Cada vitoria conta para sua classificacao global.',
    color: 'text-brand-yellow',
    glow: 'group-hover:shadow-[0_0_40px_rgba(255,214,10,0.15)]',
    borderHover: 'group-hover:border-brand-yellow/40',
  },
  {
    icon: Gamepad2,
    title: 'Replays ao Vivo',
    description: 'Reviva cada batalha com nosso sistema de replay integrado. Analise e aprenda.',
    color: 'text-brand-blue',
    glow: 'group-hover:shadow-[0_0_40px_rgba(0,212,255,0.15)]',
    borderHover: 'group-hover:border-brand-blue/40',
  },
  {
    icon: Shield,
    title: 'Anti-Cheat Robusto',
    description: 'Itens banidos monitorados e sistema de fair-play para competicao justa.',
    color: 'text-brand-purple',
    glow: 'group-hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]',
    borderHover: 'group-hover:border-brand-purple/40',
  },
  {
    icon: Users,
    title: 'Comunidade Ativa',
    description: 'Discord vibrante com eventos semanais, torneios e suporte em portugues.',
    color: 'text-[#5865F2]',
    glow: 'group-hover:shadow-[0_0_40px_rgba(88,101,242,0.15)]',
    borderHover: 'group-hover:border-[#5865F2]/40',
  },
  {
    icon: Zap,
    title: 'Loja Exclusiva',
    description: 'Cosmeticos, ranks VIP e itens especiais. Apoie o servidor e desbloqueie vantagens.',
    color: 'text-brand-online',
    glow: 'group-hover:shadow-[0_0_40px_rgba(0,255,135,0.15)]',
    borderHover: 'group-hover:border-brand-online/40',
  },
];

export function FeaturesSection() {
  return (
    <section className="relative py-24 px-4 bg-brand-primary grid-bg overflow-hidden">
      {/* Top gradient blend from hero */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#0a0e1a] to-transparent z-10" />

      {/* Accent orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-accent/3 blur-3xl pointer-events-none" />

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
            O Melhor do Pokemon
          </h2>
          <p className="text-white/50 max-w-lg mx-auto text-sm leading-relaxed">
            Tudo que voce precisa para batalhas competitivas de Pokemon no Minecraft, em um so lugar.
          </p>
        </motion.div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                className={`group relative bg-brand-surface/60 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-7 transition-all duration-500 ${feature.glow} ${feature.borderHover}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white/5 mb-5 ${feature.color} transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-white font-semibold text-base mb-2">{feature.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
