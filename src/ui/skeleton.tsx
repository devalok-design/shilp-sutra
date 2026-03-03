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
