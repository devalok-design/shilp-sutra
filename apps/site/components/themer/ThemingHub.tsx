'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import { IconArrowUpRight, IconCheck, IconCopy, IconFingerprint } from '@tabler/icons-react'
import { Text } from '@devalok/shilp-sutra/ui/text'

import { InstallTabs } from '../install-tabs'
import { ThemePreviewApp } from './ThemePreviewApp'
import {
  type ArchetypeName,
  ARCHETYPE_TITLES,
  suggestArchetypeByHue,
} from '@/lib/archetype-presets'
import { deriveAccentFg, generateRamp } from '@/lib/ramp-generator'
import { generateThemerCss } from '@/lib/themer-css'
import { type ThemerState, parseThemerParams } from '@/lib/themer-state'

const HUE_PRESETS = [
  { name: 'Devalok pink', hue: 360, chroma: 0.19 },
  { name: 'Crimson', hue: 15, chroma: 0.2 },
  { name: 'Saffron', hue: 50, chroma: 0.18 },
  { name: 'Forest', hue: 145, chroma: 0.16 },
  { name: 'Sage', hue: 155, chroma: 0.14 },
  { name: 'Teal', hue: 200, chroma: 0.16 },
  { name: 'Cobalt', hue: 245, chroma: 0.2 },
  { name: 'Indigo', hue: 265, chroma: 0.19 },
  { name: 'Aubergine', hue: 310, chroma: 0.18 },
]

const ARCHETYPE_ORDER: ArchetypeName[] = [
  'linear',
  'stripe',
  'apple',
  'material',
  'notion',
  'vercel',
  'devalok',
]

const ARCHETYPE_ACCENT: Record<ArchetypeName, { hue: number; chroma: number }> = {
  linear: { hue: 270, chroma: 0.18 },
  stripe: { hue: 250, chroma: 0.2 },
  apple: { hue: 220, chroma: 0.15 },
  material: { hue: 95, chroma: 0.12 },
  notion: { hue: 30, chroma: 0.06 },
  vercel: { hue: 0, chroma: 0.01 },
  devalok: { hue: 340, chroma: 0.19 },
}

/** Row descriptor for the archetype picker — shape + density + border weight, per archetype default. */
const ARCHETYPE_ROW_DESCRIPTOR: Record<ArchetypeName, string> = {
  linear: 'Sharp + compact + hairline borders',
  stripe: 'Slightly-rounded + comfortable + crisp borders',
  apple: 'Rounded + spacious + hairline borders',
  material: 'Rounded + comfortable + crisp borders',
  notion: 'Slightly-rounded + spacious + crisp borders',
  vercel: 'Sharp + compact + crisp borders',
  devalok: 'Slightly-rounded + comfortable + crisp borders',
}

const DEFAULT_STATE: ThemerState = { archetype: 'devalok', hue: 340, chroma: 0.19 }

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/**
 * Track the site's `.dark` class on <html> so the live preview picks the
 * matching surface + accent ramp. The ThemeToggle flips this class at runtime,
 * so we observe it rather than reading once. Lazy-init reads the class directly
 * (this component only renders client-side — it sits behind the page's
 * useSearchParams Suspense boundary), avoiding a light-card flash in dark mode.
 */
function useIsDark(): boolean {
  const [isDark, setIsDark] = React.useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  )
  React.useEffect(() => {
    const el = document.documentElement
    const update = () => setIsDark(el.classList.contains('dark'))
    update()
    const observer = new MutationObserver(update)
    observer.observe(el, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])
  return isDark
}

/**
 * Crude hex → OKLCH-hue approximation. Good enough to pick a hue band
 * (which is all we need to suggest an archetype).
 */
function hexToHue(hex: string): number | null {
  const m = hex.trim().match(/^#?([a-f0-9]{6}|[a-f0-9]{3})$/i)
  if (!m) return null
  let h = m[1]
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  if (d === 0) return 0
  let hue = 0
  if (max === r) hue = ((g - b) / d) % 6
  else if (max === g) hue = (b - r) / d + 2
  else hue = (r - g) / d + 4
  hue *= 60
  if (hue < 0) hue += 360
  return Math.round(hue)
}

/**
 * One page, two tabs, one shared live preview + CSS export below. "Use my
 * brand color" drives the hue/chroma/radius controls; "Pick an archetype"
 * swaps the whole role-token set (radius/spacing/border/shadow/type). Both
 * tabs write into the same ThemerState, so the preview and export panel
 * update no matter which door was used.
 *
 * Query-param contract is unchanged from the old /themer/result page
 * (archetype/hue/chroma/density/shape/motion) — anything that used to
 * deep-link there (including redirected old URLs, and the showcase cards'
 * `?hue=&chroma=` links) still lands on the right state here.
 */
export function ThemingHub() {
  const searchParams = useSearchParams()
  const initial = React.useMemo(() => parseThemerParams(searchParams), [searchParams])

  const [mode, setMode] = React.useState<'brand' | 'archetype'>('brand')
  const [state, setState] = React.useState<ThemerState>(() => ({
    ...DEFAULT_STATE,
    ...initial,
  }))
  const [hex, setHex] = React.useState('#d946a6')
  const [copiedCss, setCopiedCss] = React.useState(false)
  const [copiedPrompt, setCopiedPrompt] = React.useState(false)
  const [outputTab, setOutputTab] = React.useState<'css' | 'prompt'>('css')
  const exportRef = React.useRef<HTMLDivElement>(null)

  const archetype = state.archetype ?? 'devalok'
  const hue = state.hue ?? 340
  const chroma = state.chroma ?? 0.19

  const isDark = useIsDark()
  const ramp = React.useMemo(() => generateRamp(hue, chroma), [hue, chroma])

  const liveSampleStyle = React.useMemo(() => {
    const style: Record<string, string> = {}
    // Inject the ramp for the CURRENT theme — the light ramp on a dark surface
    // washes accent-tinted elements (Beta badge, brand notice) out to near-white.
    const activeRamp = isDark ? ramp.dark : ramp.light
    activeRamp.forEach((s) => {
      style[`--color-accent-${s.step}`] = s.value
    })
    style['--color-accent-fg'] = deriveAccentFg(activeRamp[8].value)
    if (state.customRadius != null) {
      style['--radius-control'] = `${state.customRadius}px`
      style['--radius-surface'] = `${Math.round(state.customRadius * 1.6)}px`
      style['--radius-control-inner'] = `${Math.max(state.customRadius - 2, 0)}px`
    }
    return style as React.CSSProperties
  }, [ramp, state.customRadius, isDark])
  const css = React.useMemo(() => generateThemerCss(state), [state])
  // Ready-to-paste prompt for an AI editor (Cursor/Claude/Copilot) — wraps the
  // generated CSS in an instruction so the agent applies the theme end-to-end.
  const agentPrompt = React.useMemo(
    () =>
      `Apply this brand theme to my shilp-sutra app. Paste the CSS below into my global stylesheet, right after the \`@import "@devalok/shilp-sutra/css";\` line, so every component picks up the accent ramp and radius:\n\n${css}`,
    [css],
  )

  const applyHex = (value: string) => {
    setHex(value)
    const h = hexToHue(value)
    if (h == null) return
    const suggestion = suggestArchetypeByHue(h)
    setState((s) => ({ ...s, hue: h, archetype: suggestion.name }))
  }

  const resetToDevalok = () => {
    setHex('#d946a6')
    setState({ ...DEFAULT_STATE })
  }

  const copyRampCss = async () => {
    try {
      await navigator.clipboard.writeText(css)
      setCopiedCss(true)
      setTimeout(() => setCopiedCss(false), 1800)
    } catch {
      // clipboard blocked — no fallback noise
    }
  }

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(agentPrompt)
      setCopiedPrompt(true)
      setTimeout(() => setCopiedPrompt(false), 1800)
    } catch {
      // clipboard blocked — no fallback noise
    }
  }

  const scrollToExport = () => {
    exportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex flex-col gap-ds-09">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-ds-08 items-start">
        <section className="flex flex-col gap-ds-05 rounded-surface border border-surface-border-subtle bg-surface-panel p-ds-06 lg:sticky lg:top-24">
            <StepLabel n={1} title="Pick your colour" />
            <div role="tablist" aria-label="Theming mode" className="flex items-center gap-ds-05 border-b border-surface-border-subtle">
              {(
                [
                  { key: 'brand', label: 'Use my brand color' },
                  { key: 'archetype', label: 'Pick an archetype' },
                ] as const
              ).map((tab) => {
                const isActive = mode === tab.key
                return (
                  <button
                    key={tab.key}
                    role="tab"
                    aria-selected={isActive}
                    type="button"
                    onClick={() => setMode(tab.key)}
                    className={[
                      'px-ds-01 py-ds-03 text-ds-sm font-medium border-b-2 -mb-px transition-colors duration-fast-01',
                      isActive
                        ? 'border-accent-9 text-surface-fg'
                        : 'border-transparent text-surface-fg-muted hover:text-surface-fg',
                    ].join(' ')}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {mode === 'brand' ? (
              <div className="flex flex-col gap-ds-05">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-04">
                  <div className="flex flex-col gap-ds-03">
                    <label htmlFor="brand-hex" className="text-ds-sm font-medium text-surface-fg">
                      Brand color
                    </label>
                    <div className="flex items-center gap-ds-03">
                      <input
                        id="brand-hex"
                        type="text"
                        value={hex}
                        onChange={(e) => setHex(e.target.value)}
                        onBlur={(e) => applyHex(e.target.value)}
                        className="flex-1 rounded-control border border-surface-border-subtle bg-surface-panel px-ds-03 py-ds-02 text-ds-md font-mono text-surface-fg focus:outline-hidden focus:ring-2 focus:ring-accent-9"
                        placeholder="#d946a6"
                      />
                      <input
                        type="color"
                        value={hex.match(/^#?[a-f0-9]{6}$/i) ? hex : '#d946a6'}
                        onChange={(e) => applyHex(e.target.value)}
                        aria-label="Color picker"
                        className="h-ds-md w-ds-md rounded-control border border-surface-border-subtle"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-ds-03">
                    <label htmlFor="corner-radius" className="text-ds-sm font-medium text-surface-fg">
                      Corner radius
                    </label>
                    <div className="flex items-center gap-ds-03">
                      <span
                        aria-hidden
                        className="h-ds-md w-ds-md shrink-0 border-2 border-surface-fg bg-surface-panel"
                        style={{ borderRadius: `${state.customRadius ?? 8}px` }}
                      />
                      <input
                        id="corner-radius"
                        type="number"
                        min={0}
                        max={64}
                        value={state.customRadius ?? ''}
                        onChange={(e) => {
                          const v = e.target.value === '' ? undefined : Number(e.target.value)
                          setState((s) => ({ ...s, customRadius: v }))
                        }}
                        placeholder="Auto"
                        className="flex-1 rounded-control border border-surface-border-subtle bg-surface-panel px-ds-03 py-ds-02 text-ds-md font-mono text-surface-fg focus:outline-hidden focus:ring-2 focus:ring-accent-9"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-ds-xs text-surface-fg-subtle -mt-ds-02">
                  Your colour sets the hue and picks a matching archetype. Leave radius blank
                  to use the archetype default.
                </p>

                <SliderField
                  label="Hue"
                  valueLabel={`${Math.round(hue)}°`}
                  min={0}
                  max={360}
                  step={1}
                  value={hue}
                  onChange={(v) => setState((s) => ({ ...s, hue: v }))}
                  track="linear-gradient(to right, oklch(0.65 0.18 0), oklch(0.7 0.18 60), oklch(0.78 0.18 120), oklch(0.75 0.18 180), oklch(0.65 0.18 240), oklch(0.6 0.18 300), oklch(0.65 0.18 360))"
                />
                <SliderField
                  label="Chroma"
                  valueLabel={chroma.toFixed(2)}
                  min={0.03}
                  max={0.3}
                  step={0.005}
                  value={chroma}
                  onChange={(v) => setState((s) => ({ ...s, chroma: v }))}
                  track={`linear-gradient(to right, oklch(0.55 0 ${hue}), oklch(0.55 0.3 ${hue}))`}
                />

                <div className="flex flex-col gap-ds-03">
                  <Text variant="label-sm" className="text-surface-fg-subtle">
                    Quick picks
                  </Text>
                  <div className="flex flex-wrap gap-ds-02">
                    {HUE_PRESETS.map((p) => {
                      const isActive = p.hue === hue && Math.abs(p.chroma - chroma) < 0.005
                      return (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => setState((s) => ({ ...s, hue: p.hue, chroma: p.chroma }))}
                          className={[
                            'inline-flex items-center gap-ds-02 px-ds-03 py-ds-02 rounded-control border text-ds-xs transition-colors duration-fast-01',
                            isActive
                              ? 'border-accent-9 bg-accent-3 text-accent-11'
                              : 'border-surface-border-subtle bg-surface-panel text-surface-fg-muted hover:border-surface-border',
                          ].join(' ')}
                        >
                          <span
                            aria-hidden
                            className="w-3 h-3 rounded-pill"
                            style={{ background: `oklch(0.55 ${p.chroma} ${p.hue})` }}
                          />
                          {p.name}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetToDevalok}
                  className="inline-flex items-center gap-ds-02 self-start text-ds-sm text-surface-fg-muted hover:text-surface-fg"
                >
                  ↻ Reset to Devalok
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-ds-02 rounded-control border border-surface-border-subtle bg-surface-sunken p-ds-02">
                {ARCHETYPE_ORDER.map((name) => {
                  const isActive = archetype === name
                  const accent = ARCHETYPE_ACCENT[name]
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setState((s) => ({ ...s, archetype: name, ...accent }))}
                      className={[
                        'flex items-center gap-ds-07 px-ds-06 py-ds-05 rounded-control border text-left transition-colors duration-fast-01',
                        isActive
                          ? 'border-surface-border bg-surface-panel shadow-raised'
                          : 'border-surface-border-subtle bg-transparent hover:bg-surface-panel-hover/60',
                      ].join(' ')}
                    >
                      <span
                        aria-hidden
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-surface-panel border border-surface-border-subtle text-surface-fg"
                      >
                        <IconFingerprint size={16} />
                      </span>
                      <span className="flex flex-col gap-ds-02">
                        <span className="text-ds-xs text-surface-fg-subtle">{capitalize(name)}</span>
                        <span className="text-ds-xl font-semibold text-surface-fg">
                          {ARCHETYPE_TITLES[name].replace(/\.$/, '')}
                        </span>
                        <span className="text-ds-md text-surface-fg-muted">
                          {ARCHETYPE_ROW_DESCRIPTOR[name]}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
        </section>

        {/* STEP 2 — see it on a real screen */}
        <section className="flex flex-col gap-ds-04">
          <StepLabel n={2} title="See it on a real screen" />
          <p className="text-ds-sm text-surface-fg-muted">
            A real product screen, recoloured live. Move the slider and watch it follow.
          </p>
          <ThemePreviewApp style={liveSampleStyle} />
          <button
            type="button"
            onClick={scrollToExport}
            className="inline-flex w-fit items-center gap-ds-01 text-ds-sm text-accent-11 hover:text-accent-12"
          >
            Looks right? Ship it <IconArrowUpRight size={14} />
          </button>
        </section>
      </div>

      {/* STEP 3 — ship it: CSS or AI-prompt, one paste */}
      <section
        ref={exportRef}
        className="flex scroll-mt-24 flex-col gap-ds-05 rounded-surface border border-surface-border-subtle bg-surface-panel p-ds-06"
      >
        <StepLabel n={3} title="Ship it" />
        <p className="text-ds-sm text-surface-fg-muted">
          Copy the CSS into your stylesheet, or hand the prompt to your AI editor. One paste and
          every component follows.
        </p>

        <div role="tablist" aria-label="Output format" className="flex items-center gap-ds-05 border-b border-surface-border-subtle">
          {(
            [
              { key: 'css', label: 'Copy CSS' },
              { key: 'prompt', label: 'Copy AI prompt' },
            ] as const
          ).map((tab) => {
            const isActive = outputTab === tab.key
            return (
              <button
                key={tab.key}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => setOutputTab(tab.key)}
                className={[
                  '-mb-px border-b-2 px-ds-01 py-ds-03 text-ds-sm font-medium transition-colors duration-fast-01',
                  isActive
                    ? 'border-accent-9 text-surface-fg'
                    : 'border-transparent text-surface-fg-muted hover:text-surface-fg',
                ].join(' ')}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={outputTab === 'css' ? copyRampCss : copyPrompt}
            className="absolute right-ds-03 top-ds-03 z-10 inline-flex items-center gap-ds-02 rounded-control border border-surface-border-subtle bg-surface-panel px-ds-03 py-ds-01 text-ds-xs font-medium text-surface-fg-muted transition-colors duration-fast-01 hover:text-surface-fg"
          >
            {(outputTab === 'css' ? copiedCss : copiedPrompt) ? (
              <IconCheck size={13} />
            ) : (
              <IconCopy size={13} />
            )}
            {(outputTab === 'css' ? copiedCss : copiedPrompt) ? 'Copied' : 'Copy'}
          </button>
          <pre className="max-h-72 overflow-auto rounded-control border border-surface-border-subtle bg-surface-base p-ds-04 pr-ds-10 text-ds-xs font-mono leading-relaxed text-surface-fg-muted">
            <code>{outputTab === 'css' ? css : agentPrompt}</code>
          </pre>
        </div>

        {outputTab === 'css' ? (
          <div className="flex flex-col gap-ds-04">
            <Text variant="body-sm" className="text-surface-fg-subtle">
              Paste after your{' '}
              <code className="font-mono text-surface-fg">@import &quot;@devalok/shilp-sutra/css&quot;</code>{' '}
              line. Need radius, fonts, or spacing? See the{' '}
              <a href="/docs/customize-brand" className="underline underline-offset-2 hover:text-surface-fg">
                customize-brand recipe
              </a>
              .
            </Text>
            <InstallTabs />
          </div>
        ) : (
          <Text variant="body-sm" className="text-surface-fg-subtle">
            Paste this into Cursor, Claude, or Copilot. It installs nothing new — it just themes the
            shilp-sutra components you are already using.
          </Text>
        )}
      </section>
    </div>
  )
}

function StepLabel({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-ds-03">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-pill bg-accent-9 text-ds-xs font-bold text-accent-fg">
        {n}
      </span>
      <Text variant="heading-sm" className="text-surface-fg">
        {title}
      </Text>
    </div>
  )
}

function SliderField({
  label,
  valueLabel,
  min,
  max,
  step,
  value,
  onChange,
  track,
}: {
  label: string
  valueLabel: string
  min: number
  max: number
  step: number
  value: number
  onChange: (v: number) => void
  track: string
}) {
  return (
    <label className="flex flex-col gap-ds-02">
      <span className="flex items-center justify-between">
        <span className="text-ds-sm text-surface-fg-muted">{label}</span>
        <span className="text-ds-sm font-mono text-surface-fg">{valueLabel}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number.parseFloat(e.target.value))}
        className="w-full h-3 sm:h-2 appearance-none rounded-pill cursor-pointer touch-none outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 sm:[&::-webkit-slider-thumb]:w-4 sm:[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-pill [&::-webkit-slider-thumb]:bg-surface-overlay [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-surface-fg [&::-webkit-slider-thumb]:shadow-raised [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 sm:[&::-moz-range-thumb]:w-4 sm:[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-pill [&::-moz-range-thumb]:bg-surface-overlay [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-surface-fg"
        style={{ background: track }}
      />
    </label>
  )
}
