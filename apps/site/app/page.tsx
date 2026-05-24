import { AgentCallout } from '@/components/agent-callout'
import { BrandShowcase } from '@/components/brand-showcase'
import { ButtonShowcase } from '@/components/button-showcase'
import { FeatureGrid } from '@/components/feature-grid'
import { Hero } from '@/components/hero'
import { LandingSurface } from '@/components/landing-surface'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

/**
 * Landing flow, AI-first. InstallSection removed — Agent Skill IS the
 * install for the audience this site serves. Manual install lives behind
 * a small link inside AgentCallout for visitors who want it.
 *
 *   1. Hero            — what we are
 *   2. LandingSurface  — proof it composes (one big live surface)
 *   3. BrandShowcase   — proof it's yours (six industries)
 *   4. ButtonShowcase  — proof we sweat detail (one component, ten worlds)
 *   5. FeatureGrid     — value props in plain English
 *   6. AgentCallout    — install. "Prefer to install by hand?" link inside
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
        <AgentCallout />
      </main>
      <SiteFooter />
    </>
  )
}
