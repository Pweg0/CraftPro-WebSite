// src/app/(public)/page.tsx
import { HeroSection } from '@/components/hero/HeroSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { CommunitySection } from '@/components/home/CommunitySection';
import { ServersPreview } from '@/components/home/ServersPreview';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <ServersPreview />
      <CommunitySection />
    </>
  );
}
