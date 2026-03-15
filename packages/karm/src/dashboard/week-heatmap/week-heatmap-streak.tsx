'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { useWeekHeatmap } from './week-heatmap-context'

// ============================================================
// Types
// ============================================================

export interface WeekHeatmapStreakProps extends React.HTMLAttributes<HTMLDivElement> {}

// ============================================================
// Component
// ============================================================

const WeekHeatmapStreak = React.forwardRef<HTMLDivElement, WeekHeatmapStreakProps>(
  function WeekHeatmapStreak({ className, ...props }, ref) {
    const { streak } = useWeekHeatmap()

    if (streak <= 1) return null

    return (
      <div
        ref={ref}
        className={cn('text-ds-sm font-medium text-warning-11', className)}
        {...props}
      >
        🔥 {streak}-day streak
      </div>
    )
  },
)

WeekHeatmapStreak.displayName = 'WeekHeatmapStreak'

export { WeekHeatmapStreak }
