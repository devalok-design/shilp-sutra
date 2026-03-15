'use client'

import * as React from 'react'
import { WeekHeatmapRoot } from './week-heatmap-root'
import type { WeekHeatmapRootProps } from './week-heatmap-root'
import { WeekHeatmapDayStrip } from './week-heatmap-day-strip'
import { WeekHeatmapSummary } from './week-heatmap-summary'
import { WeekHeatmapProgressBar } from './week-heatmap-progress-bar'
import { WeekHeatmapStreak } from './week-heatmap-streak'
import { WeekHeatmapDay } from './week-heatmap-day'

// ============================================================
// Props shorthand
// ============================================================

export interface WeekHeatmapProps extends WeekHeatmapRootProps {}

/**
 * WeekHeatmap — props shorthand that renders the default layout.
 * For custom arrangements, use the compound `WeekHeatmap.Root`, `.DayStrip`, etc.
 */
const WeekHeatmapShorthand = React.forwardRef<HTMLDivElement, WeekHeatmapProps>(
  function WeekHeatmapShorthand(props, ref) {
    const { children, ...rootProps } = props
    return (
      <WeekHeatmapRoot ref={ref} {...rootProps}>
        <WeekHeatmapDayStrip />
        <WeekHeatmapStreak />
        <WeekHeatmapSummary />
        <WeekHeatmapProgressBar />
      </WeekHeatmapRoot>
    )
  },
)

WeekHeatmapShorthand.displayName = 'WeekHeatmap'

// ============================================================
// Compound component namespace
// ============================================================

/**
 * Compound component for building weekly heatmap UIs.
 *
 * @example Props shorthand:
 * ```tsx
 * <WeekHeatmap days={days} onDayClick={fn} overdue={2} />
 * ```
 *
 * @example Composable:
 * ```tsx
 * <WeekHeatmap.Root days={days} onDayClick={fn}>
 *   <WeekHeatmap.DayStrip />
 *   <WeekHeatmap.Streak />
 *   <WeekHeatmap.Summary />
 *   <WeekHeatmap.ProgressBar />
 * </WeekHeatmap.Root>
 * ```
 */
const WeekHeatmap = Object.assign(WeekHeatmapShorthand, {
  Root: WeekHeatmapRoot,
  DayStrip: WeekHeatmapDayStrip,
  Day: WeekHeatmapDay,
  Summary: WeekHeatmapSummary,
  ProgressBar: WeekHeatmapProgressBar,
  Streak: WeekHeatmapStreak,
})

export { WeekHeatmap }
