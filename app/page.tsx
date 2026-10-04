import {
  FeatureGrid,
  GetStarted,
  Pricing,
  SiteFooter,
} from "@/components/landing/sections";
import { Hero } from "@/components/landing/hero";
import { Showcase } from "@/components/landing/showcase";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-dead-950">
      <main className="flex flex-1 flex-col">
        <Hero />
        <Showcase />
        <FeatureGrid />
        <GetStarted />
        <Pricing />
      </main>
      <SiteFooter />
    </div>
  );
}