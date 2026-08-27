'use client'

import { Button } from '@devalok/shilp-sutra/ui/button'
import { PageHeader } from '@devalok/shilp-sutra/composed/page-header'

export function PageHeaderHero() {
  return (
    <div className="w-full">
      <PageHeader
        title="Projects"
        subtitle="Everything your team is shipping this quarter."
        actions={
          <>
            <Button variant="soft">Filter</Button>
            <Button>New project</Button>
          </>
        }
      />
    </div>
  )
}

export function PageHeaderVariants() {
  return (
    <div className="grid grid-cols-1 gap-ds-06">
      <Block title="with breadcrumbs">
        <PageHeader
          breadcrumbs={[
            { label: 'Home', href: '#' },
            { label: 'Projects', href: '#' },
            { label: 'Orbit redesign' },
          ]}
          title="Orbit redesign"
          subtitle="A ground-up refresh of the marketing surface."
        />
      </Block>

      <Block title="title only">
        <PageHeader title="Settings" />
      </Block>

      <Block title="with actions">
        <PageHeader
          title="Team"
          actions={<Button>Invite member</Button>}
        />
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-panel">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-col">{children}</div>
    </div>
  )
}
