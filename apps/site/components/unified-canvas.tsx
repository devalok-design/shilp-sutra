'use client'

import { useRef, useState, type CSSProperties } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import Link from 'next/link'
import { IconArrowUpRight, IconChevronLeft, IconChevronRight, IconMoon, IconSun } from '@tabler/icons-react'
import { Button } from '@devalok/shilp-sutra/ui/button'
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
 * Discoverability layered three ways:
 *   1. Heading row spells out all six industries inline next to the title
 *      so the breadth is unmissable above the fold of the canvas.
 *   2. Tab strip uses card-shaped tabs with brand swatch + product +
 *      industry — feels like a channel switcher, not a text link list.
 *   3. Prev / Next chrome buttons let visitors cycle without aiming at
 *      specific tabs. Counter '1 / 6' anchors progress.
 *
 * Transitions: direction-aware slide (left when moving back, right when
 * forward), AnimatePresence with custom prop, plus a brand-coloured
 * border halo pulse the moment a tab swap fires so the eye registers
 * which brand just arrived.
 */
export function UnifiedCanvas() {
  const [activeIdx, setActiveIdx] = useState<number>(0)
  const [mode, setMode] = useState<CanvasMode>('light')
  const prevIdx = useRef<number>(0)
  const direction = activeIdx >= prevIdx.current ? 1 : -1

  const active = SURFACES[activeIdx]
  const ActiveComponent = active.Component
  const next: CanvasMode = mode === 'light' ? 'dark' : 'light'

  const goTo = (idx: number) => {
    prevIdx.current = activeIdx
    setActiveIdx(((idx % SURFACES.length) + SURFACES.length) % SURFACES.length)
  }

  return (
    <section id="canvas" className="mx-auto max-w-6xl px-ds-page-x py-ds-12">
      <header className="flex flex-col gap-ds-04 max-w-3xl mb-ds-06">
        <span className="text-ds-xs text-surface-fg-subtle uppercase tracking-wide">
          See it run · pick an industry
        </span>
        <h2 className="text-[length:var(--typo-heading-xl-size)] font-[number:var(--typo-heading-xl-weight)] leading-[var(--typo-heading-xl-leading)] tracking-[var(--typo-heading-xl-tracking)] text-surface-fg text-balance">
          One library. Six worlds. One frame.
        </h2>
        <p className="text-ds-md text-surface-fg-muted leading-relaxed max-w-2xl">
          The same shilp-sutra components rendered six different ways. Press a tab — or use the
          arrow buttons — to switch industries. Watch the brand recolour every surface as you go.
        </p>
        {/* Six swatches inline — at-a-glance proof there are six surfaces below */}
        <ul aria-label="Available industries" className="flex flex-wrap items-center gap-ds-03 mt-ds-02">
          {SURFACES.map((s, i) => (
            <li key={s.slug}>
              <button
                type="button"
                onClick={() => goTo(i)}
                className="group/peek inline-flex items-center gap-ds-02 text-ds-xs text-surface-fg-muted hover:text-surface-fg transition-colors duration-fast-02 ease-productive-standard"
                aria-label={`Switch to ${s.product}`}
              >
                <span
                  aria-hidden
                  className="w-3 h-3 rounded-full ring-1 ring-surface-border-subtle transition-transform duration-fast-02 ease-productive-standard group-hover/peek:scale-110"
                  style={{ background: `oklch(0.55 ${s.chroma} ${s.hue})` }}
                />
                <span className="font-medium">{s.product}</span>
                <span className="text-surface-fg-subtle">{s.industry}</span>
              </button>
            </li>
          ))}
        </ul>
      </header>

      <motion.div
        animate={{
          boxShadow: [
            `0 0 0 0 oklch(0.55 ${active.chroma} ${active.hue} / 0)`,
            `0 0 0 6px oklch(0.55 ${active.chroma} ${active.hue} / 0.18)`,
            `0 0 0 0 oklch(0.55 ${active.chroma} ${active.hue} / 0)`,
          ],
        }}
        transition={{ duration: 0.7, times: [0, 0.4, 1], ease: [0.2, 0, 0.38, 0.9] }}
        key={`halo-${active.slug}`}
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

        {/* Tab strip — card-shaped tabs, channel-switcher feel */}
        <div className="flex items-stretch border-b border-surface-border-subtle bg-surface-raised">
          <button
            type="button"
            onClick={() => goTo(activeIdx - 1)}
            className="px-ds-03 text-surface-fg-muted hover:text-surface-fg hover:bg-surface-raised-hover transition-colors duration-fast-02 ease-productive-standard focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9"
            aria-label="Previous industry"
          >
            <IconChevronLeft size={16} />
          </button>

          <LayoutGroup id="canvas-tabs-v2">
            <div
              role="tablist"
              aria-label="Industry showcases"
              className="flex items-stretch flex-1 overflow-x-auto"
            >
              {SURFACES.map((s, i) => {
                const isActive = i === activeIdx
                return (
                  <button
                    key={s.slug}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => goTo(i)}
                    className={[
                      'group/tab relative flex flex-col items-start gap-ds-01 px-ds-04 py-ds-03 min-w-[8.5rem] text-left transition-colors duration-fast-02 ease-productive-standard shrink-0',
                      'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9',
                      isActive ? 'text-surface-fg bg-surface-base' : 'text-surface-fg-muted hover:bg-surface-raised-hover',
                    ].join(' ')}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="canvas-tab-underline"
                        className="absolute left-0 right-0 bottom-0 h-0.5"
                        style={{ background: `oklch(0.55 ${s.chroma} ${s.hue})` }}
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <div className="flex items-center gap-ds-02">
                      <span
                        aria-hidden
                        className={[
                          'w-2.5 h-2.5 rounded-full transition-transform duration-fast-02 ease-productive-standard',
                          isActive ? 'scale-110 ring-2 ring-offset-1 ring-offset-surface-base' : '',
                        ].join(' ')}
                        style={
                          isActive
                            ? ({ background: `oklch(0.55 ${s.chroma} ${s.hue})`, '--tw-ring-color': `oklch(0.55 ${s.chroma} ${s.hue})` } as CSSProperties)
                            : { background: `oklch(0.55 ${s.chroma} ${s.hue})` }
                        }
                      />
                      <span className="text-ds-sm font-semibold">{s.product}</span>
                    </div>
                    <span className="text-ds-xs text-surface-fg-subtle">{s.industry}</span>
                  </button>
                )
              })}
            </div>
          </LayoutGroup>

          <div className="hidden md:flex items-center px-ds-03 text-ds-xs text-surface-fg-subtle font-mono border-l border-surface-border-subtle shrink-0">
            {activeIdx + 1} / {SURFACES.length}
          </div>

          <button
            type="button"
            onClick={() => goTo(activeIdx + 1)}
            className="px-ds-03 text-surface-fg-muted hover:text-surface-fg hover:bg-surface-raised-hover transition-colors duration-fast-02 ease-productive-standard focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9"
            aria-label="Next industry"
          >
            <IconChevronRight size={16} />
          </button>
        </div>

        {/* Body — direction-aware slide */}
        <div className="relative bg-surface-base p-ds-06 lg:p-ds-08 min-h-[420px] overflow-hidden">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={`${active.slug}-${mode}`}
              custom={direction}
              initial={{ opacity: 0, x: direction * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -24 }}
              transition={{ duration: 0.26, ease: [0.2, 0, 0.38, 0.9] }}
            >
              <ActiveComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      <footer className="mt-ds-05 flex flex-wrap items-center justify-between gap-ds-03">
        <p className="text-ds-sm text-surface-fg-muted">
          Same components in every tab. Only the accent ramp changes.
        </p>
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
