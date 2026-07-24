'use client'

import { IconMail, IconSearch, IconLock, IconCurrencyDollar } from '@tabler/icons-react'
import { Input } from '@devalok/shilp-sutra/ui/input'

export function InputHero() {
  return (
    <div className="w-full max-w-sm">
      <Input
        type="email"
        defaultValue="hello@devalok.in"
        startSection={<IconMail />}
        placeholder="you@example.com"
      />
    </div>
  )
}

export function InputVariants() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-06">
      <Block title="default & placeholder">
        <Input defaultValue="Devalok Studio" />
        <Input placeholder="Search projects…" />
      </Block>

      <Block title="size">
        <Input size="xs" placeholder="Extra small" />
        <Input size="sm" placeholder="Small" />
        <Input size="md" placeholder="Medium" />
        <Input size="lg" placeholder="Large" />
      </Block>

      <Block title="state">
        <Input state="error" defaultValue="not-an-email" />
        <Input state="warning" defaultValue="weak-password" />
        <Input state="success" defaultValue="all-clear@devalok.in" />
      </Block>

      <Block title="with sections">
        <Input startSection={<IconSearch />} placeholder="Search…" />
        <Input startSection={<IconLock />} type="password" defaultValue="secret123" />
        <Input startSection={<IconCurrencyDollar />} endSection="USD" defaultValue="1,200.00" />
      </Block>

      <Block title="disabled & read-only">
        <Input disabled placeholder="Disabled" />
        <Input readOnly defaultValue="Read-only value" />
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
