import { type HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './lib/utils'

const skeletonVariants = cva('bg-skeleton-base', {
  variants: {
    variant: {
      rectangle: 'rounded-ds-md',
      circle: 'rounded-full aspect-square',
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

interface SkeletonProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

function Skeleton({ className, variant, animation, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(skeletonVariants({ variant, animation }), className)}
      {...props}
    />
  )
}

export { Skeleton, skeletonVariants, type SkeletonProps }
