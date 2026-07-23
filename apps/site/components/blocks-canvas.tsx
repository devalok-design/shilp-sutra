'use client'

import { useState, type ComponentType } from 'react'
import { BlockDetailShell } from './block-detail-shell'

export type BlockTabData = {
  slug: string
  title: string
  description: string
  tags: readonly string[]
  uses: readonly string[]
  source: string
  Component: ComponentType
}

/**
 * Inline tabbed viewer for the Blocks section on /showcase — switching tabs
 * shows that block's live preview (and its source, via BlockDetailShell)
 * right here, no navigation to a separate /blocks/[slug] page required.
 */
export function BlocksCanvas({ blocks }: { blocks: BlockTabData[] }) {
  const [activeSlug, setActiveSlug] = useState(blocks[0]?.slug)
  const active = blocks.find((b) => b.slug === activeSlug) ?? blocks[0]
  if (!active) return null

  return (
    <div className="rounded-surface border border-surface-border bg-surface-base overflow-hidden">
      <div
        role="tablist"
        aria-label="Blocks"
        className="flex items-stretch border-b border-surface-border-subtle bg-surface-raised overflow-x-auto"
      >
        {blocks.map((b) => {
          const isActive = b.slug === active.slug
          return (
            <button
              key={b.slug}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveSlug(b.slug)}
              className={[
                'px-ds-04 py-ds-03 text-ds-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors duration-fast-02 ease-productive-standard',
                isActive
                  ? 'border-accent-9 text-surface-fg'
                  : 'border-transparent text-surface-fg-muted hover:text-surface-fg',
              ].join(' ')}
            >
              {b.title}
            </button>
          )
        })}
      </div>

      <div className="p-ds-05 sm:p-ds-06 flex flex-col gap-ds-04">
        <p className="text-ds-sm text-surface-fg-muted max-w-prose">{active.description}</p>
        <BlockDetailShell source={active.source} uses={[...active.uses]}>
          <active.Component />
        </BlockDetailShell>
      </div>
    </div>
  )
}
