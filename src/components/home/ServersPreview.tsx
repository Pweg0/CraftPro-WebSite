// src/components/home/ServersPreview.tsx
'use client';
import { motion } from 'motion/react';
import Link from 'next/link';
import { Server, ArrowRight, Wifi } from 'lucide-react';

export function ServersPreview() {
  return (
    <section id="servidores-section" className="relative py-24 px-4 bg-brand-surface/50 overflow-hidden">
      {/* Grid pattern */}
      <div className="absolute inset-0 grid-bg-accent" />

      {/* Glow effects */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-brand-blue/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-brand-accent/5 blur-3xl pointer-events-none" />

      <div className="container mx-auto relative z-10">
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
        >
          {/* Content card */}
          <div className="relative bg-brand-card/60 backdrop-blur-sm border border-white/[0.08] rounded-3xl p-10 md:p-14 text-center overflow-hidden">
            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-brand-accent/20 rounded-tl-3xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-brand-blue/20 rounded-br-3xl" />

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 mb-6"
            >
              <Server className="w-7 h-7 text-brand-accent" />
            </motion.div>

            <h2 className="font-display text-xl sm:text-2xl text-white mb-4">
              Nossos Servidores
            </h2>
            <p className="text-white/50 text-sm leading-relaxed max-w-md mx-auto mb-8">
              Varios servidores dedicados rodando 24/7 com baixa latencia. Confira o status ao vivo e entre agora.
            </p>

            {/* Status indicators */}
            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="flex items-center gap-2 text-brand-online text-xs">
                <Wifi className="w-3.5 h-3.5" />
                <span>Servidores Ativos</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-center gap-2 text-brand-blue text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
                <span>Status em tempo real</span>
              </div>
            </div>

            <Link
              href="/servidores"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-semibold text-white text-sm
                bg-gradient-to-r from-brand-accent to-[#ff6b8a]
                shadow-[0_0_25px_rgba(255,45,85,0.25)]
                hover:shadow-[0_0_40px_rgba(255,45,85,0.4)]
                transition-all duration-300 hover:scale-105 active:scale-[0.98]"
            >
              Ver Servidores
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
