'use client'

import { IconFile, IconFolder } from '@tabler/icons-react'
import { TreeView } from '@devalok/shilp-sutra/ui/tree-view'

const ITEMS = [
  {
    id: 'src',
    label: 'src',
    icon: IconFolder,
    children: [
      {
        id: 'components',
        label: 'components',
        icon: IconFolder,
        children: [
          { id: 'button', label: 'button.tsx', icon: IconFile },
          { id: 'card', label: 'card.tsx', icon: IconFile },
        ],
      },
      { id: 'index', label: 'index.ts', icon: IconFile },
    ],
  },
  {
    id: 'public',
    label: 'public',
    icon: IconFolder,
    children: [{ id: 'logo', label: 'logo.svg', icon: IconFile }],
  },
  { id: 'readme', label: 'README.md', icon: IconFile },
]

export function TreeViewHero() {
  return (
    <div className="w-full max-w-sm rounded-surface border border-surface-border-subtle bg-surface-panel p-ds-03">
      <TreeView items={ITEMS} defaultExpanded={['src', 'components']} />
    </div>
  )
}

export function TreeViewVariants() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-06">
      <Block title="collapsed by default">
        <TreeView items={ITEMS} />
      </Block>

      <Block title="checkboxes + multiSelect">
        <TreeView items={ITEMS} defaultExpanded={['src']} checkboxes multiSelect />
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
