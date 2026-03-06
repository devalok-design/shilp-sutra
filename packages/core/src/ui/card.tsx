'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from './lib/utils'

const cardVariants = cva(
  'rounded-ds-lg text-text-primary',
  {
    variants: {
      variant: {
        default: 'bg-layer-01 border border-border-subtle shadow-01',
        elevated: 'bg-layer-01 border border-border-subtle shadow-02',
        outline: 'bg-transparent border-2 border-border shadow-none',
        flat: 'bg-layer-02 border-none shadow-none',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

/**
 * Props for Card — a general-purpose content container with 4 elevation/style variants and
 * an optional interactive hover state.
 *
 * **Variants:** `default` (subtle border + shadow-01) | `elevated` (stronger shadow-02) |
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
 *   <p className="text-text-secondary text-ds-sm">No recent activity</p>
 * </Card>
 * // These are just a few ways — feel free to combine props creatively!
 */
export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  interactive?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, interactive, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        cardVariants({ variant }),
        interactive &&
          'hover:shadow-02 hover:border-border-strong cursor-pointer transition-shadow duration-fast-01',
        className,
      )}
      {...props}
    />
  ),
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
    className={cn('font-sans font-semibold leading-ds-none tracking-ds-tight text-text-primary', className)}
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
    className={cn('text-ds-md text-text-secondary', className)}
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
