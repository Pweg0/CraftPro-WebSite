// src/components/hero/HeroCTAButtons.tsx
'use client';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Copy, Check, ExternalLink, ChevronDown, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

// Main server IP — the primary IP players type to connect to CraftPro Brasil
// TODO: Replace with real network IP/domain before launch
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

  const handleScrollToServers = () => {
    document.getElementById('servidores-section')?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  return (
    <div
      data-testid="hero-cta-buttons"
      className="flex flex-wrap justify-center gap-3 mt-8"
    >
      {/* CTA 1: Jogar Agora — copies server IP */}
      <Button
        onClick={handleCopyIP}
        size="lg"
        data-testid="cta-jogar-agora"
        className="bg-brand-accent hover:bg-brand-accent/80 text-white font-semibold gap-2 shadow-lg shadow-brand-accent/30"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? 'Copiado!' : 'Jogar Agora'}
      </Button>

      {/* CTA 2: Discord — external link */}
      <a
        href="https://discord.gg/craftprobrasil"
        target="_blank"
        rel="noopener noreferrer"
        data-testid="cta-discord"
      >
        <Button
          size="lg"
          variant="outline"
          className="border-[#5865F2] text-[#5865F2] hover:bg-[#5865F2] hover:text-white gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          Discord
        </Button>
      </a>

      {/* CTA 3: Ver Servidores — smooth scroll */}
      <Button
        onClick={handleScrollToServers}
        size="lg"
        variant="outline"
        data-testid="cta-ver-servidores"
        className="border-white/30 text-white hover:bg-white/10 gap-2"
      >
        <ChevronDown className="h-4 w-4" />
        Ver Servidores
      </Button>

      {/* CTA 4: Loja — link to /loja page */}
      <Link href="/loja" data-testid="cta-loja">
        <Button
          size="lg"
          variant="outline"
          className="border-brand-yellow text-brand-yellow hover:bg-brand-yellow hover:text-brand-primary gap-2"
        >
          <ShoppingBag className="h-4 w-4" />
          Loja
        </Button>
      </Link>
    </div>
  );
}
