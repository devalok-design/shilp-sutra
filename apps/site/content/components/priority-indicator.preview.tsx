'use client'

import { PriorityIndicator } from '@devalok/shilp-sutra/composed/priority-indicator'

export function PriorityIndicatorHero() {
  return (
    <div className="flex flex-wrap items-center gap-ds-05">
      <PriorityIndicator priority="LOW" />
      <PriorityIndicator priority="MEDIUM" />
      <PriorityIndicator priority="HIGH" />
      <PriorityIndicator priority="URGENT" />
    </div>
  )
}

export function PriorityIndicatorVariants() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-06">
      <Block title="display=full (default)">
        <PriorityIndicator priority="LOW" />
        <PriorityIndicator priority="MEDIUM" />
        <PriorityIndicator priority="HIGH" />
        <PriorityIndicator priority="URGENT" />
      </Block>

      <Block title="display=compact (icon only)">
        <PriorityIndicator priority="LOW" display="compact" />
        <PriorityIndicator priority="MEDIUM" display="compact" />
        <PriorityIndicator priority="HIGH" display="compact" />
        <PriorityIndicator priority="URGENT" display="compact" />
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-raised">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-wrap items-center gap-ds-04">{children}</div>
    </div>
  )
}
