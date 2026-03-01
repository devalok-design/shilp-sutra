import * as React from 'react'
import * as ProgressPrimitive from '@primitives/react-progress'

import { cn } from './lib/utils'

interface AdditionalProgressProps {
  indicatorClassName?: string
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root> & AdditionalProgressProps,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> &
    AdditionalProgressProps
>(({ className, value, indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      'relative h-2 w-full overflow-hidden rounded-[var(--radius-full)] bg-[var(--color-layer-02)]',
      className,
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        'h-full w-full flex-1 bg-[var(--color-interactive)] transition-transform',
        indicatorClassName,
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
