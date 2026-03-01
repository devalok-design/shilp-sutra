'use client'

// ============================================================
// Calendar — Weekly/Monthly date picker for admin dashboard
// ============================================================

import * as React from 'react'
import { useEffect, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../ui/dropdown-menu'
import { FilledArrowIcon, ArrowLeftIcon, ArrowForwardIcon } from '../icons'
import { Toggle } from '../../custom-buttons/Toggle'
import { isSameDay, getWeekDays, getMonthDays } from '../utils/date-utils'
import { format } from 'date-fns'
import type { DayInfo } from '../types'

// ============================================================
// Props
// ============================================================

export interface CalendarProps {
  onDateSelect: (date: Date) => void
  hasCorrection?: (date: Date) => boolean
}

// ============================================================
// Component
// ============================================================

export function Calendar({ onDateSelect, hasCorrection }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [activeTimeFrame, setActiveTimeFrame] = useState<'weekly' | 'monthly'>(
    'weekly',
  )
  const [days, setDays] = useState<DayInfo[]>([])
  const [selectedMonth, setSelectedMonth] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [dateOffset, setDateOffset] = useState(0)

  // ============================================================
  // Calendar day generation (month view)
  // ============================================================

  const computeMonthDays = (): DayInfo[] => {
    return getMonthDays(currentDate, selectedDate)
  }

  // ============================================================
  // Calendar update
  // ============================================================

  const updateCalendarDays = () => {
    setDays(
      activeTimeFrame === 'weekly'
        ? getWeekDays(currentDate, selectedDate)
        : computeMonthDays(),
    )
  }

  // ============================================================
  // Navigation handlers
  // ============================================================

  const handleDateChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)

    if (activeTimeFrame === 'weekly') {
      const daysToAdd = direction === 'prev' ? -7 : 7
      newDate.setDate(newDate.getDate() + daysToAdd)
    } else {
      const monthsToAdd = direction === 'prev' ? -1 : 1
      newDate.setMonth(newDate.getMonth() + monthsToAdd)
      newDate.setDate(1)
    }

    setCurrentDate(newDate)
    setDateOffset(dateOffset + (direction === 'prev' ? -1 : 1))
    updateSelectedMonth(newDate)
  }

  const handleMonthSelection = (monthYear: string) => {
    const [month, year] = monthYear.split(' ')
    const newDate = new Date(currentDate)
    newDate.setMonth(new Date(`${month} 1, 2024`).getMonth())
    newDate.setFullYear(parseInt(year))

    setCurrentDate(newDate)
    setSelectedMonth(monthYear)

    const today = new Date()
    const weekDiff = Math.floor(
      (newDate.getTime() - today.getTime()) / (7 * 24 * 60 * 60 * 1000),
    )
    setDateOffset(weekDiff)
    updateCalendarDays()
  }

  const getMonthsList = () => {
    const months: string[] = []
    const currentYear = currentDate.getFullYear()

    for (let i = 0; i < 12; i++) {
      const date = new Date(currentYear, i, 1)
      months.push(`${format(date, 'MMMM')} ${currentYear}`)
    }
    return months
  }

  const handleDayClick = (index: number, date: Date) => {
    if (activeTimeFrame === 'weekly') {
      setActiveIndex(index)
    }
    setSelectedDate(date)
    onDateSelect(date)
  }

  const updateSelectedMonth = (date: Date) => {
    const newMonth = `${format(date, 'MMMM')} ${date.getFullYear()}`
    setSelectedMonth(newMonth)
  }

  // ============================================================
  // Effects
  // ============================================================

  useEffect(() => {
    updateCalendarDays()
  }, [activeTimeFrame, currentDate, dateOffset])

  useEffect(() => {
    const month = format(currentDate, 'MMMM')
    const year = currentDate.getFullYear()
    setSelectedMonth(`${month} ${year}`)

    const initialDays =
      activeTimeFrame === 'weekly'
        ? getWeekDays(currentDate, selectedDate)
        : computeMonthDays()
    setDays(initialDays)

    const today = new Date()
    const todayIndex = initialDays.findIndex((day) =>
      isSameDay(day.fullDate, today),
    )
    if (todayIndex !== -1) {
      setActiveIndex(todayIndex)
    }
  }, [])

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="w-full">
      <div className="flex-direction-row justify-flex-start mb-6 flex w-full items-center">
        <DropdownMenu>
          <DropdownMenuTrigger className="T6-Reg flex items-center gap-2 text-[var(--Mapped-Text-Secondary)]">
            {selectedMonth}
            <FilledArrowIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {getMonthsList().map((month) => (
              <DropdownMenuItem
                key={month}
                onSelect={() => handleMonthSelection(month)}
              >
                {month}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="ml-auto flex items-center gap-4">
          <Toggle
            size="medium"
            color="tonal"
            options={[
              { id: 'weekly', text: 'Weekly' },
              { id: 'monthly', text: 'Monthly' },
            ]}
            selectedId={activeTimeFrame}
            onSelect={(id) => setActiveTimeFrame(id as 'weekly' | 'monthly')}
          />

          <div className="flex gap-0">
            <button
              aria-label="Previous"
              onClick={() => handleDateChange('prev')}
              className="rounded-full p-1 hover:bg-[var(--Mapped-Surface-Secondary)]"
            >
              <ArrowLeftIcon className="h-5 w-5 text-[var(--Mapped-Text-Secondary)]" />
            </button>
            <button
              aria-label="Next"
              onClick={() => handleDateChange('next')}
              className="rounded-full p-1 hover:bg-[var(--Mapped-Surface-Secondary)]"
            >
              <ArrowForwardIcon className="h-5 w-5 text-[var(--Mapped-Text-Secondary)]" />
            </button>
          </div>
        </div>
      </div>

      <div
        className={`calendar ${
          activeTimeFrame === 'weekly' ? 'flex' : 'grid grid-cols-7 gap-0'
        } w-full items-center overflow-hidden`}
      >
        {activeTimeFrame === 'monthly' &&
          ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((weekDay) => (
            <div key={weekDay} className="pb-2 pt-4 text-center">
              <span className="L3 uppercase text-[var(--Mapped-Text-Tertiary)]">
                {weekDay}
              </span>
            </div>
          ))}

        {days.map((day, index) => (
          <div
            key={index}
            role="button"
            tabIndex={0}
            className={`${
              activeTimeFrame === 'weekly'
                ? 'w-full rounded-t-lg pb-3.5 pt-4'
                : 'pb-0 pt-0'
            } flex cursor-pointer flex-col items-center text-center ${
              activeTimeFrame === 'weekly' && activeIndex === index
                ? 'bg-[var(--Mapped-Surface-Secondary)]'
                : ''
            } ${day.isPadding ? 'opacity-50' : ''} `}
            onClick={() => handleDayClick(index, day.fullDate)}
            onKeyDown={(e) =>
              e.key === 'Enter' && handleDayClick(index, day.fullDate)
            }
          >
            {activeTimeFrame === 'weekly' && (
              <span className="L3 mb-2 uppercase text-[var(--Mapped-Text-Tertiary)]">
                {day.day}
              </span>
            )}
            <div
              className={`mx-1 my-1 flex-col ${
                activeTimeFrame === 'monthly' &&
                isSameDay(day.fullDate, selectedDate)
                  ? 'flex h-10 w-10 items-center justify-center rounded-full bg-[var(--Surface-Purple-Dark)] shadow-[0px_4px_4px_0px_rgba(255,255,255,0.25)_inset,0px_0px_4px_0px_var(--primitives-purple-400-b,#AB9DED)_inset]'
                  : 'flex h-10 w-10 items-center justify-center'
              }`}
            >
              <span
                className={`B1-Reg flex h-10 w-10 items-center justify-center rounded-full ${
                  day.isToday
                    ? 'bg-[var(--Mapped-Text-Highlight2)] p-2 text-[var(--neutrals-lightest)]'
                    : 'text-[var(--Mapped-Text-Secondary)]'
                } ${
                  day.isActive && !day.isToday
                    ? 'bg-[var(--Mapped-Surface-Dark)]'
                    : ''
                }`}
              >
                {day.date}
              </span>
              {hasCorrection && hasCorrection(day.fullDate) && (
                <div className="absolute z-10 mt-6 h-[6px] w-[6px] translate-y-[5px] rounded-[60px] bg-[var(--Text-Error)]"></div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

Calendar.displayName = 'Calendar'
