'use client'

// ============================================================
// RenderDate — Inline date cell with attendance-aware styling
// Extracted from admin-dashboard.tsx
// ============================================================

import { useEffect, useState } from 'react'
import { cn } from '../../../ui/lib/utils'
import {
  isSameDay,
  getStartOfDay,
} from '../utils/date-utils'
import type { AttendanceStatus, DayInfo } from '../types'
import { format } from 'date-fns'

// ============================================================
// Types
// ============================================================

export interface DateAttendanceInfo {
  status: AttendanceStatus | null
  hasCorrectionOrApproval?: boolean
  isBreakApproved?: boolean
}

export interface RenderDateProps {
  day: DayInfo
  isAdmin: boolean
  selectedDate: string | Date
  dateAttendanceMap: Map<string, DateAttendanceInfo> | null
  activeTimeFrame: string
}

// ============================================================
// Component
// ============================================================

export function RenderDate({
  day,
  isAdmin,
  dateAttendanceMap,
  selectedDate,
  activeTimeFrame,
}: RenderDateProps) {
  const [state, setState] = useState({
    today: day.isToday,
    isPresent: null as boolean | null,
    isDefault: null as boolean | null,
    isBreak: null as boolean | null,
    isAbsent: null as boolean | null,
    breakStart: null as boolean | null,
    breakMid: null as boolean | null,
    breakEnd: null as boolean | null,
    disabled: null as boolean | null,
    disabledState: false,
    hover: false,
    focus: false,
    pressed: false,
    selected: day.isActive,
  })

  const isPastDate = (date: Date) => {
    const today = new Date()
    return getStartOfDay(date) < getStartOfDay(today)
  }

  const isBreakDay = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd')
    const attendanceInfo = dateAttendanceMap?.get(formattedDate)
    return attendanceInfo?.status === 'BREAK'
  }

  const isAbsentDay = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd')
    const attendanceInfo = dateAttendanceMap?.get(formattedDate)
    return (
      isPastDate(date) &&
      attendanceInfo &&
      !attendanceInfo.hasCorrectionOrApproval &&
      attendanceInfo?.status === 'ABSENT'
    )
  }

  const isPresentDay = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd')
    const attendanceInfo = dateAttendanceMap?.get(formattedDate)
    return attendanceInfo?.status === 'PRESENT'
  }

  useEffect(() => {
    const present = isPresentDay(day.fullDate) ?? false
    const breakDay = isBreakDay(day.fullDate) ?? false
    const absent = isAbsentDay(day.fullDate) ?? false
    const disabled = day.isDisabled || false
    const isDefault = !day.isToday && !breakDay && !absent && !disabled

    let breakStart = false
    let breakMid = false
    let breakEnd = false

    if (breakDay) {
      const prevDate = new Date(day.fullDate)
      prevDate.setDate(prevDate.getDate() - 1)
      const prevDateFormatted = format(prevDate, 'yyyy-MM-dd')

      const nextDate = new Date(day.fullDate)
      nextDate.setDate(nextDate.getDate() + 1)
      const nextDateFormatted = format(nextDate, 'yyyy-MM-dd')

      const isPrevBreak =
        dateAttendanceMap?.get(prevDateFormatted)?.status === 'BREAK' &&
        dateAttendanceMap?.get(prevDateFormatted)?.isBreakApproved
      const isNextBreak =
        dateAttendanceMap?.get(nextDateFormatted)?.status === 'BREAK' &&
        dateAttendanceMap?.get(nextDateFormatted)?.isBreakApproved

      breakStart = breakDay && !isPrevBreak && !!isNextBreak
      breakMid = breakDay && !!isPrevBreak && !!isNextBreak
      breakEnd = breakDay && !!isPrevBreak && !isNextBreak

      if (breakDay && !isPrevBreak && !isNextBreak) {
        breakStart = true
        breakEnd = true
        breakMid = false
      }
    }

    const selected = isSameDay(new Date(selectedDate), day.fullDate)

    setState((prev) => ({
      ...prev,
      isPresent: present,
      isBreak: breakDay,
      isAbsent: absent,
      disabled,
      isDefault,
      breakStart,
      breakMid,
      breakEnd,
      selected,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day, dateAttendanceMap, selectedDate, isAdmin])

  // Determine if this is a non-weekly break with specific position
  const isNonWeeklyBreak = state.isBreak && activeTimeFrame !== 'weekly'
  const isBreakStartOnly = isNonWeeklyBreak && state.breakStart && !state.breakEnd
  const isBreakEndOnly = isNonWeeklyBreak && state.breakEnd && !state.breakStart
  const isBreakMidNonWeekly = isNonWeeklyBreak && state.breakMid

  // ── Outer wrapper classes (replaces getBGStyles) ──
  const bgClasses = cn(
    'flex w-full items-center justify-center p-ds-02',
    isBreakStartOnly && 'rounded-l-[20px]',
    isBreakEndOnly && 'rounded-r-[20px]',
    isBreakMidNonWeekly && 'bg-[var(--color-interactive-subtle)]',
  )

  // ── Inner date circle classes (replaces getStyles) ──
  // Order matters: base → base-state → hover → focus → pressed → selected → disabledState
  // tailwind-merge ensures the last conflicting class wins.
  const dateClasses = cn(
    // Base layout & transitions
    'flex h-10 w-10 items-center justify-center rounded-full B1-Reg relative overflow-hidden',
    'transition-[background-color,color,border] duration-200',
    'outline-[var(--color-border-strong)] outline-solid outline-0',

    // Cursor
    state.disabled ? 'cursor-default' : 'cursor-pointer',

    // ── Base states (mutually exclusive in original if/else) ──

    // Disabled
    state.disabled && 'bg-transparent text-[var(--color-text-disabled)]',

    // Today (not break, not disabled)
    !state.disabled && state.today && !state.isBreak &&
      'bg-[var(--color-interactive)] text-[var(--color-text-on-color)] shadow-[inset_0_4px_4px_rgba(255,255,255,0.25),inset_0_0_8px_var(--color-interactive-hover)]',

    // Break (not disabled, not today-only)
    !state.disabled && state.isBreak && !isBreakMidNonWeekly &&
      'bg-[var(--color-interactive-selected)] text-[var(--color-text-secondary)] shadow-[inset_0_4px_4px_rgba(255,255,255,0.25),inset_0_0_4px_var(--color-focus)]',

    // Break mid in non-weekly view overrides break base
    !state.disabled && state.isBreak && isBreakMidNonWeekly &&
      'rounded-none bg-[var(--color-interactive-subtle)] text-[var(--color-text-secondary)] shadow-none',

    // Break border-radius overrides for non-weekly
    !state.disabled && state.isBreak && isBreakStartOnly &&
      'rounded-l-[20px] rounded-r-none',
    !state.disabled && state.isBreak && isBreakEndOnly &&
      'rounded-l-none rounded-r-[20px]',

    // Absent (not disabled, not today, not break)
    !state.disabled && !state.today && !state.isBreak && state.isAbsent &&
      'bg-transparent text-[var(--color-error)]',

    // Present (not disabled, not today, not break, not absent)
    !state.disabled && !state.today && !state.isBreak && !state.isAbsent && state.isPresent &&
      'bg-transparent text-[var(--color-text-primary)]',

    // Default (not disabled, not today, not break, not absent, not present)
    !state.disabled && state.isDefault &&
      'bg-transparent text-[var(--color-text-secondary)]',

    // ── Hover overrides ──

    // Hover on today (not break)
    state.hover && !state.disabled && state.today && !state.isBreak &&
      'bg-[var(--color-interactive)] text-[var(--color-text-on-color)] shadow-[inset_0_4px_4px_rgba(255,255,255,0.25),inset_0_0_8px_var(--color-interactive-hover)]',

    // Hover on present (not today, not break)
    state.hover && !state.disabled && !state.today && !state.isBreak && state.isPresent &&
      'bg-[var(--color-field)] text-[var(--color-text-primary)]',

    // Hover on default (not today, not break, not present)
    state.hover && !state.disabled && !state.today && !state.isBreak && !state.isPresent && state.isDefault &&
      'bg-[var(--color-field)] text-[var(--color-text-secondary)]',

    // Hover on break (same visual as base break, but re-assert to match original)
    state.hover && !state.disabled && state.isBreak && !isBreakMidNonWeekly &&
      'bg-[var(--color-interactive-selected)] text-[var(--color-text-secondary)] shadow-[inset_0_4px_4px_rgba(255,255,255,0.25),inset_0_0_4px_var(--color-focus)]',
    state.hover && !state.disabled && state.isBreak && isBreakMidNonWeekly &&
      'rounded-none bg-[var(--color-interactive-subtle)] text-[var(--color-text-secondary)] shadow-none',

    // Hover on absent (not today, not break)
    state.hover && !state.disabled && !state.today && !state.isBreak && state.isAbsent &&
      'bg-[var(--color-field)] text-[var(--color-error)]',

    // ── Focus ──
    state.focus && !state.pressed && 'outline-2',

    // ── Pressed ──
    state.pressed && (state.isPresent || state.isAbsent || state.isDefault || state.disabled) &&
      'bg-[var(--color-error-surface)]',

    // ── Selected ──
    state.selected && 'font-semibold',
    state.selected && activeTimeFrame === 'monthly' && 'text-[var(--color-text-primary)]',

    // ── DisabledState (visual-only disabled, different from functional disabled) ──
    state.disabledState && 'text-[var(--color-text-disabled)]',
    state.disabledState && state.today &&
      'bg-[var(--color-text-disabled)] text-[var(--color-text-on-color)]',
  )

  return (
    <div className={bgClasses}>
      <div
        className={dateClasses}
        tabIndex={0}
        onMouseEnter={() => setState((prev) => ({ ...prev, hover: true }))}
        onMouseLeave={() => setState((prev) => ({ ...prev, hover: false }))}
        onFocus={() => setState((prev) => ({ ...prev, focus: true }))}
        onBlur={() => setState((prev) => ({ ...prev, focus: false }))}
        onMouseDown={() => setState((prev) => ({ ...prev, pressed: true }))}
        onMouseUp={() => setState((prev) => ({ ...prev, pressed: false }))}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setState((prev) => ({ ...prev, pressed: true }))
          }
        }}
        onKeyUp={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setState((prev) => ({ ...prev, pressed: false }))
          }
        }}
      >
        {day.date}
        {state.isAbsent && (
          <span className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[var(--color-error)]" />
        )}
      </div>
    </div>
  )
}

RenderDate.displayName = 'RenderDate'
