// src/components/server-status/ServerCard.tsx
// Server Component — receives pre-fetched status as props
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { CopyIPButton } from './CopyIPButton';
import type { Server, ServerStatus } from '@/types';

interface ServerCardProps {
  server: Server;
  status: ServerStatus;
}

export function ServerCard({ server, status }: ServerCardProps) {
  return (
    <div
      data-testid={`server-card-${server.id}`}
      className={[
        'rounded-card border-2 bg-brand-card overflow-hidden transition-all duration-300',
        status.online
          ? 'border-brand-online shadow-[0_0_20px_rgba(0,255,135,0.3)]'
          : 'border-brand-offline opacity-70',
      ].join(' ')}
    >
      {/* Server banner */}
      <div className="relative h-40 bg-brand-surface">
        {server.bannerPath ? (
          <Image
            src={server.bannerPath}
            alt={`Banner do servidor ${server.name}`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-display text-xs text-white/30">{server.name}</span>
          </div>
        )}
      </div>

      {/* Card content */}
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-xs text-white">{server.name}</h3>
          <Badge
            data-testid={`server-status-${server.id}`}
            className={
              status.online
                ? 'bg-brand-online/20 text-brand-online border-brand-online/50'
                : 'bg-brand-offline/20 text-brand-offline border-brand-offline/50'
            }
            variant="outline"
          >
            {status.online ? 'Online' : 'Offline'}
          </Badge>
        </div>

        <p className="text-sm text-white/60 leading-relaxed">{server.description}</p>

        <div className="flex items-center justify-between gap-2">
          {/* Player count */}
          <span
            data-testid={`player-count-${server.id}`}
            className="text-xs text-white/50"
          >
            {status.online
              ? `${status.playersOnline} / ${status.playersMax} jogadores`
              : 'Servidor offline'}
          </span>

          {/* Copy IP */}
          <CopyIPButton ip={server.ip} />
        </div>
      </div>
    </div>
  );
}
