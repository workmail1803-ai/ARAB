import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SnowEffect from "@/components/SnowEffect";
import AwardsBadges from "@/components/AwardsBadges";
import FeatureGrid from "@/components/FeatureGrid";
import TrustedBy from "@/components/TrustedBy";
import HowItWorks from "@/components/HowItWorks";
import AppShowcase from "@/components/AppShowcase";
import DispatchPlatform from "@/components/DispatchPlatform";
import AppBenefits from "@/components/AppBenefits";
import Pricing from "@/components/Pricing";
import InteractiveMap from "@/components/InteractiveMap";
import CTABanner from "@/components/CTABanner";
import Reviews from "@/components/Reviews";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen relative">
      <SnowEffect />
      <TopBar />
      <Navbar />
      <Hero />
      <AwardsBadges />
      <FeatureGrid />
      <TrustedBy />
      <HowItWorks />
      <AppShowcase />
      <DispatchPlatform />
      <AppBenefits />
      <Pricing />
      <InteractiveMap />
      <CTABanner />
      <Reviews />
      <Footer />
    </main>
  );
}
