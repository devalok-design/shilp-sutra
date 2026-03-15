'use client'

import * as React from 'react'
import { IconFilter, IconFilterX } from '@tabler/icons-react'
import { cn } from '@/ui/lib/utils'
import { useScratchpad } from './scratchpad-context'

// ============================================================
// Types
// ============================================================

export interface ScratchpadFilterToggleProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {}

// ============================================================
// Component
// ============================================================

const ScratchpadFilterToggle = React.forwardRef<HTMLButtonElement, ScratchpadFilterToggleProps>(
  function ScratchpadFilterToggle({ className, ...props }, ref) {
    const { showCompleted, setShowCompleted } = useScratchpad()

    const Icon = showCompleted ? IconFilter : IconFilterX

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => setShowCompleted(!showCompleted)}
        aria-label={showCompleted ? 'Hide completed' : 'Show completed'}
        className={cn(
          'flex h-ico-md w-ico-md items-center justify-center rounded-ds-sm text-surface-fg-muted transition-colors hover:bg-surface-2 hover:text-surface-fg',
          className,
        )}
        {...props}
      >
        <Icon className="h-3.5 w-3.5" />
      </button>
    )
  },
)

ScratchpadFilterToggle.displayName = 'ScratchpadFilterToggle'

export { ScratchpadFilterToggle }
