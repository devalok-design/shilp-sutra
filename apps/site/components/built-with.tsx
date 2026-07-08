'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import { IconArrowUpRight, IconLock } from '@tabler/icons-react'
import { Badge } from '@devalok/shilp-sutra/ui/badge'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Text } from '@devalok/shilp-sutra/ui/text'
import { generateRamp } from '@/lib/ramp-generator'

/**
 * Subscribes to the .dark class on <html> via MutationObserver and
 * returns the live theme. Used by useBrandRamp() so the inline accent
 * CSS-var override picks the right (light or dark) OKLCH stops.
 */
function useThemeMode(): 'light' | 'dark' {
  const [mode, setMode] = useState<'light' | 'dark'>('light')
  useEffect(() => {
    const read = () =>
      setMode(document.documentElement.classList.contains('dark') ? 'dark' : 'light')
    read()
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => observer.disconnect()
  }, [])
  return mode
}

/**
 * Built-with section — Devalok products carrying shilp-sutra. Per
 * docs/copy/shilp-sutra-copy-context.md §7.
 *
 * Visual: one featured card (Karm, the largest consumer) full-width, then
 * three secondary cards in a 3-column grid. Each card applies its own
 * brand's accent ramp via inline CSS-vars so the strip itself demonstrates
 * the multi-brand thesis the site sells. The same library, four colours,
 * four products.
 *
 * Dark-mode: relies entirely on semantic surface-* and accent-* tokens
 * which DS remaps in .dark scope. The two oklch fallback values inside
 * useBrandRamp() are the auto-foreground (white-on-dark-accent /
 * dark-on-light-accent) and stay correct under both modes because the
 * accent-9 lightness anchor is mode-neutral.
 *
 * Favicons: Google s2 service with onError fallback to a letter-tile so
 * a missing favicon (Hiring is internal, Gurukul may not have one set
 * yet) doesn't render a broken-image icon.
 *
 * Versions pinned to consumer package.json at 2026-05-25. Re-verify per
 * minor by greping the consumer repos.
 */

type Consumer = {
  name: string
  type: string
  pitch: string
  /** Short one-liner used on the featured hero. */
  punchline?: string
  /** Pinned shilp-sutra version. */
  version: string
  /** Public domain. null = internal. */
  domain: string | null
  href: string | null
  /** Status signal — "Daily use", "Public beta", "Internal", "Open · MIT". */
  status: string
  /** 3-6 shilp-sutra component names this product leans on most. */
  uses: readonly string[]
  /** Brand ramp anchors — drives the CSS-var override on the card. */
  hue: number
  chroma: number
  /** Optional bundled logo at /public/<path>. When present BrandTile
   *  renders the image instead of the letter-tile fallback. */
  iconSrc?: string
}

const KARM: Consumer = {
  name: 'Karm',
  type: 'Project ops platform',
  punchline: 'The studio runs on Karm. Karm runs on shilp-sutra.',
  pitch:
    'Project workspaces for design and strategy studios. Triage, track, and deliver work to clients with low-friction review and approval.',
  version: '0.40.x',
  domain: 'karm.devalok.in',
  href: 'https://karm.devalok.in',
  status: 'Daily use, 8 hours a day',
  uses: ['Sidebar', 'TopBar', 'DataTable', 'ActivityFeed', 'CommandPalette', 'Sheet'],
  hue: 360,
  chroma: 0.19,
}

const SECONDARIES: Consumer[] = [
  {
    name: 'Devalok Hiring',
    type: 'Internal review tool',
    pitch:
      'Design hiring review. Triage, track, and manage applicants end-to-end with brief-keyed scorecards.',
    version: '0.33.2',
    domain: null,
    href: null,
    status: 'Internal',
    uses: ['Form', 'Combobox', 'DataTable', 'Sheet'],
    hue: 275,
    chroma: 0.16,
  },
  {
    name: 'BharatTools',
    type: 'Public product',
    pitch:
      'Browser-only utilities for Indian government forms. Photo to spec, signature merge, KB compression. Files never leave your device.',
    version: '0.37.1',
    domain: 'bharattools.in',
    href: 'https://bharattools.in',
    status: 'Public beta',
    uses: ['FileUpload', 'Progress', 'Alert', 'Stepper'],
    hue: 35,
    chroma: 0.18,
    // Pulled from devalok-design/bharattools-frontend/public/android-chrome-192x192.png
    iconSrc: '/built-with/bharattools.png',
  },
  {
    name: 'Gurukul',
    type: 'Open knowledge hub',
    pitch:
      "Devalok's practical guides for founders, designers, and builders. Open, MIT, edits welcome.",
    version: '0.29.0',
    domain: 'gurukul.devalok.in',
    href: 'https://gurukul.devalok.in',
    status: 'Open · MIT',
    uses: ['Text', 'Card', 'Breadcrumb', 'Tabs'],
    hue: 145,
    chroma: 0.15,
  },
]

/**
 * Inline CSS-var override that re-skins the accent ramp on just this
 * subtree. Same trick the showcase canvas uses for industry brands.
 *
 * Dark-mode aware: useThemeMode subscribes to the .dark class on <html>
 * and picks the matching OKLCH ramp (generateRamp returns both light and
 * dark stops with different lightness curves). Without this, the inline
 * override would force light-mode pinks/saffrons even under .dark and
 * the card would read washed-out / nearly white.
 */
function useBrandRamp(hue: number, chroma: number): CSSProperties {
  const mode = useThemeMode()
  return useMemo(() => {
    const ramp = generateRamp(hue, chroma)
    const stops = mode === 'dark' ? ramp.dark : ramp.light
    const style: Record<string, string> = {}
    stops.forEach((s) => {
      style[`--color-accent-${s.step}`] = s.value
    })
    const accent9L = Number.parseFloat(
      stops[8].value.match(/oklch\(\s*([0-9.]+)/)?.[1] ?? '0.55',
    )
    style['--color-accent-fg'] = accent9L < 0.62 ? 'oklch(0.99 0 0)' : 'oklch(0.13 0 0)'
    return style as CSSProperties
  }, [hue, chroma, mode])
}

/**
 * BrandTile — small per-product glyph used in the BuiltWith cards.
 * Resolves in priority order:
 *   1. Bundled product logo (iconSrc) — used by BharatTools today.
 *   2. IconLock for internal-only products without a public domain.
 *   3. Brand-coloured letter tile (first char of name) — every other
 *      consumer. Uses accent-3 bg + accent-11 fg so it follows the
 *      card's per-product brand ramp via useBrandRamp.
 */
function BrandTile({
  iconSrc,
  domain,
  name,
  size = 36,
}: {
  iconSrc?: string
  domain: string | null
  name: string
  size?: number
}) {
  const [errored, setErrored] = useState(false)
  const px = `${size}px`

  if (iconSrc && !errored) {
    return (
      // Bundled in /public. Next/Image is overkill for a small static asset.
      <img
        src={iconSrc}
        alt={`${name} logo`}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        onError={() => setErrored(true)}
        className="rounded-control-inner shrink-0 border border-surface-border-subtle bg-surface-base object-cover"
        style={{ width: px, height: px }}
      />
    )
  }

  if (!domain) {
    return (
      <span
        aria-hidden
        className="rounded-control-inner bg-surface-overlay border border-surface-border-subtle text-surface-fg-subtle flex items-center justify-center shrink-0"
        style={{ width: px, height: px }}
      >
        <IconLock size={Math.round(size * 0.44)} />
      </span>
    )
  }

  return (
    <span
      aria-hidden
      className="rounded-control-inner bg-accent-3 text-accent-11 border border-accent-7 flex items-center justify-center shrink-0 font-semibold"
      style={{ width: px, height: px, fontSize: `${Math.max(12, Math.round(size * 0.44))}px` }}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  )
}

/** 5-step swatch strip generated from the product's own ramp. */
function SwatchStrip({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const steps = [3, 5, 7, 9, 11] as const
  const dim = size === 'sm' ? 'h-1.5' : 'h-2'
  return (
    <div
      aria-hidden
      className={`flex w-full overflow-hidden rounded-pill border border-surface-border-subtle ${dim}`}
    >
      {steps.map((step) => (
        <span
          key={step}
          className="flex-1"
          style={{ background: `var(--color-accent-${step})` }}
        />
      ))}
    </div>
  )
}

function UsesRow({ uses, max }: { uses: readonly string[]; max?: number }) {
  const limit = max ?? uses.length
  const visible = uses.slice(0, limit)
  const overflow = uses.length - visible.length
  return (
    <ul className="flex flex-wrap items-center gap-ds-02">
      {visible.map((c) => (
        <li key={c}>
          <span className="inline-flex items-center px-ds-02 py-[1px] rounded-control-inner bg-accent-3 text-accent-11 text-ds-xs font-mono">
            {c}
          </span>
        </li>
      ))}
      {overflow > 0 ? (
        <li>
          <span
            className="inline-flex items-center px-ds-02 py-[1px] rounded-control-inner bg-surface-overlay text-surface-fg-subtle text-ds-xs font-mono"
            title={uses.slice(limit).join(', ')}
          >
            +{overflow} more
          </span>
        </li>
      ) : null}
    </ul>
  )
}

function FeaturedCard({ consumer }: { consumer: Consumer }) {
  const style = useBrandRamp(consumer.hue, consumer.chroma)
  return (
    <article
      style={style}
      className="relative overflow-hidden rounded-surface border border-accent-7 bg-linear-to-br from-accent-2 via-accent-3 to-accent-2"
    >
      <div className="relative grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-ds-06 lg:gap-ds-08 p-ds-05 sm:p-ds-06 lg:p-ds-08">
        {/* Left — identity + pitch */}
        <div className="flex flex-col gap-ds-05 min-w-0">
          <div className="flex items-center gap-ds-03 min-w-0">
            <BrandTile iconSrc={consumer.iconSrc} domain={consumer.domain} name={consumer.name} size={40} />
            <div className="flex flex-col min-w-0">
              <span className="text-ds-xs uppercase tracking-wide text-accent-11 truncate">
                Flagship · {consumer.status}
              </span>
              <Text variant="heading-xl" className="text-surface-fg text-balance">
                {consumer.name}
              </Text>
            </div>
          </div>

          {consumer.punchline ? (
            <Text
              variant="heading-md"
              className="text-surface-fg text-balance max-w-prose font-medium"
            >
              {consumer.punchline}
            </Text>
          ) : null}

          <Text variant="body-md" className="text-surface-fg-muted max-w-prose">
            {consumer.pitch}
          </Text>

          <div className="flex flex-col gap-ds-02">
            <span className="text-ds-xs uppercase tracking-wide text-surface-fg-subtle">
              What it leans on
            </span>
            <UsesRow uses={consumer.uses} />
          </div>

          <div className="flex flex-wrap items-center gap-ds-03 pt-ds-02">
            {consumer.href ? (
              <Link href={consumer.href} target="_blank" rel="noreferrer">
                <Button
                  variant="solid"
                  size="md"
                  endIcon={<IconArrowUpRight size={14} />}
                >
                  Open {consumer.name}
                </Button>
              </Link>
            ) : (
              <Button variant="soft" size="md" disabled>
                Internal only
              </Button>
            )}
            <span className="text-ds-xs font-mono text-surface-fg-subtle">
              shilp-sutra@{consumer.version}
            </span>
          </div>
        </div>

        {/* Right — visual brand evidence. Below sm the mock chrome stacks
            below the identity; on md+ it sits in its own column. */}
        <div className="flex flex-col gap-ds-04 justify-between min-w-0">
          <div className="flex flex-col gap-ds-03">
            <span className="text-ds-xs uppercase tracking-wide text-surface-fg-subtle">
              The brand it wears
            </span>
            <SwatchStrip />
            <div className="flex items-center justify-between text-ds-xs font-mono text-surface-fg-subtle">
              <span>hue {consumer.hue}</span>
              <span>chroma {consumer.chroma}</span>
            </div>
          </div>

          {/* Mock product chrome — proves the brand on a real-feeling
              artifact. Hidden below sm to avoid cramping a phone viewport. */}
          <div className="hidden sm:flex rounded-control bg-surface-base shadow-overlay p-ds-04 flex-col gap-ds-03">
            <div className="flex items-center gap-ds-02 min-w-0">
              <span aria-hidden className="w-2 h-2 rounded-pill bg-error-9 shrink-0" />
              <span aria-hidden className="w-2 h-2 rounded-pill bg-warning-9 shrink-0" />
              <span aria-hidden className="w-2 h-2 rounded-pill bg-success-9 shrink-0" />
              <span className="ml-ds-02 text-ds-xs font-mono text-surface-fg-subtle truncate">
                {consumer.domain ?? 'internal'}
              </span>
            </div>
            <div className="flex flex-col gap-ds-02">
              <span aria-hidden className="h-2 w-3/4 rounded-pill bg-accent-9" />
              <span aria-hidden className="h-1.5 w-full rounded-pill bg-accent-3" />
              <span aria-hidden className="h-1.5 w-5/6 rounded-pill bg-accent-3" />
              <span aria-hidden className="h-1.5 w-2/3 rounded-pill bg-accent-3" />
            </div>
            <div className="flex items-center justify-between gap-ds-02 pt-ds-01">
              <span className="inline-flex items-center px-ds-02 py-[1px] rounded-control-inner bg-accent-9 text-accent-fg text-[10px] font-semibold uppercase tracking-wide">
                Send for review
              </span>
              <span className="inline-flex items-center px-ds-02 py-[1px] rounded-control-inner bg-accent-3 text-accent-11 text-[10px] font-medium">
                Save draft
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

function SecondaryCard({ consumer }: { consumer: Consumer }) {
  const style = useBrandRamp(consumer.hue, consumer.chroma)
  const isInteractive = Boolean(consumer.href)

  // Amal #1: cards that look like links should be links. Hover lift +
  // arrow chevron are dropped entirely on internal-only cards so they
  // stop suggesting interaction they can't deliver.
  const cardClass = [
    'group relative flex flex-col gap-ds-04 overflow-hidden rounded-surface border bg-surface-raised h-full',
    isInteractive
      ? 'border-surface-border-subtle hover:shadow-raised-hover hover:border-accent-7 hover:-translate-y-px focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base transition-[border-color,box-shadow,transform] duration-fast-02 ease-productive-standard cursor-pointer'
      : 'border-surface-border-subtle',
  ].join(' ')

  const body = (
    <article style={style} className={cardClass}>
      <div className="relative h-16 bg-linear-to-br from-accent-3 to-accent-2 border-b border-surface-border-subtle overflow-hidden shrink-0">
        <div className="relative h-full flex items-center justify-between gap-ds-03 px-ds-04 min-w-0">
          <BrandTile
            iconSrc={consumer.iconSrc}
            domain={consumer.domain}
            name={consumer.name}
            size={32}
          />
          <div className="flex items-center gap-ds-02 shrink-0">
            <Badge variant="soft" color="accent" size="sm" className="truncate max-w-[8rem]">
              {consumer.status}
            </Badge>
            {isInteractive ? (
              <span
                aria-hidden
                className="inline-flex items-center justify-center w-6 h-6 rounded-control-inner bg-surface-base/70 backdrop-blur-sm border border-surface-border-subtle text-surface-fg group-hover:bg-accent-9 group-hover:text-accent-fg group-hover:border-accent-9 transition-colors duration-fast-02 ease-productive-standard"
              >
                <IconArrowUpRight
                  size={12}
                  className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-fast-02 ease-productive-standard"
                />
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-ds-03 px-ds-05 pb-ds-05 min-w-0">
        <div className="flex flex-col gap-ds-01 min-w-0">
          <Text variant="heading-sm" className="text-surface-fg truncate">
            {consumer.name}
          </Text>
          <Text variant="body-xs" className="text-surface-fg-subtle truncate">
            {consumer.type}
          </Text>
        </div>

        {/* Amal #2: fixed-height clamp on the pitch + chip-row reservation
            so every card reserves the same vertical space regardless of
            copy length. Footers line up across the row. */}
        <Text
          variant="body-sm"
          className="text-surface-fg-muted line-clamp-3 min-h-[3.75rem]"
        >
          {consumer.pitch}
        </Text>

        <SwatchStrip size="sm" />

        <div className="min-h-[1.5rem]">
          <UsesRow uses={consumer.uses} max={3} />
        </div>

        <footer className="mt-auto flex items-center justify-between gap-ds-02 pt-ds-03 border-t border-surface-border-subtle min-w-0">
          <span className="text-ds-xs font-mono text-surface-fg-subtle truncate">
            shilp-sutra@{consumer.version}
          </span>
          {isInteractive ? (
            <span className="text-ds-xs text-surface-fg group-hover:text-accent-11 transition-colors duration-fast-01 shrink-0">
              Open {consumer.name.split(' ')[0]} →
            </span>
          ) : (
            <span className="text-ds-xs text-surface-fg-subtle italic shrink-0">No public URL</span>
          )}
        </footer>
      </div>
    </article>
  )

  return isInteractive && consumer.href ? (
    <Link
      href={consumer.href}
      target="_blank"
      rel="noreferrer"
      className="block h-full"
      aria-label={`Open ${consumer.name} (${consumer.status})`}
    >
      {body}
    </Link>
  ) : (
    body
  )
}

export function BuiltWith() {
  return (
    <section className="mx-auto max-w-6xl px-page-x py-ds-12">
      <div className="flex flex-col gap-ds-08">
        <div className="flex flex-col gap-ds-03 max-w-3xl">
          <Text variant="label-md" className="text-surface-fg-subtle">
            Shipped on shilp-sutra
          </Text>
          <Text variant="heading-xl" className="text-surface-fg text-balance">
            Devalok ships its own tools on it.
          </Text>
          <Text variant="body-md" className="text-surface-fg-muted max-w-2xl">
            Four products, four brands, one library. The brand swap that powers this site powers
            every product below. Each card is tinted with its own product&apos;s accent ramp,
            generated by the same OKLCH algorithm shilp-sutra ships.
          </Text>
        </div>

        <FeaturedCard consumer={KARM} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-ds-04">
          {SECONDARIES.map((c) => (
            <SecondaryCard key={c.name} consumer={c} />
          ))}
        </div>
      </div>
    </section>
  )
}
