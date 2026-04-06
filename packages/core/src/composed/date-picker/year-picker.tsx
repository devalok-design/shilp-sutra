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
  const COLS = 3
  const startYear = Math.floor(currentYear / 10) * 10
  const years = Array.from({ length: 12 }, (_, i) => startYear + i)
  const [focusedIndex, setFocusedIndex] = React.useState(() => {
    const sel = years.indexOf(selectedYear ?? currentYear)
    return sel >= 0 ? sel : 0
  })
  const buttonRefs = React.useRef<(HTMLButtonElement | null)[]>([])

  const isYearDisabled = (year: number) =>
    (minDate != null && year < minDate.getFullYear()) ||
    (maxDate != null && year > maxDate.getFullYear())

  const handleKeyDown = (e: React.KeyboardEvent) => {
    let next = focusedIndex
    switch (e.key) {
      case 'ArrowRight': next = Math.min(11, focusedIndex + 1); break
      case 'ArrowLeft': next = Math.max(0, focusedIndex - 1); break
      case 'ArrowDown': next = Math.min(11, focusedIndex + COLS); break
      case 'ArrowUp': next = Math.max(0, focusedIndex - COLS); break
      case 'Home': next = 0; break
      case 'End': next = 11; break
      default: return
    }
    e.preventDefault()
    while (next !== focusedIndex && isYearDisabled(years[next])) {
      next += (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ? -1 : 1
      if (next < 0 || next > 11) return
    }
    setFocusedIndex(next)
    buttonRefs.current[next]?.focus()
  }

  return (
    <div ref={ref} {...props} className={cn("w-[252px]", className)}>
      <div className="text-center pb-ds-04 text-ds-md font-semibold text-surface-fg">
        {startYear} &ndash; {startYear + 11}
      </div>
      <div role="grid" aria-label="Year picker" onKeyDown={handleKeyDown}>
        {[0, 1, 2, 3].map((rowIdx) => (
          <div key={rowIdx} role="row" className="grid grid-cols-3 gap-ds-02 mb-ds-02 last:mb-0">
            {years.slice(rowIdx * COLS, rowIdx * COLS + COLS).map((year) => {
              const index = years.indexOf(year)
              const isSelected = year === selectedYear
              const isDisabled = isYearDisabled(year)

              return (
                <button
                  key={year}
                  ref={(el) => { buttonRefs.current[index] = el }}
                  type="button"
                  role="gridcell"
                  tabIndex={index === focusedIndex ? 0 : -1}
                  disabled={isDisabled || false}
                  onClick={() => !isDisabled && onYearSelect(year)}
                  className={cn(
                    'h-ds-sm-plus rounded-ds-md text-ds-md transition-colors focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2',
                    isDisabled && 'opacity-action-disabled pointer-events-none cursor-not-allowed',
                    isSelected &&
                      'bg-accent-9 text-accent-fg',
                    !isSelected &&
                      !isDisabled &&
                      'hover:bg-surface-raised-hover text-surface-fg',
                  )}
                >
                  {year}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
},
)

YearPicker.displayName = 'YearPicker'
