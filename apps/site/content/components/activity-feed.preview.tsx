'use client'

import { IconGitCommit, IconMessage, IconRocket, IconUserPlus } from '@tabler/icons-react'
import { ActivityFeed, type ActivityItem } from '@devalok/shilp-sutra/composed/activity-feed'

// Fixed string timestamps (never `new Date()` at render — that diverges between
// server and client and trips a hydration mismatch). groupBy="none" keeps the
// order deterministic instead of computing "Today/Yesterday" from the clock.
const ITEMS: ActivityItem[] = [
  {
    id: '1',
    actor: { name: 'Aisha Kapoor' },
    action: 'shipped the Orbit redesign',
    timestamp: '2026-05-24T11:42:00',
    icon: IconRocket,
    color: 'success',
  },
  {
    id: '2',
    actor: { name: 'Ben Carter' },
    action: 'merged ds-link-button into main',
    timestamp: '2026-05-24T10:18:00',
    icon: IconGitCommit,
    color: 'info',
  },
  {
    id: '3',
    actor: { name: 'Chen Wei' },
    action: 'left a comment on Billing v2',
    timestamp: '2026-05-24T09:30:00',
    icon: IconMessage,
    detail: '“Can we ship the tiered plan first?”',
  },
  {
    id: '4',
    actor: { name: 'Diego Alvarez' },
    action: 'joined the workspace',
    timestamp: '2026-05-23T17:05:00',
    icon: IconUserPlus,
  },
]

export function ActivityFeedHero() {
  return (
    <div className="max-w-md">
      <ActivityFeed items={ITEMS} groupBy="none" />
    </div>
  )
}

export function ActivityFeedVariants() {
  return (
    <div className="flex flex-col gap-ds-06">
      <Block title="compact">
        <ActivityFeed items={ITEMS} groupBy="none" compact />
      </Block>
      <Block title="empty state">
        <ActivityFeed items={[]} groupBy="none" emptyState="No activity yet." />
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 rounded-control border border-surface-border-subtle bg-surface-panel p-ds-05">
      <span className="font-mono text-ds-xs text-surface-fg-subtle">{title}</span>
      {children}
    </div>
  )
}
