// src/app/(public)/login/page.tsx
import { auth, signIn } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Image from 'next/image';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;

  if (session?.user) {
    redirect(params.callbackUrl ?? '/');
  }

  return (
    <div className="min-h-screen bg-brand-primary flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-background.webp"
          alt=""
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/85 to-[#0a0e1a]/70" />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 grid-bg" />

      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-brand-accent/5 blur-3xl pointer-events-none" />

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-brand-surface/60 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-9 shadow-2xl">
          {/* Decorative corner accents */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-brand-accent/20 rounded-tl-3xl" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-brand-accent/20 rounded-br-3xl" />

          {/* Logo */}
          <div className="text-center mb-9">
            <h1 className="font-display text-2xl mb-2">
              <span className="text-gradient-neon">CraftPro</span>{' '}
              <span className="text-white/80">Brasil</span>
            </h1>
            <p className="text-white/35 text-sm">
              Pokemon, Tech & Magia no Minecraft
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-white/[0.06] mb-9" />

          {/* Discord login */}
          <form
            action={async () => {
              'use server';
              await signIn('discord', {
                redirectTo: params.callbackUrl ?? '/',
              });
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold py-3.5 px-6 rounded-xl
                transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                shadow-[0_0_25px_rgba(88,101,242,0.25)] hover:shadow-[0_0_40px_rgba(88,101,242,0.4)]"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
              Entrar com Discord
            </button>
          </form>

          {/* Info */}
          <p className="text-white/25 text-xs text-center mt-7">
            Ao entrar, voce podera acessar seu perfil, rankings e batalhas.
          </p>
        </div>
      </div>
    </div>
  );
}
