'use client'

// ============================================================
// Calendar — Weekly/Monthly date picker for admin dashboard
// ============================================================

import * as React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../ui/dropdown-menu'
import { FilledArrowIcon, ArrowLeftIcon, ArrowForwardIcon } from '../icons'
import { Toggle } from '../../custom-buttons'
import { isSameDay } from '../utils/date-utils'
import { useCalendarNavigation } from './use-calendar-navigation'
import { format } from 'date-fns'

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
  const cal = useCalendarNavigation()

  // ============================================================
  // Navigation handlers
  // ============================================================

  const handleDateChange = (direction: 'prev' | 'next') => {
    cal.navigateDate(direction)
  }

  const handleMonthSelection = (monthYear: string) => {
    cal.selectMonth(monthYear)
  }

  const getMonthsList = () => {
    const months: string[] = []
    const currentDate = new Date(cal.currentDate)
    const currentYear = currentDate.getFullYear()

    for (let i = 0; i < 12; i++) {
      const date = new Date(currentYear, i, 1)
      months.push(`${format(date, 'MMMM')} ${currentYear}`)
    }
    return months
  }

  const handleDayClick = (index: number, date: Date) => {
    if (cal.activeTimeFrame === 'weekly') {
      cal.selectDate(index, date)
    } else {
      cal.selectDayMonthly(date)
    }
    onDateSelect(date)
  }

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="w-full">
      <div className="flex-direction-row justify-flex-start mb-6 flex w-full items-center">
        <DropdownMenu>
          <DropdownMenuTrigger className="T6-Reg flex items-center gap-2 text-[var(--color-text-secondary)]">
            {cal.selectedMonth}
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
            selectedId={cal.activeTimeFrame}
            onSelect={(id) => cal.setActiveTimeFrame(id)}
          />

          <div className="flex gap-0">
            <button
              aria-label="Previous"
              onClick={() => handleDateChange('prev')}
              className="rounded-[var(--radius-full)] p-1 hover:bg-[var(--color-layer-02)]"
            >
              <ArrowLeftIcon className="h-[var(--icon-md)] w-[var(--icon-md)] text-[var(--color-text-secondary)]" />
            </button>
            <button
              aria-label="Next"
              onClick={() => handleDateChange('next')}
              className="rounded-[var(--radius-full)] p-1 hover:bg-[var(--color-layer-02)]"
            >
              <ArrowForwardIcon className="h-[var(--icon-md)] w-[var(--icon-md)] text-[var(--color-text-secondary)]" />
            </button>
          </div>
        </div>
      </div>

      <div
        className={`calendar ${
          cal.activeTimeFrame === 'weekly' ? 'flex' : 'grid grid-cols-7 gap-0'
        } w-full items-center overflow-hidden`}
      >
        {cal.activeTimeFrame === 'monthly' &&
          ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((weekDay) => (
            <div key={weekDay} className="pb-2 pt-4 text-center">
              <span className="L3 uppercase text-[var(--color-text-tertiary)]">
                {weekDay}
              </span>
            </div>
          ))}

        {cal.days.map((day, index) => (
          <div
            key={index}
            role="button"
            tabIndex={day.isPadding ? -1 : 0}
            aria-label={day.isPadding ? undefined : format(day.fullDate, 'MMMM d, yyyy')}
            className={`${
              cal.activeTimeFrame === 'weekly'
                ? 'w-full rounded-t-[var(--radius-lg)] pb-3.5 pt-4'
                : 'pb-0 pt-0'
            } flex cursor-pointer flex-col items-center text-center ${
              cal.activeTimeFrame === 'weekly' && cal.activeIndex === index
                ? 'bg-[var(--color-layer-02)]'
                : ''
            } ${day.isPadding ? 'opacity-50' : ''} `}
            onClick={() => handleDayClick(index, day.fullDate)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleDayClick(index, day.fullDate)
              }
            }}
          >
            {cal.activeTimeFrame === 'weekly' && (
              <span className="L3 mb-2 uppercase text-[var(--color-text-tertiary)]">
                {day.day}
              </span>
            )}
            <div
              className={`mx-1 my-1 flex-col ${
                cal.activeTimeFrame === 'monthly' &&
                isSameDay(day.fullDate, new Date(cal.selectedDate))
                  ? 'flex h-10 w-10 items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-interactive-subtle)] shadow-[0px_4px_4px_0px_rgba(255,255,255,0.25)_inset,0px_0px_4px_0px_var(--color-focus)_inset]'
                  : 'flex h-10 w-10 items-center justify-center'
              }`}
            >
              <span
                className={`B1-Reg flex h-10 w-10 items-center justify-center rounded-[var(--radius-full)] ${
                  day.isToday
                    ? 'bg-[var(--color-interactive-hover)] p-2 text-[var(--color-text-on-color)]'
                    : 'text-[var(--color-text-secondary)]'
                } ${
                  day.isActive && !day.isToday
                    ? 'bg-[var(--color-field)]'
                    : ''
                }`}
              >
                {day.date}
              </span>
              {hasCorrection && hasCorrection(day.fullDate) && (
                <div className="absolute z-10 mt-6 h-[6px] w-[6px] translate-y-[5px] rounded-[var(--radius-full)] bg-[var(--color-text-error)]"></div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

Calendar.displayName = 'Calendar'
