'use client'

import * as React from 'react'
import { cn } from '../../ui/lib/utils'

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export interface MonthPickerProps {
  currentYear: number
  selectedMonth?: number // 0-11
  onMonthSelect: (month: number) => void
  minDate?: Date
  maxDate?: Date
}

export const MonthPicker = React.forwardRef<HTMLDivElement, MonthPickerProps>(
  function MonthPicker({
  currentYear,
  selectedMonth,
  onMonthSelect,
  minDate,
  maxDate,
}, ref) {
  return (
    <div ref={ref} className="w-[252px]">
      <div className="text-center pb-ds-04 text-ds-md font-semibold text-text-primary">
        {currentYear}
      </div>
      <div className="grid grid-cols-4 gap-ds-02">
        {MONTHS.map((label, index) => {
          const isSelected = index === selectedMonth
          const isDisabled =
            (minDate != null &&
              (currentYear < minDate.getFullYear() ||
                (currentYear === minDate.getFullYear() &&
                  index < minDate.getMonth()))) ||
            (maxDate != null &&
              (currentYear > maxDate.getFullYear() ||
                (currentYear === maxDate.getFullYear() &&
                  index > maxDate.getMonth())))

          return (
            <button
              key={label}
              type="button"
              disabled={isDisabled || false}
              onClick={() => !isDisabled && onMonthSelect(index)}
              className={cn(
                'h-ds-sm-plus rounded-ds-md text-ds-md transition-colors',
                isDisabled && 'opacity-[0.38] pointer-events-none cursor-not-allowed',
                isSelected &&
                  'bg-interactive text-text-on-color',
                !isSelected &&
                  !isDisabled &&
                  'hover:bg-field text-text-primary',
              )}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
},
)

MonthPicker.displayName = 'MonthPicker'
