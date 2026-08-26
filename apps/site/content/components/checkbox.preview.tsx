'use client'

import * as React from 'react'
import { Checkbox } from '@devalok/shilp-sutra/ui/checkbox'

export function CheckboxHero() {
  const [agreed, setAgreed] = React.useState(true)
  return (
    <label className="flex items-center gap-ds-03 cursor-pointer">
      <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} />
      <span className="text-body-md text-surface-fg">I agree to the terms of service</span>
    </label>
  )
}

export function CheckboxVariants() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-06">
      <Block title="checked state">
        <Checkbox defaultChecked={false} />
        <Checkbox defaultChecked />
        <Checkbox indeterminate />
      </Block>

      <Block title="size">
        <Checkbox size="sm" defaultChecked />
        <Checkbox size="md" defaultChecked />
        <Checkbox size="lg" defaultChecked />
      </Block>

      <Block title="state">
        <Checkbox state="error" defaultChecked />
        <Checkbox state="warning" defaultChecked />
        <Checkbox state="success" defaultChecked />
      </Block>

      <Block title="disabled">
        <Checkbox disabled />
        <Checkbox disabled defaultChecked />
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-panel">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-wrap items-center gap-ds-03">{children}</div>
    </div>
  )
}
