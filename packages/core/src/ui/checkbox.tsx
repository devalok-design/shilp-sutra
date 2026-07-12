'use client'

import * as CheckboxPrimitive from '@primitives/react-checkbox'
import { AnimatePresence, motion } from 'framer-motion'
import * as React from 'react'

import { useFormField } from './form'
import { type FieldState, resolveFieldState } from './lib/field-state'
import { durations } from './lib/motion'
import { cn } from './lib/utils'

/** Border + background tint per validation state (checked state uses accent regardless). */
const stateTintClasses: Record<Exclude<FieldState, 'default'>, string> = {
  error: 'border-error-7 bg-error-3',
  warning: 'border-warning-7 bg-warning-3',
  success: 'border-success-7 bg-success-3',
}

/**
 * Props for Checkbox — a Radix-powered accessible checkbox with error state styling and
 * an indeterminate state for "select all" row controls.
 *
 * **Indeterminate:** Pass `indeterminate={true}` to show the "−" dash (overrides `checked`).
 * This is correct for "select all" headers when only some rows are selected.
 *
 * **Controlled:** Use `checked` + `onCheckedChange` for controlled usage.
 * `onCheckedChange` receives `true | false | 'indeterminate'` from Radix.
 *
 * @example
 * // Basic controlled checkbox:
 * <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} />
 *
 * @example
 * // Error state when required checkbox is not checked:
 * <Checkbox state={!termsAccepted ? 'error' : 'default'} checked={termsAccepted} onCheckedChange={(v) => setTerms(v === true)} />
 *
 * @example
 * // "Select all" checkbox with indeterminate state:
 * <Checkbox
 *   indeterminate={someSelected && !allSelected}
 *   checked={allSelected}
 *   onCheckedChange={(v) => toggleAll(v === true)}
 * />
 * // These are just a few ways — feel free to combine props creatively!
 */
export interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  /** Validation/feedback state. `'error'` also sets `aria-invalid`. Inherited from `FormField` when omitted. */
  state?: FieldState
  indeterminate?: boolean
  /** Control size — `sm` (20px), `md` (24px, default, WCAG compliant), `lg` (28px). */
  size?: 'sm' | 'md' | 'lg'
}

const checkboxSizeClasses = {
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-7 w-7',
} as const

const checkboxIconClasses = {
  sm: 'h-[14px] w-[14px]',
  md: 'h-[18px] w-[18px]',
  lg: 'h-5 w-5',
} as const

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, state: stateProp, indeterminate, size = 'md', checked, onCheckedChange, defaultChecked, ...props }, ref) => {
  // Track internal state so AnimatePresence works for both controlled & uncontrolled usage
  const isControlled = checked !== undefined
  const [internalChecked, setInternalChecked] = React.useState<boolean | 'indeterminate'>(
    indeterminate ? 'indeterminate' : (defaultChecked ? true : false),
  )

  const fieldCtx = useFormField()
  const state = resolveFieldState(stateProp, fieldCtx.state)
  const ariaDescribedBy = props['aria-describedby'] ?? fieldCtx.helperTextId
  const ariaRequired = props['aria-required'] ?? fieldCtx.required

  const actualChecked = indeterminate ? 'indeterminate' : (isControlled ? checked : internalChecked)
  const isActive = actualChecked === true || actualChecked === 'indeterminate'

  const handleCheckedChange = React.useCallback(
    (value: boolean | 'indeterminate') => {
      if (!isControlled) setInternalChecked(value)
      onCheckedChange?.(value)
    },
    [isControlled, onCheckedChange],
  )

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      checked={isControlled || indeterminate ? actualChecked : undefined}
      defaultChecked={!isControlled && !indeterminate ? defaultChecked : undefined}
      onCheckedChange={handleCheckedChange}
      className={cn(
        'touch-target peer flex items-center justify-center shrink-0 rounded-control-inner',
        checkboxSizeClasses[size],
        'border border-surface-border-strong',
        'bg-surface-raised-hover',
        'transition-colors duration-fast-01 ease-productive-standard',
        'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-action-disabled',
        'data-[state=unchecked]:hover:border-accent-7 data-[state=unchecked]:hover:bg-surface-raised-active',
        'data-[state=checked]:bg-accent-9 data-[state=checked]:border-accent-7 data-[state=checked]:text-accent-fg',
        'data-[state=indeterminate]:bg-accent-9 data-[state=indeterminate]:border-accent-7 data-[state=indeterminate]:text-accent-fg',
        state && stateTintClasses[state],
        className,
      )}
      aria-invalid={state === 'error' || undefined}
      aria-describedby={ariaDescribedBy}
      aria-required={ariaRequired || undefined}
      {...props}
    >
      <AnimatePresence>
        {isActive && (
          <CheckboxPrimitive.Indicator forceMount asChild>
            <motion.span
              className="flex items-center justify-center text-current"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: durations.fast01 }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className={checkboxIconClasses[size]}
              >
                {actualChecked === 'indeterminate' ? (
                  <motion.line
                    x1="4"
                    y1="8"
                    x2="12"
                    y2="8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    exit={{ pathLength: 0 }}
                    transition={{ duration: durations.moderate02, ease: 'easeOut' }}
                  />
                ) : (
                  <motion.path
                    d="M3.5 8.5l3 3 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    exit={{ pathLength: 0 }}
                    transition={{ duration: durations.moderate02, ease: 'easeOut' }}
                  />
                )}
              </svg>
            </motion.span>
          </CheckboxPrimitive.Indicator>
        )}
      </AnimatePresence>
    </CheckboxPrimitive.Root>
  )
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
