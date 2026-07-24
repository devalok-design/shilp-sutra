'use client'

import { IconHeart, IconPlus, IconTrash, IconX } from '@tabler/icons-react'
import { IconButton } from '@devalok/shilp-sutra/ui/icon-button'

export function IconButtonHero() {
  return (
    <div className="flex flex-wrap items-center gap-ds-03">
      <IconButton icon={<IconPlus />} aria-label="Create new" />
      <IconButton icon={<IconHeart />} variant="soft" aria-label="Favourite" />
      <IconButton icon={<IconX />} variant="ghost" shape="circle" aria-label="Close" />
      <IconButton icon={<IconTrash />} variant="soft" color="error" aria-label="Delete" />
    </div>
  )
}

export function IconButtonVariants() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-06">
      <Block title="variant">
        <IconButton icon={<IconPlus />} variant="solid" aria-label="Solid" />
        <IconButton icon={<IconPlus />} variant="soft" aria-label="Soft" />
        <IconButton icon={<IconPlus />} variant="outline" aria-label="Outline" />
        <IconButton icon={<IconPlus />} variant="ghost" aria-label="Ghost" />
      </Block>

      <Block title="shape">
        <IconButton icon={<IconHeart />} shape="square" aria-label="Square" />
        <IconButton icon={<IconHeart />} shape="circle" aria-label="Circle" />
      </Block>

      <Block title="size">
        <IconButton icon={<IconPlus />} size="sm" aria-label="Small" />
        <IconButton icon={<IconPlus />} size="md" aria-label="Medium" />
        <IconButton icon={<IconPlus />} size="lg" aria-label="Large" />
      </Block>

      <Block title="disabled / loading">
        <IconButton icon={<IconPlus />} disabled aria-label="Disabled" />
        <IconButton icon={<IconPlus />} loading aria-label="Loading" />
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-raised">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-wrap items-center gap-ds-03">{children}</div>
    </div>
  )
}
