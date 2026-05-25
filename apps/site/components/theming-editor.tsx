'use client'

import { useEffect, useMemo, useState } from 'react'
import { IconCheck, IconCopy, IconRotateClockwise } from '@tabler/icons-react'
import { Badge } from '@devalok/shilp-sutra/ui/badge'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Text } from '@devalok/shilp-sutra/ui/text'
import { generateRamp, rampToCss } from '@/lib/ramp-generator'

const STORAGE_KEY = 'shilp-sutra:custom-brand'
const CUSTOM_STYLE_ID = 'ss-custom-brand'

type EditorState = {
  hue: number
  chroma: number
}

const DEFAULT_STATE: EditorState = {
  hue: 360,
  chroma: 0.19,
}

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

function readPersisted(): EditorState {
  if (typeof window === 'undefined') return DEFAULT_STATE
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    const parsed = JSON.parse(raw)
    if (typeof parsed.hue === 'number' && typeof parsed.chroma === 'number') return parsed
  } catch {
    // ignore
  }
  return DEFAULT_STATE
}

export function ThemingEditor() {
  const [state, setState] = useState<EditorState>(DEFAULT_STATE)
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // URL params override persisted state — lets the brand showcase tiles
    // deep-link into the editor with a hue/chroma preloaded.
    const params = new URLSearchParams(window.location.search)
    const hueParam = Number.parseFloat(params.get('hue') ?? '')
    const chromaParam = Number.parseFloat(params.get('chroma') ?? '')
    if (Number.isFinite(hueParam) && Number.isFinite(chromaParam)) {
      setState({ hue: hueParam, chroma: chromaParam })
    } else {
      setState(readPersisted())
    }
    setMounted(true)
  }, [])

  const ramp = useMemo(() => generateRamp(state.hue, state.chroma), [state.hue, state.chroma])
  const css = useMemo(() => rampToCss(ramp), [ramp])

  // Live inject the ramp on /theming. Sets <html data-brand="custom"> so it
  // wins over the shipped preset styles (which key on data-brand="devalok" etc.).
  useEffect(() => {
    if (!mounted) return
    document.documentElement.setAttribute('data-brand', 'custom')
    let style = document.getElementById(CUSTOM_STYLE_ID) as HTMLStyleElement | null
    if (!style) {
      style = document.createElement('style')
      style.id = CUSTOM_STYLE_ID
      document.head.appendChild(style)
    }
    style.textContent = css.replace(':root {', ':root[data-brand="custom"] {').replace('.dark {', ':root[data-brand="custom"].dark {')
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // ignore
    }
    return () => {
      // Clean up: when navigating away, drop the custom override + reset to persisted preset.
      // This prevents the editor's hue from leaking onto /components etc.
    }
  }, [css, mounted, state])

  // On unmount, restore the persisted preset brand so other pages aren't tinted by the editor.
  useEffect(() => {
    return () => {
      try {
        const preset = window.localStorage.getItem('shilp-sutra:brand') ?? 'devalok'
        document.documentElement.setAttribute('data-brand', preset)
        document.getElementById(CUSTOM_STYLE_ID)?.remove()
      } catch {
        // ignore
      }
    }
  }, [])

  const reset = () => setState(DEFAULT_STATE)
  const pickPreset = (h: number, c: number) => setState({ hue: h, chroma: c })

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(css)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // ignore
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-ds-09">
      <section className="flex flex-col gap-ds-06">
        <header className="flex flex-col gap-ds-02">
          <Text variant="label-sm" className="text-surface-fg-subtle">
            Controls
          </Text>
          <Text variant="heading-md" className="text-surface-fg">
            Pick a hue. The whole site follows.
          </Text>
        </header>

        <div className="flex flex-col gap-ds-04">
          <SliderField
            label="Hue"
            valueLabel={`${state.hue}°`}
            min={0}
            max={360}
            step={1}
            value={state.hue}
            onChange={(v) => setState((s) => ({ ...s, hue: v }))}
            track={'linear-gradient(to right, oklch(0.65 0.18 0), oklch(0.7 0.18 60), oklch(0.78 0.18 120), oklch(0.75 0.18 180), oklch(0.65 0.18 240), oklch(0.6 0.18 300), oklch(0.65 0.18 360))'}
          />
          <SliderField
            label="Chroma"
            valueLabel={state.chroma.toFixed(2)}
            min={0.03}
            max={0.3}
            step={0.005}
            value={state.chroma}
            onChange={(v) => setState((s) => ({ ...s, chroma: v }))}
            track={`linear-gradient(to right, oklch(0.55 0 ${state.hue}), oklch(0.55 0.3 ${state.hue}))`}
          />
        </div>

        <div className="flex flex-col gap-ds-03">
          <Text variant="label-sm" className="text-surface-fg-subtle">
            Quick picks
          </Text>
          <div className="flex flex-wrap gap-ds-02">
            {HUE_PRESETS.map((p) => {
              const isActive = p.hue === state.hue && Math.abs(p.chroma - state.chroma) < 0.005
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => pickPreset(p.hue, p.chroma)}
                  className={[
                    'inline-flex items-center gap-ds-02 px-ds-03 py-ds-02 rounded-control border text-ds-xs transition-colors duration-fast-01',
                    isActive
                      ? 'border-accent-9 bg-accent-3 text-accent-11'
                      : 'border-surface-border-subtle bg-surface-raised text-surface-fg-muted hover:border-surface-border',
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

        <div className="flex flex-col gap-ds-03">
          <Text variant="label-sm" className="text-surface-fg-subtle">
            12-step ramp (light)
          </Text>
          <div className="grid grid-cols-12 gap-1 h-12 rounded-control overflow-hidden border border-surface-border-subtle">
            {ramp.light.map((s) => (
              <div
                key={`l-${s.step}`}
                title={`Step ${s.step}: ${s.value}`}
                aria-label={`Light step ${s.step}`}
                style={{ background: s.value }}
              />
            ))}
          </div>
          <Text variant="label-sm" className="text-surface-fg-subtle">
            12-step ramp (dark)
          </Text>
          <div className="grid grid-cols-12 gap-1 h-12 rounded-control overflow-hidden border border-surface-border-subtle">
            {ramp.dark.map((s) => (
              <div
                key={`d-${s.step}`}
                title={`Step ${s.step}: ${s.value}`}
                aria-label={`Dark step ${s.step}`}
                style={{ background: s.value }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-ds-02">
          <Button variant="ghost" size="sm" startIcon={<IconRotateClockwise size={14} />} onClick={reset}>
            Reset to Devalok
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-ds-06">
        <header className="flex flex-col gap-ds-02">
          <Text variant="label-sm" className="text-surface-fg-subtle">
            Live preview
          </Text>
          <Text variant="heading-md" className="text-surface-fg">
            Components recolor live as you move the sliders.
          </Text>
        </header>

        <div className="flex flex-col gap-ds-05 p-ds-06 rounded-control bg-surface-raised border border-surface-border-subtle">
          <div className="flex flex-wrap items-center gap-ds-02">
            <Button>Solid</Button>
            <Button variant="soft">Soft</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>

          <div className="flex flex-wrap items-center gap-ds-02">
            <Badge>New</Badge>
            <Badge color="success">Live</Badge>
            <Badge color="warning">Draft</Badge>
            <Badge color="error">Removed</Badge>
            <Badge variant="soft" color="accent">Beta</Badge>
          </div>

          <div className="flex flex-col gap-ds-02">
            <label className="text-ds-sm text-surface-fg-muted">Email</label>
            <input
              type="email"
              placeholder="namaskar@devalok.in"
              className="w-full h-ds-md px-ds-04 rounded-control border border-surface-border bg-surface-overlay text-ds-md text-surface-fg placeholder:text-surface-fg-subtle focus:outline-hidden focus:ring-2 focus:ring-accent-9 focus:border-accent-9 transition-colors duration-fast-01"
            />
          </div>

          <div className="rounded-control border border-accent-7 bg-accent-2 p-ds-05">
            <Text variant="label-sm" className="text-accent-11">
              Brand-tinted notice
            </Text>
            <Text variant="body-sm" className="text-surface-fg mt-ds-01">
              Surface, border, and text all read against the active hue. The DS does the heavy
              lifting; you only pick the colour.
            </Text>
          </div>
        </div>

        <div className="flex flex-col gap-ds-03">
          <div className="flex items-center justify-between">
            <Text variant="label-sm" className="text-surface-fg-subtle">
              Export CSS
            </Text>
            <Button
              variant="ghost"
              size="compact-sm"
              startIcon={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
              onClick={copy}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <pre className="px-ds-04 py-ds-04 rounded-control border border-surface-border bg-surface-overlay overflow-x-auto text-ds-xs font-mono leading-relaxed text-surface-fg whitespace-pre max-h-96">
            <code>{css}</code>
          </pre>
          <Text variant="body-xs" className="text-surface-fg-subtle">
            Paste this into your consumer CSS after the <code className="font-mono">@import "@devalok/shilp-sutra/css"</code> line. Your whole app picks up the new ramp instantly. See the customize-brand recipe for deeper customizations (radius, fonts, spacing).
          </Text>
        </div>
      </section>
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
      {/*
        Track stays slim at 2px; thumb is fat on coarse pointers (touch ≥24px,
        comfortably > 44px hit area thanks to the invisible padding ring), slim
        on fine pointers (mouse, 16px). Avoids fat thumbs hijacking desktop
        precision while staying easy to grab on phone/tablet.
      */}
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
