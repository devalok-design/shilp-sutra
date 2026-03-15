'use client'

import * as React from 'react'
import { createContext, useContext, useMemo } from 'react'

// ============================================================
// Types
// ============================================================

export interface WeekDay {
  date: string       // ISO date
  completed: number
  total: number
}

export interface WeekHeatmapContextValue {
  days: WeekDay[]
  onDayClick?: (date: string) => void
  overdue?: number
  totalCompleted: number
  totalTasks: number
  streak: number
  today: string
}

export interface WeekHeatmapProviderProps {
  children: React.ReactNode
  days: WeekDay[]
  onDayClick?: (date: string) => void
  overdue?: number
  /** ISO date string for "today", defaults to actual today */
  today?: string
}

// ============================================================
// Context
// ============================================================

const WeekHeatmapContext = createContext<WeekHeatmapContextValue | null>(null)

export function useWeekHeatmap(): WeekHeatmapContextValue {
  const ctx = useContext(WeekHeatmapContext)
  if (!ctx) {
    throw new Error('useWeekHeatmap must be used within a WeekHeatmapProvider')
  }
  return ctx
}

// ============================================================
// Helpers
// ============================================================

function computeStreak(days: WeekDay[], today: string): number {
  // Get past days (before today), sorted descending by date
  const pastDays = days
    .filter((d) => d.date < today)
    .sort((a, b) => b.date.localeCompare(a.date))

  let streak = 0
  for (const day of pastDays) {
    if (day.total > 0 && day.completed === day.total) {
      streak++
    } else {
      break
    }
  }
  return streak
}

// ============================================================
// Provider
// ============================================================

function WeekHeatmapProvider({
  children,
  days,
  onDayClick,
  overdue,
  today: todayProp,
}: WeekHeatmapProviderProps) {
  const today = todayProp ?? new Date().toISOString().split('T')[0]

  const value = useMemo<WeekHeatmapContextValue>(() => {
    const totalCompleted = days.reduce((sum, d) => sum + d.completed, 0)
    const totalTasks = days.reduce((sum, d) => sum + d.total, 0)
    const streak = computeStreak(days, today)

    return {
      days,
      onDayClick,
      overdue,
      totalCompleted,
      totalTasks,
      streak,
      today,
    }
  }, [days, onDayClick, overdue, today])

  return (
    <WeekHeatmapContext.Provider value={value}>{children}</WeekHeatmapContext.Provider>
  )
}

WeekHeatmapProvider.displayName = 'WeekHeatmapProvider'

export { WeekHeatmapProvider }
