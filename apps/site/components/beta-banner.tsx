'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { IconX } from '@tabler/icons-react'
import { SHILP_SUTRA_MINOR } from '@/lib/version'

/**
 * Public-beta strip. Site-wide, dismissable. Persists per-minor in
 * localStorage so 0.41 / 0.42 re-show the banner — every minor carries
 * real change.
 *
 * Coordinates with <SiteHeader /> via a CSS custom property:
 *   --beta-banner-h on <html> is set to the banner's measured height
 *   when visible, removed when dismissed or unmounted. SiteHeader reads
 *   that variable to offset its fixed `top` so the floating pill never
 *   collides with this strip.
 *
 * Copy and dismiss policy locked in docs/copy/shilp-sutra-copy-context.md
 * §6 (banner copy) and beta plan §6.3.
 */

const FEEDBACK_URL =
  'https://github.com/devalok-design/shilp-sutra/issues/new?template=ai-agent-feedback.yml&labels=beta-feedback'

export function BetaBanner() {
  const storageKey = `beta-banner-v${SHILP_SUTRA_MINOR}-dismissed`
  const [hidden, setHidden] = useState(true)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dismissed = typeof window !== 'undefined' && window.localStorage.getItem(storageKey) === '1'
    setHidden(dismissed)
  }, [storageKey])

  // Publish height on <html> so SiteHeader can offset its fixed `top`.
  // Re-measures on mount + resize + content reflow. Clears on unmount/dismiss.
  useEffect(() => {
    if (hidden) {
      document.documentElement.style.removeProperty('--beta-banner-h')
      return
    }
    const node = ref.current
    if (!node) return

    const publish = () => {
      const h = node.getBoundingClientRect().height
      document.documentElement.style.setProperty('--beta-banner-h', `${Math.ceil(h)}px`)
    }

    publish()
    window.addEventListener('resize', publish)
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(publish) : null
    observer?.observe(node)

    return () => {
      window.removeEventListener('resize', publish)
      observer?.disconnect()
      document.documentElement.style.removeProperty('--beta-banner-h')
    }
  }, [hidden])

  if (hidden) return null

  const dismiss = () => {
    try {
      window.localStorage.setItem(storageKey, '1')
    } catch {
      // Storage blocked (private mode, quota). Banner still dismisses for this session.
    }
    setHidden(true)
  }

  return (
    <div
      ref={ref}
      role="region"
      aria-label="Public beta notice"
      className="relative z-popover border-b border-accent-7 bg-accent-2"
    >
      <div className="mx-auto max-w-6xl px-page-x py-ds-02 flex flex-wrap items-center justify-between gap-ds-03">
        <p className="text-ds-xs sm:text-ds-sm text-accent-12 max-w-3xl">
          <strong className="font-semibold">Public beta · v{SHILP_SUTRA_MINOR}.</strong>
          {' '}
          APIs may move. Codemods ship for any break touching more than two components.
          {' '}
          <Link
            href={FEEDBACK_URL}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-accent-11"
          >
            Give feedback →
          </Link>
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss beta notice"
          className="shrink-0 rounded-ds-sm p-ds-01 text-accent-11 hover:bg-accent-3 transition-colors duration-fast-01 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-8"
        >
          <IconX size={16} aria-hidden />
        </button>
      </div>
    </div>
  )
}
