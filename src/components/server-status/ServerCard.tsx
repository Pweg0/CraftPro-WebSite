// src/components/server-status/ServerCard.tsx
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { CopyIPButton } from './CopyIPButton';
import type { Server, ServerStatus } from '@/types';

interface ServerCardProps {
  server: Server;
  status: ServerStatus;
}

function isValidImageSrc(src: string | null | undefined): src is string {
  if (!src) return false;
  return src.startsWith('/') || src.startsWith('http://') || src.startsWith('https://');
}

export function ServerCard({ server, status }: ServerCardProps) {
  const hasBanner = isValidImageSrc(server.bannerPath);

  return (
    <div
      data-testid={`server-card-${server.id}`}
      className={[
        'card-glow rounded-2xl border bg-brand-card/60 backdrop-blur-sm overflow-hidden transition-all duration-400',
        status.online
          ? 'border-brand-online/20 shadow-[0_0_30px_rgba(0,255,135,0.08)]'
          : 'border-white/[0.06] opacity-60',
      ].join(' ')}
    >
      {/* Server banner */}
      <div className="relative h-44 bg-brand-surface overflow-hidden">
        {hasBanner ? (
          <Image
            src={server.bannerPath!}
            alt={`Banner do servidor ${server.name}`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            unoptimized={server.bannerPath!.startsWith('http')}
          />
        ) : (
          <div className="flex h-full items-center justify-center grid-bg">
            <span className="font-display text-xs text-white/20">{server.name}</span>
          </div>
        )}
        {/* Gradient overlay on banner */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-card/80 to-transparent" />

        {/* Status badge overlaid on banner */}
        <div className="absolute top-3 right-3">
          <Badge
            data-testid={`server-status-${server.id}`}
            className={
              status.online
                ? 'bg-brand-online/20 text-brand-online border-brand-online/30 backdrop-blur-sm shadow-[0_0_12px_rgba(0,255,135,0.2)]'
                : 'bg-white/10 text-white/50 border-white/10 backdrop-blur-sm'
            }
            variant="outline"
          >
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status.online ? 'bg-brand-online animate-pulse' : 'bg-white/40'}`} />
            {status.online ? 'Online' : 'Offline'}
          </Badge>
        </div>
      </div>

      {/* Card content */}
      <div className="p-6 space-y-4">
        <h3 className="font-display text-xs text-white tracking-wide">{server.name}</h3>
        <p className="text-sm text-white/60 leading-relaxed">{server.description}</p>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/[0.06]">
          <span
            data-testid={`player-count-${server.id}`}
            className="text-xs text-white/55"
          >
            {status.online
              ? `${status.playersOnline} / ${status.playersMax} jogadores`
              : 'Servidor offline'}
          </span>
          <CopyIPButton ip={server.ip} />
        </div>
      </div>
    </div>
  );
}
