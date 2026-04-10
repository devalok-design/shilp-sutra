'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { IconClock, IconCalendarEvent, IconX } from '@tabler/icons-react'
import { Icon } from '../../ui/icon'
import { Button } from '../../ui/button'
import { cn } from '../../ui/lib/utils'
import { DateTimePicker } from '../date-picker'

// ── Smart Presets ──────────────────────────────────────────────

interface PresetOption {
  label: string
  date: Date
}

function getSmartPresets(): PresetOption[] {
  const now = new Date()
  const hour = now.getHours()
  const presets: PresetOption[] = []

  const nextTime = (targetHour: number, daysAhead = 0) => {
    const d = new Date(now)
    d.setDate(d.getDate() + daysAhead)
    d.setHours(targetHour, 0, 0, 0)
    return d
  }

  const nextMonday = (targetHour: number) => {
    const d = new Date(now)
    const dayOfWeek = d.getDay()
    const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 7 : 8 - dayOfWeek
    d.setDate(d.getDate() + daysUntilMonday)
    d.setHours(targetHour, 0, 0, 0)
    return d
  }

  if (hour < 9) {
    presets.push({ label: 'Later this morning · 9:00 AM', date: nextTime(9) })
    presets.push({ label: 'This afternoon · 1:00 PM', date: nextTime(13) })
    presets.push({ label: 'This evening · 6:00 PM', date: nextTime(18) })
  } else if (hour < 13) {
    presets.push({ label: 'This afternoon · 1:00 PM', date: nextTime(13) })
    presets.push({ label: 'This evening · 6:00 PM', date: nextTime(18) })
    presets.push({ label: 'Tomorrow morning · 9:00 AM', date: nextTime(9, 1) })
  } else if (hour < 18) {
    presets.push({ label: 'This evening · 6:00 PM', date: nextTime(18) })
    presets.push({ label: 'Tomorrow morning · 9:00 AM', date: nextTime(9, 1) })
    presets.push({ label: 'Tomorrow afternoon · 1:00 PM', date: nextTime(13, 1) })
  } else {
    presets.push({ label: 'Tomorrow morning · 9:00 AM', date: nextTime(9, 1) })
    presets.push({ label: 'Tomorrow afternoon · 1:00 PM', date: nextTime(13, 1) })
  }

  const monday = nextMonday(9)
  if (monday.getTime() - now.getTime() > 2 * 24 * 60 * 60 * 1000) {
    presets.push({ label: 'Next Monday · 9:00 AM', date: monday })
  }

  return presets
}

// ── Schedule Dropdown Content ──────────────────────────────────
// Renders inside SplitButton's dropdownContent slot.

export interface ScheduleDropdownContentProps {
  onSchedule: (date: Date) => void
  onClose: () => void
}

export function ScheduleDropdownContent({ onSchedule, onClose }: ScheduleDropdownContentProps) {
  const [showPicker, setShowPicker] = React.useState(false)
  const [customDate, setCustomDate] = React.useState<Date | null>(null)

  const presets = React.useMemo(() => getSmartPresets(), [])

  const handlePreset = (date: Date) => {
    onSchedule(date)
    onClose()
  }

  const handleCustomConfirm = () => {
    if (customDate) {
      onSchedule(customDate)
      onClose()
      setCustomDate(null)
    }
  }

  if (showPicker) {
    return (
      <div className="p-ds-04" style={{ minWidth: 280 }}>
        <div className="mb-ds-03 flex items-center justify-between">
          <p className="text-ds-sm font-medium text-surface-fg">Pick date & time</p>
          <button
            type="button"
            onClick={() => setShowPicker(false)}
            className="inline-flex items-center justify-center rounded-ds-md p-ds-01 text-surface-fg-subtle hover:bg-surface-raised-hover hover:text-surface-fg transition-colors"
            aria-label="Back to presets"
          >
            <Icon icon={IconX} size="sm" />
          </button>
        </div>
        <DateTimePicker
          value={customDate}
          onChange={setCustomDate}
          minDate={new Date()}
          placeholder="Select date & time"
        />
        <div className="mt-ds-03 flex justify-end">
          <Button
            variant="solid"
            size="sm"
            onClick={handleCustomConfirm}
            disabled={!customDate || customDate <= new Date()}
          >
            Confirm
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-ds-02" style={{ minWidth: 260 }}>
      <p className="px-ds-03 py-ds-01 text-ds-xs font-medium text-surface-fg-subtle">
        Schedule send
      </p>
      {presets.map((preset, i) => (
        <button
          key={i}
          type="button"
          onClick={() => handlePreset(preset.date)}
          className="flex w-full items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-02b text-ds-sm text-surface-fg hover:bg-surface-raised-hover transition-colors duration-fast-01"
        >
          <Icon icon={IconClock} size="sm" className="shrink-0 text-surface-fg-muted" />
          {preset.label}
        </button>
      ))}
      <div className="mx-ds-02 my-ds-02 h-px bg-surface-border" />
      <button
        type="button"
        onClick={() => setShowPicker(true)}
        className="flex w-full items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-02b text-ds-sm text-surface-fg hover:bg-surface-raised-hover transition-colors duration-fast-01"
      >
        <Icon icon={IconCalendarEvent} size="sm" className="shrink-0 text-accent-11" />
        Pick date & time...
      </button>
    </div>
  )
}

// ── Schedule Banner ────────────────────────────────────────────

function formatScheduleTime(date: Date): string {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const isToday = date.toDateString() === now.toDateString()
  const isTomorrow = date.toDateString() === tomorrow.toDateString()

  const time = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

  if (isToday) return `Today at ${time}`
  if (isTomorrow) return `Tomorrow at ${time}`
  return `${date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at ${time}`
}

export function ScheduleBanner({ date, onClear }: { date: Date; onClear: () => void }) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="overflow-hidden"
    >
      <div className="flex items-center gap-ds-03 px-ds-04 py-ds-02b text-ds-xs text-accent-11 bg-accent-2 border-b border-accent-4">
        <Icon icon={IconClock} size="xs" className="shrink-0" />
        <span className="flex-1 truncate">
          Scheduled for {formatScheduleTime(date)}
        </span>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex shrink-0 items-center justify-center rounded-ds-sm p-ds-01 hover:bg-accent-3 transition-colors"
          aria-label="Cancel schedule"
        >
          <Icon icon={IconX} size="xs" />
        </button>
      </div>
    </motion.div>
  )
}
