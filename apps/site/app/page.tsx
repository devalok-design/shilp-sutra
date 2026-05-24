import { AgentCallout } from '@/components/agent-callout'
import { BetaBanner } from '@/components/beta-banner'
import { BuiltWith } from '@/components/built-with'
import { ButtonShowcase } from '@/components/button-showcase'
import { ComponentShowcase } from '@/components/component-showcase'
import { DevalokBlock } from '@/components/devalok-block'
import { FeatureGrid } from '@/components/feature-grid'
import { Hero } from '@/components/hero'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { UnifiedCanvas } from '@/components/unified-canvas'

/**
 * Landing flow. Beta banner + built-with strip + Devalok block added per
 * docs/copy/shilp-sutra-copy-context.md §6 + §7 + §5.
 *
 *   0. BetaBanner       — public-beta strip, dismissable, homepage only
 *   1. Hero              — what we are
 *   2. UnifiedCanvas     — six industries in one tabbed canvas, all live
 *   3. ButtonShowcase    — one component, ten worlds (close-up craft)
 *   4. BuiltWith         — Devalok's own products carrying shilp-sutra
 *   5. ComponentShowcase — curated grid of components in context
 *   6. FeatureGrid       — three pillars + builder promise
 *   7. AgentCallout      — teaser; full pitch at /agents
 *   8. DevalokBlock      — who's behind this, with a quiet link to devalok.in
 */
export default function HomePage() {
  return (
    <>
      <BetaBanner />
      <SiteHeader />
      <main id="main" className="flex-1">
        <Hero />
        <UnifiedCanvas />
        <ButtonShowcase />
        <BuiltWith />
        <ComponentShowcase />
        <FeatureGrid />
        <AgentCallout />
        <DevalokBlock />
      </main>
      <SiteFooter />
    </>
  )
}
