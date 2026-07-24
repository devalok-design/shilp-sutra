'use client'

import * as React from 'react'
import { RadioGroup, RadioGroupItem } from '@devalok/shilp-sutra/ui/radio'

export function RadioHero() {
  const [plan, setPlan] = React.useState('team')
  const options = [
    { value: 'solo', label: 'Solo', hint: 'One seat, personal projects' },
    { value: 'team', label: 'Team', hint: 'Up to 10 seats, shared spaces' },
    { value: 'studio', label: 'Studio', hint: 'Unlimited seats, SSO' },
  ]
  return (
    <RadioGroup value={plan} onValueChange={setPlan} className="w-full max-w-sm">
      {options.map((opt) => (
        <label key={opt.value} className="flex items-start gap-ds-03 cursor-pointer">
          <RadioGroupItem value={opt.value} className="mt-ds-01" />
          <span className="flex flex-col">
            <span className="text-body-md text-surface-fg">{opt.label}</span>
            <span className="text-body-sm text-surface-fg-muted">{opt.hint}</span>
          </span>
        </label>
      ))}
    </RadioGroup>
  )
}

export function RadioVariants() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-06">
      <Block title="group">
        <RadioGroup defaultValue="a">
          <label className="flex items-center gap-ds-03 cursor-pointer">
            <RadioGroupItem value="a" />
            <span className="text-body-md text-surface-fg">Option A</span>
          </label>
          <label className="flex items-center gap-ds-03 cursor-pointer">
            <RadioGroupItem value="b" />
            <span className="text-body-md text-surface-fg">Option B</span>
          </label>
          <label className="flex items-center gap-ds-03 opacity-action-disabled">
            <RadioGroupItem value="c" disabled />
            <span className="text-body-md text-surface-fg">Option C (disabled)</span>
          </label>
        </RadioGroup>
      </Block>

      <Block title="size">
        <RadioGroup defaultValue="md" className="grid-flow-col justify-start items-center gap-ds-04 w-fit">
          <RadioGroupItem value="sm" size="sm" />
          <RadioGroupItem value="md" size="md" />
          <RadioGroupItem value="lg" size="lg" />
        </RadioGroup>
      </Block>

      <Block title="error state">
        <RadioGroup defaultValue="one" state="error">
          <label className="flex items-center gap-ds-03 cursor-pointer">
            <RadioGroupItem value="one" />
            <span className="text-body-md text-surface-fg">First</span>
          </label>
          <label className="flex items-center gap-ds-03 cursor-pointer">
            <RadioGroupItem value="two" />
            <span className="text-body-md text-surface-fg">Second</span>
          </label>
        </RadioGroup>
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-raised">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-col gap-ds-02">{children}</div>
    </div>
  )
}
