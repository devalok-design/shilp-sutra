import * as React from 'react'
import * as ProgressPrimitive from '@primitives/react-progress'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from './lib/utils'

/* ---------------------------------------------------------------------------
 * CVA Variants
 * ------------------------------------------------------------------------ */

const progressTrackVariants = cva(
  'relative w-full overflow-hidden rounded-ds-full bg-layer-02',
  {
    variants: {
      size: {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

const progressIndicatorVariants = cva(
  'h-full w-full flex-1 transition-all',
  {
    variants: {
      color: {
        default: 'bg-interactive',
        success: 'bg-success',
        warning: 'bg-warning',
        error: 'bg-error',
      },
    },
    defaultVariants: { color: 'default' },
  },
)

/* ---------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------ */

interface ProgressProps
  extends Omit<
      React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
      'color'
    >,
    VariantProps<typeof progressTrackVariants>,
    VariantProps<typeof progressIndicatorVariants> {
  /** Additional class names for the indicator element */
  indicatorClassName?: string
  /** Display the percentage label next to the progress bar */
  showLabel?: boolean
}

/* ---------------------------------------------------------------------------
 * Component
 * ------------------------------------------------------------------------ */

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(
  (
    {
      className,
      value,
      size,
      color,
      indicatorClassName,
      showLabel,
      ...props
    },
    ref,
  ) => {
    const isIndeterminate = value === undefined || value === null

    return (
      <div className={cn('flex items-center gap-ds-03', showLabel && 'w-full')}>
        <ProgressPrimitive.Root
          ref={ref}
          value={isIndeterminate ? null : value}
          className={cn(progressTrackVariants({ size }), className)}
          {...props}
        >
          <ProgressPrimitive.Indicator
            className={cn(
              progressIndicatorVariants({ color }),
              isIndeterminate &&
                'w-2/5 animate-progress-indeterminate motion-reduce:animate-none',
              indicatorClassName,
            )}
            style={
              isIndeterminate
                ? undefined
                : { transform: `translateX(-${100 - (value || 0)}%)` }
            }
          />
        </ProgressPrimitive.Root>

        {showLabel && !isIndeterminate && (
          <span className="shrink-0 text-ds-xs text-text-secondary">
            {value}%
          </span>
        )}
      </div>
    )
  },
)
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress, progressTrackVariants, progressIndicatorVariants }
export type { ProgressProps }
