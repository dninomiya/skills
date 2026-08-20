import type { ReactNode } from "react"

import { ContainerDemo } from "@/components/showcase/demos/container-demo"
import { PlaceholderDemo } from "@/components/showcase/demos/placeholder-demo"
import { SectionDemo } from "@/components/showcase/demos/section-demo"
import { ContactForm } from "@/registry/website/blocks/contact-form/contact-form"
import { CtaBand } from "@/registry/website/blocks/cta-band/cta-band"
import { FaqAccordion } from "@/registry/website/blocks/faq-accordion/faq-accordion"
import { FeatureAlternating } from "@/registry/website/blocks/feature-alternating/feature-alternating"
import { FeatureGrid } from "@/registry/website/blocks/feature-grid/feature-grid"
import { HeroCentered } from "@/registry/website/blocks/hero-centered/hero-centered"
import { HeroSplit } from "@/registry/website/blocks/hero-split/hero-split"
import LandingPage from "@/registry/website/blocks/landing-page/page"
import { LogoCloud } from "@/registry/website/blocks/logo-cloud/logo-cloud"
import { PricingTiers } from "@/registry/website/blocks/pricing-tiers/pricing-tiers"
import { SiteFooter } from "@/registry/website/blocks/site-footer/site-footer"
import { SiteHeader } from "@/registry/website/blocks/site-header/site-header"
import { StatsBand } from "@/registry/website/blocks/stats-band/stats-band"
import { TestimonialGrid } from "@/registry/website/blocks/testimonial-grid/testimonial-grid"

/**
 * Everything the showcase can render in a preview frame.
 * Primitives render a demo; blocks render themselves.
 */
export const previews: Record<string, ReactNode> = {
  container: <ContainerDemo />,
  section: <SectionDemo />,
  placeholder: <PlaceholderDemo />,
  "site-header": <SiteHeader />,
  "hero-centered": <HeroCentered />,
  "hero-split": <HeroSplit />,
  "logo-cloud": <LogoCloud />,
  "feature-grid": <FeatureGrid />,
  "feature-alternating": <FeatureAlternating />,
  "stats-band": <StatsBand />,
  "testimonial-grid": <TestimonialGrid />,
  "pricing-tiers": <PricingTiers />,
  "faq-accordion": <FaqAccordion />,
  "cta-band": <CtaBand />,
  "contact-form": <ContactForm />,
  "site-footer": <SiteFooter />,
  "landing-page": <LandingPage />,
}

export function getPreview(name: string) {
  return previews[name]
}
