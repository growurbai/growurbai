import { HeroSection } from "@/components/landing/HeroSection";
import { TrustedBrandsMarquee } from "@/components/landing/TrustedBrandsMarquee";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { BeforeAfterSection } from "@/components/landing/BeforeAfterSection";
import { VideoShowcaseSection } from "@/components/landing/VideoShowcaseSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-midnight">
      <SiteNavbar />
      <main>
        <HeroSection />
        <TrustedBrandsMarquee />
        <FeaturesSection />
        <BeforeAfterSection />
        <VideoShowcaseSection />
        <PricingSection />
        <TestimonialsSection />
      </main>
      <SiteFooter />
    </div>
  );
}
