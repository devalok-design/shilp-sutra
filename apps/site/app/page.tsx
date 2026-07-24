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
import { StackSupport } from '@/components/stack-support'
import { UnifiedCanvas } from '@/components/unified-canvas'

/**
 * Landing flow. Beta banner + built-with strip + Devalok block added per
 * docs/copy/shilp-sutra-copy-context.md §6 + §7 + §5. Wedge row + stack strip
 * added right under the hero per §2 — answer "why this, not shadcn?" and
 * "does this fit my stack?" before the reader scrolls.
 *
 *   0. BetaBanner       — public-beta strip, dismissable, homepage only
 *   1. Hero              — what we are
 *   2. StackSupport      — framework strip; kills the "my stack?" doubt (§6)
 *   3. UnifiedCanvas     — six industries in one tabbed canvas, all live
 *   4. ButtonShowcase    — one component, ten worlds (close-up craft)
 *   5. BuiltWith         — Devalok's own products carrying shilp-sutra
 *   6. ComponentShowcase — curated grid of components in context
 *   7. FeatureGrid       — three pillars + builder promise
 *   8. AgentCallout      — teaser; full pitch at /agents
 *   9. DevalokBlock      — who's behind this, with a quiet link to devalok.in
 */
export default function HomePage() {
  return (
    <>
      <BetaBanner />
      <SiteHeader />
      <main id="main" className="flex-1">
        <Hero />
        <StackSupport />
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
