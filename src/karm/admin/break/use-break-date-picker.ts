'use client'

// ============================================================
// useBreakDatePicker — Grouped calendar state for EditBreak dialog
// Extracts the 6 calendar-related useState calls from edit-break.tsx
// into a single hook with navigation and reset helpers.
// ============================================================

import { useState, useCallback } from 'react'

// ============================================================
// State interface
// ============================================================

export interface BreakDatePickerState {
  showCalendar: boolean
  activeDate: 'start' | 'end' | null
  currentMonth: number
  currentYear: number
  selectedStartDate: string | null
  selectedEndDate: string | null
}

// ============================================================
// Hook
// ============================================================

export function useBreakDatePicker() {
  const [showCalendar, setShowCalendar] = useState(false)
  const [activeDate, setActiveDate] = useState<'start' | 'end' | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(
    null,
  )
  const [selectedEndDate, setSelectedEndDate] = useState<string | null>(null)

  // ============================================================
  // navigateMonth — safe month navigation avoiding mutation bugs
  // ============================================================

  const navigateMonth = useCallback(
    (direction: 'prev' | 'next') => {
      const m = currentMonth
      const y = currentYear

      if (direction === 'next') {
        const newMonth = m === 11 ? 0 : m + 1
        const newYear = m === 11 ? y + 1 : y // Check ORIGINAL m, not mutated
        setCurrentMonth(newMonth)
        setCurrentYear(newYear)
      } else {
        const newMonth = m === 0 ? 11 : m - 1
        const newYear = m === 0 ? y - 1 : y // Check ORIGINAL m, not mutated
        setCurrentMonth(newMonth)
        setCurrentYear(newYear)
      }
    },
    [currentMonth, currentYear],
  )

  // ============================================================
  // resetDates — clear calendar selection state
  // ============================================================

  const resetDates = useCallback(() => {
    setShowCalendar(false)
    setActiveDate(null)
    setSelectedStartDate(null)
    setSelectedEndDate(null)
  }, [])

  return {
    // State
    showCalendar,
    activeDate,
    currentMonth,
    currentYear,
    selectedStartDate,
    selectedEndDate,

    // Setters (for cases needing direct access)
    setShowCalendar,
    setActiveDate,
    setCurrentMonth,
    setCurrentYear,
    setSelectedStartDate,
    setSelectedEndDate,

    // Helpers
    navigateMonth,
    resetDates,
  }
}
