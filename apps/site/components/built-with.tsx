'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import { IconArrowRight } from '@tabler/icons-react'
import { KarmLogo } from '@devalok/shilp-sutra-brand/karm'
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
 * Built-with section — Karm, the studio's own project tool, carrying
 * shilp-sutra in daily use.
 *
 * One featured card, tinted with Karm's own accent ramp via inline
 * CSS-vars so the card itself shows the brand-swap the site sells: the
 * same library, re-skinned per product.
 *
 * Dark-mode: relies on semantic surface-* and accent-* tokens which DS
 * remaps in .dark scope, plus useBrandRamp() picking the matching OKLCH
 * stops for the live theme.
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
  /** Status signal — "Daily use", "Public beta", "Internal", "Open · MIT". */
  status: string
  /** 3-6 shilp-sutra component names this product leans on most. */
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
  status: 'Daily use, 8 hours a day',
  uses: ['Sidebar', 'TopBar', 'DataTable', 'ActivityFeed', 'CommandPalette', 'Sheet'],
  hue: 360,
  chroma: 0.19,
}

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
      className="relative overflow-hidden rounded-surface border border-accent-7 bg-accent-2"
    >
      <div className="relative grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-ds-06 lg:gap-ds-08 p-ds-05 sm:p-ds-06 lg:p-ds-08">
        {/* Left — identity + pitch */}
        <div className="flex flex-col gap-ds-05 min-w-0">
          <div className="flex items-center gap-ds-03 min-w-0">
            <KarmLogo type="icon" color="auto" size="md" aria-hidden className="shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-ds-xs text-accent-11 truncate">
                {consumer.type} · {consumer.status}
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
            <span className="text-ds-xs text-surface-fg-subtle">What it leans on</span>
            <UsesRow uses={consumer.uses} />
          </div>

          <div className="flex flex-wrap items-center gap-ds-03 pt-ds-02">
            <Link href="/docs">
              <Button variant="solid" size="md" endIcon={<IconArrowRight size={14} />}>
                Install it the way Karm does
              </Button>
            </Link>
            <span className="text-ds-xs font-mono text-surface-fg-subtle">
              shilp-sutra@{consumer.version}
            </span>
          </div>
        </div>

        {/* Right — visual brand evidence. Below sm the mock chrome stacks
            below the identity; on md+ it sits in its own column. */}
        <div className="flex flex-col gap-ds-04 justify-between min-w-0">
          <div className="flex flex-col gap-ds-03">
            <span className="text-ds-xs text-surface-fg-subtle">The brand it wears</span>
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
              <span className="text-ds-xs font-mono text-surface-fg-subtle truncate">
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

export function BuiltWith() {
  return (
    <section className="mx-auto max-w-6xl px-page-x py-ds-12">
      <div className="flex flex-col gap-ds-08">
        <div className="flex flex-col items-center gap-ds-03 max-w-3xl mx-auto text-center">
          <Text variant="heading-xl" className="text-surface-fg text-balance">
            Devalok ships its own tools on it.
          </Text>
          <Text variant="body-md" className="text-surface-fg-muted max-w-2xl">
            Karm is our studio&apos;s own project tool. We use it every day, built on
            shilp-sutra top to bottom.
          </Text>
        </div>

        <FeaturedCard consumer={KARM} />
      </div>
    </section>
  )
}
