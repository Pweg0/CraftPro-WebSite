// src/components/server-status/CopyIPButton.tsx
// Client Component — clipboard API is browser-only
'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

interface CopyIPButtonProps {
  ip: string;
}

export function CopyIPButton({ ip }: CopyIPButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(ip);
    setCopied(true);
    toast.success('IP copiado!', { description: ip });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      onClick={handleCopy}
      variant="outline"
      size="sm"
      data-testid="copy-ip-button"
      className="border-white/30 text-white hover:bg-white/10 gap-2 font-mono text-xs"
    >
      {copied ? <Check className="h-3 w-3 text-brand-online" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copiado!' : ip}
    </Button>
  );
}
