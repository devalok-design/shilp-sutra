import { BelowFold } from '@/components/below-fold'
import { Hero } from '@/components/hero'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

/**
 * Landing flow. Only the lander (header + full-height hero) paints on load; the
 * rest is deferred via <BelowFold> (lazy chunks, mounted on scroll/idle) for a
 * faster first paint. Section order + rationale per
 * docs/copy/shilp-sutra-copy-context.md §2/§5/§6/§7:
 *
 *   1. Hero              — what we are (full viewport height)
 *   — below the fold (lazy) —
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
      <SiteHeader />
      <main id="main" className="flex-1">
        <Hero />
        <BelowFold />
      </main>
      <SiteFooter />
    </>
  )
}
