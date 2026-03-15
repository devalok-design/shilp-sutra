'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { Scratchpad } from './scratchpad'
import type { ScratchpadItem } from './scratchpad/scratchpad-context'

// ============================================================
// Types
// ============================================================

export interface SidebarScratchpadProps extends React.HTMLAttributes<HTMLDivElement> {
  items: ScratchpadItem[]
  onToggle: (id: string, done: boolean) => void
  onAdd?: (text: string) => void
  onDelete?: (id: string) => void
  onEdit?: (id: string, text: string) => void
  onReorder?: (items: ScratchpadItem[]) => void
  onPromote?: (id: string) => void
  maxItems?: number
  defaultOpen?: boolean
  badgeCount?: number
}

// ============================================================
// Component
// ============================================================

const SidebarScratchpad = React.forwardRef<HTMLDivElement, SidebarScratchpadProps>(
  function SidebarScratchpad(
    {
      items,
      onToggle,
      onAdd,
      onDelete,
      onEdit,
      onReorder,
      onPromote,
      maxItems = 20,
      defaultOpen = true,
      badgeCount,
      className,
      ...props
    },
    ref,
  ) {
    return (
      <Scratchpad.Root
        ref={ref}
        items={items}
        maxItems={maxItems}
        onToggle={onToggle}
        onAdd={onAdd}
        onDelete={onDelete}
        onEdit={onEdit}
        onReorder={onReorder}
        onPromote={onPromote}
        className={cn('flex flex-col', className)}
        {...props}
      >
        <Scratchpad.Collapse defaultOpen={defaultOpen} badgeCount={badgeCount}>
          <div className="flex flex-col gap-0.5 px-ds-03 pb-ds-02">
            <Scratchpad.List compact />
            <Scratchpad.AddInput
              placeholder="Quick add..."
              triggerLabel="+ Add..."
              className="mt-0"
            />
          </div>
        </Scratchpad.Collapse>
      </Scratchpad.Root>
    )
  },
)

SidebarScratchpad.displayName = 'SidebarScratchpad'

export { SidebarScratchpad }
