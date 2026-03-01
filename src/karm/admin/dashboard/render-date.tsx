'use client'

// ============================================================
// RenderDate — Inline date cell with attendance-aware styling
// Extracted from admin-dashboard.tsx
// ============================================================

import { useEffect, useState, type CSSProperties } from 'react'
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
    const disabled = (day as any).isDisabled || false
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
  }, [day, dateAttendanceMap, selectedDate, isAdmin])

  const getBGStyles = (): CSSProperties => {
    const baseStyle: CSSProperties = {
      display: 'flex',
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '4px',
      marginLeft: '0px',
      marginRight: '0px',
    }

    let backgroundColor = 'transparent'
    let borderTopLeftRadius = '0px'
    let borderBottomLeftRadius = '0px'
    let borderTopRightRadius = '0px'
    let borderBottomRightRadius = '0px'

    if (state.isBreak && activeTimeFrame !== 'weekly') {
      if (state.breakStart && !state.breakEnd) {
        borderTopLeftRadius = '20px'
        borderBottomLeftRadius = '20px'
        baseStyle.justifyContent = 'center'
      }

      if (state.breakEnd && !state.breakStart) {
        borderTopRightRadius = '20px'
        borderBottomRightRadius = '20px'
        baseStyle.justifyContent = 'center'
      }

      if (state.breakMid) {
        backgroundColor = '#F8F6FC'
      }
    }

    return {
      ...baseStyle,
      backgroundColor,
      borderTopLeftRadius,
      borderBottomLeftRadius,
      borderTopRightRadius,
      borderBottomRightRadius,
    }
  }

  const getStyles = (): CSSProperties => {
    const baseStyle: CSSProperties = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      fontSize: '16px',
      fontWeight: '400',
      cursor: state.disabled ? 'default' : 'pointer',
      position: 'relative',
      transition: 'background-color 0.2s, color 0.2s, border 0.2s',
      outlineColor: '#DD9EB8',
      outlineStyle: 'solid',
      outlineWidth: '0px',
      overflow: 'hidden',
    }

    let backgroundColor = 'transparent'
    let color = '#000000'
    let border = 'none'
    let boxShadow = 'none'
    let fontWeight = '400'

    if (state.disabled) {
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        color: '#B7AFB2',
        cursor: 'default',
      }
    }

    if (state.today && !state.isBreak) {
      backgroundColor = 'var(--color-interactive)'
      color = '#FFFFFF'
      boxShadow =
        '0px 4px 4px 0px rgba(255, 255, 255, 0.25) inset, 0px 0px 8px 0px var(--color-interactive-hover, #B6204A) inset'
    } else if (state.isBreak) {
      backgroundColor = '#E6E1F3'
      color = '#403A3C'
      boxShadow =
        '0px 4px 4px 0px rgba(255, 255, 255, 0.25) inset, 0px 0px 4px 0px var(--color-focus) inset'

      if (state.breakStart && !state.breakEnd && activeTimeFrame !== 'weekly') {
        baseStyle.borderTopLeftRadius = '20px'
        baseStyle.borderBottomLeftRadius = '20px'
      }

      if (state.breakEnd && !state.breakStart && activeTimeFrame !== 'weekly') {
        baseStyle.borderTopRightRadius = '20px'
        baseStyle.borderBottomRightRadius = '20px'
      }

      if (state.breakMid && activeTimeFrame !== 'weekly') {
        baseStyle.borderRadius = '0px'
        backgroundColor = '#F8F6FC'
        color = '#403A3C'
        boxShadow = 'unset'
      }
    } else if (state.isAbsent) {
      backgroundColor = 'transparent'
      color = '#D2222D'
    } else if (state.isPresent) {
      backgroundColor = 'transparent'
      color = '#3F181E'
    } else if (state.isDefault) {
      backgroundColor = 'transparent'
      color = '#6B6164'
    }

    if (state.hover) {
      if (state.today && !state.isBreak) {
        backgroundColor = '#B02651'
        color = '#FFFFFF'
        boxShadow =
          '0px 4px 4px 0px rgba(255, 255, 255, 0.25) inset, 0px 0px 8px 0px var(--color-interactive-hover, #B6204A) inset'
      } else if (state.isPresent) {
        backgroundColor = '#E6E4E5'
        color = '#3F181E'
      } else if (state.isDefault) {
        backgroundColor = '#E6E4E5'
        color = '#6B6164'
      } else if (state.isBreak) {
        backgroundColor = '#E6E1F3'
        color = '#403A3C'
        boxShadow =
          '0px 4px 4px 0px rgba(255, 255, 255, 0.25) inset, 0px 0px 4px 0px var(--color-focus) inset'

        if (
          state.breakStart &&
          !state.breakEnd &&
          activeTimeFrame !== 'weekly'
        ) {
          baseStyle.borderTopLeftRadius = '20px'
          baseStyle.borderBottomLeftRadius = '20px'
        }

        if (
          state.breakEnd &&
          !state.breakStart &&
          activeTimeFrame !== 'weekly'
        ) {
          baseStyle.borderTopRightRadius = '20px'
          baseStyle.borderBottomRightRadius = '20px'
        }

        if (state.breakMid && activeTimeFrame !== 'weekly') {
          baseStyle.borderRadius = '0px'
          backgroundColor = '#F8F6FC'
          color = '#403A3C'
          boxShadow = 'unset'
        }
      } else if (state.isAbsent) {
        backgroundColor = '#E6E4E5'
        color = '#D2222D'
      } else if (state.disabled) {
        backgroundColor = '#E6E4E5'
        color = '#B7AFB2'
      }
    }

    if (state.focus && !state.pressed) {
      baseStyle.outlineWidth = '2px'
    }

    if (state.pressed) {
      baseStyle.position = 'relative'
      if (
        state.isPresent ||
        state.isAbsent ||
        state.isDefault ||
        state.disabled
      ) {
        backgroundColor = '#FCF7F7'
      }
    }

    if (state.selected) {
      fontWeight = '600'
      if (activeTimeFrame === 'monthly') {
        color = 'var(--color-text-primary)'
      }
    }

    if (state.disabledState) {
      color = '#B7AFB2'
      if (state.today) {
        color = '#FFF'
        backgroundColor = '#B7AFB2'
      }
    }

    return {
      ...baseStyle,
      backgroundColor,
      color,
      border,
      fontWeight,
      boxShadow,
    }
  }

  return (
    <div
      className={cn('background', {
        'calendar start-date':
          state.isBreak && state.breakStart && !state.breakEnd,
        'calendar end-date':
          state.isBreak && !state.breakStart && state.breakEnd,
        weekly: activeTimeFrame === 'weekly',
      })}
      style={getBGStyles()}
    >
      <div
        className={cn('date', {
          pressed: state.pressed,
          'text-bold': state.selected,
        })}
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
        style={getStyles()}
      >
        {day.date}
        {state.isAbsent && (
          <span
            style={{
              position: 'absolute',
              bottom: '0px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#D2222D',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
        )}
      </div>
    </div>
  )
}

RenderDate.displayName = 'RenderDate'
