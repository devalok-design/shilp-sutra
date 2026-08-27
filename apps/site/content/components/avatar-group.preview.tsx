'use client'

import { AvatarGroup } from '@devalok/shilp-sutra/composed/avatar-group'

const TEAM = [
  { name: 'Aisha Kapoor' },
  { name: 'Ben Carter' },
  { name: 'Chen Wei' },
  { name: 'Diego Alvarez' },
  { name: 'Elena Rossi' },
  { name: 'Farid Hassan' },
]

export function AvatarGroupHero() {
  return <AvatarGroup users={TEAM} max={4} />
}

export function AvatarGroupVariants() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-06">
      <Block title="size">
        <AvatarGroup users={TEAM} max={3} size="sm" />
        <AvatarGroup users={TEAM} max={3} size="md" />
        <AvatarGroup users={TEAM} max={3} size="lg" />
      </Block>

      <Block title="max (overflow +N)">
        <AvatarGroup users={TEAM} max={2} />
        <AvatarGroup users={TEAM} max={4} />
      </Block>

      <Block title="showTooltip={false}">
        <AvatarGroup users={TEAM} max={4} showTooltip={false} />
      </Block>

      <Block title="expandDirection=left">
        <AvatarGroup users={TEAM} max={4} expandDirection="left" />
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-panel">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-wrap items-center gap-ds-05">{children}</div>
    </div>
  )
}
