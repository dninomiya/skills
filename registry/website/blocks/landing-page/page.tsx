import { CtaBand } from "@/registry/website/blocks/cta-band/cta-band"
import { FaqAccordion } from "@/registry/website/blocks/faq-accordion/faq-accordion"
import { FeatureAlternating } from "@/registry/website/blocks/feature-alternating/feature-alternating"
import { FeatureGrid } from "@/registry/website/blocks/feature-grid/feature-grid"
import { HeroCentered } from "@/registry/website/blocks/hero-centered/hero-centered"
import { LogoCloud } from "@/registry/website/blocks/logo-cloud/logo-cloud"
import { PricingTiers } from "@/registry/website/blocks/pricing-tiers/pricing-tiers"
import { SiteFooter } from "@/registry/website/blocks/site-footer/site-footer"
import { SiteHeader } from "@/registry/website/blocks/site-header/site-header"
import { StatsBand } from "@/registry/website/blocks/stats-band/stats-band"
import { TestimonialGrid } from "@/registry/website/blocks/testimonial-grid/testimonial-grid"

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroCentered />
        <LogoCloud />
        <FeatureGrid />
        <FeatureAlternating />
        <StatsBand />
        <TestimonialGrid />
        <PricingTiers />
        <FaqAccordion />
        <CtaBand />
      </main>
      <SiteFooter />
    </div>
  )
}
