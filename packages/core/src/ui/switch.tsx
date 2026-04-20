'use client'

import * as SwitchPrimitives from "@primitives/react-switch"
import { motion } from 'framer-motion'
import * as React from "react"

import { useFormField } from './form'
import { springs } from './lib/motion'
import { cn } from "./lib/utils"

const sizeConfig = {
  sm: { track: 'h-6 w-[38px]', thumb: 'h-5 w-5', travel: 16 },
  md: { track: 'h-6 w-11', thumb: 'h-ico-md w-ico-md', travel: 20 },
  lg: { track: 'h-7 w-[52px]', thumb: 'h-6 w-6', travel: 24 },
} as const

const colorMap = {
  accent: 'data-[state=checked]:bg-accent-9',
  success: 'data-[state=checked]:bg-success-9',
  warning: 'data-[state=checked]:bg-warning-9',
} as const

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  error?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: 'accent' | 'success' | 'warning'
  thumbIcon?: React.ReactNode
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, error, size = 'md', color = 'accent', thumbIcon, checked, defaultChecked, onCheckedChange, ...props }, ref) => {
  const fieldCtx = useFormField()
  const isError = error ?? fieldCtx.state === 'error'
  const ariaDescribedBy = props['aria-describedby'] ?? fieldCtx.helperTextId
  const ariaRequired = props['aria-required'] ?? fieldCtx.required

  // Track checked state internally to drive Framer Motion animation
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked ?? false)
  const isChecked = checked !== undefined ? checked : internalChecked
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
        "touch-target peer inline-flex shrink-0 cursor-pointer items-center rounded-ds-full border-2 border-surface-border-strong shadow-raised transition-colors duration-fast-01 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-action-disabled data-[state=checked]:border-transparent data-[state=unchecked]:bg-surface-border-strong data-[state=unchecked]:hover:bg-surface-raised-active",
        track,
        colorMap[color],
        isError && "border-error-7 data-[state=checked]:bg-error-9",
        className
      )}
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={handleCheckedChange}
      aria-invalid={isError || undefined}
      aria-describedby={ariaDescribedBy}
      aria-required={ariaRequired || undefined}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb asChild>
        <motion.span
          className={cn(
            "pointer-events-none flex items-center justify-center rounded-ds-full bg-accent-fg shadow-raised-hover ring-0",
            thumb
          )}
          animate={{ x: isChecked ? travel : 0 }}
          whileTap={{ scale: 0.85 }}
          transition={springs.snappy}
        >
          {thumbIcon}
        </motion.span>
      </SwitchPrimitives.Thumb>
    </SwitchPrimitives.Root>
  )
})
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
