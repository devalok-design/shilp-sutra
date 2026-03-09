'use client'

import * as React from 'react'
import { IconMinus, IconPlus } from '@tabler/icons-react'
import { cn } from './lib/utils'
import { useFormField } from './form'

/**
 * Props for NumberInput — a stepper control with "−" and "+" buttons flanking a numeric input,
 * clamped between `min` and `max`. The decrement/increment buttons are disabled when bounds are reached.
 *
 * **Controlled only:** Pass `value` + `onValueChange` for controlled usage. Uncontrolled usage is
 * possible but the buttons won't update the displayed value without `onValueChange`.
 *
 * **Step:** The `step` prop controls how much each button press increments/decrements (default 1).
 * Direct text input is also clamped to `[min, max]` on change.
 *
 * @example
 * // Quantity selector with 1–99 range:
 * <NumberInput value={qty} onValueChange={setQty} min={1} max={99} />
 *
 * @example
 * // Rating input (1–10, step 1):
 * <NumberInput value={rating} onValueChange={setRating} min={1} max={10} />
 *
 * @example
 * // Fine-grained opacity control (0–100, step 5):
 * <NumberInput value={opacity} onValueChange={setOpacity} min={0} max={100} step={5} />
 *
 * @example
 * // Disabled number display (read-only-like):
 * <NumberInput value={autoCalcValue} onValueChange={() => {}} disabled />
 * // These are just a few ways — feel free to combine props creatively!
 */
export interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type' | 'size'> {
  value?: number
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value = 0,
      onValueChange,
      min = Number.MIN_SAFE_INTEGER,
      max = Number.MAX_SAFE_INTEGER,
      step = 1,
      disabled = false,
      className,
      'aria-label': ariaLabelProp,
      ...rest
    },
    ref,
  ) => {
    const fieldCtx = useFormField()
    // If no explicit aria-label and not inside a FormField (no id to associate with Label),
    // provide a sensible default
    const ariaLabel = ariaLabelProp ?? (rest.id || fieldCtx.helperTextId ? undefined : 'Numeric value')

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseInt(e.target.value, 10) || 0
      if (newValue >= min && newValue <= max) {
        onValueChange?.(newValue)
      }
    }

    const handleIncrement = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault() // Prevent form submission
      const newValue = value + step
      if (newValue <= max) {
        onValueChange?.(newValue)
      }
    }

    const handleDecrement = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault() // Prevent form submission
      const newValue = value - step
      if (newValue >= min) {
        onValueChange?.(newValue)
      }
    }

    return (
      <div
        className={cn(
          'flex items-center justify-between rounded-ds-full border border-border',
          className,
        )}
      >
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          aria-label="Decrease value"
          className="flex h-ds-sm w-ds-sm items-center justify-center border-0 text-text-placeholder transition-colors hover:text-text-secondary"
        >
          <IconMinus className="h-ico-sm w-ico-sm" />
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
          aria-label={ariaLabel}
          aria-describedby={rest['aria-describedby'] ?? fieldCtx.helperTextId}
          className="bg-transparent text-ds-base font-semibold w-ds-sm-plus border-0 text-center text-text-secondary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          {...rest}
        />

        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          aria-label="Increase value"
          className="flex h-ds-sm w-ds-sm items-center justify-center border-0 text-text-placeholder transition-colors hover:text-text-secondary"
        >
          <IconPlus className="h-ico-sm w-ico-sm" />
        </button>
      </div>
    )
  },
)
NumberInput.displayName = 'NumberInput'

export { NumberInput }
