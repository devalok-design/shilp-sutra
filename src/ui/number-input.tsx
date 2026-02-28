'use client'

import * as React from 'react'
import { MinusIcon, PlusIcon } from 'lucide-react'

const NumberInput = ({
  value = 0,
  onChange = (value: number) => {},
  min = Number.MIN_SAFE_INTEGER,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  disabled = false,
  className = '',
}) => {
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
      className={`flex items-center justify-between rounded-[36px] border border-[var(--color-border-default)] ${className}`}
    >
      <button
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className="flex h-8 w-8 items-center justify-center border-0 text-[var(--color-text-placeholder)] transition-colors hover:text-[var(--color-text-secondary)]"
      >
        <MinusIcon className="h-3 w-4" />
      </button>

      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="text-base font-semibold w-9 border-0 text-center text-[var(--color-text-secondary)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />

      <button
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className="flex h-8 w-8 items-center justify-center border-0 text-[var(--color-text-placeholder)] transition-colors hover:text-[var(--color-text-secondary)]"
      >
        <PlusIcon className="h-4 w-4" />
      </button>
    </div>
  )
}

export default NumberInput
