'use client'

import { motion } from 'framer-motion'
import * as React from "react"
import * as SwitchPrimitives from "@primitives/react-switch"

import { springs } from './lib/motion'
import { cn } from "./lib/utils"

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  error?: boolean
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, error, checked, defaultChecked, onCheckedChange, ...props }, ref) => {
  // Track checked state internally to drive Framer Motion animation
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked ?? false)
  const isChecked = checked !== undefined ? checked : internalChecked

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
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-ds-full border-2 border-transparent shadow-01 transition-colors duration-fast-01 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-[0.38] data-[state=checked]:bg-interactive data-[state=unchecked]:bg-border-strong",
        error && "border-border-error data-[state=checked]:bg-error",
        className
      )}
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={handleCheckedChange}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb asChild>
        <motion.span
          className="pointer-events-none block h-ico-md w-ico-md rounded-ds-full bg-text-on-color shadow-02 ring-0"
          animate={{ x: isChecked ? 20 : 0 }}
          transition={springs.snappy}
        />
      </SwitchPrimitives.Thumb>
    </SwitchPrimitives.Root>
  )
})
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
