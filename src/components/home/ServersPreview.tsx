// src/components/home/ServersPreview.tsx
'use client';
import { motion } from 'motion/react';
import Link from 'next/link';
import { ArrowRight, Wifi } from 'lucide-react';
import {
  PickaxeIcon,
  PokeballIcon,
  DiamondIcon,
  GrassBlockIcon,
  CreeperFaceIcon,
  EnderPearlIcon,
} from '@/components/ui/themed-icons';

const servers = [
  {
    name: 'All The Mods',
    tagline: 'Magia, Tech, Aventura & RPG',
    description:
      'O modpack definitivo que junta os melhores mods de Minecraft — magia, tecnologia, aventura e RPG em um unico servidor.',
    icon: <PickaxeIcon size={28} />,
    floatingIcon: <DiamondIcon size={24} />,
    floatingIcon2: <CreeperFaceIcon size={20} />,
    borderColor: 'border-mc-diamond/20 hover:border-mc-diamond/40',
    glowColor: 'hover:shadow-[0_0_40px_rgba(78,232,232,0.1)]',
    badgeColor: 'bg-mc-diamond/10 text-mc-diamond border-mc-diamond/20',
    iconBg: 'bg-mc-diamond/10',
    accentGlow: 'bg-mc-diamond/5',
  },
  {
    name: 'All The Mons',
    tagline: 'Tudo + Pokemon!',
    description:
      'Tudo de All The Mods + Pokemon! Capture, treine e batalhe com seus Pokemon favoritos no mundo de Minecraft.',
    icon: <PokeballIcon size={28} className="text-brand-accent" />,
    floatingIcon: <PokeballIcon size={24} className="text-brand-accent" />,
    floatingIcon2: <GrassBlockIcon size={20} />,
    borderColor: 'border-brand-accent/20 hover:border-brand-accent/40',
    glowColor: 'hover:shadow-[0_0_40px_rgba(255,45,85,0.1)]',
    badgeColor: 'bg-brand-accent/10 text-brand-accent border-brand-accent/20',
    iconBg: 'bg-brand-accent/10',
    accentGlow: 'bg-brand-accent/5',
  },
];

export function ServersPreview() {
  return (
    <section
      id="servidores-section"
      className="relative py-24 px-4 bg-brand-surface/50 overflow-hidden"
    >
      {/* Grid pattern */}
      <div className="absolute inset-0 grid-bg-accent" />

      {/* Glow effects */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-mc-diamond/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-brand-accent/5 blur-3xl pointer-events-none" />

      <div className="container mx-auto relative z-10">
        {/* Section header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-brand-blue text-xs font-semibold tracking-[0.2em] uppercase mb-3 block">
            Servidores
          </span>
          <h2 className="font-display text-xl sm:text-2xl text-white mb-4">
            Nossos Servidores
          </h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-md mx-auto">
            Dois servidores dedicados rodando 24/7 com baixa latencia. Escolha sua aventura.
          </p>
        </motion.div>

        {/* Server cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {servers.map((server, index) => (
            <motion.div
              key={server.name}
              className={`relative bg-brand-card/60 backdrop-blur-sm border rounded-2xl p-8 transition-all duration-500 overflow-hidden ${server.borderColor} ${server.glowColor}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              {/* Floating accent icons */}
              <motion.div
                className="absolute top-4 right-4 opacity-10"
                animate={{ y: [0, -6, 0], rotate: [0, 8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              >
                {server.floatingIcon}
              </motion.div>
              <motion.div
                className="absolute bottom-6 right-8 opacity-8"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              >
                {server.floatingIcon2}
              </motion.div>

              {/* Accent glow */}
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full ${server.accentGlow} blur-3xl pointer-events-none`} />

              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${server.iconBg} mb-5`}>
                {server.icon}
              </div>

              {/* Badge */}
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium mb-4 ml-3 ${server.badgeColor}`}>
                <Wifi className="w-3 h-3" aria-hidden="true" />
                Online 24/7
              </div>

              {/* Content */}
              <h3 className="font-display text-base sm:text-lg text-white mb-1">
                {server.name}
              </h3>
              <p className="text-sm font-medium text-white/70 mb-3">{server.tagline}</p>
              <p className="text-sm text-white/50 leading-relaxed mb-6">
                {server.description}
              </p>

              {/* CTA */}
              <Link
                href="/servidores"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white transition-colors duration-200 group/link"
              >
                Ver detalhes
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/link:translate-x-1" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link
            href="/servidores"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-semibold text-white text-sm
              bg-gradient-to-r from-brand-accent to-[#ff6b8a]
              shadow-[0_0_25px_rgba(255,45,85,0.25)]
              hover:shadow-[0_0_40px_rgba(255,45,85,0.4)]
              transition-all duration-300 hover:scale-105 active:scale-[0.98]
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
          >
            Ver Todos os Servidores
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
