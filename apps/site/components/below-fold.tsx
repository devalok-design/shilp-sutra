'use client'

/**
 * BelowFold — defers everything under the hero so only the lander paints on
 * load. Each section is a separate lazy chunk (ssr:false); they mount when the
 * sentinel nears the viewport (scroll) OR on idle as a fallback, so users who
 * never scroll — and crawlers that run JS — still get the full page.
 *
 * Tradeoff: below-fold content is client-rendered (not in the SSR HTML), so it
 * isn't in the raw-HTML crawl. The hero + all page metadata remain server-
 * rendered. This is a deliberate performance choice for the marketing lander.
 */

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'

const BrandOrbit = dynamic(() => import('./brand-orbit').then((m) => m.BrandOrbit))
const StackSupport = dynamic(() => import('./stack-support').then((m) => m.StackSupport))
const UnifiedCanvas = dynamic(() => import('./unified-canvas').then((m) => m.UnifiedCanvas))
const ButtonShowcase = dynamic(() => import('./button-showcase').then((m) => m.ButtonShowcase))
const BuiltWith = dynamic(() => import('./built-with').then((m) => m.BuiltWith))
const ComponentShowcase = dynamic(() =>
  import('./component-showcase').then((m) => m.ComponentShowcase),
)
const FeatureGrid = dynamic(() => import('./feature-grid').then((m) => m.FeatureGrid))
const AgentCallout = dynamic(() => import('./agent-callout').then((m) => m.AgentCallout))
const DevalokBlock = dynamic(() => import('./devalok-block').then((m) => m.DevalokBlock))

export function BelowFold() {
  const [show, setShow] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (show) return
    let done = false
    const reveal = () => {
      if (done) return
      done = true
      setShow(true)
    }

    const el = ref.current
    const io = el
      ? new IntersectionObserver(
          (entries) => {
            if (entries.some((e) => e.isIntersecting)) reveal()
          },
          { rootMargin: '600px 0px' },
        )
      : null
    if (io && el) io.observe(el)

    // Fallback: mount on idle so non-scrollers + JS crawlers get the content.
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
    }
    const idleId = w.requestIdleCallback
      ? w.requestIdleCallback(reveal, { timeout: 3500 })
      : window.setTimeout(reveal, 2500)

    return () => {
      io?.disconnect()
      if (typeof idleId === 'number') window.clearTimeout(idleId)
    }
  }, [show])

  return (
    <div ref={ref}>
      {show && (
        <>
          {/* TODO(placement): temporary home for the animated brand orbit. */}
          <section className="px-page-x py-ds-08">
            <BrandOrbit />
          </section>
          <StackSupport />
          <UnifiedCanvas />
          <ButtonShowcase />
          <BuiltWith />
          <ComponentShowcase />
          <FeatureGrid />
          <AgentCallout />
          <DevalokBlock />
        </>
      )}
    </div>
  )
}
