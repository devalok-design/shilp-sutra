'use client'

import { Label } from '@devalok/shilp-sutra/ui/label'
import { Input } from '@devalok/shilp-sutra/ui/input'

export function LabelHero() {
  return (
    <div className="flex flex-col gap-ds-02 w-full max-w-sm">
      <Label htmlFor="hero-email">Work email</Label>
      <Input id="hero-email" type="email" placeholder="you@example.com" />
    </div>
  )
}

export function LabelVariants() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-06">
      <Block title="labelled field">
        <div className="flex flex-col gap-ds-02">
          <Label htmlFor="lbl-name">Full name</Label>
          <Input id="lbl-name" placeholder="Ada Lovelace" />
        </div>
      </Block>

      <Block title="required">
        <div className="flex flex-col gap-ds-02">
          <Label htmlFor="lbl-username" required>Username</Label>
          <Input id="lbl-username" placeholder="@handle" />
        </div>
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
