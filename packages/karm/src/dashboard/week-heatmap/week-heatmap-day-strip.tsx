'use client'

import * as React from 'react'
import { useCallback, useRef, useState } from 'react'
import { cn } from '@/ui/lib/utils'
import { motionProps } from '@/ui/lib/motion'
import { MotionStagger, MotionStaggerItem } from '@/motion/primitives'
import { MotionPop } from '@/motion/primitives'
import { useWeekHeatmap } from './week-heatmap-context'
import { WeekHeatmapDay } from './week-heatmap-day'

// ============================================================
// Types
// ============================================================

export interface WeekHeatmapDayStripProps extends React.HTMLAttributes<HTMLDivElement> {}

// ============================================================
// Component
// ============================================================

const WeekHeatmapDayStrip = React.forwardRef<HTMLDivElement, WeekHeatmapDayStripProps>(
  function WeekHeatmapDayStrip({ className, ...props }, ref) {
    const { days, today } = useWeekHeatmap()
    const [focusedIndex, setFocusedIndex] = useState(0)
    const cellRefs = useRef<(HTMLDivElement | null)[]>([])

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        let nextIndex = focusedIndex

        switch (e.key) {
          case 'ArrowRight':
            e.preventDefault()
            nextIndex = Math.min(focusedIndex + 1, days.length - 1)
            break
          case 'ArrowLeft':
            e.preventDefault()
            nextIndex = Math.max(focusedIndex - 1, 0)
            break
          case 'Home':
            e.preventDefault()
            nextIndex = 0
            break
          case 'End':
            e.preventDefault()
            nextIndex = days.length - 1
            break
          default:
            return
        }

        setFocusedIndex(nextIndex)
        cellRefs.current[nextIndex]?.focus()
      },
      [focusedIndex, days.length],
    )

    return (
      <MotionStagger
        ref={ref}
        role="grid"
        aria-label="Weekly task completion"
        delay={0.05}
        className={cn('grid grid-cols-7 gap-ds-03', className)}
        onKeyDown={handleKeyDown}
        {...motionProps(props)}
      >
        <div role="row" className="contents">
          {days.map((day, i) => {
            const isToday = day.date === today
            const dayEl = (
              <WeekHeatmapDay
                ref={(el: HTMLDivElement | null) => {
                  cellRefs.current[i] = el
                }}
                day={day}
                index={i}
                focusedIndex={focusedIndex}
                onFocusChange={setFocusedIndex}
              />
            )

            if (isToday) {
              return (
                <MotionPop key={day.date} show preset="bouncy">
                  {dayEl}
                </MotionPop>
              )
            }

            return (
              <MotionStaggerItem key={day.date}>
                {dayEl}
              </MotionStaggerItem>
            )
          })}
        </div>
      </MotionStagger>
    )
  },
)

WeekHeatmapDayStrip.displayName = 'WeekHeatmapDayStrip'

export { WeekHeatmapDayStrip }
