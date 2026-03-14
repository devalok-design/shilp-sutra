'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'

// ============================================================
// Types
// ============================================================

export interface ActivityTimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

// ============================================================
// ActivityTimeline
// ============================================================

const ActivityTimeline = React.forwardRef<HTMLDivElement, ActivityTimelineProps>(
  function ActivityTimeline({ children, className, ...props }, ref) {
    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        {/* Timeline line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-surface-border" />

        {/* Entries */}
        <div className="space-y-ds-05">
          {children}
        </div>
      </div>
    )
  },
)

ActivityTimeline.displayName = 'ActivityTimeline'

export { ActivityTimeline }
