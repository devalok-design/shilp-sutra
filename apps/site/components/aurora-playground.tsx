'use client'

import * as React from 'react'

import {
  AURORA_PRESETS,
  AuroraBloom,
  type AuroraGrain,
  type AuroraIntensity,
  type AuroraLayers,
  type AuroraParallax,
  type AuroraPosition,
  type AuroraPresetId,
  type AuroraShape,
} from '@devalok/shilp-sutra-brand/aurora'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { SegmentedControl } from '@devalok/shilp-sutra/ui/segmented-control'
import { Slider } from '@devalok/shilp-sutra/ui/slider'
import { Switch } from '@devalok/shilp-sutra/ui/switch'
import { Text } from '@devalok/shilp-sutra/ui/text'

interface AuroraState {
  intensity: AuroraIntensity
  shape: AuroraShape
  position: AuroraPosition
  layers: AuroraLayers
  speed: number
  parallax: AuroraParallax
  grain: AuroraGrain
  breathing: boolean
}

function presetToState(id: AuroraPresetId): AuroraState {
  const p = AURORA_PRESETS[id].props
  return {
    intensity: p.intensity,
    shape: p.shape,
    position: p.position,
    layers: p.layers as AuroraLayers,
    speed: p.speed,
    parallax: p.parallax,
    grain: p.grain,
    breathing: p.breathing,
  }
}

const DEFAULTS: AuroraState = presetToState('devalok')

const INTENSITY_OPTIONS = [
  { id: 'subtle', text: 'Subtle' },
  { id: 'medium', text: 'Medium' },
  { id: 'strong', text: 'Strong' },
]
const SHAPE_OPTIONS = [
  { id: 'curtain', text: 'Curtain' },
  { id: 'ribbon', text: 'Ribbon' },
  { id: 'halo', text: 'Halo' },
  { id: 'full', text: 'Full' },
]
const POSITION_OPTIONS = [
  { id: 'top', text: 'Top' },
  { id: 'center', text: 'Centre' },
  { id: 'bottom', text: 'Bottom' },
  { id: 'full', text: 'Full' },
]
const LAYER_OPTIONS = [
  { id: '1', text: '1' },
  { id: '2', text: '2' },
  { id: '3', text: '3' },
]
const PARALLAX_OPTIONS = [
  { id: 'off', text: 'Off' },
  { id: 'mouse', text: 'Mouse' },
  { id: 'scroll', text: 'Scroll' },
]
const GRAIN_OPTIONS = [
  { id: 'off', text: 'Off' },
  { id: 'paper', text: 'Paper' },
  { id: 'match', text: 'Devalok' },
]

const PRESET_IDS: AuroraPresetId[] = [
  'devalok',
  'bhairav',
  'saptarishi',
  'diya',
  'monsoon',
  'mandir',
]

export function AuroraPlayground() {
  const [s, setS] = React.useState<AuroraState>(DEFAULTS)
  const [activePreset, setActivePreset] = React.useState<AuroraPresetId | null>(
    'devalok',
  )

  const update = <K extends keyof AuroraState>(key: K, value: AuroraState[K]) => {
    setS((prev) => ({ ...prev, [key]: value }))
    // Manual control = no preset is "active" anymore.
    setActivePreset(null)
  }

  const applyPreset = (id: AuroraPresetId) => {
    setS(presetToState(id))
    setActivePreset(id)
  }

  const codeSnippet = React.useMemo(() => formatCode(s, activePreset), [s, activePreset])

  return (
    <div className="flex flex-col gap-ds-09">
      {/* ─── Preset gallery ───────────────────────────────────────── */}
      <section className="flex flex-col gap-ds-04">
        <div className="flex flex-col gap-ds-01">
          <Text variant="label-md" className="text-surface-fg">
            Presets
          </Text>
          <Text variant="body-sm" className="text-surface-fg-muted max-w-2xl">
            Six Devalok configurations of AuroraBloom. Each one a complete prop
            set with a curated mood. Click any preset to load it into the live
            controls below.
          </Text>
        </div>

        <div className="grid gap-ds-04 sm:grid-cols-2 lg:grid-cols-3">
          {PRESET_IDS.map((id) => {
            const preset = AURORA_PRESETS[id]
            const isActive = activePreset === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => applyPreset(id)}
                className={
                  'group text-left rounded-control border bg-surface-panel overflow-hidden transition-colors focus-visible:focus-ring ' +
                  (isActive
                    ? 'border-accent-9 ring-1 ring-accent-9/30'
                    : 'border-surface-border hover:border-surface-border-strong')
                }
              >
                {/* Mini live aurora — layers=1 to keep WebGL context count
                    low across the six cards. The preset's other props
                    drive the visible look. */}
                <div className="relative isolate overflow-hidden bg-surface-base h-44">
                  <AuroraBloom
                    {...preset.props}
                    layers={1}
                  />
                  <div className="relative z-10 flex h-full items-end p-ds-03">
                    <span className="text-ds-xs uppercase tracking-wider text-surface-fg-subtle drop-shadow-sm">
                      {preset.name}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-ds-02 p-ds-04">
                  <div className="flex items-center justify-between gap-ds-02">
                    <Text variant="label-md" className="text-surface-fg">
                      {preset.name}
                    </Text>
                    {isActive && (
                      <span className="inline-flex items-center rounded-control-inner bg-accent-3 px-ds-02 py-[1px] text-ds-xs font-mono text-accent-11">
                        active
                      </span>
                    )}
                  </div>
                  <Text variant="body-sm" className="text-surface-fg-muted line-clamp-2">
                    {preset.mood}
                  </Text>
                  <Text variant="body-sm" className="text-surface-fg-subtle line-clamp-2">
                    {preset.useCase}
                  </Text>
                  {/* Palette swatch strip — 5 hex stops the aurora draws
                      from. `palette: 'brand'` (Devalok preset) shows a
                      brand-follows tag instead of static swatches. */}
                  <div className="mt-ds-02 flex items-center gap-ds-02">
                    {preset.props.palette === 'brand' ? (
                      <span className="inline-flex items-center gap-ds-01 rounded-control-inner border border-surface-border-subtle bg-surface-base px-ds-02 py-[1px] text-ds-xs font-mono text-surface-fg-subtle">
                        <span className="w-2 h-2 rounded-pill bg-accent-9" aria-hidden />
                        follows brand
                      </span>
                    ) : Array.isArray(preset.props.palette) ? (
                      <div
                        aria-label={`${preset.name} palette`}
                        className="flex h-3 overflow-hidden rounded-control-inner border border-surface-border-subtle"
                      >
                        {preset.props.palette.map((hex, i) => (
                          <span
                            key={i}
                            className="w-6"
                            style={{ background: hex }}
                            aria-hidden
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* ─── Live preview + controls ──────────────────────────────── */}
      <div className="grid gap-ds-06 lg:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-ds-04">
          <div className="relative isolate overflow-hidden rounded-surface border border-surface-border bg-surface-base h-[28rem]">
            <AuroraBloom
              intensity={s.intensity}
              shape={s.shape}
              position={s.position}
              layers={s.layers}
              speed={s.speed}
              parallax={s.parallax}
              grain={s.grain}
              breathing={s.breathing}
            />
            <div className="relative z-10 flex h-full flex-col items-center justify-center gap-ds-04 px-ds-08 text-center">
              <Text variant="label-md" className="text-surface-fg-subtle">
                Live preview
              </Text>
              <h2 className="font-display text-[length:var(--typo-heading-xl-size)] font-[number:var(--typo-heading-xl-weight)] leading-[var(--typo-heading-xl-leading)] text-surface-fg max-w-2xl text-balance">
                The library that <span className="text-accent-11">looks like yours.</span>
              </h2>
              <Text variant="body-md" className="text-surface-fg-muted max-w-lg">
                Tweak a control on the right or pick a preset above. The
                preview updates live, the curtain cross-fades, no flip.
              </Text>
            </div>
          </div>

          <details className="rounded-control border border-surface-border bg-surface-panel px-ds-04 py-ds-03 text-ds-sm">
            <summary className="cursor-pointer text-surface-fg-muted">Show the JSX</summary>
            <pre className="mt-ds-03 overflow-x-auto rounded-control-inner bg-surface-base p-ds-04 text-ds-xs font-mono text-surface-fg leading-relaxed">
              <code>{codeSnippet}</code>
            </pre>
          </details>
        </div>

        <aside className="flex flex-col gap-ds-05 lg:sticky lg:top-ds-08 lg:self-start">
          <div className="flex items-center justify-between">
            <Text variant="label-md" className="text-surface-fg">
              Aurora controls
            </Text>
            <Button variant="ghost" size="sm" onClick={() => applyPreset('devalok')}>
              Reset
            </Button>
          </div>

          <ControlRow label="Intensity">
            <SegmentedControl
              size="sm"
              options={INTENSITY_OPTIONS}
              selectedId={s.intensity}
              onSelect={(id) => update('intensity', id as AuroraIntensity)}
            />
          </ControlRow>
          <ControlRow label="Shape">
            <SegmentedControl
              size="sm"
              options={SHAPE_OPTIONS}
              selectedId={s.shape}
              onSelect={(id) => update('shape', id as AuroraShape)}
            />
          </ControlRow>
          <ControlRow label="Position">
            <SegmentedControl
              size="sm"
              options={POSITION_OPTIONS}
              selectedId={s.position}
              onSelect={(id) => update('position', id as AuroraPosition)}
            />
          </ControlRow>
          <ControlRow label="Layers">
            <SegmentedControl
              size="sm"
              options={LAYER_OPTIONS}
              selectedId={String(s.layers)}
              onSelect={(id) => update('layers', Number(id) as AuroraLayers)}
            />
          </ControlRow>
          <ControlRow label={`Speed · ${s.speed.toFixed(2)}`}>
            <Slider
              min={0}
              max={1.5}
              step={0.05}
              value={[s.speed]}
              onValueChange={(v) => update('speed', v[0] ?? 0)}
            />
          </ControlRow>
          <ControlRow label="Parallax">
            <SegmentedControl
              size="sm"
              options={PARALLAX_OPTIONS}
              selectedId={s.parallax}
              onSelect={(id) => update('parallax', id as AuroraParallax)}
            />
          </ControlRow>
          <ControlRow label="Grain">
            <SegmentedControl
              size="sm"
              options={GRAIN_OPTIONS}
              selectedId={s.grain}
              onSelect={(id) => update('grain', id as AuroraGrain)}
            />
          </ControlRow>

          <div className="flex items-center justify-between rounded-control border border-surface-border bg-surface-panel px-ds-04 py-ds-03">
            <Text variant="body-sm" className="text-surface-fg">
              Breathing
            </Text>
            <Switch
              checked={s.breathing}
              onCheckedChange={(v) => update('breathing', v)}
            />
          </div>

          <div className="rounded-control border border-surface-border-subtle bg-surface-base px-ds-04 py-ds-03 text-ds-xs text-surface-fg-muted leading-relaxed">
            <strong className="text-surface-fg">Tip:</strong> change the brand from the header
            dropdown. The aurora <em>cross-fades</em> to the new ramp instead of flipping.
            Toggle theme to see dark / light selection logic at work.
          </div>
        </aside>
      </div>
    </div>
  )
}

function ControlRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-02">
      <Text variant="body-sm" className="text-surface-fg-muted">
        {label}
      </Text>
      {children}
    </div>
  )
}

function formatCode(s: AuroraState, activePreset: AuroraPresetId | null): string {
  if (activePreset) {
    return [
      `import { AuroraBloom, AURORA_PRESETS } from '@devalok/shilp-sutra-brand/aurora'`,
      ``,
      `<section className="relative isolate overflow-hidden">`,
      `  <AuroraBloom {...AURORA_PRESETS.${activePreset}.props} />`,
      `  <div className="relative z-10">…content…</div>`,
      `</section>`,
    ].join('\n')
  }
  return [
    `<section className="relative isolate overflow-hidden">`,
    `  <AuroraBloom`,
    `    intensity="${s.intensity}"`,
    `    shape="${s.shape}"`,
    `    position="${s.position}"`,
    `    layers={${s.layers}}`,
    `    speed={${s.speed}}`,
    `    parallax="${s.parallax}"`,
    `    grain="${s.grain}"`,
    `    breathing={${s.breathing}}`,
    `  />`,
    `  <div className="relative z-10">…content…</div>`,
    `</section>`,
  ].join('\n')
}
