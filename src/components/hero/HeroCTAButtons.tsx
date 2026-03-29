// src/components/hero/HeroCTAButtons.tsx
'use client';
import Link from 'next/link';
import { toast } from 'sonner';
import { Copy, Check, ExternalLink, Server, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

const MAIN_SERVER_IP = 'play.craftprobrasil.com';

export function HeroCTAButtons() {
  const [copied, setCopied] = useState(false);

  const handleCopyIP = async () => {
    await navigator.clipboard.writeText(MAIN_SERVER_IP);
    setCopied(true);
    toast.success('IP copiado!', {
      description: MAIN_SERVER_IP,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      data-testid="hero-cta-buttons"
      className="flex flex-wrap justify-center gap-3 mt-10"
    >
      {/* CTA 1: Jogar Agora — copies server IP */}
      <button
        onClick={handleCopyIP}
        data-testid="cta-jogar-agora"
        className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-white text-sm
          bg-gradient-to-r from-brand-accent to-[#ff6b8a] hover:from-[#ff6b8a] hover:to-brand-accent
          shadow-[0_0_30px_rgba(255,45,85,0.3)] hover:shadow-[0_0_40px_rgba(255,45,85,0.5)]
          transition-all duration-300 hover:scale-105 active:scale-[0.98]
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? 'Copiado!' : 'Jogar Agora'}
      </button>

      {/* CTA 2: Discord */}
      <a
        href="https://discord.gg/FcdR6PPjg6"
        target="_blank"
        rel="noopener noreferrer"
        data-testid="cta-discord"
        className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-white text-sm
          bg-[#5865F2]/20 border border-[#5865F2]/50 hover:bg-[#5865F2] hover:border-[#5865F2]
          hover:shadow-[0_0_30px_rgba(88,101,242,0.3)]
          transition-all duration-300 hover:scale-105 active:scale-[0.98] backdrop-blur-sm
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5865F2]"
      >
        <ExternalLink className="h-4 w-4" />
        Discord
      </a>

      {/* CTA 3: Ver Servidores */}
      <Link
        href="/servidores"
        data-testid="cta-ver-servidores"
        className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-white/80 text-sm
          bg-white/5 border border-white/15 hover:bg-white/10 hover:border-white/30 hover:text-white
          transition-all duration-300 hover:scale-105 active:scale-[0.98] backdrop-blur-sm
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
      >
        <Server className="h-4 w-4" />
        Ver Servidores
      </Link>

      {/* CTA 4: Loja */}
      <Link
        href="/loja"
        data-testid="cta-loja"
        className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-brand-yellow text-sm
          bg-brand-yellow/10 border border-brand-yellow/30 hover:bg-brand-yellow hover:text-[#0a0e1a] hover:border-brand-yellow
          hover:shadow-[0_0_30px_rgba(255,214,10,0.3)]
          transition-all duration-300 hover:scale-105 active:scale-[0.98] backdrop-blur-sm
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow"
      >
        <ShoppingBag className="h-4 w-4" />
        Loja
      </Link>
    </div>
  );
}
