'use client'

import * as React from 'react'
import { Slider } from '@devalok/shilp-sutra/ui/slider'

export function SliderHero() {
  const [value, setValue] = React.useState([60])
  return (
    <div className="w-full max-w-sm">
      <Slider
        value={value}
        onValueChange={setValue}
        max={100}
        step={1}
        aria-label="Volume"
      />
    </div>
  )
}

export function SliderVariants() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-06">
      <Block title="size">
        <Slider defaultValue={[40]} size="sm" aria-label="Small slider" />
        <Slider defaultValue={[50]} size="md" aria-label="Medium slider" />
        <Slider defaultValue={[60]} size="lg" aria-label="Large slider" />
      </Block>

      <Block title="color">
        <Slider defaultValue={[50]} color="accent" aria-label="Accent slider" />
        <Slider defaultValue={[50]} color="success" aria-label="Success slider" />
        <Slider defaultValue={[50]} color="warning" aria-label="Warning slider" />
        <Slider defaultValue={[50]} color="error" aria-label="Error slider" />
      </Block>

      <Block title="range (two thumbs)">
        <Slider defaultValue={[25, 75]} aria-label="Price range" />
      </Block>

      <Block title="disabled">
        <Slider defaultValue={[40]} disabled aria-label="Disabled slider" />
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-05 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-panel">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-col gap-ds-06">{children}</div>
    </div>
  )
}
