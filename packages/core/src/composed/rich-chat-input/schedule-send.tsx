'use client'

import { IconCalendarEvent, IconClock, IconPencil,IconX } from '@tabler/icons-react'
import { motion } from 'framer-motion'
import * as React from 'react'

import { Button } from '../../ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog'
import { Icon } from '../../ui/icon'
import { durations } from '../../ui/lib/motion'
import { cn } from '../../ui/lib/utils'
import { CalendarGrid } from '../date-picker/calendar-grid'
import { useCalendar } from '../date-picker/use-calendar'

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

// ── Inline Time Selector (hour, minute, AM/PM) ────────────────

function InlineTimePicker({ value, onChange }: { value: Date; onChange: (d: Date) => void }) {
  const hours12 = value.getHours() % 12 || 12
  const minutes = value.getMinutes()
  const isPM = value.getHours() >= 12

  const setHour = (h: number) => {
    const d = new Date(value)
    d.setHours(isPM ? (h % 12) + 12 : h % 12)
    onChange(d)
  }

  const setMinute = (m: number) => {
    const d = new Date(value)
    d.setMinutes(m)
    onChange(d)
  }

  const togglePeriod = (pm: boolean) => {
    const d = new Date(value)
    const h = d.getHours()
    if (pm && h < 12) d.setHours(h + 12)
    else if (!pm && h >= 12) d.setHours(h - 12)
    onChange(d)
  }

  return (
    <div className="flex items-center gap-ds-02">
      {/* Hour */}
      <select
        value={hours12}
        onChange={(e) => setHour(Number(e.target.value))}
        className="h-ds-sm rounded-control border border-surface-border-strong bg-surface-raised px-ds-02 text-ds-sm text-surface-fg focus:outline-hidden focus:ring-2 focus:ring-accent-9"
        aria-label="Hour"
      >
        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>

      <span className="text-ds-sm text-surface-fg-subtle font-medium">:</span>

      {/* Minute — 5-min steps */}
      <select
        value={minutes - (minutes % 5)}
        onChange={(e) => setMinute(Number(e.target.value))}
        className="h-ds-sm rounded-control border border-surface-border-strong bg-surface-raised px-ds-02 text-ds-sm text-surface-fg focus:outline-hidden focus:ring-2 focus:ring-accent-9"
        aria-label="Minute"
      >
        {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
          <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
        ))}
      </select>

      {/* AM/PM toggle */}
      <div className="inline-flex rounded-control border border-surface-border-strong overflow-hidden">
        <button
          type="button"
          onClick={() => togglePeriod(false)}
          className={cn(
            'px-ds-02b py-ds-01 text-ds-xs font-medium transition-colors duration-fast-01',
            !isPM ? 'bg-accent-9 text-white' : 'bg-surface-raised text-surface-fg-subtle hover:bg-surface-raised-hover',
          )}
        >
          AM
        </button>
        <button
          type="button"
          onClick={() => togglePeriod(true)}
          className={cn(
            'px-ds-02b py-ds-01 text-ds-xs font-medium transition-colors duration-fast-01',
            isPM ? 'bg-accent-9 text-white' : 'bg-surface-raised text-surface-fg-subtle hover:bg-surface-raised-hover',
          )}
        >
          PM
        </button>
      </div>
    </div>
  )
}

// ── Compact Date + Time Entry (for dropdown) ──────────────────

function CompactDateTimeEntry({
  value,
  onChange,
  minDate,
}: {
  value: Date | null
  onChange: (d: Date) => void
  minDate?: Date
}) {
  const now = new Date()
  const selected = value ?? (() => { const d = new Date(now); d.setHours(d.getHours() + 1, 0, 0, 0); return d })()

  // Format date as YYYY-MM-DD for the native input
  const dateStr = `${selected.getFullYear()}-${String(selected.getMonth() + 1).padStart(2, '0')}-${String(selected.getDate()).padStart(2, '0')}`

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parts = e.target.value.split('-')
    if (parts.length !== 3) return
    const d = new Date(selected)
    d.setFullYear(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
    onChange(d)
  }

  const minDateStr = minDate
    ? `${minDate.getFullYear()}-${String(minDate.getMonth() + 1).padStart(2, '0')}-${String(minDate.getDate()).padStart(2, '0')}`
    : undefined

  return (
    <div className="space-y-ds-03">
      {/* Date input */}
      <div className="flex items-center justify-between">
        <span className="text-ds-xs font-medium text-surface-fg-subtle">Date</span>
        <input
          type="date"
          value={dateStr}
          min={minDateStr}
          onChange={handleDateChange}
          className="h-ds-sm rounded-control border border-surface-border-strong bg-surface-raised px-ds-03 text-ds-sm text-surface-fg focus:outline-hidden focus:ring-2 focus:ring-accent-9"
        />
      </div>

      {/* Time row */}
      <div className="flex items-center justify-between">
        <span className="text-ds-xs font-medium text-surface-fg-subtle">Time</span>
        <InlineTimePicker value={selected} onChange={onChange} />
      </div>
    </div>
  )
}

// ── Full Calendar + Time Picker (for dialog) ──────────────────

function FullDateTimePicker({
  value,
  onChange,
  minDate,
}: {
  value: Date | null
  onChange: (d: Date) => void
  minDate?: Date
}) {
  const now = new Date()
  const selected = value ?? (() => { const d = new Date(now); d.setHours(d.getHours() + 1, 0, 0, 0); return d })()

  const { currentMonth, goToPreviousMonth, goToNextMonth } = useCalendar(selected)

  const handleDateSelect = (date: Date) => {
    const d = new Date(date)
    d.setHours(selected.getHours(), selected.getMinutes(), 0, 0)
    onChange(d)
  }

  return (
    <div className="space-y-ds-03">
      <CalendarGrid
        currentMonth={currentMonth}
        selected={selected}
        onSelect={handleDateSelect}
        onMonthChange={(d) => {
          if (d < currentMonth) goToPreviousMonth()
          else goToNextMonth()
        }}
        minDate={minDate}
        className="w-full"
      />
      <div className="flex items-center justify-between border-t border-surface-border pt-ds-03">
        <span className="text-ds-xs font-medium text-surface-fg-subtle">Time</span>
        <InlineTimePicker value={selected} onChange={onChange} />
      </div>
    </div>
  )
}

// ── Schedule Dropdown Content (presets + inline picker) ─────────

export interface ScheduleDropdownContentProps {
  onSchedule: (date: Date) => void
  onClose: () => void
  /** Open a full dialog instead of inline picker. Consumer provides the dialog. */
  onOpenDialog?: () => void
}

export function ScheduleDropdownContent({ onSchedule, onClose, onOpenDialog }: ScheduleDropdownContentProps) {
  const [showPicker, setShowPicker] = React.useState(false)
  const [customDate, setCustomDate] = React.useState<Date | null>(null)

  const presets = React.useMemo(() => getSmartPresets(), [])

  const handlePreset = (date: Date) => {
    onSchedule(date)
    onClose()
  }

  const handleCustomConfirm = () => {
    if (customDate && customDate > new Date()) {
      onSchedule(customDate)
      onClose()
      setCustomDate(null)
      setShowPicker(false)
    }
  }

  if (showPicker) {
    return (
      <div className="p-ds-04" style={{ minWidth: 270 }}>
        <div className="mb-ds-03 flex items-center justify-between">
          <p className="text-ds-sm font-medium text-surface-fg">Pick date & time</p>
          <button
            type="button"
            onClick={() => setShowPicker(false)}
            className="inline-flex items-center justify-center rounded-control p-ds-01 text-surface-fg-subtle hover:bg-surface-raised-hover hover:text-surface-fg transition-colors"
            aria-label="Back to presets"
          >
            <Icon icon={IconX} size="sm" />
          </button>
        </div>

        <CompactDateTimeEntry
          value={customDate}
          onChange={setCustomDate}
          minDate={new Date()}
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
          className="flex w-full items-center gap-ds-03 rounded-control px-ds-03 py-ds-02b text-ds-sm text-surface-fg hover:bg-surface-raised-hover transition-colors duration-fast-01"
        >
          <Icon icon={IconClock} size="sm" className="shrink-0 text-surface-fg-muted" />
          {preset.label}
        </button>
      ))}
      <div className="mx-ds-02 my-ds-02 h-px bg-surface-border" />
      <button
        type="button"
        onClick={() => setShowPicker(true)}
        className="flex w-full items-center gap-ds-03 rounded-control px-ds-03 py-ds-02b text-ds-sm text-surface-fg hover:bg-surface-raised-hover transition-colors duration-fast-01"
      >
        <Icon icon={IconCalendarEvent} size="sm" className="shrink-0 text-accent-11" />
        Pick date & time...
      </button>
      {onOpenDialog && (
        <button
          type="button"
          onClick={() => { onOpenDialog(); onClose() }}
          className="flex w-full items-center gap-ds-03 rounded-control px-ds-03 py-ds-02b text-ds-sm text-surface-fg hover:bg-surface-raised-hover transition-colors duration-fast-01"
        >
          <Icon icon={IconCalendarEvent} size="sm" className="shrink-0 text-surface-fg-muted" />
          Open full picker...
        </button>
      )}
    </div>
  )
}

// ── Schedule Dialog (full-screen on mobile) ────────────────────

export interface ScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSchedule: (date: Date) => void
  /** Pre-fill with existing scheduled date (edit mode). */
  initialDate?: Date | null
}

export function ScheduleDialog({ open, onOpenChange, onSchedule, initialDate }: ScheduleDialogProps) {
  const [date, setDate] = React.useState<Date | null>(initialDate ?? null)

  // Reset when opened with new initialDate
  React.useEffect(() => {
    if (open) setDate(initialDate ?? null)
  }, [open, initialDate])

  const handleConfirm = () => {
    if (date && date > new Date()) {
      onSchedule(date)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle>{initialDate ? 'Reschedule message' : 'Schedule send'}</DialogTitle>
        </DialogHeader>

        <FullDateTimePicker
          value={date}
          onChange={setDate}
          minDate={new Date()}
        />

        <DialogFooter className="gap-ds-02">
          <Button variant="soft" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            variant="solid"
            onClick={handleConfirm}
            disabled={!date || date <= new Date()}
          >
            {initialDate ? 'Reschedule' : 'Schedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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

export function ScheduleBanner({ date, onClear, onEdit }: { date: Date; onClear: () => void; onEdit?: () => void }) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: durations.moderate01 }}
      className="overflow-hidden"
    >
      <div className="flex items-center gap-ds-03 px-ds-04 py-ds-02b text-ds-xs text-accent-11 bg-accent-2 border-b border-accent-4">
        <Icon icon={IconClock} size="xs" className="shrink-0" />
        <span className="flex-1 truncate">
          Scheduled for {formatScheduleTime(date)}
        </span>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex shrink-0 items-center justify-center rounded-control-inner p-ds-01 hover:bg-accent-3 transition-colors"
            aria-label="Edit schedule"
          >
            <Icon icon={IconPencil} size="xs" />
          </button>
        )}
        <button
          type="button"
          onClick={onClear}
          className="inline-flex shrink-0 items-center justify-center rounded-control-inner p-ds-01 hover:bg-accent-3 transition-colors"
          aria-label="Cancel schedule"
        >
          <Icon icon={IconX} size="xs" />
        </button>
      </div>
    </motion.div>
  )
}
