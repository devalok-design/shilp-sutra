'use client'

import * as React from 'react'
import { ColorInput } from '@devalok/shilp-sutra/ui/color-input'

export function ColorInputHero() {
  const [color, setColor] = React.useState('#c53637')
  return (
    <div className="flex items-center gap-ds-04">
      <ColorInput value={color} onChange={setColor} />
      <span className="font-mono text-body-sm text-surface-fg-subtle">{color}</span>
    </div>
  )
}

export function ColorInputVariants() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-06">
      <Block title="variant=default">
        <ControlledColorInput initial="#1479b0" />
      </Block>

      <Block title="variant=inline">
        <ControlledColorInput initial="#308639" variant="inline" />
      </Block>

      <Block title="defaultFormat=rgb">
        <ControlledColorInput initial="#df911a" defaultFormat="rgb" />
      </Block>

      <Block title="disabled">
        <ColorInput value="#7d5fad" disabled />
      </Block>
    </div>
  )
}

function ControlledColorInput({
  initial,
  variant,
  defaultFormat,
}: {
  initial: string
  variant?: 'default' | 'inline'
  defaultFormat?: 'hex' | 'rgb' | 'hsl'
}) {
  const [color, setColor] = React.useState(initial)
  return <ColorInput value={color} onChange={setColor} variant={variant} defaultFormat={defaultFormat} />
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-panel">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-wrap items-center gap-ds-03">{children}</div>
    </div>
  )
}
