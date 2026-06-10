import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { MissionStrip } from "@/components/sections/MissionStrip";
import { StatsSection } from "@/components/sections/StatsSection";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { FeatureSpotlight } from "@/components/sections/FeatureSpotlight";
import { MapPreview } from "@/components/sections/MapPreview";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { CommunityCTA } from "@/components/sections/CommunityCTA";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EcoVerse — One Earth. One Community. Infinite Compassion.",
  description:
    "India's first unified platform for animal welfare — rescue, adopt, connect, and protect together. Join thousands of volunteers, rescuers, and animal lovers across India.",
};

export default function HomePage() {
  return (
    <main style={{ background: "transparent", minHeight: "100vh" }}>
      <Navbar />
      <HeroSection />
      <MissionStrip />
      <StatsSection />
      <HowItWorks />
      <FeatureSpotlight />
      <MapPreview />
      <TestimonialsSection />
      <CommunityCTA />
      <Footer />
    </main>
  );
}
