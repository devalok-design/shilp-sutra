'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { useWeekHeatmap } from './week-heatmap-context'

// ============================================================
// Types
// ============================================================

export interface WeekHeatmapSummaryProps extends React.HTMLAttributes<HTMLDivElement> {}

// ============================================================
// Component
// ============================================================

const WeekHeatmapSummary = React.forwardRef<HTMLDivElement, WeekHeatmapSummaryProps>(
  function WeekHeatmapSummary({ className, ...props }, ref) {
    const { totalCompleted, totalTasks, overdue } = useWeekHeatmap()
    const remaining = totalTasks - totalCompleted

    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-ds-03 text-ds-sm', className)}
        {...props}
      >
        <span className="text-success-11">{totalCompleted} completed</span>
        <span className="text-surface-fg-subtle">&middot;</span>
        <span className="text-surface-fg-muted">{remaining} remaining</span>
        {overdue != null && overdue > 0 && (
          <>
            <span className="text-surface-fg-subtle">&middot;</span>
            <span className="text-error-11">{overdue} overdue</span>
          </>
        )}
      </div>
    )
  },
)

WeekHeatmapSummary.displayName = 'WeekHeatmapSummary'

export { WeekHeatmapSummary }
