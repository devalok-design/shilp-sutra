'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/ui/lib/utils'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/ui/tooltip'
import { useWeekHeatmap } from './week-heatmap-context'
import type { WeekDay } from './week-heatmap-context'

// ============================================================
// Helpers
// ============================================================

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const dayIndex = d.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
  // Map to Mon=0 ... Sun=6
  const mapped = dayIndex === 0 ? 6 : dayIndex - 1
  return DAY_LABELS[mapped]
}

function formatTooltipDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

type DayStatus = 'complete' | 'partial' | 'none' | 'today' | 'future' | 'empty'

function getDayStatus(day: WeekDay, today: string): DayStatus {
  if (day.date === today) return 'today'
  if (day.total === 0) return 'empty'
  if (day.date > today) return 'future'
  // Past day
  if (day.completed === day.total) return 'complete'
  if (day.completed > 0) return 'partial'
  return 'none'
}

const statusStyles: Record<DayStatus, string> = {
  complete: 'bg-success-9 text-success-11',
  partial: 'bg-warning-9 text-warning-11',
  none: 'bg-error-9 text-error-11',
  today: 'bg-info-9 ring-1 ring-info-7 text-info-11 font-medium',
  future: 'bg-surface-3 text-surface-fg-muted',
  empty: 'bg-surface-2 border border-dashed border-surface-border text-surface-fg-subtle',
}

// ============================================================
// Types
// ============================================================

export interface WeekHeatmapDayProps {
  day: WeekDay
  index: number
  focusedIndex: number
  onFocusChange: (index: number) => void
}

// ============================================================
// Component
// ============================================================

const WeekHeatmapDay = React.forwardRef<HTMLDivElement, WeekHeatmapDayProps>(
  function WeekHeatmapDay({ day, index, focusedIndex, onFocusChange }, ref) {
    const { onDayClick, today } = useWeekHeatmap()
    const status = getDayStatus(day, today)
    const label = getDayLabel(day.date)
    const isDisabled = status === 'empty'

    const tooltipContent = (
      <div className="flex flex-col">
        <span>{formatTooltipDate(day.date)}</span>
        <span>{day.total > 0 ? `${day.completed} of ${day.total} completed` : 'No tasks'}</span>
      </div>
    )

    const handleClick = () => {
      if (isDisabled || status === 'future') return
      onDayClick?.(day.date)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onDayClick?.(day.date)
      }
    }

    return (
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              ref={ref}
              role="gridcell"
              tabIndex={focusedIndex === index ? 0 : -1}
              aria-disabled={isDisabled || undefined}
              aria-label={`${label}, ${day.completed} of ${day.total} completed`}
              className="flex cursor-pointer flex-col items-center gap-ds-02 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-7"
              onClick={handleClick}
              onFocus={() => onFocusChange(index)}
              onKeyDown={handleKeyDown}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-ds-xs text-surface-fg-muted">{label}</span>
              <div
                className={cn(
                  'flex h-8 w-10 items-center justify-center rounded-ds-md',
                  statusStyles[status],
                )}
              />
              {day.total > 0 ? (
                <span className="text-ds-xs text-surface-fg-muted">
                  {day.completed}/{day.total}
                </span>
              ) : (
                <span className="text-ds-xs text-surface-fg-subtle">&mdash;</span>
              )}
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>{tooltipContent}</TooltipContent>
        </Tooltip>
    )
  },
)

WeekHeatmapDay.displayName = 'WeekHeatmapDay'

export { WeekHeatmapDay, getDayLabel, getDayStatus, type DayStatus }
