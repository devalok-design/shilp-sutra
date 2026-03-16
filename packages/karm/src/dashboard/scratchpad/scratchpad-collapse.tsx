'use client'

import * as React from 'react'
import { useState } from 'react'
import { IconChevronDown } from '@tabler/icons-react'
import { cn } from '@/ui/lib/utils'

// ============================================================
// Types
// ============================================================

export interface ScratchpadCollapseProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Header label */
  label?: string
  /** Whether expanded on first render */
  defaultOpen?: boolean
  /** Badge count shown next to the label */
  badgeCount?: number
  /** Header text size class override */
  headerClassName?: string
}

// ============================================================
// Component
// ============================================================

const ScratchpadCollapse = React.forwardRef<HTMLDivElement, ScratchpadCollapseProps>(
  function ScratchpadCollapse(
    {
      label = 'Scratchpad',
      defaultOpen = true,
      badgeCount,
      headerClassName,
      className,
      children,
      ...props
    },
    ref,
  ) {
    const [open, setOpen] = useState(defaultOpen)

    return (
      <div ref={ref} className={cn('flex flex-col', className)} {...props}>
        {/* Collapsible header */}
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          className={cn(
            'flex w-full items-center gap-ds-02 px-ds-03 py-ds-02 text-left text-ds-sm font-semibold text-surface-fg-muted transition-colors duration-150 hover:bg-surface-raised-hover',
            headerClassName,
          )}
        >
          <IconChevronDown
            className={cn(
              'h-3.5 w-3.5 shrink-0 transition-transform duration-200',
              !open && '-rotate-90',
            )}
          />
          <span className="flex-1">{label}</span>
          {badgeCount != null && badgeCount > 0 && (
            <span className="rounded-full bg-surface-raised-hover px-1.5 text-ds-xs text-surface-fg-muted">
              {badgeCount}
            </span>
          )}
        </button>

        {/* Collapsible body — CSS grid transition */}
        <div
          className={cn(
            'grid transition-[grid-template-rows] duration-200',
            open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
        >
          <div className="overflow-hidden">{children}</div>
        </div>
      </div>
    )
  },
)

ScratchpadCollapse.displayName = 'ScratchpadCollapse'

export { ScratchpadCollapse }
