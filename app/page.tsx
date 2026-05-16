import { HeroSection } from "@/components/landing/HeroSection";
import { TrustedBrandsMarquee } from "@/components/landing/TrustedBrandsMarquee";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { BeforeAfterSection } from "@/components/landing/BeforeAfterSection";
import { VideoShowcaseSection } from "@/components/landing/VideoShowcaseSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { LandingFaqSection } from "@/components/landing/LandingFaqSection";
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
        <HowItWorksSection />
        <BeforeAfterSection />
        <VideoShowcaseSection />
        <PricingSection />
        <TestimonialsSection />
        <LandingFaqSection />
      </main>
      <SiteFooter />
    </div>
  );
}
