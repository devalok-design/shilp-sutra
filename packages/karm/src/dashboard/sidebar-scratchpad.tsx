'use client'

import * as React from 'react'
import { useState } from 'react'
import { IconChevronDown } from '@tabler/icons-react'
import { cn } from '@/ui/lib/utils'
import { Checkbox } from '@/ui/checkbox'
import type { ScratchpadItem } from './scratchpad-widget'

// ============================================================
// Types
// ============================================================

export interface SidebarScratchpadProps {
  items: ScratchpadItem[]
  onToggle: (id: string, done: boolean) => void
  defaultOpen?: boolean
  badgeCount?: number
  className?: string
}

// ============================================================
// Component
// ============================================================

const SidebarScratchpad = React.forwardRef<HTMLDivElement, SidebarScratchpadProps>(
  function SidebarScratchpad(
    { items, onToggle, defaultOpen = true, badgeCount, className },
    ref,
  ) {
    const [open, setOpen] = useState(defaultOpen)

    return (
      <div ref={ref} className={cn('flex flex-col', className)}>
        {/* Collapsible header */}
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          className="flex w-full items-center gap-ds-02 px-ds-03 py-ds-02 text-left text-ds-xs font-semibold text-text-secondary transition-colors hover:bg-layer-02"
        >
          <IconChevronDown
            className={cn(
              'h-3.5 w-3.5 shrink-0 transition-transform duration-200',
              !open && '-rotate-180',
            )}
          />
          <span className="flex-1">Scratchpad</span>
          {badgeCount != null && badgeCount > 0 && (
            <span className="rounded-full bg-layer-02 px-1.5 text-ds-xs text-text-secondary">
              {badgeCount}
            </span>
          )}
        </button>

        {/* Collapsible body */}
        <div
          className={cn(
            'grid transition-[grid-template-rows] duration-200',
            open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-0.5 px-ds-03 pb-ds-02">
              {items.map((item) => (
                <label
                  key={item.id}
                  className="flex cursor-pointer items-center gap-ds-02 rounded-ds-sm px-ds-02 py-0.5 transition-colors hover:bg-layer-02"
                >
                  <Checkbox
                    checked={item.done}
                    onCheckedChange={(checked) => onToggle(item.id, checked === true)}
                    aria-label={`Toggle ${item.text}`}
                    className="h-3.5 w-3.5"
                  />
                  <span
                    className={cn(
                      'flex-1 text-xs transition-all duration-200',
                      item.done ? 'text-text-placeholder line-through' : 'text-text-primary',
                    )}
                  >
                    {item.text}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  },
)

SidebarScratchpad.displayName = 'SidebarScratchpad'

export { SidebarScratchpad }
