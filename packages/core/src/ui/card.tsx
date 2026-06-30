'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'framer-motion'
import * as React from 'react'

import { motionProps,springs, tweens } from './lib/motion'
import { cn } from './lib/utils'

type CardSize = 'sm' | 'md' | 'lg'

const CardSizeContext = React.createContext<CardSize>('md')

const cardVariants = cva(
  'rounded-surface text-surface-fg transition-shadow duration-fast-02 ease-productive-standard',
  {
    variants: {
      variant: {
        // Elevation-led: the shadow's own ring is the edge (make-kit rule #6 — no
        // border+shadow double-edge). border-transparent keeps the `color` prop able to
        // paint a deliberate colored edge without a grey one by default.
        default: 'bg-surface-raised border border-transparent shadow-raised',
        elevated: 'bg-surface-raised border border-transparent shadow-raised-hover',
        // Border-led: a visible edge, no shadow.
        outline: 'bg-transparent border border-surface-border-strong shadow-none',
        flat: 'bg-surface-raised border-none shadow-none',
      },
      color: {
        default: '',
        accent: 'border-accent-7',
        error: 'border-error-7',
        success: 'border-success-7',
        warning: 'border-warning-7',
        info: 'border-info-7',
        neutral: '',
      },
      size: {
        sm: '',
        md: '',
        lg: '',
      },
    },
    defaultVariants: { variant: 'default', color: 'default', size: 'md' },
  },
)

/**
 * Props for Card — a general-purpose content container with 4 elevation/style variants and
 * an optional interactive hover state.
 *
 * **Variants (elevation-led vs border-led — never both):** `default` (ring-in-shadow, no border) |
 * `elevated` (stronger shadow-raised-hover, no border) | `outline` (visible border, no shadow) |
 * `flat` (filled background, no edge). The shadow tokens carry their own 1px ring, so elevated
 * variants need no explicit border (make-kit rule #6).
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
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof cardVariants> {
  interactive?: boolean
  /** Position of the accent border strip */
  accent?: 'left' | 'top' | 'right' | 'bottom'
  /** Semantic color key or any CSS color string for the accent strip. Requires `accent` to be set. @default 'default' */
  accentColor?: 'default' | 'secondary' | 'error' | 'success' | 'warning' | 'info' | (string & {})
  /** Width of the accent strip in pixels @default 3 */
  accentWidth?: 2 | 3 | 4 | 6
}

export type { CardSize }

const accentSizeClasses: Record<string, Record<number, string>> = {
  left:   { 2: 'w-[2px]', 3: 'w-[3px]', 4: 'w-[4px]', 6: 'w-[6px]' },
  top:    { 2: 'h-[2px]', 3: 'h-[3px]', 4: 'h-[4px]', 6: 'h-[6px]' },
  right:  { 2: 'w-[2px]', 3: 'w-[3px]', 4: 'w-[4px]', 6: 'w-[6px]' },
  bottom: { 2: 'h-[2px]', 3: 'h-[3px]', 4: 'h-[4px]', 6: 'h-[6px]' },
}

const accentPositionClasses: Record<string, string> = {
  left: 'left-0 top-0 bottom-0 rounded-l-surface',
  top: 'top-0 left-0 right-0 rounded-t-surface',
  right: 'right-0 top-0 bottom-0 rounded-r-surface',
  bottom: 'bottom-0 left-0 right-0 rounded-b-surface',
}

function getAccentPositionClasses(position: string, width: number): string {
  return `${accentPositionClasses[position] ?? ''} ${accentSizeClasses[position]?.[width] ?? ''}`
}

function resolveAccentColor(color: string): string {
  return accentColorMap[color] ?? color
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, color, size, interactive, accent, accentColor = 'default', accentWidth = 3, children, ...props }, ref) => {
    const resolvedSize: CardSize = size ?? 'md'
    const classes = cn(
      cardVariants({ variant, color, size }),
      accent && 'relative overflow-hidden',
      interactive && 'hover:shadow-raised-hover cursor-pointer transition-shadow duration-fast-02 ease-productive-standard',
      className,
    )

    const accentEl = accent ? (
      <motion.span
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={tweens.fade}
        className={cn('absolute pointer-events-none bg-[var(--card-accent-bg)]', getAccentPositionClasses(accent, accentWidth))}
        style={{ '--card-accent-bg': resolveAccentColor(accentColor) } as React.CSSProperties}
      />
    ) : null

    const content = (
      <CardSizeContext.Provider value={resolvedSize}>
        {accentEl}
        {children}
      </CardSizeContext.Provider>
    )

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
          {content}
        </motion.div>
      )
    }

    return (
      <div ref={ref} className={classes} {...props}>
        {content}
      </div>
    )
  },
)
Card.displayName = 'Card'

const headerSizeClasses: Record<CardSize, string> = {
  sm: 'p-ds-05',
  md: 'p-ds-06',
  lg: 'p-ds-07',
}

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const size = React.useContext(CardSizeContext)
  return (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-ds-02b', headerSizeClasses[size], className)}
      {...props}
    />
  )
})
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

const contentSizeClasses: Record<CardSize, string> = {
  sm: 'p-ds-05 pt-0',
  md: 'p-ds-06 pt-0',
  lg: 'p-ds-07 pt-0',
}

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const size = React.useContext(CardSizeContext)
  return (
    <div ref={ref} className={cn(contentSizeClasses[size], className)} {...props} />
  )
})
CardContent.displayName = 'CardContent'

const footerSizeClasses: Record<CardSize, string> = {
  sm: 'p-ds-05 pt-0',
  md: 'p-ds-06 pt-0',
  lg: 'p-ds-07 pt-0',
}

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const size = React.useContext(CardSizeContext)
  return (
    <div
      ref={ref}
      className={cn('flex items-center', footerSizeClasses[size], className)}
      {...props}
    />
  )
})
CardFooter.displayName = 'CardFooter'

export { Card, CardContent,CardDescription, CardFooter, CardHeader, CardTitle, cardVariants }
