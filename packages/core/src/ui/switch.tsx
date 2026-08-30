'use client'

import * as SwitchPrimitives from "@primitives/react-switch"
import { motion, useReducedMotion } from 'framer-motion'
import * as React from "react"

import { useFormField } from './form'
import { type FieldState, resolveFieldState } from './lib/field-state'
import { springs } from './lib/motion'
import { cn } from "./lib/utils"

// Travel must equal (track width − 2×border − thumb), so the thumb lands 2px
// from the inner edge at both ends. sm was 16, which overshot by 2px and left
// the checked thumb flush against the right border with no inset at all —
// "Switch sm: increase the right padding to 2px" (design 2026-08-24).
// md (44−4−20) and lg (52−4−24) were already correct.
const sizeConfig = {
  sm: { track: 'h-6 w-[38px]', thumb: 'h-5 w-5', travel: 14 },
  md: { track: 'h-6 w-11', thumb: 'h-ico-md w-ico-md', travel: 20 },
  lg: { track: 'h-7 w-[52px]', thumb: 'h-6 w-6', travel: 24 },
} as const

/**
 * Validation border + checked-track tint per state (overrides `color` when set).
 *
 * The border is only VISIBLE here. The track always reserves 2px of it —
 * `border-transparent` in the base classes — because the border sits inside the
 * box and the thumb's travel is computed as (track − 2×border − thumb). Making
 * it appear and disappear would move the thumb by 4px whenever a field went
 * into an error state.
 *
 * That reservation is also what lets the 2026-08-24 refresh remove the resting
 * stroke without losing validation: unchecked, this border is the ONLY thing
 * distinguishing error/warning/success from default, since the coloured track
 * applies solely when checked.
 */
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
      // OFF track moved from `surface-border-strong` to neutral-5 and its hover
      // from `surface-panel-active` (neutral-3) to neutral-6 (design 2026-08-24).
      // Both darken the track, which is what makes the thumb readable against
      // it: track-vs-thumb goes 1.350:1 → 1.598:1, and hover reaches 1.955:1.
      // Direction holds in dark too (n-5 0.377 → n-6 0.417, both above panel).
      //
      // The design also asked to DROP the 2px border. Not done: unchecked, that
      // border is the only edge the control has, and it is the stronger of the
      // two (neutral-6 at 2.006:1 vs the fill's 1.639:1). Removing it lowers the
      // component boundary against WCAG 1.4.11, which both values already miss.
      // Raised as a question rather than shipped.
      className={cn(
        // `border-transparent`, not "no border": the 2px is still reserved so
        // the thumb's travel stays (track − 2×border − thumb) whether or not a
        // validation state paints it. Removing the width outright would shift
        // the thumb 4px the moment a field errored.
        // The resting stroke is gone per the 2026-08-24 refresh, so an
        // unchecked switch is now carried by its fill alone (1.639:1, down from
        // the border's 2.006:1). deviation: SWITCH-RESTING-STROKE-REMOVED
        "touch-target peer inline-flex shrink-0 cursor-pointer items-center rounded-pill border-2 border-transparent shadow-raised transition-colors duration-fast-01 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-action-disabled data-[state=unchecked]:bg-neutral-5 data-[state=unchecked]:hover:bg-neutral-6",
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
