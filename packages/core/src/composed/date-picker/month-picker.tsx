'use client'

import * as React from 'react'
import { cn } from '../../ui/lib/utils'

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export interface MonthPickerProps extends React.ComponentPropsWithoutRef<'div'> {
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
  className,
  ...props
}, ref) {
  const COLS = 4
  const [focusedIndex, setFocusedIndex] = React.useState(selectedMonth ?? 0)
  const buttonRefs = React.useRef<(HTMLButtonElement | null)[]>([])

  const isMonthDisabled = (index: number) =>
    (minDate != null &&
      (currentYear < minDate.getFullYear() ||
        (currentYear === minDate.getFullYear() && index < minDate.getMonth()))) ||
    (maxDate != null &&
      (currentYear > maxDate.getFullYear() ||
        (currentYear === maxDate.getFullYear() && index > maxDate.getMonth())))

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
    // Skip disabled months
    while (next !== focusedIndex && isMonthDisabled(next)) {
      next += (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ? -1 : 1
      if (next < 0 || next > 11) return
    }
    setFocusedIndex(next)
    buttonRefs.current[next]?.focus()
  }

  return (
    <div ref={ref} {...props} className={cn("w-[252px]", className)}>
      <div className="text-center pb-ds-04 text-ds-md font-semibold text-surface-fg">
        {currentYear}
      </div>
      <div role="grid" aria-label="Month picker" tabIndex={-1} onKeyDown={handleKeyDown}>
        {[0, 1, 2].map((rowIdx) => (
          <div key={rowIdx} role="row" className="grid grid-cols-4 gap-ds-02 mb-ds-02 last:mb-0">
            {MONTHS.slice(rowIdx * COLS, rowIdx * COLS + COLS).map((label, colIdx) => {
              const index = rowIdx * COLS + colIdx
              const isSelected = index === selectedMonth
              const isDisabled = isMonthDisabled(index)

              return (
                <button
                  key={label}
                  ref={(el) => { buttonRefs.current[index] = el }}
                  type="button"
                  role="gridcell"
                  tabIndex={index === focusedIndex ? 0 : -1}
                  disabled={isDisabled || false}
                  onClick={() => !isDisabled && onMonthSelect(index)}
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
                  {label}
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

MonthPicker.displayName = 'MonthPicker'
