import { AgentCallout } from '@/components/agent-callout'
import { ButtonShowcase } from '@/components/button-showcase'
import { ComponentShowcase } from '@/components/component-showcase'
import { FeatureGrid } from '@/components/feature-grid'
import { Hero } from '@/components/hero'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { UnifiedCanvas } from '@/components/unified-canvas'

/**
 * Landing flow, AI-first, single-canvas. LandingSurface + BrandShowcase
 * collapsed into UnifiedCanvas — one frame, six tabs, same job done with
 * less surface area.
 *
 *   1. Hero            — what we are
 *   2. UnifiedCanvas   — six industries in one tabbed canvas, all live
 *   3. ButtonShowcase  — one component, ten worlds (close-up craft)
 *   4. FeatureGrid     — value props in plain English
 *   5. AgentCallout    — install. "Prefer to install by hand?" link inside
 */
export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <UnifiedCanvas />
        <ButtonShowcase />
        <ComponentShowcase />
        <FeatureGrid />
        <AgentCallout />
      </main>
      <SiteFooter />
    </>
  )
}
