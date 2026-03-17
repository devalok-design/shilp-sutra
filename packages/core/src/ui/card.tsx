'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'framer-motion'

import { springs, motionProps } from './lib/motion'
import { cn } from './lib/utils'

const cardVariants = cva(
  'rounded-ds-lg text-surface-fg transition-shadow duration-fast-02 ease-productive-standard',
  {
    variants: {
      variant: {
        default: 'bg-surface-raised border border-surface-border shadow-raised',
        elevated: 'bg-surface-raised border border-surface-border shadow-raised-hover',
        outline: 'bg-transparent border border-surface-border-strong shadow-none',
        flat: 'bg-surface-raised border-none shadow-none',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

/**
 * Props for Card — a general-purpose content container with 4 elevation/style variants and
 * an optional interactive hover state.
 *
 * **Variants:** `default` (subtle border + shadow-raised) | `elevated` (stronger shadow-raised-hover) |
 * `outline` (2px solid border, no shadow) | `flat` (filled background, no shadow)
 *
 * **Composition:** Use sub-components `<CardHeader>`, `<CardTitle>`, `<CardDescription>`,
 * `<CardContent>`, and `<CardFooter>` for consistent internal spacing.
 *
 * **Interactive:** Pass `interactive` to enable hover shadow lift and pointer cursor —
 * useful for clickable cards in grids.
 *
 * @example
 * // Standard content card with header and body:
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Project Alpha</CardTitle>
 *     <CardDescription>Last updated 2 hours ago</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     <p>Sprint 4 is in progress with 12 open tasks.</p>
 *   </CardContent>
 * </Card>
 *
 * @example
 * // Elevated card for a dashboard stat widget:
 * <Card variant="elevated">
 *   <CardContent>
 *     <StatCard label="Revenue" value="$12,400" delta={{ value: "+8%", direction: "up" }} />
 *   </CardContent>
 * </Card>
 *
 * @example
 * // Clickable card in a project grid (interactive hover effect):
 * <Card interactive onClick={() => router.push(`/projects/${id}`)}>
 *   <CardHeader>
 *     <CardTitle>{project.name}</CardTitle>
 *   </CardHeader>
 * </Card>
 *
 * @example
 * // Flat card for a sidebar panel section (no shadow):
 * <Card variant="flat" className="p-ds-05">
 *   <p className="text-surface-fg-muted text-ds-sm">No recent activity</p>
 * </Card>
 * // These are just a few ways — feel free to combine props creatively!
 */
const accentColorMap: Record<string, string> = {
  default: 'var(--color-accent-9)',
  secondary: 'var(--color-secondary-9)',
  error: 'var(--color-error-9)',
  success: 'var(--color-success-9)',
  warning: 'var(--color-warning-9)',
  info: 'var(--color-info-9)',
}

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  interactive?: boolean
  /** Position of the accent border strip */
  accent?: 'left' | 'top' | 'right' | 'bottom'
  /** Semantic color for the accent strip. Requires `accent` to be set. @default 'default' */
  accentColor?: 'default' | 'secondary' | 'error' | 'success' | 'warning' | 'info'
}

const accentPositionClasses: Record<string, string> = {
  left: 'left-0 top-0 bottom-0 w-[3px] rounded-l-ds-lg',
  top: 'top-0 left-0 right-0 h-[3px] rounded-t-ds-lg',
  right: 'right-0 top-0 bottom-0 w-[3px] rounded-r-ds-lg',
  bottom: 'bottom-0 left-0 right-0 h-[3px] rounded-b-ds-lg',
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, interactive, accent, accentColor = 'default', children, ...props }, ref) => {
    const classes = cn(
      cardVariants({ variant }),
      accent && 'relative overflow-hidden',
      interactive && 'hover:shadow-raised-hover hover:border-surface-border-strong cursor-pointer transition-shadow duration-fast-02 ease-productive-standard',
      className,
    )

    const accentEl = accent ? (
      <span
        aria-hidden="true"
        className={cn('absolute pointer-events-none', accentPositionClasses[accent])}
        style={{ backgroundColor: accentColorMap[accentColor] }}
      />
    ) : null

    if (interactive) {
      return (
        <motion.div
          ref={ref}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.98 }}
          transition={springs.snappy}
          className={classes}
          {...motionProps(props)}
        >
          {accentEl}
          {children}
        </motion.div>
      )
    }

    return (
      <div ref={ref} className={classes} {...props}>
        {accentEl}
        {children}
      </div>
    )
  },
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-ds-02b p-ds-06', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('font-sans font-semibold leading-ds-none tracking-normal text-surface-fg', className)}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-ds-md text-surface-fg-muted', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-ds-06 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-ds-06 pt-0', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

export { Card, cardVariants, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
