'use client'

import { DeadlineIndicator } from '@devalok/shilp-sutra/composed/deadline-indicator'

const HOUR = 60 * 60 * 1000

export function DeadlineIndicatorHero() {
  return (
    <div className="flex flex-wrap items-center gap-ds-05">
      <DeadlineIndicator deadline={new Date(Date.now() + 48 * HOUR)} showIcon />
      <DeadlineIndicator deadline={new Date(Date.now() + 3 * HOUR)} showIcon />
      <DeadlineIndicator deadline={new Date(Date.now() - 2 * HOUR)} showIcon />
    </div>
  )
}

export function DeadlineIndicatorVariants() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-06">
      <Block title="urgency (color reflects time left)">
        <DeadlineIndicator deadline={new Date(Date.now() + 72 * HOUR)} showIcon />
        <DeadlineIndicator deadline={new Date(Date.now() + 12 * HOUR)} showIcon />
        <DeadlineIndicator deadline={new Date(Date.now() + 2 * HOUR)} showIcon />
        <DeadlineIndicator deadline={new Date(Date.now() - HOUR)} showIcon />
      </Block>

      <Block title="format=absolute">
        <DeadlineIndicator deadline={new Date(Date.now() + 30 * HOUR)} format="absolute" showIcon />
      </Block>

      <Block title="no icon">
        <DeadlineIndicator deadline={new Date(Date.now() + 5 * HOUR)} />
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
