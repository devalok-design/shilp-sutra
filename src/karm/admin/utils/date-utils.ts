// ============================================================
// Admin Module — Date Utilities
// Ported from moment-timezone to date-fns + Intl
// ============================================================

import {
  startOfDay as fnsStartOfDay,
  endOfDay as fnsEndOfDay,
  startOfWeek as fnsStartOfWeek,
  addDays,
  getDaysInMonth,
  startOfMonth,
  subMonths,
  addMonths,
  format,
  isSameDay as fnsIsSameDay,
} from 'date-fns'

const DEFAULT_TIMEZONE = 'Asia/Kolkata'
const DEFAULT_LOCALE = 'en-IN'

// ============================================================
// Core formatting
// ============================================================

export function formatDateIST(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Date(date).toLocaleDateString(DEFAULT_LOCALE, {
    timeZone: DEFAULT_TIMEZONE,
    ...options,
  })
}

export function formatTimeIST(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Date(date).toLocaleTimeString(DEFAULT_LOCALE, {
    timeZone: DEFAULT_TIMEZONE,
    ...options,
  })
}

// ============================================================
// Legacy formatting helpers
// ============================================================

export function formatDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date)
  const formatted = d
    .toLocaleDateString(DEFAULT_LOCALE, {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
      timeZone: DEFAULT_TIMEZONE,
    })
    .replace(',', '')
  return formatted.replace(/(\d{2})$/, '\u2019$1')
}

export function formatOptionalDate(date: Date | string | '-'): string {
  if (date === '-') return '-'
  return formatDate(date as Date | string)
}

export function formatDateWithWeekday(date: Date): string {
  const weekday = date.toLocaleString(DEFAULT_LOCALE, {
    weekday: 'long',
    timeZone: DEFAULT_TIMEZONE,
  })
  const formatted = formatDate(date)
  return `${formatted}, ${weekday}`
}

export function getDaySuffix(day: number): string {
  if (day >= 11 && day <= 13) return `${day}th`
  switch (day % 10) {
    case 1:
      return `${day}st`
    case 2:
      return `${day}nd`
    case 3:
      return `${day}rd`
    default:
      return `${day}th`
  }
}

// ============================================================
// Day-of-week / month-grid helpers
// ============================================================

export function isSameDay(date1: Date, date2: Date): boolean {
  if (!(date1 instanceof Date) || !(date2 instanceof Date)) return false
  return fnsIsSameDay(date1, date2)
}

export interface WeekDay {
  day: string
  date: number
  fullDate: Date
  isToday: boolean
  isActive: boolean
  hasBreak?: boolean
  isAbsent?: boolean
}

export function getWeekDays(
  currentDate: string | Date,
  selectedDate: string | Date,
): WeekDay[] {
  const start = fnsStartOfWeek(new Date(currentDate), { weekStartsOn: 0 })
  const today = new Date()
  const selected = new Date(selectedDate)

  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(start, i)
    return {
      day: format(d, 'EEE').toUpperCase(),
      date: d.getDate(),
      fullDate: d,
      isToday: fnsIsSameDay(d, today),
      isActive: fnsIsSameDay(d, selected),
    }
  })
}

export interface MonthDay {
  day: string
  date: number
  fullDate: Date
  isToday: boolean
  isActive: boolean
  isPadding: boolean
}

export function getMonthDays(
  currentDate: Date | string,
  selectedDate: Date | string,
): MonthDay[] {
  const current = new Date(currentDate)
  const selected = new Date(selectedDate)
  const today = new Date()
  const firstDay = startOfMonth(current)
  const startPadding = firstDay.getDay() // 0 = Sunday
  const totalDaysInMonth = getDaysInMonth(current)

  const allDays: MonthDay[] = []

  // Previous month padding
  const prevMonth = subMonths(firstDay, 1)
  const prevMonthDays = getDaysInMonth(prevMonth)
  for (let i = startPadding - 1; i >= 0; i--) {
    const day = prevMonthDays - i
    const d = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), day)
    allDays.push({
      day: format(d, 'EEE').toUpperCase(),
      date: d.getDate(),
      fullDate: d,
      isToday: fnsIsSameDay(d, today),
      isActive: fnsIsSameDay(d, selected),
      isPadding: true,
    })
  }

  // Current month
  for (let i = 1; i <= totalDaysInMonth; i++) {
    const d = new Date(current.getFullYear(), current.getMonth(), i)
    allDays.push({
      day: format(d, 'EEE').toUpperCase(),
      date: i,
      fullDate: d,
      isToday: fnsIsSameDay(d, today),
      isActive: fnsIsSameDay(d, selected),
      isPadding: false,
    })
  }

  // Next month padding
  const totalCells = allDays.length
  const endPadding = (7 - (totalCells % 7)) % 7
  const nextMonth = addMonths(firstDay, 1)
  for (let i = 1; i <= endPadding; i++) {
    const d = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i)
    allDays.push({
      day: format(d, 'EEE').toUpperCase(),
      date: i,
      fullDate: d,
      isToday: fnsIsSameDay(d, today),
      isActive: fnsIsSameDay(d, selected),
      isPadding: true,
    })
  }

  return allDays
}

// ============================================================
// Start/end of day (timezone-aware via Intl)
// ============================================================

export function getStartOfDay(date: Date = new Date()): Date {
  return fnsStartOfDay(date)
}

export function getEndOfDay(date: Date = new Date()): Date {
  return fnsEndOfDay(date)
}
