'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { IconX } from '@tabler/icons-react'
import { SHILP_SUTRA_MINOR } from '@/lib/version'

/**
 * Public-beta strip. Site-wide, dismissable. Persists per-minor in
 * localStorage so 0.41 / 0.42 re-show the banner — every minor carries
 * real change.
 *
 * Copy and dismiss policy locked in docs/copy/shilp-sutra-copy-context.md
 * §6 (banner copy) and beta plan §6.3.
 */

const FEEDBACK_URL =
  'https://github.com/devalok-design/shilp-sutra/issues/new?template=ai-agent-feedback.yml&labels=beta-feedback'

export function BetaBanner() {
  const storageKey = `beta-banner-v${SHILP_SUTRA_MINOR}-dismissed`
  const [hidden, setHidden] = useState(true)

  useEffect(() => {
    const dismissed = typeof window !== 'undefined' && window.localStorage.getItem(storageKey) === '1'
    setHidden(dismissed)
  }, [storageKey])

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
      role="region"
      aria-label="Public beta notice"
      className="relative z-30 border-b border-accent-7 bg-accent-2"
    >
      <div className="mx-auto max-w-6xl px-page-x py-ds-02 flex flex-wrap items-center justify-between gap-ds-03">
        <p className="text-ds-xs sm:text-ds-sm text-accent-12 max-w-3xl">
          <strong className="font-semibold">Public beta · v{SHILP_SUTRA_MINOR}</strong>
          {' — '}
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
