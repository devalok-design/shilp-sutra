'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { WeekHeatmapProvider } from './week-heatmap-context'
import type { WeekHeatmapProviderProps } from './week-heatmap-context'

// ============================================================
// Types
// ============================================================

export interface WeekHeatmapRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDayClick'>,
    Omit<WeekHeatmapProviderProps, 'children'> {}

// ============================================================
// Component
// ============================================================

const WeekHeatmapRoot = React.forwardRef<HTMLDivElement, WeekHeatmapRootProps>(
  function WeekHeatmapRoot(
    { days, onDayClick, overdue, today, className, children, ...props },
    ref,
  ) {
    return (
      <WeekHeatmapProvider
        days={days}
        onDayClick={onDayClick}
        overdue={overdue}
        today={today}
      >
        <div ref={ref} className={cn('flex flex-col gap-ds-04', className)} {...props}>
          {children}
        </div>
      </WeekHeatmapProvider>
    )
  },
)

WeekHeatmapRoot.displayName = 'WeekHeatmapRoot'

export { WeekHeatmapRoot }
