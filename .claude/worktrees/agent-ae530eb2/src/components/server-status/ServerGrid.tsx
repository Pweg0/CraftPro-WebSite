// src/components/server-status/ServerGrid.tsx
// Server Component — receives servers + statuses as props from the page
import { ServerCard } from './ServerCard';
import type { Server, ServerStatus } from '@/types';

interface ServerGridProps {
  servers: Server[];
  statuses: ServerStatus[];
}

export function ServerGrid({ servers, statuses }: ServerGridProps) {
  if (servers.length === 0) {
    return (
      <div className="text-center py-16 text-white/50">
        Nenhum servidor configurado.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {servers.map((server, index) => (
        <ServerCard
          key={server.id}
          server={server}
          status={statuses[index]}
        />
      ))}
    </div>
  );
}
