'use client'

import { IconFolderOff, IconInbox, IconSearch } from '@tabler/icons-react'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { EmptyState } from '@devalok/shilp-sutra/composed/empty-state'

export function EmptyStateHero() {
  return (
    <div className="w-full max-w-md">
      <EmptyState
        icon={<IconInbox />}
        title="No messages yet"
        description="When teammates send you a message, it will show up here."
        action={<Button>Start a conversation</Button>}
      />
    </div>
  )
}

export function EmptyStateVariants() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-06">
      <Block title="with action">
        <EmptyState
          icon={<IconFolderOff />}
          title="No projects"
          description="Create your first project to get going."
          action={<Button variant="soft">New project</Button>}
        />
      </Block>

      <Block title="no description">
        <EmptyState icon={<IconSearch />} title="No results found" />
      </Block>

      <Block title="compact">
        <EmptyState
          compact
          icon={<IconInbox />}
          title="Inbox zero"
          description="You are all caught up."
        />
      </Block>

      <Block title="default chakra icon">
        <EmptyState title="Nothing here yet" description="Falls back to the Devalok glyph." />
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
