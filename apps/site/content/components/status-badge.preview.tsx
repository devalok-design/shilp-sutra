'use client'

import { StatusBadge } from '@devalok/shilp-sutra/composed/status-badge'

export function StatusBadgeHero() {
  return (
    <div className="flex flex-wrap items-center gap-ds-03">
      <StatusBadge status="active" />
      <StatusBadge status="pending" />
      <StatusBadge status="in-progress" />
      <StatusBadge status="completed" />
    </div>
  )
}

export function StatusBadgeVariants() {
  return (
    <div className="grid grid-cols-1 gap-ds-06">
      <Block title="status vocabulary">
        <StatusBadge status="active" />
        <StatusBadge status="pending" />
        <StatusBadge status="approved" />
        <StatusBadge status="rejected" />
        <StatusBadge status="blocked" />
        <StatusBadge status="review" />
        <StatusBadge status="cancelled" />
        <StatusBadge status="draft" />
      </Block>

      <Block title="size">
        <StatusBadge status="active" size="sm" />
        <StatusBadge status="active" size="md" />
      </Block>

      <Block title="custom label & hideDot">
        <StatusBadge status="completed" label="Shipped" />
        <StatusBadge status="pending" hideDot />
      </Block>

      <Block title="clickable (chevron)">
        <StatusBadge status="in-progress" onClick={() => {}} />
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
