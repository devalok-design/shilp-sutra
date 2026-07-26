'use client'

import * as SwitchPrimitives from "@primitives/react-switch"
import { motion, useReducedMotion } from 'framer-motion'
import * as React from "react"

import { useFormField } from './form'
import { type FieldState, resolveFieldState } from './lib/field-state'
import { springs } from './lib/motion'
import { cn } from "./lib/utils"

const sizeConfig = {
  sm: { track: 'h-6 w-[38px]', thumb: 'h-5 w-5', travel: 16 },
  md: { track: 'h-6 w-11', thumb: 'h-ico-md w-ico-md', travel: 20 },
  lg: { track: 'h-7 w-[52px]', thumb: 'h-6 w-6', travel: 24 },
} as const

/** Validation border + checked-track tint per state (overrides `color` when set). */
const stateTintClasses: Record<Exclude<FieldState, 'default'>, string> = {
  error: 'border-error-7 data-[state=checked]:bg-error-9',
  warning: 'border-warning-7 data-[state=checked]:bg-warning-9',
  success: 'border-success-7 data-[state=checked]:bg-success-9',
}

const colorMap = {
  accent: 'data-[state=checked]:bg-accent-9',
  success: 'data-[state=checked]:bg-success-9',
  warning: 'data-[state=checked]:bg-warning-9',
} as const

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  /** Validation/feedback state. `'error'` also sets `aria-invalid`. Inherited from `FormField` when omitted. Distinct from `color` (the ON-track tint). */
  state?: FieldState
  size?: 'sm' | 'md' | 'lg'
  color?: 'accent' | 'success' | 'warning'
  thumbIcon?: React.ReactNode
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, state: stateProp, size = 'md', color = 'accent', thumbIcon, checked, defaultChecked, onCheckedChange, ...props }, ref) => {
  const fieldCtx = useFormField()
  const state = resolveFieldState(stateProp, fieldCtx.state)
  const ariaDescribedBy = props['aria-describedby'] ?? fieldCtx.helperTextId
  const ariaRequired = props['aria-required'] ?? fieldCtx.required

  // Track checked state internally to drive Framer Motion animation
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked ?? false)
  const isChecked = checked !== undefined ? checked : internalChecked
  const reduced = useReducedMotion()
  // Thumb travels toward the inline-end — mirror it under RTL.
  const isRtl =
    typeof document !== 'undefined' &&
    (document.dir === 'rtl' || document.documentElement.dir === 'rtl')
  const { track, thumb, travel } = sizeConfig[size]

  const handleCheckedChange = React.useCallback(
    (value: boolean) => {
      if (checked === undefined) {
        setInternalChecked(value)
      }
      onCheckedChange?.(value)
    },
    [checked, onCheckedChange],
  )

  return (
    <SwitchPrimitives.Root
      className={cn(
        "touch-target peer inline-flex shrink-0 cursor-pointer items-center rounded-pill border-2 border-surface-border-strong shadow-raised transition-colors duration-fast-01 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-action-disabled data-[state=checked]:border-transparent data-[state=unchecked]:bg-surface-border-strong data-[state=unchecked]:hover:bg-surface-raised-active",
        track,
        colorMap[color],
        state && stateTintClasses[state],
        className
      )}
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={handleCheckedChange}
      aria-invalid={state === 'error' || undefined}
      aria-describedby={ariaDescribedBy}
      aria-required={ariaRequired || undefined}
      {...props}
      // Explicit id wins; otherwise adopt FormField's inputId so <Label htmlFor>
      // resolves. Without this the label points at nothing and the switch has NO
      // accessible name, despite the consumer wiring FormField + Label correctly.
      id={props.id ?? fieldCtx.inputId}
      ref={ref}
    >
      <SwitchPrimitives.Thumb asChild>
        <motion.span
          className={cn(
            "pointer-events-none flex items-center justify-center rounded-pill bg-accent-fg shadow-raised-hover ring-0",
            thumb
          )}
          animate={{ x: (isChecked ? travel : 0) * (isRtl ? -1 : 1) }}
          whileTap={reduced ? undefined : { scale: 0.85 }}
          transition={reduced ? { duration: 0 } : springs.snappy}
        >
          {thumbIcon}
        </motion.span>
      </SwitchPrimitives.Thumb>
    </SwitchPrimitives.Root>
  )
})
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
