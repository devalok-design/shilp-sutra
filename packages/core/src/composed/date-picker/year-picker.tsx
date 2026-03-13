'use client'

import * as React from 'react'
import { cn } from '../../ui/lib/utils'

export interface YearPickerProps extends React.ComponentPropsWithoutRef<'div'> {
  currentYear: number
  selectedYear?: number
  onYearSelect: (year: number) => void
  minDate?: Date
  maxDate?: Date
}

export const YearPicker = React.forwardRef<HTMLDivElement, YearPickerProps>(
  function YearPicker({
  currentYear,
  selectedYear,
  onYearSelect,
  minDate,
  maxDate,
  className,
  ...props
}, ref) {
  const startYear = Math.floor(currentYear / 10) * 10
  const years = Array.from({ length: 12 }, (_, i) => startYear + i)

  return (
    <div ref={ref} {...props} className={cn("w-[252px]", className)}>
      <div className="text-center pb-ds-04 text-ds-md font-semibold text-surface-fg">
        {startYear} &ndash; {startYear + 11}
      </div>
      <div className="grid grid-cols-3 gap-ds-02">
        {years.map((year) => {
          const isSelected = year === selectedYear
          const isDisabled =
            (minDate != null && year < minDate.getFullYear()) ||
            (maxDate != null && year > maxDate.getFullYear())

          return (
            <button
              key={year}
              type="button"
              disabled={isDisabled || false}
              onClick={() => !isDisabled && onYearSelect(year)}
              className={cn(
                'h-ds-sm-plus rounded-ds-md text-ds-md transition-colors',
                isDisabled && 'opacity-action-disabled pointer-events-none cursor-not-allowed',
                isSelected &&
                  'bg-accent-9 text-accent-fg',
                !isSelected &&
                  !isDisabled &&
                  'hover:bg-surface-3 text-surface-fg',
              )}
            >
              {year}
            </button>
          )
        })}
      </div>
    </div>
  )
},
)

YearPicker.displayName = 'YearPicker'
