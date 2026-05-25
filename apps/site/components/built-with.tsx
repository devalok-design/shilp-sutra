'use client'

import { useMemo, type CSSProperties } from 'react'
import Link from 'next/link'
import { IconArrowUpRight, IconLock, IconSparkles } from '@tabler/icons-react'
import { Badge } from '@devalok/shilp-sutra/ui/badge'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Text } from '@devalok/shilp-sutra/ui/text'
import { generateRamp } from '@/lib/ramp-generator'

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
 * Versions pinned to consumer package.json at 2026-05-25 — re-verify per
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
  /** 3-5 shilp-sutra component names this product leans on most. */
  uses: readonly string[]
  /** Brand ramp anchors — drives the CSS-var override on the card. */
  hue: number
  chroma: number
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
 */
function useBrandRamp(hue: number, chroma: number): CSSProperties {
  return useMemo(() => {
    const ramp = generateRamp(hue, chroma)
    const style: Record<string, string> = {}
    ramp.light.forEach((s) => {
      style[`--color-accent-${s.step}`] = s.value
    })
    const accent9L = Number.parseFloat(
      ramp.light[8].value.match(/oklch\(\s*([0-9.]+)/)?.[1] ?? '0.55',
    )
    style['--color-accent-fg'] = accent9L < 0.62 ? 'oklch(0.99 0 0)' : 'oklch(0.13 0 0)'
    return style as CSSProperties
  }, [hue, chroma])
}

function Favicon({ domain, name }: { domain: string | null; name: string }) {
  if (!domain) {
    return (
      <span
        aria-hidden
        className="w-9 h-9 rounded-control-inner bg-surface-overlay border border-surface-border-subtle text-surface-fg-subtle flex items-center justify-center shrink-0"
      >
        <IconLock size={16} />
      </span>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
      alt={`${name} favicon`}
      width={36}
      height={36}
      loading="lazy"
      className="w-9 h-9 rounded-control-inner shrink-0 border border-surface-border-subtle bg-surface-base"
    />
  )
}

/** 5-step swatch strip generated from the product's own ramp. */
function SwatchStrip({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const steps = [3, 5, 7, 9, 11] as const
  const dim = size === 'sm' ? 'h-1.5' : 'h-2'
  return (
    <div className={`flex w-full overflow-hidden rounded-pill border border-surface-border-subtle ${dim}`}>
      {steps.map((step) => (
        <span
          key={step}
          aria-hidden
          className="flex-1"
          style={{ background: `var(--color-accent-${step})` }}
        />
      ))}
    </div>
  )
}

function UsesRow({ uses }: { uses: readonly string[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-ds-02">
      {uses.map((c) => (
        <li key={c}>
          <span className="inline-flex items-center px-ds-02 py-[1px] rounded-control-inner bg-accent-3 text-accent-11 text-ds-xs font-mono">
            {c}
          </span>
        </li>
      ))}
    </ul>
  )
}

function FeaturedCard({ consumer }: { consumer: Consumer }) {
  const style = useBrandRamp(consumer.hue, consumer.chroma)
  return (
    <article
      style={style}
      className="relative overflow-hidden rounded-surface border border-accent-7 shadow-raised bg-gradient-to-br from-accent-2 via-accent-3 to-accent-2"
    >
      {/* Decorative brand glow in the corner — purely atmospheric */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-pill opacity-40 blur-3xl"
        style={{ background: `var(--color-accent-9)` }}
      />

      <div className="relative grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-ds-08 p-ds-06 sm:p-ds-08">
        {/* Left — identity + pitch */}
        <div className="flex flex-col gap-ds-05">
          <div className="flex items-center gap-ds-03">
            <Favicon domain={consumer.domain} name={consumer.name} />
            <div className="flex flex-col min-w-0">
              <span className="text-ds-xs uppercase tracking-wide text-accent-11 inline-flex items-center gap-ds-02">
                <IconSparkles size={12} aria-hidden />
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

        {/* Right — visual brand evidence */}
        <div className="flex flex-col gap-ds-04 justify-between">
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

          {/* Mock product chrome — proves the brand on a real-feeling artifact */}
          <div className="rounded-control border border-accent-7 bg-surface-base shadow-overlay p-ds-04 flex flex-col gap-ds-03">
            <div className="flex items-center gap-ds-02">
              <span className="w-2 h-2 rounded-pill bg-error-9" />
              <span className="w-2 h-2 rounded-pill bg-warning-9" />
              <span className="w-2 h-2 rounded-pill bg-success-9" />
              <span className="ml-ds-02 text-ds-xs font-mono text-surface-fg-subtle truncate">
                {consumer.domain ?? 'internal'}
              </span>
            </div>
            <div className="flex flex-col gap-ds-02">
              <span className="h-2 w-3/4 rounded-pill bg-accent-9" />
              <span className="h-1.5 w-full rounded-pill bg-accent-3" />
              <span className="h-1.5 w-5/6 rounded-pill bg-accent-3" />
              <span className="h-1.5 w-2/3 rounded-pill bg-accent-3" />
            </div>
            <div className="flex items-center justify-between gap-ds-02 pt-ds-01">
              <span className="inline-flex items-center px-ds-02 py-[1px] rounded-control-inner bg-accent-9 text-accent-fg text-[10px] font-semibold uppercase tracking-wide">
                Action
              </span>
              <span className="inline-flex items-center px-ds-02 py-[1px] rounded-control-inner bg-accent-3 text-accent-11 text-[10px] font-medium">
                Secondary
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
  return (
    <article
      style={style}
      className="group relative flex flex-col gap-ds-04 overflow-hidden rounded-surface border border-surface-border-subtle bg-surface-raised shadow-raised hover:shadow-raised-hover hover:border-accent-7 transition-[border-color,box-shadow,transform] duration-fast-02 ease-productive-standard hover:-translate-y-px"
    >
      {/* Brand wash at top */}
      <div className="relative h-16 bg-gradient-to-br from-accent-3 to-accent-2 border-b border-surface-border-subtle overflow-hidden">
        <span
          aria-hidden
          className="absolute -top-10 -right-10 w-32 h-32 rounded-pill opacity-40 blur-2xl"
          style={{ background: `var(--color-accent-9)` }}
        />
        <div className="relative h-full flex items-center justify-between px-ds-04">
          <Favicon domain={consumer.domain} name={consumer.name} />
          <Badge variant="soft" color="accent" size="sm">
            {consumer.status}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col gap-ds-03 px-ds-05 pb-ds-05">
        <div className="flex flex-col gap-ds-01">
          <Text variant="heading-sm" className="text-surface-fg truncate">
            {consumer.name}
          </Text>
          <Text variant="body-xs" className="text-surface-fg-subtle">
            {consumer.type}
          </Text>
        </div>

        <Text variant="body-sm" className="text-surface-fg-muted line-clamp-3">
          {consumer.pitch}
        </Text>

        <SwatchStrip size="sm" />

        <UsesRow uses={consumer.uses.slice(0, 4)} />

        <footer className="mt-auto flex items-center justify-between gap-ds-02 pt-ds-03 border-t border-surface-border-subtle">
          <span className="text-ds-xs font-mono text-surface-fg-subtle">
            @{consumer.version}
          </span>
          {consumer.href ? (
            <Link
              href={consumer.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-ds-01 text-ds-xs text-surface-fg hover:text-accent-11 transition-colors duration-fast-01"
            >
              Visit
              <IconArrowUpRight
                size={12}
                aria-hidden
                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-fast-02 ease-productive-standard"
              />
            </Link>
          ) : (
            <span className="text-ds-xs text-surface-fg-subtle italic">No public URL</span>
          )}
        </footer>
      </div>
    </article>
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
