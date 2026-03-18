import type { Metadata } from 'next';
import { Inter, Press_Start_2P } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Providers } from '@/lib/providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const pressStart = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-press-start',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CraftPro Brasil — Pokémon, Tech & Magia no Minecraft',
  description: 'O hub central para jogadores do CraftPro Brasil. Pokémon no Minecraft com servidores competitivos.',
  metadataBase: new URL('https://craftprobrasil.com'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${pressStart.variable}`}>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <Providers>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
