'use client'

/**
 * BuildathonStrip — the running-buildathon notice in the homepage hero, sitting
 * with the CTAs rather than as a bar pinned to the top of the window.
 *
 * Carries the buildathon page's visual language deliberately and sparingly: the
 * top hairline it uses for set-off asides, and the poster's lime plate on exactly
 * one value — the time remaining. Lime is the one emphasis device across both
 * surfaces, and it stops meaning anything if it spreads.
 *
 * Two constraints shape the timer:
 *
 * 1. The homepage is statically prerendered, so a countdown computed on the
 *    server would freeze at build time and quietly lie. The remaining time is
 *    therefore computed on the client.
 * 2. Content must never depend on JS having run. The server render — and the
 *    first client render, so hydration matches — shows the absolute deadline,
 *    which is true whether or not the effect ever fires. The live figure
 *    replaces it after mount as an enhancement.
 *
 * It is also NOT the stock DAYS/HRS/MIN/SEC box widget. One compressed phrase,
 * ticking at minute resolution: a real deadline stated plainly, not urgency
 * theatre. The whole strip disappears once entries close.
 */

import { useEffect, useState } from 'react'
import { IconArrowRight } from '@tabler/icons-react'
import { Text } from '@devalok/shilp-sutra/ui/text'

import { TrackedLink } from './tracked-link'
import { CLOSES, CLOSES_AT, PRIZE, isOpen } from '@/lib/buildathon'

const LIME = '#D5EF72'
const LIME_INK = '#131514'

/** Largest-two-units phrasing: "4 days, 6 hours" → "6 hours, 12 minutes" → "12 minutes". */
function formatRemaining(ms: number): string | null {
  if (ms <= 0) return null
  const totalMinutes = Math.floor(ms / 60_000)
  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  const minutes = totalMinutes % 60
  const unit = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

  if (days > 0) return `${unit(days, 'day')}, ${unit(hours, 'hour')} left`
  if (hours > 0) return `${unit(hours, 'hour')}, ${unit(minutes, 'minute')} left`
  return `${unit(Math.max(minutes, 1), 'minute')} left`
}

export function BuildathonStrip() {
  // null until mounted, so server HTML and first client render agree.
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

  // Server-side gate plus a client-side one, so the strip vanishes on a page
  // that was prerendered while the buildathon was still open.
  if (!isOpen() || closed) return null

  return (
    <div className="w-full border-t border-surface-border-subtle pt-ds-04">
      <TrackedLink
        href="/buildathon"
        event="cta_click"
        eventProps={{ cta: 'buildathon-strip', location: 'home-hero' }}
        className="group flex flex-col items-center gap-ds-03 text-center sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-ds-04 sm:text-left"
      >
        <Text variant="label-sm" as="span" className="text-surface-fg-subtle">
          Buildathon running
        </Text>

        <span
          className="px-ds-02 py-ds-01 text-ds-sm font-semibold tabular-nums"
          style={{ background: LIME, color: LIME_INK }}
        >
          {remaining ?? `closes ${CLOSES}`}
        </span>

        {/* "Build on Shilp Sutra" is dropped on purpose: the reader is already on
            the Shilp Sutra site, and the label above says what this is. Keeping it
            pushed the strip onto a second line for no added meaning. */}
        <span className="inline-flex items-baseline gap-ds-02 text-ds-base text-surface-fg">
          Win {PRIZE} of brand and GTM support
          <IconArrowRight
            size={16}
            aria-hidden
            className="translate-y-[0.15em] transition-transform duration-fast-02 group-hover:translate-x-[3px]"
          />
        </span>
      </TrackedLink>
    </div>
  )
}
