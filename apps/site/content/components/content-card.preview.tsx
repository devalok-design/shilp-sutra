'use client'

import { Button } from '@devalok/shilp-sutra/ui/button'
import { ContentCard } from '@devalok/shilp-sutra/composed/content-card'

export function ContentCardHero() {
  return (
    <div className="w-full max-w-md">
      <ContentCard
        headerTitle="Monthly usage"
        headerActions={<Button variant="ghost" size="sm">Export</Button>}
        footer={<span className="text-body-sm text-surface-fg-subtle">Updated 5 minutes ago</span>}
      >
        <p className="text-body-md text-surface-fg-subtle">
          Your team used 3,240 of 5,000 build minutes this month.
        </p>
      </ContentCard>
    </div>
  )
}

export function ContentCardVariants() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-06">
      <Block title="variant=default">
        <ContentCard>
          <p className="text-body-md text-surface-fg">Default raised card surface.</p>
        </ContentCard>
      </Block>

      <Block title="variant=outline">
        <ContentCard variant="outline">
          <p className="text-body-md text-surface-fg">Bordered, transparent background.</p>
        </ContentCard>
      </Block>

      <Block title="variant=ghost">
        <ContentCard variant="ghost">
          <p className="text-body-md text-surface-fg">No border until hover.</p>
        </ContentCard>
      </Block>

      <Block title="with header + footer">
        <ContentCard
          headerTitle="Billing"
          footer={<Button size="sm">Manage plan</Button>}
        >
          <p className="text-body-md text-surface-fg-subtle">Pro plan · renews July 30.</p>
        </ContentCard>
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-raised">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-col">{children}</div>
    </div>
  )
}
