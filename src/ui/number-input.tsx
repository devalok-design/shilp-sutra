'use client'

import * as React from 'react'
import { IconMinus, IconPlus } from '@tabler/icons-react'
import { cn } from './lib/utils'

export interface NumberInputProps {
  value?: number
  onChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  className?: string
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value = 0,
      onChange = (_value: number) => {},
      min = Number.MIN_SAFE_INTEGER,
      max = Number.MAX_SAFE_INTEGER,
      step = 1,
      disabled = false,
      className,
    },
    ref,
  ) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseInt(e.target.value) || 0
      if (newValue >= min && newValue <= max) {
        onChange(newValue)
      }
    }

    const handleIncrement = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault() // Prevent form submission
      const newValue = value + step
      if (newValue <= max) {
        onChange(newValue)
      }
    }

    const handleDecrement = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault() // Prevent form submission
      const newValue = value - step
      if (newValue >= min) {
        onChange(newValue)
      }
    }

    return (
      <div
        className={cn(
          'flex items-center justify-between rounded-[var(--radius-full)] border border-[var(--color-border-default)]',
          className,
        )}
      >
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          aria-label="Decrease value"
          className="flex h-8 w-8 items-center justify-center border-0 text-[var(--color-text-placeholder)] transition-colors hover:text-[var(--color-text-secondary)]"
        >
          <IconMinus className="h-[var(--icon-sm)] w-[var(--icon-sm)]" />
        </button>

        <input
          ref={ref}
          type="number"
          value={value}
          onChange={handleInputChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className="text-ds-base font-semibold w-9 border-0 text-center text-[var(--color-text-secondary)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />

        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          aria-label="Increase value"
          className="flex h-8 w-8 items-center justify-center border-0 text-[var(--color-text-placeholder)] transition-colors hover:text-[var(--color-text-secondary)]"
        >
          <IconPlus className="h-[var(--icon-sm)] w-[var(--icon-sm)]" />
        </button>
      </div>
    )
  },
)
NumberInput.displayName = 'NumberInput'

export { NumberInput }
