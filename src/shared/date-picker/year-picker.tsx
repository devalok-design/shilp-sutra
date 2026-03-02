'use client'

import { cn } from '../../ui/lib/utils'

export interface YearPickerProps {
  currentYear: number
  selectedYear?: number
  onYearSelect: (year: number) => void
  minDate?: Date
  maxDate?: Date
}

export function YearPicker({
  currentYear,
  selectedYear,
  onYearSelect,
  minDate,
  maxDate,
}: YearPickerProps) {
  const startYear = Math.floor(currentYear / 10) * 10
  const years = Array.from({ length: 12 }, (_, i) => startYear + i)

  return (
    <div className="w-[252px]">
      <div className="text-center pb-ds-04 text-ds-md font-semibold text-[var(--color-text-primary)]">
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
                'h-9 rounded-[var(--radius-md)] text-ds-md transition-colors',
                isDisabled && 'opacity-40 pointer-events-none cursor-not-allowed',
                isSelected &&
                  'bg-[var(--color-interactive)] text-[var(--color-text-on-color)]',
                !isSelected &&
                  !isDisabled &&
                  'hover:bg-[var(--color-field)] text-[var(--color-text-primary)]',
              )}
            >
              {year}
            </button>
          )
        })}
      </div>
    </div>
  )
}

YearPicker.displayName = 'YearPicker'
