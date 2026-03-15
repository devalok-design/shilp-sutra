'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { Progress } from '@/ui/progress'
import { useWeekHeatmap } from './week-heatmap-context'

// ============================================================
// Types
// ============================================================

export interface WeekHeatmapProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {}

// ============================================================
// Component
// ============================================================

const WeekHeatmapProgressBar = React.forwardRef<HTMLDivElement, WeekHeatmapProgressBarProps>(
  function WeekHeatmapProgressBar({ className, ...props }, ref) {
    const { totalCompleted, totalTasks } = useWeekHeatmap()
    const percentage = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0

    return (
      <div ref={ref} className={cn(className)} {...props}>
        <Progress color="success" size="sm" value={percentage} aria-label="Weekly completion progress" />
      </div>
    )
  },
)

WeekHeatmapProgressBar.displayName = 'WeekHeatmapProgressBar'

export { WeekHeatmapProgressBar }
