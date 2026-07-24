'use client'

import { Badge } from '@devalok/shilp-sutra/ui/badge'
import { BadgeGroup } from '@devalok/shilp-sutra/ui/badge-group'

export function BadgeGroupHero() {
  return (
    <BadgeGroup max={3}>
      <Badge variant="soft">Design</Badge>
      <Badge variant="soft">Research</Badge>
      <Badge variant="soft">Frontend</Badge>
      <Badge variant="soft">Backend</Badge>
      <Badge variant="soft">DevOps</Badge>
    </BadgeGroup>
  )
}

export function BadgeGroupVariants() {
  return (
    <div className="grid grid-cols-1 gap-ds-06">
      <Block title="no max (all shown)">
        <BadgeGroup>
          <Badge color="accent">React</Badge>
          <Badge color="success">TypeScript</Badge>
          <Badge color="warning">Tailwind</Badge>
        </BadgeGroup>
      </Block>

      <Block title="max=2 (overflow +N)">
        <BadgeGroup max={2}>
          <Badge variant="soft">Alpha</Badge>
          <Badge variant="soft">Beta</Badge>
          <Badge variant="soft">Gamma</Badge>
          <Badge variant="soft">Delta</Badge>
        </BadgeGroup>
      </Block>

      <Block title="gap">
        <BadgeGroup gap="tight">
          <Badge variant="soft">Tight</Badge>
          <Badge variant="soft">Tight</Badge>
        </BadgeGroup>
        <BadgeGroup gap="loose">
          <Badge variant="soft">Loose</Badge>
          <Badge variant="soft">Loose</Badge>
        </BadgeGroup>
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-raised">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-wrap items-center gap-ds-05">{children}</div>
    </div>
  )
}
