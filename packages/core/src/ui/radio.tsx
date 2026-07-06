'use client'

import * as RadioGroupPrimitive from '@primitives/react-radio-group'
import { IconCircle } from '@tabler/icons-react'
import { AnimatePresence, motion } from 'framer-motion'
import * as React from 'react'

import { useFormField } from './form'
import { springs } from './lib/motion'
import { cn } from './lib/utils'

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  const fieldCtx = useFormField()
  const isError = fieldCtx.state === 'error'
  const ariaDescribedBy = props['aria-describedby'] ?? fieldCtx.helperTextId
  const ariaRequired = props['aria-required'] ?? fieldCtx.required

  return (
    <RadioGroupPrimitive.Root
      className={cn('grid gap-ds-03', className)}
      aria-invalid={isError || undefined}
      aria-describedby={ariaDescribedBy}
      aria-required={ariaRequired || undefined}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

export interface RadioGroupItemProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  /** Control size — `sm` (20px), `md` (24px, default, WCAG compliant), `lg` (28px). */
  size?: 'sm' | 'md' | 'lg'
}

const radioSizeClasses = {
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-7 w-7',
} as const

const radioIndicatorClasses = {
  sm: 'h-1.5 w-1.5',
  md: 'h-ds-03 w-ds-03',
  lg: 'h-2.5 w-2.5',
} as const

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, size = 'md', ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        'touch-target aspect-square rounded-pill',
        radioSizeClasses[size],
        'border border-surface-border-strong bg-surface-raised-hover',
        'transition-colors duration-fast-01',
        'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-action-disabled',
        'hover:border-accent-7 hover:bg-surface-raised-active',
        'data-[state=checked]:border-accent-7',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator asChild className="flex items-center justify-center">
        <motion.span
          className="flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={springs.snappy}
        >
          <IconCircle className={cn(radioIndicatorClasses[size], 'fill-accent-9 text-accent-11')} />
        </motion.span>
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export type RadioGroupProps = React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>

export { RadioGroup, RadioGroupItem }
