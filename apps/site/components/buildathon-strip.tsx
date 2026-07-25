'use client'

/**
 * BuildathonStrip — the running-buildathon announcement in the homepage hero,
 * sitting with the CTAs rather than as a bar pinned to the top of the window.
 *
 * It borrows the poster's own hierarchy rather than inventing a promo panel:
 * a small label, then one number at display scale on the lime plate, then the
 * offer. Lime marks the deadline here and on /buildathon and nothing else on
 * either surface — that is what makes the two read as one system.
 *
 * There is deliberately no card, border or shadow around it. The hairline and
 * the plate carry the block; wrapping it in a tinted, rounded, shadowed slab
 * would turn it into the stock pre-footer CTA banner, and it would compete with
 * the hero composition instead of sitting under it.
 *
 * Two constraints shape the timer:
 *
 * 1. The homepage is statically prerendered, so a countdown computed on the
 *    server would freeze at build time and quietly lie about the deadline. The
 *    remaining time is therefore computed on the client.
 * 2. Content must never depend on JS having run. The server render — and the
 *    first client render, so hydration matches — shows the absolute deadline,
 *    which is true whether or not the effect ever fires. The live figure
 *    replaces it after mount as an enhancement.
 *
 * It is also NOT the stock DAYS/HRS/MIN/SEC box widget. One phrase at the
 * coarsest honest unit, ticking at minute resolution: a real deadline stated
 * plainly, not urgency theatre. The whole block disappears once entries close.
 */

import { useEffect, useState } from 'react'
import { IconArrowRight } from '@tabler/icons-react'
import { Text } from '@devalok/shilp-sutra/ui/text'

import { TrackedLink } from './tracked-link'
import { CLOSES_SHORT, CLOSES_AT, PRIZE, isOpen } from '@/lib/buildathon'

const LIME = '#D5EF72'
const LIME_INK = '#131514'

/**
 * One unit, the coarsest that is still honest: "6 days left" → "18 hours left"
 * → "42 minutes left". At display scale a two-unit phrase reads as a spec, and
 * the finer unit is not what a reader needs from a homepage.
 */
function formatRemaining(ms: number): string | null {
  if (ms <= 0) return null
  const minutes = Math.floor(ms / 60_000)
  const unit = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'} left`
  if (minutes >= 1440) return unit(Math.floor(minutes / 1440), 'day')
  if (minutes >= 60) return unit(Math.floor(minutes / 60), 'hour')
  return unit(Math.max(minutes, 1), 'minute')
}

export function BuildathonStrip() {
  // null until mounted, so the server HTML and the first client render agree.
  const [remaining, setRemaining] = useState<string | null>(null)
  const [closed, setClosed] = useState(false)

  useEffect(() => {
    const tick = () => {
      const ms = CLOSES_AT - Date.now()
      if (ms <= 0) {
        setClosed(true)
        setRemaining(null)
        return
      }
      setRemaining(formatRemaining(ms))
    }
    tick()
    // Minute resolution, so a 30s tick keeps the figure honest without a
    // per-second re-render.
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [])

  // Gated server-side as well as here, so a page prerendered while entries were
  // open still drops the block once they close.
  if (!isOpen() || closed) return null

  return (
    <div className="w-full border-t border-surface-border-subtle pt-ds-05">
      <TrackedLink
        href="/buildathon"
        event="cta_click"
        eventProps={{ cta: 'buildathon-strip', location: 'home-hero' }}
        className="group flex flex-col items-center gap-ds-03 text-center lg:items-start lg:text-left"
      >
        <Text variant="label-sm" as="span" className="text-surface-fg-subtle">
          Build with Shilp Sutra · an open buildathon
        </Text>

        {/* The number is the block. Clamped so it stays big on desktop without
            overflowing the narrow column on a phone. */}
        <span
          className="inline-block px-ds-03 py-ds-01 font-display text-[clamp(1.75rem,5.5vw,2.75rem)] font-semibold leading-[1.15] tabular-nums"
          style={{ background: LIME, color: LIME_INK }}
        >
          {remaining ?? `Closes ${CLOSES_SHORT}`}
        </span>

        <Text variant="body-lg" as="span" className="text-pretty text-surface-fg">
          Build anything on Shilp Sutra and win {PRIZE} of brand identity, GTM strategy, and
          ongoing support from Devalok.
        </Text>

        <span className="mt-ds-01 inline-flex items-center gap-ds-02 text-ds-md font-semibold text-accent-11">
          See how to enter
          <IconArrowRight
            size={18}
            aria-hidden
            className="transition-transform duration-fast-02 group-hover:translate-x-[3px]"
          />
        </span>
      </TrackedLink>
    </div>
  )
}
