'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { useScratchpad } from './scratchpad-context'

// ============================================================
// Types
// ============================================================

export interface ScratchpadEmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Icon shown above the message */
  icon?: React.ComponentType<{ className?: string }>
  /** Message displayed when no items */
  message?: string
}

// ============================================================
// Component
// ============================================================

const ScratchpadEmptyState = React.forwardRef<HTMLDivElement, ScratchpadEmptyStateProps>(
  function ScratchpadEmptyState(
    { icon: Icon, message = 'Nothing here yet. Add a task!', className, ...props },
    ref,
  ) {
    const { visibleItems } = useScratchpad()

    // Auto-hide when items exist
    if (visibleItems.length > 0) return null

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center gap-ds-03 py-ds-06 text-center',
          className,
        )}
        {...props}
      >
        {Icon && <Icon className="h-ico-lg w-ico-lg text-surface-fg-subtle" />}
        <span className="text-ds-md text-surface-fg-subtle">{message}</span>
      </div>
    )
  },
)

ScratchpadEmptyState.displayName = 'ScratchpadEmptyState'

export { ScratchpadEmptyState }
