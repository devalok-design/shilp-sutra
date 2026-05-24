'use client'

import * as React from 'react'

import { AuroraBloom } from '@/components/aurora-bloom'
import type {
  AuroraGrain,
  AuroraIntensity,
  AuroraLayers,
  AuroraParallax,
  AuroraPosition,
  AuroraShape,
} from '@/components/aurora-bloom'
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

const DEFAULTS: AuroraState = {
  intensity: 'medium',
  shape: 'curtain',
  position: 'top',
  layers: 2,
  speed: 0.35,
  parallax: 'mouse',
  grain: 'paper',
  breathing: true,
}

const PRESETS: Array<{ id: string; name: string; description: string; state: AuroraState }> = [
  {
    id: 'devalok-hero',
    name: 'Devalok hero',
    description: 'The shipped landing.',
    state: { ...DEFAULTS },
  },
  {
    id: 'quiet-wash',
    name: 'Quiet wash',
    description: 'Subtle behind a content page.',
    state: { ...DEFAULTS, intensity: 'subtle', layers: 1, parallax: 'off', breathing: false },
  },
  {
    id: 'centred-halo',
    name: 'Centred halo',
    description: 'Spotlight behind a hero illustration.',
    state: { ...DEFAULTS, shape: 'halo', position: 'center', intensity: 'strong', layers: 3 },
  },
  {
    id: 'foot-ribbon',
    name: 'Foot ribbon',
    description: 'Coloured band over a CTA footer.',
    state: { ...DEFAULTS, shape: 'ribbon', position: 'bottom', layers: 2, breathing: true },
  },
  {
    id: 'full-bleed',
    name: 'Full bleed',
    description: 'No mask — aurora fills the canvas.',
    state: { ...DEFAULTS, shape: 'full', position: 'full', intensity: 'subtle', layers: 3 },
  },
  {
    id: 'devalok-grain',
    name: 'Devalok grain',
    description: 'SVG turbulence rhymes with Buttons.',
    state: { ...DEFAULTS, grain: 'match' },
  },
]

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

export function AuroraPlayground() {
  const [s, setS] = React.useState<AuroraState>(DEFAULTS)

  const update = <K extends keyof AuroraState>(key: K, value: AuroraState[K]) =>
    setS((prev) => ({ ...prev, [key]: value }))

  const codeSnippet = React.useMemo(() => formatCode(s), [s])

  return (
    <div className="grid gap-ds-06 lg:grid-cols-[1fr_22rem]">
      {/* ── Live preview ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-ds-04">
        <div className="relative isolate overflow-hidden rounded-ds-lg border border-surface-border bg-surface-base h-[28rem]">
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
            <h2 className="text-[length:var(--typo-heading-xl-size)] font-[number:var(--typo-heading-xl-weight)] leading-[var(--typo-heading-xl-leading)] text-surface-fg max-w-2xl text-balance">
              The library that <span className="text-accent-11">looks like yours.</span>
            </h2>
            <Text variant="body-md" className="text-surface-fg-muted max-w-lg">
              Move your cursor — the back layer drifts. Switch any control — the curtain
              cross-fades, no flip.
            </Text>
          </div>
        </div>

        <details className="rounded-ds-md border border-surface-border bg-surface-2 px-ds-04 py-ds-03 text-ds-sm">
          <summary className="cursor-pointer text-surface-fg-muted">Show the JSX</summary>
          <pre className="mt-ds-03 overflow-x-auto rounded-ds-sm bg-surface-base p-ds-04 text-ds-xs font-mono text-surface-fg leading-relaxed">
            <code>{codeSnippet}</code>
          </pre>
        </details>
      </div>

      {/* ── Controls ─────────────────────────────────────────────── */}
      <aside className="flex flex-col gap-ds-05 lg:sticky lg:top-ds-08 lg:self-start">
        <div className="flex items-center justify-between">
          <Text variant="label-md" className="text-surface-fg">
            Aurora controls
          </Text>
          <Button variant="ghost" size="sm" onClick={() => setS(DEFAULTS)}>
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

        <div className="flex items-center justify-between rounded-ds-md border border-surface-border bg-surface-2 px-ds-04 py-ds-03">
          <Text variant="body-sm" className="text-surface-fg">
            Breathing
          </Text>
          <Switch
            checked={s.breathing}
            onCheckedChange={(v) => update('breathing', v)}
          />
        </div>

        <div className="mt-ds-03 flex flex-col gap-ds-02">
          <Text variant="label-md" className="text-surface-fg">
            Presets
          </Text>
          <div className="grid grid-cols-2 gap-ds-02">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setS(preset.state)}
                className="text-left rounded-ds-md border border-surface-border bg-surface-2 px-ds-03 py-ds-02 transition-colors hover:bg-surface-3 focus-visible:focus-ring"
              >
                <div className="text-ds-sm font-medium text-surface-fg">{preset.name}</div>
                <div className="text-ds-xs text-surface-fg-muted">{preset.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-ds-md border border-surface-border-subtle bg-surface-base px-ds-04 py-ds-03 text-ds-xs text-surface-fg-muted leading-relaxed">
          <strong className="text-surface-fg">Tip:</strong> change the brand from the header
          dropdown — the aurora <em>cross-fades</em> to the new ramp instead of flipping.
          Toggle theme to see dark / light selection logic at work.
        </div>
      </aside>
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

function formatCode(s: AuroraState): string {
  const lines = [
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
  ]
  return lines.join('\n')
}
