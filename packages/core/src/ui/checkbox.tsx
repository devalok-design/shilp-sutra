'use client'

import * as CheckboxPrimitive from '@primitives/react-checkbox'
import { IconCheck, IconMinus } from '@tabler/icons-react'
import { AnimatePresence, motion } from 'framer-motion'
import * as React from 'react'
import { springs } from './lib/motion'
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
  const isActive = resolvedChecked === true || resolvedChecked === 'indeterminate'

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      checked={resolvedChecked}
      className={cn(
        'peer flex items-center justify-center h-ico-md w-ico-md shrink-0 rounded-ds-sm',
        'border border-surface-border-strong',
        'bg-surface-3',
        'transition-colors duration-fast-01',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-action-disabled',
        'data-[state=checked]:bg-accent-9 data-[state=checked]:border-accent-7 data-[state=checked]:text-accent-fg',
        'data-[state=indeterminate]:bg-accent-9 data-[state=indeterminate]:border-accent-7 data-[state=indeterminate]:text-accent-fg',
        error && 'border-error-7',
        className,
      )}
      {...props}
    >
      <AnimatePresence>
        {isActive && (
          <CheckboxPrimitive.Indicator forceMount asChild>
            <motion.span
              className="flex items-center justify-center text-current"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={springs.bouncy}
            >
              {resolvedChecked === 'indeterminate' ? (
                <IconMinus className="h-ico-sm w-ico-sm" />
              ) : (
                <IconCheck className="h-ico-sm w-ico-sm" />
              )}
            </motion.span>
          </CheckboxPrimitive.Indicator>
        )}
      </AnimatePresence>
    </CheckboxPrimitive.Root>
  )
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
