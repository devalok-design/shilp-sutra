'use client'

import * as React from 'react'
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
} from 'date-fns'
import { cn } from '../../ui/lib/utils'

export type PresetKey =
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisYear'

export interface PresetsProps {
  presets: PresetKey[]
  onSelect: (start: Date, end: Date) => void
  className?: string
}

interface PresetDefinition {
  label: string
  getRange: () => { start: Date; end: Date }
}

const PRESET_MAP: Record<PresetKey, PresetDefinition> = {
  today: {
    label: 'Today',
    getRange: () => {
      const now = new Date()
      return { start: startOfDay(now), end: endOfDay(now) }
    },
  },
  yesterday: {
    label: 'Yesterday',
    getRange: () => {
      const yesterday = subDays(new Date(), 1)
      return { start: startOfDay(yesterday), end: endOfDay(yesterday) }
    },
  },
  last7days: {
    label: 'Last 7 days',
    getRange: () => {
      const now = new Date()
      return { start: startOfDay(subDays(now, 6)), end: endOfDay(now) }
    },
  },
  last30days: {
    label: 'Last 30 days',
    getRange: () => {
      const now = new Date()
      return { start: startOfDay(subDays(now, 29)), end: endOfDay(now) }
    },
  },
  thisMonth: {
    label: 'This month',
    getRange: () => {
      const now = new Date()
      return { start: startOfMonth(now), end: endOfMonth(now) }
    },
  },
  lastMonth: {
    label: 'Last month',
    getRange: () => {
      const now = new Date()
      const last = subMonths(now, 1)
      return { start: startOfMonth(last), end: endOfMonth(last) }
    },
  },
  thisYear: {
    label: 'This year',
    getRange: () => {
      const now = new Date()
      return { start: startOfYear(now), end: endOfDay(now) }
    },
  },
}

export function Presets({ presets, onSelect, className }: PresetsProps) {
  return (
    <div className={cn('flex flex-col gap-ds-01', className)}>
      {presets.map((key) => {
        const preset = PRESET_MAP[key]
        if (!preset) return null
        return (
          <button
            key={key}
            type="button"
            onClick={() => {
              const { start, end } = preset.getRange()
              onSelect(start, end)
            }}
            className={cn(
              'h-8 w-full rounded-[var(--radius-md)] px-ds-03 text-left text-ds-sm',
              'text-[var(--color-text-primary)] transition-colors',
              'hover:bg-[var(--color-field)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]',
            )}
          >
            {preset.label}
          </button>
        )
      })}
    </div>
  )
}

Presets.displayName = 'Presets'
