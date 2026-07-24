'use client'

import * as React from 'react'
import { IconCheck } from '@tabler/icons-react'
import { Switch } from '@devalok/shilp-sutra/ui/switch'

export function SwitchHero() {
  const [on, setOn] = React.useState(true)
  return (
    <label className="flex items-center gap-ds-03 cursor-pointer">
      <Switch checked={on} onCheckedChange={setOn} />
      <span className="text-body-md text-surface-fg">
        Email notifications {on ? 'on' : 'off'}
      </span>
    </label>
  )
}

export function SwitchVariants() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-06">
      <Block title="on / off">
        <Switch defaultChecked={false} />
        <Switch defaultChecked />
      </Block>

      <Block title="size">
        <Switch size="sm" defaultChecked />
        <Switch size="md" defaultChecked />
        <Switch size="lg" defaultChecked />
      </Block>

      <Block title="color">
        <Switch color="accent" defaultChecked />
        <Switch color="success" defaultChecked />
        <Switch color="warning" defaultChecked />
      </Block>

      <Block title="state">
        <Switch state="error" defaultChecked />
        <Switch state="warning" defaultChecked />
        <Switch state="success" defaultChecked />
      </Block>

      <Block title="thumb icon">
        <Switch defaultChecked thumbIcon={<IconCheck size={14} />} />
      </Block>

      <Block title="disabled">
        <Switch disabled />
        <Switch disabled defaultChecked />
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-raised">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-wrap items-center gap-ds-03">{children}</div>
    </div>
  )
}
