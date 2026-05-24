import { AgentCallout } from '@/components/agent-callout'
import { BrandShowcase } from '@/components/brand-showcase'
import { ButtonShowcase } from '@/components/button-showcase'
import { FeatureGrid } from '@/components/feature-grid'
import { Hero } from '@/components/hero'
import { InstallSection } from '@/components/install-section'
import { LandingSurface } from '@/components/landing-surface'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

/**
 * Landing flow, ordered around the "be yourself" thesis:
 *   1. Hero            — what we are
 *   2. LandingSurface  — proof it composes (one big live surface)
 *   3. BrandShowcase   — proof it's yours (six industries)
 *   4. ButtonShowcase  — proof we sweat detail (one component, ten worlds)
 *   5. FeatureGrid     — value props in plain English
 *   6. InstallSection  — get started
 *   7. AgentCallout    — and your AI editor knows it
 */
export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <LandingSurface />
        <BrandShowcase />
        <ButtonShowcase />
        <FeatureGrid />
        <InstallSection />
        <AgentCallout />
      </main>
      <SiteFooter />
    </>
  )
}
