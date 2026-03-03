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

export const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  function Calendar({ onDateSelect, hasCorrection }, ref) {
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
    <div ref={ref} className="w-full">
      <div className="flex-direction-row justify-flex-start mb-ds-06 flex w-full items-center">
        <DropdownMenu>
          <DropdownMenuTrigger className="text-ds-xl flex items-center gap-ds-03 text-text-secondary">
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

        <div className="ml-auto flex items-center gap-ds-05">
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
              className="rounded-ds-full p-ds-02 hover:bg-layer-02"
            >
              <ArrowLeftIcon className="h-ico-md w-ico-md text-text-secondary" />
            </button>
            <button
              aria-label="Next"
              onClick={() => handleDateChange('next')}
              className="rounded-ds-full p-ds-02 hover:bg-layer-02"
            >
              <ArrowForwardIcon className="h-ico-md w-ico-md text-text-secondary" />
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
            <div key={weekDay} className="pb-ds-03 pt-ds-05 text-center">
              <span className="text-ds-sm font-semibold uppercase tracking-wider  text-text-tertiary">
                {weekDay}
              </span>
            </div>
          ))}

        {cal.days.map((day, index) => (
          <button
            type="button"
            key={index}
            tabIndex={day.isPadding ? -1 : 0}
            aria-label={day.isPadding ? undefined : format(day.fullDate, 'MMMM d, yyyy')}
            className={`${
              cal.activeTimeFrame === 'weekly'
                ? 'w-full rounded-t-ds-lg pb-3.5 pt-ds-05'
                : 'pb-0 pt-0'
            } flex cursor-pointer flex-col items-center text-center ${
              cal.activeTimeFrame === 'weekly' && cal.activeIndex === index
                ? 'bg-layer-02'
                : ''
            } ${day.isPadding ? 'opacity-50' : ''} `}
            onClick={() => handleDayClick(index, day.fullDate)}
          >
            {cal.activeTimeFrame === 'weekly' && (
              <span className="text-ds-sm font-semibold uppercase tracking-wider mb-ds-03  text-text-tertiary">
                {day.day}
              </span>
            )}
            <div
              className={`mx-ds-02 my-ds-02 flex-col ${
                cal.activeTimeFrame === 'monthly' &&
                isSameDay(day.fullDate, new Date(cal.selectedDate))
                  ? 'flex h-10 w-10 items-center justify-center rounded-ds-full bg-interactive-subtle shadow-[0px_4px_4px_0px_var(--color-inset-glow)_inset,0px_0px_4px_0px_var(--color-focus)_inset]'
                  : 'flex h-10 w-10 items-center justify-center'
              }`}
            >
              <span
                className={`text-ds-base flex h-10 w-10 items-center justify-center rounded-ds-full ${
                  day.isToday
                    ? 'bg-interactive-hover p-ds-03 text-text-on-color'
                    : 'text-text-secondary'
                } ${
                  day.isActive && !day.isToday
                    ? 'bg-field'
                    : ''
                }`}
              >
                {day.date}
              </span>
              {hasCorrection && hasCorrection(day.fullDate) && (
                <div className="absolute z-10 mt-ds-06 h-[6px] w-[6px] translate-y-[5px] rounded-ds-full bg-text-error"></div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
},
)

Calendar.displayName = 'Calendar'
