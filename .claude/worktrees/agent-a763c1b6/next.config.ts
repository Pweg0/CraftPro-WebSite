// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'mc-heads.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'crafatar.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
