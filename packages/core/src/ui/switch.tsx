'use client'

import * as React from "react"
import * as SwitchPrimitives from "@primitives/react-switch"

import { cn } from "./lib/utils"

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  error?: boolean
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, error, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-ds-full border-2 border-transparent shadow-01 transition-colors duration-fast-01 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-[0.38] data-[state=checked]:bg-interactive data-[state=unchecked]:bg-border-strong",
      error && "border-border-error data-[state=checked]:bg-error",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-ico-md w-ico-md rounded-ds-full bg-text-on-color shadow-02 ring-0 transition-transform duration-fast-01 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
