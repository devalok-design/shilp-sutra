import { useState } from 'react'
import { subMonths, addMonths, setMonth, setYear } from 'date-fns'

export function useCalendar(initialMonth?: Date) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth ?? new Date())

  const goToPreviousMonth = () => setCurrentMonth((prev) => subMonths(prev, 1))
  const goToNextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1))
  const goToMonth = (month: number) =>
    setCurrentMonth((prev) => setMonth(prev, month))
  const goToYear = (year: number) =>
    setCurrentMonth((prev) => setYear(prev, year))

  return {
    currentMonth,
    setCurrentMonth,
    goToPreviousMonth,
    goToNextMonth,
    goToMonth,
    goToYear,
  }
}
