'use client'

// ============================================================
// useCalendarNavigation — Shared calendar state for admin dashboard & calendar
// Uses useReducer for atomic state transitions (selecting a date
// must update days array synchronously).
// ============================================================

import { useReducer, useCallback } from 'react'
import { format } from 'date-fns'
import {
  isSameDay,
  getWeekDays,
  getMonthDays,
  getStartOfDay,
} from '../utils/date-utils'
import type { DayInfo } from '../types'

// ============================================================
// State & Action types
// ============================================================

export interface CalendarNavigationState {
  currentDate: string
  selectedDate: string
  isFutureDate: boolean
  activeTimeFrame: string
  days: DayInfo[]
  selectedMonth: string
  activeIndex: number
  dateOffset: number
}

type CalendarAction =
  | { type: 'SET_TIME_FRAME'; payload: string }
  | { type: 'SELECT_DATE'; payload: { index: number; date: Date } }
  | { type: 'NAVIGATE_DATE'; payload: 'prev' | 'next' }
  | { type: 'SELECT_MONTH'; payload: string }
  | { type: 'GO_TODAY' }
  | { type: 'UPDATE_DAYS' }
  | {
      type: 'SELECT_DAY_MONTHLY'
      payload: { date: Date }
    }

// ============================================================
// Helpers
// ============================================================

const formatDateStr = (date: Date): string =>
  format(date, "yyyy-MM-dd'T'HH:mm:ssxxx")

const computeDays = (
  activeTimeFrame: string,
  currentDate: string,
  selectedDate: string,
): DayInfo[] => {
  return activeTimeFrame === 'weekly'
    ? getWeekDays(currentDate, selectedDate)
    : getMonthDays(currentDate, selectedDate)
}

const computeSelectedMonth = (date: Date): string =>
  `${format(date, 'MMMM')} ${format(date, 'yyyy')}`

// ============================================================
// Reducer
// ============================================================

function calendarReducer(
  state: CalendarNavigationState,
  action: CalendarAction,
): CalendarNavigationState {
  const today = new Date()

  switch (action.type) {
    case 'SET_TIME_FRAME': {
      const newDays = computeDays(
        action.payload,
        state.currentDate,
        state.selectedDate,
      )
      return {
        ...state,
        activeTimeFrame: action.payload,
        days: newDays,
      }
    }

    case 'SELECT_DATE': {
      const { index, date } = action.payload
      const newDateStr = formatDateStr(date)
      const newIsFuture = getStartOfDay(date) > getStartOfDay(today)
      const newMonth = computeSelectedMonth(date)
      return {
        ...state,
        activeIndex: index,
        selectedDate: newDateStr,
        isFutureDate: newIsFuture,
        selectedMonth: newMonth,
      }
    }

    case 'SELECT_DAY_MONTHLY': {
      const { date } = action.payload
      const newDateStr = formatDateStr(date)
      const newIsFuture = getStartOfDay(date) > getStartOfDay(today)
      const newMonth = computeSelectedMonth(date)
      const newDays = computeDays(
        state.activeTimeFrame,
        state.currentDate,
        newDateStr,
      )
      return {
        ...state,
        selectedDate: newDateStr,
        isFutureDate: newIsFuture,
        selectedMonth: newMonth,
        days: newDays,
      }
    }

    case 'NAVIGATE_DATE': {
      const newDate = new Date(state.currentDate)

      if (state.activeTimeFrame === 'weekly') {
        const daysToAdd = action.payload === 'prev' ? -7 : 7
        newDate.setDate(newDate.getDate() + daysToAdd)
      } else {
        const monthsToAdd = action.payload === 'prev' ? -1 : 1
        newDate.setMonth(newDate.getMonth() + monthsToAdd)
        newDate.setDate(1)
      }

      const newDateStr = formatDateStr(newDate)
      const newMonth = computeSelectedMonth(newDate)
      const newDays = computeDays(state.activeTimeFrame, newDateStr, newDateStr)

      return {
        ...state,
        currentDate: newDateStr,
        selectedDate: newDateStr,
        dateOffset: state.dateOffset + (action.payload === 'prev' ? -1 : 1),
        selectedMonth: newMonth,
        days: newDays,
      }
    }

    case 'SELECT_MONTH': {
      const [month, year] = action.payload.split(' ')
      const newDate = new Date(state.selectedDate)
      newDate.setMonth(new Date(`${month} 1, 2024`).getMonth())
      newDate.setFullYear(parseInt(year))

      const newDateStr = formatDateStr(newDate)
      const weekDiff = Math.floor(
        (newDate.getTime() - today.getTime()) / (7 * 24 * 60 * 60 * 1000),
      )
      const newDays = computeDays(state.activeTimeFrame, newDateStr, newDateStr)

      return {
        ...state,
        currentDate: newDateStr,
        selectedDate: newDateStr,
        selectedMonth: action.payload,
        dateOffset: weekDiff,
        days: newDays,
      }
    }

    case 'GO_TODAY': {
      const todayStr = formatDateStr(today)
      const newMonth = computeSelectedMonth(today)
      const weekDiff = Math.floor(
        (today.getTime() - new Date().getTime()) / (7 * 24 * 60 * 60 * 1000),
      )
      const newDays = computeDays(state.activeTimeFrame, todayStr, todayStr)
      const todayIndex = newDays.findIndex((day) =>
        isSameDay(day.fullDate, today),
      )

      return {
        ...state,
        currentDate: todayStr,
        selectedDate: todayStr,
        selectedMonth: newMonth,
        dateOffset: weekDiff,
        isFutureDate: false,
        days: newDays,
        activeIndex: todayIndex !== -1 ? todayIndex : state.activeIndex,
      }
    }

    case 'UPDATE_DAYS': {
      const newDays = computeDays(
        state.activeTimeFrame,
        state.currentDate,
        state.selectedDate,
      )
      return { ...state, days: newDays }
    }

    default:
      return state
  }
}

// ============================================================
// Hook
// ============================================================

function createInitialState(): CalendarNavigationState {
  const today = new Date()
  const todayStr = formatDateStr(today)
  const initialDays = getWeekDays(todayStr, todayStr)
  const todayIndex = initialDays.findIndex((day) =>
    isSameDay(day.fullDate, today),
  )

  return {
    currentDate: todayStr,
    selectedDate: todayStr,
    isFutureDate: false,
    activeTimeFrame: 'weekly',
    days: initialDays,
    selectedMonth: computeSelectedMonth(today),
    activeIndex: todayIndex !== -1 ? todayIndex : 0,
    dateOffset: 0,
  }
}

export function useCalendarNavigation() {
  const [state, dispatch] = useReducer(calendarReducer, null, createInitialState)

  // ============================================================
  // Action creators
  // ============================================================

  const setActiveTimeFrame = useCallback((timeFrame: string) => {
    dispatch({ type: 'SET_TIME_FRAME', payload: timeFrame })
  }, [])

  const selectDate = useCallback((index: number, date: Date) => {
    dispatch({ type: 'SELECT_DATE', payload: { index, date } })
  }, [])

  const selectDayMonthly = useCallback((date: Date) => {
    dispatch({ type: 'SELECT_DAY_MONTHLY', payload: { date } })
  }, [])

  const navigateDate = useCallback((direction: 'prev' | 'next') => {
    dispatch({ type: 'NAVIGATE_DATE', payload: direction })
  }, [])

  const selectMonth = useCallback((monthYear: string) => {
    dispatch({ type: 'SELECT_MONTH', payload: monthYear })
  }, [])

  const goToday = useCallback(() => {
    dispatch({ type: 'GO_TODAY' })
  }, [])

  const updateDays = useCallback(() => {
    dispatch({ type: 'UPDATE_DAYS' })
  }, [])

  // ============================================================
  // Computed values
  // ============================================================

  const isTodaySelected = useCallback((): boolean => {
    return isSameDay(new Date(state.selectedDate), new Date())
  }, [state.selectedDate])

  const getYearsList = useCallback((): string[] => {
    const years: string[] = []
    const currentYear = new Date().getFullYear()
    const currentMonth = format(new Date(state.selectedDate), 'MMMM')

    for (let i = -2; i < 1; i++) {
      const date = new Date(currentYear + i, 0)
      years.push(`${currentMonth} ${date.getFullYear()}`)
    }
    return years
  }, [state.selectedDate])

  const isFirstDate = useCallback((): boolean => {
    return (
      state.days.length > 0 &&
      !!state.days[0].fullDate &&
      isSameDay(state.days[0].fullDate, new Date(state.selectedDate))
    )
  }, [state.days, state.selectedDate])

  const isLastDate = useCallback((): boolean => {
    return (
      state.days.length > 0 &&
      !!state.days[state.days.length - 1].fullDate &&
      isSameDay(
        state.days[state.days.length - 1].fullDate,
        new Date(state.selectedDate),
      )
    )
  }, [state.days, state.selectedDate])

  return {
    ...state,
    dispatch,

    // Action creators
    setActiveTimeFrame,
    selectDate,
    selectDayMonthly,
    navigateDate,
    selectMonth,
    goToday,
    updateDays,

    // Computed
    isTodaySelected,
    getYearsList,
    isFirstDate,
    isLastDate,
  }
}

export type { CalendarAction }
