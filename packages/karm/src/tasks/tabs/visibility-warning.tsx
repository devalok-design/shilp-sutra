'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'

// ============================================================
// Types
// ============================================================

export interface VisibilityWarningProps extends React.HTMLAttributes<HTMLParagraphElement> {}

// ============================================================
// VisibilityWarning
// ============================================================

const VisibilityWarning = React.forwardRef<HTMLParagraphElement, VisibilityWarningProps>(
  function VisibilityWarning({ className, ...props }, ref) {
    return (
      <p
        ref={ref}
        className={cn('text-ds-xs text-warning-11', className)}
        {...props}
      >
        This task is visible to clients. Comments may be seen by external users.
      </p>
    )
  },
)

VisibilityWarning.displayName = 'VisibilityWarning'

export { VisibilityWarning }
