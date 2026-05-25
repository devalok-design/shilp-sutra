import Link from 'next/link'
import { IconArrowUpRight, IconLock } from '@tabler/icons-react'
import { Text } from '@devalok/shilp-sutra/ui/text'
import { CARD_RESTING } from '@/lib/card-recipe'

/**
 * Built-with strip — Devalok's own products carrying shilp-sutra. Per
 * docs/copy/shilp-sutra-copy-context.md §7. The strongest social signal
 * available at 0.40 beta: no external consumers yet, but the studio ships
 * four of its own things on it.
 *
 * Versions are pinned to what each consumer's package.json declared at
 * 2026-05-25 — re-verify before each minor by greping the consumer repos.
 *
 * Favicons load via Google's s2 service. Privacy-aware: no tracking value
 * to Google, just the favicon URL. Acceptable at beta; replace with bundled
 * brand assets when /built-with detail pages land.
 */

type Consumer = {
  name: string
  type: string
  tagline: string
  /** Pinned shilp-sutra version from the consumer's package.json. */
  version: string
  /** Public domain. null = internal, no link. */
  domain: string | null
  href: string | null
}

const consumers: Consumer[] = [
  {
    name: 'Karm',
    type: 'Project ops platform',
    tagline:
      'Triage, track, and deliver design and strategy work to clients with low-friction review and approval.',
    version: '0.40.x',
    domain: 'karm.devalok.in',
    href: 'https://karm.devalok.in',
  },
  {
    name: 'Devalok Hiring',
    type: 'Internal tool',
    tagline:
      'Design hiring review platform. Triage, track, and manage design applicants end-to-end.',
    version: '0.33.2',
    domain: null,
    href: null,
  },
  {
    name: 'BharatTools',
    type: 'Public product',
    tagline:
      'Browser-only utilities for Indian government forms. Photo to spec, signature merge, KB compression. Files never leave your device.',
    version: '0.37.1',
    domain: 'bharattools.in',
    href: 'https://bharattools.in',
  },
  {
    name: 'Gurukul',
    type: 'Open knowledge hub',
    tagline:
      "Devalok's practical guides for founders, designers, and builders. Public, MIT.",
    version: '0.29.0',
    domain: 'gurukul.devalok.in',
    href: 'https://gurukul.devalok.in',
  },
]

export function BuiltWith() {
  return (
    <section className="mx-auto max-w-6xl px-page-x py-ds-12">
      <div className="flex flex-col gap-ds-08">
        <div className="flex flex-col gap-ds-03 max-w-3xl">
          <Text variant="label-md" className="text-surface-fg-subtle">
            Shipped on shilp-sutra
          </Text>
          <Text variant="heading-xl" className="text-surface-fg">
            Devalok ships its own tools on it.
          </Text>
          <Text variant="body-md" className="text-surface-fg-muted max-w-2xl">
            Four products carry the same library. Same components, four brand identities, four
            audiences. Real users, real builds, real beta feedback feeding back into 1.0.
          </Text>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-ds-04">
          {consumers.map((c) => (
            <li key={c.name} className={CARD_RESTING + ' flex flex-col gap-ds-04'}>
              <header className="flex items-start gap-ds-03">
                {c.domain ? (
                  // Intentional: <img> with Google favicon service — Next/Image
                  // would proxy through /_next/image which adds latency for a
                  // 32×32 favicon. The @next/next/no-img-element rule is not
                  // registered in this project's flat ESLint config.
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${c.domain}&sz=64`}
                    alt=""
                    width={32}
                    height={32}
                    loading="lazy"
                    className="rounded-control-inner shrink-0 border border-surface-border-subtle"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="w-8 h-8 rounded-control-inner bg-surface-overlay border border-surface-border-subtle text-surface-fg-subtle flex items-center justify-center shrink-0"
                  >
                    <IconLock size={14} />
                  </span>
                )}
                <div className="flex flex-col min-w-0">
                  <Text variant="heading-sm" className="text-surface-fg truncate">
                    {c.name}
                  </Text>
                  <Text variant="body-xs" className="text-surface-fg-subtle">
                    {c.type}
                  </Text>
                </div>
              </header>

              <Text variant="body-sm" className="text-surface-fg-muted">
                {c.tagline}
              </Text>

              <footer className="mt-auto flex items-center justify-between gap-ds-02 pt-ds-02 border-t border-surface-border-subtle">
                <span className="text-ds-xs font-mono text-surface-fg-subtle">
                  shilp-sutra@{c.version}
                </span>
                {c.href ? (
                  <Link
                    href={c.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-ds-01 text-ds-xs text-surface-fg hover:text-accent-11 transition-colors duration-fast-01"
                  >
                    Visit
                    <IconArrowUpRight size={12} aria-hidden />
                  </Link>
                ) : (
                  <span className="text-ds-xs text-surface-fg-subtle italic">Internal</span>
                )}
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
