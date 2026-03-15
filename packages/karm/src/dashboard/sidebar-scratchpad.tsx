'use client'

import * as React from 'react'
import { useState } from 'react'
import { IconChevronDown } from '@tabler/icons-react'
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
  /** @deprecated Use ProgressRing instead — badge is no longer rendered */
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
      // badgeCount kept in signature for back-compat but no longer rendered
      badgeCount: _badgeCount,
      className,
      ...props
    },
    ref,
  ) {
    const [open, setOpen] = useState(defaultOpen)

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
        <div className="flex flex-col">
          {/* Collapsible header with ProgressRing + FilterToggle */}
          <div className="flex w-full items-center gap-ds-02 px-ds-03 py-ds-02 text-ds-sm font-semibold text-surface-fg-muted">
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              aria-expanded={open}
              aria-label="Scratchpad"
              className="flex flex-1 items-center gap-ds-02 text-left transition-colors duration-150 hover:text-surface-fg"
            >
              <IconChevronDown
                className={cn(
                  'h-3.5 w-3.5 shrink-0 transition-transform duration-200',
                  !open && '-rotate-90',
                )}
              />
              <span className="flex-1">Scratchpad</span>
            </button>
            <Scratchpad.FilterToggle />
            <Scratchpad.ProgressRing size="sm" />
          </div>

          {/* Collapsible body — CSS grid transition */}
          <div
            className={cn(
              'grid transition-[grid-template-rows] duration-200',
              open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
            )}
          >
            <div className="overflow-hidden">
              <div className="flex flex-col gap-0.5 px-ds-03 pb-ds-02">
                <Scratchpad.EmptyState />
                <Scratchpad.List compact />
                <Scratchpad.AddInput
                  placeholder="Quick add..."
                  triggerLabel="+ Add..."
                  className="mt-0"
                />
              </div>
            </div>
          </div>
        </div>
      </Scratchpad.Root>
    )
  },
)

SidebarScratchpad.displayName = 'SidebarScratchpad'

export { SidebarScratchpad }
