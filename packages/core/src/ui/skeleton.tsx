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
      pulse: 'animate-pulse motion-reduce:animate-none',
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
        aria-hidden="true"
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
    const safeLines = Math.max(1, lines ?? 3)
    return (
      <div
        ref={ref}
        className={cn('flex flex-col', textSpacingClasses[spacing], className)}
        {...props}
      >
        {Array.from({ length: safeLines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-3.5 rounded-ds-sm bg-skeleton-base',
              animationClasses[animation],
              i === safeLines - 1 ? lastLineWidthClasses[lastLineWidth] : 'w-full',
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
  width?: 'auto' | 'full' | 'icon'
  animation?: SkeletonAnimation
}

const SkeletonButton = React.forwardRef<HTMLDivElement, SkeletonButtonProps>(
  ({ className, size = 'md', width = 'auto', animation = 'pulse', ...props }, ref) => {
    const isIcon = width === 'icon'
    return (
      <div
        ref={ref}
        className={cn(
          'bg-skeleton-base rounded-ds-md',
          buttonSizeClasses[size],
          isIcon ? 'aspect-square' : buttonWidthClasses[width as 'auto' | 'full'][size],
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
    const safeBars = Math.max(1, bars ?? 7)
    return (
      <div
        ref={ref}
        className={cn('flex items-end gap-ds-02', height, className)}
        {...props}
      >
        {Array.from({ length: safeBars }).map((_, i) => {
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

// ---------------------------------------------------------------------------
// SkeletonImage
// ---------------------------------------------------------------------------

export interface SkeletonImageProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string
  height?: string
  animation?: SkeletonAnimation
}

const SkeletonImage = React.forwardRef<HTMLDivElement, SkeletonImageProps>(
  ({ className, width = 'w-full', height = 'h-40', animation = 'pulse', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-skeleton-base rounded-ds-md relative flex items-center justify-center',
          width,
          height,
          animationClasses[animation],
          className,
        )}
        {...props}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-skeleton-shimmer opacity-40"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
    )
  },
)
SkeletonImage.displayName = 'SkeletonImage'

// ---------------------------------------------------------------------------
// SkeletonGroup
// ---------------------------------------------------------------------------

export interface SkeletonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Accessible label for the loading state */
  label?: string
}

const SkeletonGroup = React.forwardRef<HTMLDivElement, SkeletonGroupProps>(
  ({ label = 'Loading', children, ...props }, ref) => {
    return (
      <div ref={ref} role="status" aria-label={label} aria-busy="true" {...props}>
        <span className="sr-only">{label}...</span>
        {children}
      </div>
    )
  },
)
SkeletonGroup.displayName = 'SkeletonGroup'

export {
  Skeleton,
  skeletonVariants,
  SkeletonAvatar,
  SkeletonText,
  SkeletonButton,
  SkeletonInput,
  SkeletonChart,
  SkeletonImage,
  SkeletonGroup,
}
