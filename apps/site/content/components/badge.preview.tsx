'use client'

import { IconCheck, IconClock, IconExclamationCircle } from '@tabler/icons-react'
import { Badge } from '@devalok/shilp-sutra/ui/badge'

export function BadgeHero() {
  return (
    <div className="flex flex-wrap items-center gap-ds-02">
      <Badge>Default</Badge>
      <Badge variant="soft" color="success">Live</Badge>
      <Badge variant="outline" color="warning">Beta</Badge>
      <Badge color="error">Critical</Badge>
    </div>
  )
}

export function BadgeVariants() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-06">
      <Block title="variant">
        <Badge>Solid</Badge>
        <Badge variant="soft">Soft</Badge>
        <Badge variant="outline">Outline</Badge>
      </Block>

      <Block title="color">
        <Badge color="accent">Accent</Badge>
        <Badge color="success">Success</Badge>
        <Badge color="warning">Warning</Badge>
        <Badge color="error">Error</Badge>
        <Badge color="neutral">Neutral</Badge>
      </Block>

      <Block title="size">
        <Badge size="sm">SM</Badge>
        <Badge size="md">MD</Badge>
        <Badge size="lg">LG</Badge>
      </Block>

      <Block title="with icons">
        <Badge startIcon={<IconCheck size={12} />} color="success">Approved</Badge>
        <Badge startIcon={<IconClock size={12} />} color="warning">Pending</Badge>
        <Badge startIcon={<IconExclamationCircle size={12} />} color="error">Failed</Badge>
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-ds-md border border-surface-border-subtle bg-surface-raised">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-wrap items-center gap-ds-02">{children}</div>
    </div>
  )
}
