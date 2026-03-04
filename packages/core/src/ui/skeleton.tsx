'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './lib/utils'

const skeletonVariants = cva('bg-skeleton-base', {
  variants: {
    variant: {
      rectangle: 'rounded-ds-md',
      circle: 'rounded-ds-full aspect-square',
      text: 'rounded-ds-sm h-4 w-full',
    },
    animation: {
      pulse: 'animate-pulse',
      shimmer:
        'bg-[length:200%_100%] bg-gradient-to-r from-skeleton-base via-skeleton-shimmer to-skeleton-base animate-skeleton-shimmer motion-reduce:animate-none',
      none: '',
    },
  },
  defaultVariants: {
    variant: 'rectangle',
    animation: 'pulse',
  },
})

/**
 * Props for Skeleton — a loading placeholder with shape variants and two animation styles.
 *
 * **Shape variants:** `rectangle` (default, rounded corners) | `circle` (aspect-square pill) |
 * `text` (full-width slim bar, for text line placeholders)
 *
 * **Animation:** `pulse` (default, opacity fade) | `shimmer` (left-to-right gradient sweep,
 * respects `prefers-reduced-motion`) | `none` (static, for testing or paused states)
 *
 * @example
 * // Text line placeholder (repeatable for a paragraph skeleton):
 * <Skeleton variant="text" />
 * <Skeleton variant="text" className="w-3/4" />
 *
 * @example
 * // Avatar + name card loading state:
 * <div className="flex items-center gap-ds-04">
 *   <Skeleton variant="circle" className="h-ds-md w-ds-md" />
 *   <div className="flex flex-col gap-ds-02 flex-1">
 *     <Skeleton variant="text" className="w-1/2" />
 *     <Skeleton variant="text" className="w-1/3" />
 *   </div>
 * </div>
 *
 * @example
 * // Card placeholder with shimmer animation:
 * <Skeleton variant="rectangle" animation="shimmer" className="h-48 w-full" />
 * // These are just a few ways — feel free to combine props creatively!
 */
export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, animation, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(skeletonVariants({ variant, animation }), className)}
        {...props}
      />
    )
  },
)
Skeleton.displayName = 'Skeleton'

export { Skeleton, skeletonVariants }
