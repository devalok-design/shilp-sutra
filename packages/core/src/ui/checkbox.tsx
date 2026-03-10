'use client'

import * as CheckboxPrimitive from '@primitives/react-checkbox'
import { IconCheck, IconMinus } from '@tabler/icons-react'
import * as React from 'react'
import { cn } from './lib/utils'

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
 * <Checkbox error={!termsAccepted} checked={termsAccepted} onCheckedChange={(v) => setTerms(v === true)} />
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
  error?: boolean
  indeterminate?: boolean
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, error, indeterminate, checked, ...props }, ref) => {
  const resolvedChecked = indeterminate ? 'indeterminate' : checked

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      checked={resolvedChecked}
      className={cn(
        'peer flex items-center justify-center h-ico-md w-ico-md shrink-0 rounded-ds-sm',
        'border border-border-strong',
        'bg-field',
        'transition-colors duration-fast-01',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-[0.38]',
        'data-[state=checked]:bg-interactive data-[state=checked]:border-interactive data-[state=checked]:text-text-on-color',
        'data-[state=indeterminate]:bg-interactive data-[state=indeterminate]:border-interactive data-[state=indeterminate]:text-text-on-color',
        error && 'border-border-error',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current animate-check-pop">
        {resolvedChecked === 'indeterminate' ? (
          <IconMinus className="h-ico-sm w-ico-sm" />
        ) : (
          <IconCheck className="h-3 w-3" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
