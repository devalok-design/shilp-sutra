'use client'

import { IconMinus, IconPlus } from '@tabler/icons-react'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { useFormField } from './form'
import { Icon } from './icon'
import type { IconSize } from './icon-context'
import { type FieldState, resolveFieldState } from './lib/field-state'
import { cn } from './lib/utils'

/** @deprecated Use `FieldState` — the shared control-state type. Kept as an alias. */
export type NumberInputState = FieldState

const numberInputWrapperVariants = cva(
  'flex items-center justify-between rounded-control border border-surface-border-strong',
  {
    variants: {
      size: {
        xs: 'h-ds-xs-plus',
        sm: 'h-ds-sm',
        md: 'h-ds-md',
        lg: 'h-ds-lg',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

export type NumberInputSize = NonNullable<VariantProps<typeof numberInputWrapperVariants>['size']>

/** Maps size to stepper button dimensions */
const buttonSizeMap: Record<NonNullable<NumberInputSize>, string> = {
  xs: 'h-[22px] w-[22px]',
  sm: 'h-ds-sm w-ds-sm',
  md: 'h-ds-sm w-ds-sm',
  lg: 'h-ds-md w-ds-md',
}

/** Maps size to Icon component size */
const iconSizeMap: Record<NonNullable<NumberInputSize>, IconSize> = {
  xs: 'xs',
  sm: 'sm',
  md: 'sm',
  lg: 'md',
}

/** Maps size to input text and width classes */
const inputSizeMap: Record<NonNullable<NumberInputSize>, string> = {
  xs: 'text-ds-sm w-ds-06b',
  sm: 'text-ds-sm w-ds-sm-plus',
  md: 'text-ds-md w-ds-sm-plus',
  lg: 'text-ds-md w-ds-md',
}

/** Maps state to border color classes */
const stateColorMap: Record<NonNullable<NumberInputState>, string> = {
  default: '',
  error: 'border-error-7',
  warning: 'border-warning-7',
  success: 'border-success-7',
}

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
 * **Sizes:** `xs` (28px) | `sm` (32px) | `md` (40px, default) | `lg` (48px)
 *
 * **Validation states:** `state="error"` colors the border red.
 * Use with `<FormField>` to show helper text below the input.
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
  /** Size of the number input. Controls height, button sizes, text size. */
  size?: NumberInputSize
  /** Validation state controlling border color. */
  state?: FieldState
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
      size: sizeProp = 'md',
      state: stateProp,
      'aria-label': ariaLabelProp,
      ...rest
    },
    ref,
  ) => {
    const size = sizeProp ?? 'md'
    const fieldCtx = useFormField()
    // If no explicit aria-label and not inside a FormField (no id to associate with Label),
    // provide a sensible default
    const ariaLabel = ariaLabelProp ?? (rest.id || fieldCtx.helperTextId ? undefined : 'Numeric value')

    // Merge FormField context — explicit props always win (shared precedence)
    const state = resolveFieldState(stateProp, fieldCtx.state) ?? 'default'

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.trim()
      if (raw === '' || raw === '-') {
        onValueChange?.(min >= 0 ? min : 0)
        return
      }
      const parsed = Number(raw)
      if (Number.isNaN(parsed)) return
      const clamped = Math.min(Math.max(parsed, min), max)
      onValueChange?.(clamped)
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

    const resolvedButtonSize = buttonSizeMap[size]
    const resolvedIconSize = iconSizeMap[size]
    const resolvedInputSize = inputSizeMap[size]

    return (
      <div
        className={cn(
          numberInputWrapperVariants({ size }),
          stateColorMap[state],
          className,
        )}
      >
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          aria-label="Decrease value"
          title="Decrease"
          className={cn(
            'flex items-center justify-center border-0 rounded-control-inner text-surface-fg-subtle hover:bg-surface-raised-hover hover:text-surface-fg-muted active:scale-90 transition-[color,background-color,transform] duration-fast-01 ease-productive-standard disabled:opacity-action-disabled disabled:pointer-events-none',
            resolvedButtonSize,
          )}
        >
          <Icon icon={IconMinus} size={resolvedIconSize} />
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
          aria-invalid={state === 'error' || undefined}
          aria-describedby={rest['aria-describedby'] ?? fieldCtx.helperTextId}
          className={cn(
            'bg-transparent font-semibold border-0 text-center text-surface-fg-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
            resolvedInputSize,
          )}
          {...rest}
        />

        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          aria-label="Increase value"
          title="Increase"
          className={cn(
            'flex items-center justify-center border-0 rounded-control-inner text-surface-fg-subtle hover:bg-surface-raised-hover hover:text-surface-fg-muted active:scale-90 transition-[color,background-color,transform] duration-fast-01 ease-productive-standard disabled:opacity-action-disabled disabled:pointer-events-none',
            resolvedButtonSize,
          )}
        >
          <Icon icon={IconPlus} size={resolvedIconSize} />
        </button>
      </div>
    )
  },
)
NumberInput.displayName = 'NumberInput'

export { NumberInput, numberInputWrapperVariants }
