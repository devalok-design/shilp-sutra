'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { Progress } from '@/ui'

// ============================================================
// Types
// ============================================================

export interface SubtaskProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  completed: number
  total: number
}

// ============================================================
// SubtaskProgress
// ============================================================

const SubtaskProgress = React.forwardRef<HTMLDivElement, SubtaskProgressProps>(
  function SubtaskProgress({ completed, total, className, ...props }, ref) {
    return (
      <div ref={ref} className={cn('mb-ds-05 flex items-center gap-ds-04', className)} {...props}>
        <Progress value={total > 0 ? (completed / total) * 100 : 0} className="h-ds-02b" />
        <span className="shrink-0 text-ds-sm font-medium text-surface-fg-subtle">
          {completed}/{total}
        </span>
      </div>
    )
  },
)

SubtaskProgress.displayName = 'SubtaskProgress'

export { SubtaskProgress }
