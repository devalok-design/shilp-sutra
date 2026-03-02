import * as React from "react"
import * as SwitchPrimitives from "@primitives/react-switch"

import { cn } from "./lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-[var(--radius-full)] border-2 border-transparent shadow-sm transition-colors duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[var(--color-interactive)] data-[state=unchecked]:bg-[var(--color-border-strong)]",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-[var(--icon-md)] w-[var(--icon-md)] rounded-[var(--radius-full)] bg-[var(--color-text-on-color)] shadow-md ring-0 transition-transform duration-[var(--duration-fast)] data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
