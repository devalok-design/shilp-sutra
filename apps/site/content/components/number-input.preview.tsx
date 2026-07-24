'use client'

import * as React from 'react'
import { NumberInput } from '@devalok/shilp-sutra/ui/number-input'

export function NumberInputHero() {
  const [qty, setQty] = React.useState(3)
  return (
    <NumberInput value={qty} onValueChange={setQty} min={1} max={99} aria-label="Quantity" />
  )
}

export function NumberInputVariants() {
  const [xs, setXs] = React.useState(1)
  const [sm, setSm] = React.useState(2)
  const [md, setMd] = React.useState(3)
  const [lg, setLg] = React.useState(4)
  const [err, setErr] = React.useState(120)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-06">
      <Block title="size">
        <NumberInput size="xs" value={xs} onValueChange={setXs} aria-label="Extra small" />
        <NumberInput size="sm" value={sm} onValueChange={setSm} aria-label="Small" />
        <NumberInput size="md" value={md} onValueChange={setMd} aria-label="Medium" />
        <NumberInput size="lg" value={lg} onValueChange={setLg} aria-label="Large" />
      </Block>

      <Block title="state">
        <NumberInput state="error" value={err} onValueChange={setErr} max={99} aria-label="Over limit" />
      </Block>

      <Block title="disabled">
        <NumberInput value={5} onValueChange={() => {}} disabled aria-label="Disabled" />
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-raised">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-wrap items-center gap-ds-04">{children}</div>
    </div>
  )
}
