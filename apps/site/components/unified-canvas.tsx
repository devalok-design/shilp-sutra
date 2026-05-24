'use client'

import { useState, type CSSProperties } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import Link from 'next/link'
import { IconArrowUpRight, IconMoon, IconSun } from '@tabler/icons-react'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Text } from '@devalok/shilp-sutra/ui/text'
import { AtlasShowcase } from '@/content/showcase/atlas'
import { DevalokShowcase } from '@/content/showcase/devalok'
import { LendisShowcase } from '@/content/showcase/lendis'
import { MiraShowcase } from '@/content/showcase/mira'
import { PatrikaShowcase } from '@/content/showcase/patrika'
import { VaidyaShowcase } from '@/content/showcase/vaidya'
import { generateRamp } from '@/lib/ramp-generator'

type CanvasMode = 'light' | 'dark'

type Surface = {
  slug: string
  industry: string
  product: string
  tagline: string
  hue: number
  chroma: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: () => any
}

const SURFACES: Surface[] = [
  { slug: 'atlas', industry: 'SaaS', product: 'Atlas', tagline: 'Workspaces for distributed teams', hue: 245, chroma: 0.19, Component: AtlasShowcase },
  { slug: 'lendis', industry: 'Fintech', product: 'Lendis', tagline: 'KYC + lending end-to-end', hue: 145, chroma: 0.16, Component: LendisShowcase },
  { slug: 'mira', industry: 'D2C', product: 'Mira', tagline: 'Slow-made textiles', hue: 55, chroma: 0.18, Component: MiraShowcase },
  { slug: 'vaidya', industry: 'Healthcare', product: 'Vaidya', tagline: 'A clinic in your pocket', hue: 200, chroma: 0.15, Component: VaidyaShowcase },
  { slug: 'patrika', industry: 'Editorial', product: 'Patrika', tagline: 'Long-form journalism', hue: 15, chroma: 0.2, Component: PatrikaShowcase },
  { slug: 'devalok', industry: 'Studio', product: 'Devalok', tagline: 'The house brand', hue: 360, chroma: 0.19, Component: DevalokShowcase },
]

function rampInlineStyle(hue: number, chroma: number): CSSProperties {
  const ramp = generateRamp(hue, chroma)
  const style: Record<string, string> = {}
  ramp.light.forEach((s) => {
    style[`--color-accent-${s.step}`] = s.value
  })
  const accent9L = Number.parseFloat(ramp.light[8].value.match(/oklch\(\s*([0-9.]+)/)?.[1] ?? '0.55')
  style['--color-accent-fg'] = accent9L < 0.62 ? 'oklch(0.99 0 0)' : 'oklch(0.13 0 0)'
  return style as CSSProperties
}

/**
 * Unified canvas — six industry surfaces in one frame.
 *
 * Tab strip switches between them with a sliding accent-pill indicator and
 * a crossfade on the content. Each surface wraps in its own brand-scoped
 * CSS-var override + canvas-light/dark class so the same one frame can be
 * pink Devalok, indigo Atlas, saffron Mira, or teal Vaidya without
 * affecting the surrounding page.
 *
 * Replaces what used to be two separate sections (LandingSurface +
 * BrandShowcase) — same job, one cleaner experience.
 */
export function UnifiedCanvas() {
  const [activeSlug, setActiveSlug] = useState<string>('atlas')
  const [mode, setMode] = useState<CanvasMode>('light')

  const active = SURFACES.find((s) => s.slug === activeSlug) ?? SURFACES[0]
  const ActiveComponent = active.Component
  const next: CanvasMode = mode === 'light' ? 'dark' : 'light'

  return (
    <section id="canvas" className="mx-auto max-w-6xl px-ds-page-x py-ds-12">
      <header className="flex flex-col gap-ds-03 max-w-3xl mb-ds-06">
        <div className="text-ds-xs text-surface-fg-subtle uppercase tracking-wide">
          See it run · six industries
        </div>
        <h2 className="text-[length:var(--typo-heading-xl-size)] font-[number:var(--typo-heading-xl-weight)] leading-[var(--typo-heading-xl-leading)] tracking-[var(--typo-heading-xl-tracking)] text-surface-fg text-balance">
          One library. Six worlds. One frame.
        </h2>
        <p className="text-ds-md text-surface-fg-muted leading-relaxed max-w-2xl">
          Each tab is a real product surface, built from shilp-sutra and recoloured by an
          industry-appropriate brand. Switch between them — the same components carry every
          context. Press play, click around, watch the state machines breathe.
        </p>
      </header>

      <div
        className={[
          mode === 'dark' ? 'canvas-dark dark' : 'canvas-light',
          'rounded-ds-lg border border-surface-border bg-surface-base overflow-hidden',
        ].join(' ')}
        style={rampInlineStyle(active.hue, active.chroma)}
      >
        {/* Chrome */}
        <div className="flex items-center justify-between gap-ds-03 px-ds-05 py-ds-03 bg-surface-raised border-b border-surface-border-subtle">
          <div className="flex items-center gap-ds-03 min-w-0">
            <span className="flex items-center gap-1 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-error-9" />
              <span className="w-2.5 h-2.5 rounded-full bg-warning-9" />
              <span className="w-2.5 h-2.5 rounded-full bg-success-9" />
            </span>
            <span className="flex items-center gap-ds-02 min-w-0">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={active.slug}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="text-ds-md text-surface-fg font-semibold"
                >
                  {active.product}
                </motion.span>
              </AnimatePresence>
              <span className="text-ds-xs text-surface-fg-subtle hidden sm:inline">
                · {active.tagline}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-ds-02 shrink-0">
            <Link
              href={`/showcase/${active.slug}`}
              className="hidden sm:inline-flex items-center gap-ds-02 text-ds-xs text-surface-fg-muted hover:text-surface-fg transition-colors duration-fast-02 ease-productive-standard"
            >
              Open standalone
              <IconArrowUpRight size={12} />
            </Link>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Switch canvas to ${next} mode`}
              onClick={() => setMode(next)}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mode}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="inline-flex"
                >
                  {mode === 'light' ? <IconMoon size={14} /> : <IconSun size={14} />}
                </motion.span>
              </AnimatePresence>
            </Button>
          </div>
        </div>

        {/* Tab strip */}
        <LayoutGroup id="canvas-tabs">
          <div
            role="tablist"
            aria-label="Industry showcases"
            className="flex items-center gap-ds-01 px-ds-03 py-ds-02 border-b border-surface-border-subtle overflow-x-auto"
          >
            {SURFACES.map((s) => {
              const isActive = s.slug === activeSlug
              return (
                <button
                  key={s.slug}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveSlug(s.slug)}
                  className={[
                    'group/tab relative z-[1] inline-flex items-center gap-ds-02 px-ds-03 py-ds-02 rounded-ds-md text-ds-sm transition-colors duration-fast-02 ease-productive-standard shrink-0',
                    'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9',
                    isActive ? 'text-surface-fg' : 'text-surface-fg-subtle hover:text-surface-fg',
                  ].join(' ')}
                  style={
                    isActive
                      ? undefined
                      : ({ '--swatch-bg': `oklch(0.55 ${s.chroma} ${s.hue})` } as CSSProperties)
                  }
                >
                  {isActive && (
                    <motion.span
                      layoutId="canvas-tab-pill"
                      className="absolute inset-0 rounded-ds-md bg-surface-raised border border-surface-border-strong shadow-raised"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span
                    className="relative z-[1] w-2.5 h-2.5 rounded-full"
                    style={{ background: `oklch(0.55 ${s.chroma} ${s.hue})` }}
                  />
                  <span className="relative z-[1] font-medium">{s.product}</span>
                  <span className="relative z-[1] text-ds-xs text-surface-fg-subtle hidden md:inline">
                    {s.industry}
                  </span>
                </button>
              )
            })}
          </div>
        </LayoutGroup>

        {/* Body */}
        <div className="bg-surface-base p-ds-06 lg:p-ds-08 min-h-[420px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${active.slug}-${mode}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.2, 0, 0.38, 0.9] }}
            >
              <ActiveComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <footer className="mt-ds-05 flex flex-wrap items-center justify-between gap-ds-03">
        <Text variant="body-sm" className="text-surface-fg-muted">
          Same components in every tab. Only the accent ramp changes.
        </Text>
        <Link
          href={`/theming?hue=${active.hue}&chroma=${active.chroma}`}
          className="inline-flex items-center gap-ds-02 text-ds-sm text-accent-11 hover:underline underline-offset-2"
        >
          Take {active.product}&apos;s brand into the editor
          <IconArrowUpRight size={14} />
        </Link>
      </footer>
    </section>
  )
}
