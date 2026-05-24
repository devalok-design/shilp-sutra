'use client'

import * as React from 'react'

import { LotusBloom } from '@/components/lotus-bloom'
import type { LotusCycle } from '@/components/lotus-bloom'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { SegmentedControl } from '@devalok/shilp-sutra/ui/segmented-control'
import { Slider } from '@devalok/shilp-sutra/ui/slider'
import { Text } from '@devalok/shilp-sutra/ui/text'

const CYCLE_OPTIONS = [
  { id: 'loop', text: 'Loop' },
  { id: 'once', text: 'Once' },
  { id: 'paused', text: 'Paused' },
]

const STAGES = [
  {
    name: 'Bud',
    biology: 'Closed bud, green-tinted, petal tips just beginning to colour.',
    motion: 'Mask radius ≈ 18 %. Petal mesh sits at 35 % opacity behind green leaves.',
  },
  {
    name: 'Opening',
    biology: 'Petals unfurl outward, 2–12 cm. Stigma becomes receptive; thermogenesis peaks.',
    motion: 'Mask grows to 58 %. Petal scale jumps to 0.95, stamens fade in at 25 %.',
  },
  {
    name: 'Full bloom',
    biology: 'Petals horizontal. Yellow stamens released with mature pollen.',
    motion: 'Mask 95 %. Petal palette shifts to white-centre / deep-edge gradient.',
  },
  {
    name: 'Peak',
    biology: 'Flower at maximum spread, held briefly before retraction.',
    motion: 'Mask 100 %. All three mesh layers at full opacity. Slow continuous drift.',
  },
  {
    name: 'Close',
    biology: 'Petals retract; flower closes as light fades. Cycle restarts at dawn.',
    motion: 'Mask shrinks to 55 %. Petal opacity drops; green leaves re-assert.',
  },
]

export function LotusShowcase() {
  const [durationSec, setDurationSec] = React.useState(24)
  const [cycle, setCycle] = React.useState<LotusCycle>('loop')

  return (
    <div className="flex flex-col gap-ds-09">
      {/* ── Hero — full-bleed lotus ──────────────────────────────── */}
      <div className="relative isolate overflow-hidden rounded-ds-lg border border-surface-border h-[34rem]">
        <LotusBloom durationSec={durationSec} cycle={cycle} />
        <div className="relative z-10 flex h-full flex-col items-center justify-end gap-ds-03 px-ds-08 pb-ds-08 text-center">
          <Text variant="label-md" className="text-surface-fg-subtle">
            Nelumbo nucifera
          </Text>
          <h2 className="text-[length:var(--typo-heading-2xl-size)] font-[number:var(--typo-heading-2xl-weight)] leading-[var(--typo-heading-2xl-leading)] text-surface-fg max-w-3xl text-balance">
            Bud, bloom, breathe.
          </h2>
          <Text variant="body-md" className="text-surface-fg-muted max-w-xl">
            Five stages of the sacred lotus, compressed from four days into{' '}
            {Math.round(durationSec)} seconds. Built from the same WebGL primitives
            that drive Aurora — different choreography, same mesh.
          </Text>
        </div>
      </div>

      {/* ── Controls ─────────────────────────────────────────────── */}
      <section className="grid gap-ds-06 lg:grid-cols-[1fr_auto] items-start">
        <div className="flex flex-col gap-ds-04 rounded-ds-md border border-surface-border bg-surface-2 p-ds-05">
          <Text variant="label-md" className="text-surface-fg">
            Cycle controls
          </Text>

          <div className="flex flex-col gap-ds-02">
            <Text variant="body-sm" className="text-surface-fg-muted">
              Behaviour
            </Text>
            <SegmentedControl
              size="sm"
              options={CYCLE_OPTIONS}
              selectedId={cycle}
              onSelect={(id) => setCycle(id as LotusCycle)}
            />
          </div>

          <div className="flex flex-col gap-ds-02">
            <Text variant="body-sm" className="text-surface-fg-muted">
              Cycle length · {durationSec.toFixed(0)} seconds
            </Text>
            <Slider
              min={6}
              max={90}
              step={2}
              value={[durationSec]}
              onValueChange={(v) => setDurationSec(v[0] ?? 24)}
            />
          </div>

          <div className="flex gap-ds-02 pt-ds-02">
            <Button
              variant="soft"
              size="sm"
              onClick={() => {
                setDurationSec(24)
                setCycle('loop')
              }}
            >
              Reset
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDurationSec(8)}
            >
              Speed-run
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDurationSec(60)}
            >
              Meditate
            </Button>
          </div>
        </div>

        <pre className="rounded-ds-md bg-surface-base border border-surface-border-subtle p-ds-05 text-ds-xs font-mono text-surface-fg leading-relaxed overflow-x-auto min-w-[20rem]">
{`<LotusBloom
  durationSec={${durationSec}}
  cycle="${cycle}"
/>`}
        </pre>
      </section>

      {/* ── Stage diagram ────────────────────────────────────────── */}
      <section className="flex flex-col gap-ds-04">
        <div className="flex flex-col gap-ds-01">
          <Text variant="label-md" className="text-surface-fg">
            How the lotus moves
          </Text>
          <Text variant="body-md" className="text-surface-fg-muted max-w-2xl">
            Real lotuses move through five developmental stages. The biology
            on the left, the WebGL mapping on the right.
          </Text>
        </div>
        <ol className="grid gap-ds-03 md:grid-cols-2 lg:grid-cols-5">
          {STAGES.map((stage, i) => (
            <li
              key={stage.name}
              className="rounded-ds-md border border-surface-border bg-surface-2 p-ds-04 flex flex-col gap-ds-02"
            >
              <div className="flex items-center gap-ds-02">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent-9 text-ds-xs font-bold text-accent-fg">
                  {i + 1}
                </span>
                <Text variant="label-md" className="text-surface-fg">
                  {stage.name}
                </Text>
              </div>
              <Text variant="body-sm" className="text-surface-fg-muted">
                {stage.biology}
              </Text>
              <Text variant="body-sm" className="text-surface-fg-subtle italic">
                {stage.motion}
              </Text>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Footnote ─────────────────────────────────────────────── */}
      <section className="rounded-ds-md border border-surface-border-subtle bg-surface-raised p-ds-05 flex flex-col gap-ds-02">
        <Text variant="label-sm" className="text-surface-fg-subtle">
          Brand reactivity
        </Text>
        <Text variant="body-sm" className="text-surface-fg-muted">
          The petal palette follows{' '}
          <code className="font-mono text-surface-fg">--color-accent-*</code> — switch
          brand from the header and the lotus turns indigo or sage with you. Leaf
          colour stays tied to{' '}
          <code className="font-mono text-surface-fg">--color-success-9</code> and
          stamens to{' '}
          <code className="font-mono text-surface-fg">--color-warning-9</code> because
          those carry the lotus's universal identity.
        </Text>
      </section>
    </div>
  )
}
