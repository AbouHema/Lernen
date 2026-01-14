import { LandingFeatures } from "@/components/landing-features";
import { LandingHero } from "@/components/landing-hero";
import { LandingScreens } from "@/components/landing-screens";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TrustStrip } from "@/components/trust-strip";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <SiteHeader />
      <main>
        <LandingHero />
        <TrustStrip />
        <LandingFeatures />
        <LandingScreens />
      </main>
      <SiteFooter />
    </div>
  );
}
