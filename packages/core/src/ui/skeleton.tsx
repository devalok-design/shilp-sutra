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

// ---------------------------------------------------------------------------
// Animation helper — resolves animation classes for sub-components
// ---------------------------------------------------------------------------

const animationClasses = {
  pulse: 'animate-pulse',
  shimmer:
    'bg-[length:200%_100%] bg-gradient-to-r from-skeleton-base via-skeleton-shimmer to-skeleton-base animate-skeleton-shimmer motion-reduce:animate-none',
  none: '',
} as const

type SkeletonAnimation = 'pulse' | 'shimmer' | 'none'

// ---------------------------------------------------------------------------
// SkeletonAvatar
// ---------------------------------------------------------------------------

const avatarSizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
} as const

export interface SkeletonAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animation?: SkeletonAnimation
}

const SkeletonAvatar = React.forwardRef<HTMLDivElement, SkeletonAvatarProps>(
  ({ className, size = 'md', animation = 'pulse', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-skeleton-base rounded-ds-full',
          avatarSizeClasses[size],
          animationClasses[animation],
          className,
        )}
        {...props}
      />
    )
  },
)
SkeletonAvatar.displayName = 'SkeletonAvatar'

// ---------------------------------------------------------------------------
// SkeletonText
// ---------------------------------------------------------------------------

const lastLineWidthClasses = {
  full: 'w-full',
  'three-quarter': 'w-3/4',
  half: 'w-1/2',
} as const

const textSpacingClasses = {
  sm: 'gap-ds-02',
  md: 'gap-ds-03',
} as const

export interface SkeletonTextProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number
  /** Last line width — 'full' | 'three-quarter' | 'half' (default: 'three-quarter') */
  lastLineWidth?: 'full' | 'three-quarter' | 'half'
  /** Gap between lines */
  spacing?: 'sm' | 'md'
  animation?: SkeletonAnimation
}

const SkeletonText = React.forwardRef<HTMLDivElement, SkeletonTextProps>(
  (
    {
      className,
      lines = 3,
      lastLineWidth = 'three-quarter',
      spacing = 'md',
      animation = 'pulse',
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col', textSpacingClasses[spacing], className)}
        {...props}
      >
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-3.5 rounded-ds-sm bg-skeleton-base',
              animationClasses[animation],
              i === lines - 1 ? lastLineWidthClasses[lastLineWidth] : 'w-full',
            )}
          />
        ))}
      </div>
    )
  },
)
SkeletonText.displayName = 'SkeletonText'

// ---------------------------------------------------------------------------
// SkeletonButton
// ---------------------------------------------------------------------------

const buttonSizeClasses = {
  sm: 'h-ds-sm',
  md: 'h-ds-md',
  lg: 'h-ds-lg',
} as const

const buttonWidthClasses = {
  auto: { sm: 'w-24', md: 'w-28', lg: 'w-32' },
  full: { sm: 'w-full', md: 'w-full', lg: 'w-full' },
} as const

export interface SkeletonButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  width?: 'auto' | 'full'
  animation?: SkeletonAnimation
}

const SkeletonButton = React.forwardRef<HTMLDivElement, SkeletonButtonProps>(
  ({ className, size = 'md', width = 'auto', animation = 'pulse', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-skeleton-base rounded-ds-md',
          buttonSizeClasses[size],
          buttonWidthClasses[width][size],
          animationClasses[animation],
          className,
        )}
        {...props}
      />
    )
  },
)
SkeletonButton.displayName = 'SkeletonButton'

// ---------------------------------------------------------------------------
// SkeletonInput
// ---------------------------------------------------------------------------

const inputSizeClasses = {
  sm: 'h-ds-sm',
  md: 'h-ds-md',
  lg: 'h-ds-lg',
} as const

export interface SkeletonInputProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  animation?: SkeletonAnimation
}

const SkeletonInput = React.forwardRef<HTMLDivElement, SkeletonInputProps>(
  ({ className, size = 'md', animation = 'pulse', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'w-full bg-skeleton-base rounded-ds-md border border-skeleton-base/30',
          inputSizeClasses[size],
          animationClasses[animation],
          className,
        )}
        {...props}
      />
    )
  },
)
SkeletonInput.displayName = 'SkeletonInput'

// ---------------------------------------------------------------------------
// SkeletonChart
// ---------------------------------------------------------------------------

/** Deterministic bar heights based on index (percentage of container height) */
const BAR_HEIGHTS = [65, 40, 85, 55, 70, 30, 90, 50, 75, 35, 80, 45, 60, 95, 38] as const

export interface SkeletonChartProps extends React.HTMLAttributes<HTMLDivElement> {
  bars?: number
  height?: string
  animation?: SkeletonAnimation
}

const SkeletonChart = React.forwardRef<HTMLDivElement, SkeletonChartProps>(
  ({ className, bars = 7, height = 'h-40', animation = 'pulse', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-end gap-ds-02', height, className)}
        {...props}
      >
        {Array.from({ length: bars }).map((_, i) => {
          const barHeight = BAR_HEIGHTS[i % BAR_HEIGHTS.length]
          return (
            <div
              key={i}
              className={cn(
                'flex-1 bg-skeleton-base rounded-t-ds-sm',
                animationClasses[animation],
              )}
              style={{ height: `${barHeight}%` }}
            />
          )
        })}
      </div>
    )
  },
)
SkeletonChart.displayName = 'SkeletonChart'

export {
  Skeleton,
  skeletonVariants,
  SkeletonAvatar,
  SkeletonText,
  SkeletonButton,
  SkeletonInput,
  SkeletonChart,
}
