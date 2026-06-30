'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'framer-motion'
import * as React from 'react'

import { motionProps, springs } from './lib/motion'
import { cn } from './lib/utils'

type CardSize = 'sm' | 'md' | 'lg'

const CardSizeContext = React.createContext<CardSize>('md')

const cardVariants = cva(
  // Gap model: the container owns the vertical edge (py) and inter-slot rhythm (gap);
  // slots own only horizontal padding (px). No per-slot py, no pt-0, no per-element
  // margins — adding/removing a slot can't unbalance the bottom edge (make-kit rule:
  // shadow ring is the edge, gap is the rhythm).
  // `relative` establishes the positioning context for <CardAction> corner slots.
  'relative flex flex-col rounded-surface text-surface-fg transition-shadow duration-fast-02 ease-productive-standard',
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
      // size drives the container's vertical padding + inter-slot gap; slots read
      // the same size from context for their horizontal padding.
      size: {
        sm: 'py-ds-05 gap-ds-03',
        md: 'py-ds-05b gap-ds-04',
        lg: 'py-ds-06 gap-ds-05',
      },
    },
    defaultVariants: { variant: 'default', color: 'default', size: 'md' },
  },
)

/** Horizontal padding per size — applied to every slot so full-bleed children
 *  (dividers, media) can opt out, while the container owns the vertical edges. */
const slotPxClasses: Record<CardSize, string> = {
  sm: 'px-ds-05',
  md: 'px-ds-05b',
  lg: 'px-ds-06',
}

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
export interface CardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof cardVariants> {
  interactive?: boolean
}

export type { CardSize }

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, color, size, interactive, children, ...props }, ref) => {
    const resolvedSize: CardSize = size ?? 'md'
    const classes = cn(
      cardVariants({ variant, color, size }),
      interactive && 'hover:shadow-raised-hover cursor-pointer transition-shadow duration-fast-02 ease-productive-standard',
      className,
    )

    const content = (
      <CardSizeContext.Provider value={resolvedSize}>
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

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const size = React.useContext(CardSizeContext)
  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-col gap-ds-02b [&>:first-child]:mt-0 [&>:last-child]:mb-0',
        slotPxClasses[size],
        className,
      )}
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

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const size = React.useContext(CardSizeContext)
  return (
    <div
      ref={ref}
      className={cn(
        // Reset first/last child margins so a raw <p>/<h*>'s UA margin can't leak
        // past the slot onto the container's gap-model padding (the bottom-heavy bug).
        '[&>:first-child]:mt-0 [&>:last-child]:mb-0',
        slotPxClasses[size],
        className,
      )}
      {...props}
    />
  )
})
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const size = React.useContext(CardSizeContext)
  return (
    <div
      ref={ref}
      className={cn('flex items-center gap-ds-03', slotPxClasses[size], className)}
      {...props}
    />
  )
})
CardFooter.displayName = 'CardFooter'

type CardActionPlacement = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'

// Corner inset matches the slot padding for the card's size, so an action's edge
// lines up with the content edge. Class names are spelled out literally (not built
// from the size) so Tailwind's JIT can see them.
const cornerPositions: Record<CardSize, Record<CardActionPlacement, string>> = {
  sm: {
    'top-right': 'top-ds-05 right-ds-05',
    'top-left': 'top-ds-05 left-ds-05',
    'bottom-right': 'bottom-ds-05 right-ds-05',
    'bottom-left': 'bottom-ds-05 left-ds-05',
  },
  md: {
    'top-right': 'top-ds-05b right-ds-05b',
    'top-left': 'top-ds-05b left-ds-05b',
    'bottom-right': 'bottom-ds-05b right-ds-05b',
    'bottom-left': 'bottom-ds-05b left-ds-05b',
  },
  lg: {
    'top-right': 'top-ds-06 right-ds-06',
    'top-left': 'top-ds-06 left-ds-06',
    'bottom-right': 'bottom-ds-06 right-ds-06',
    'bottom-left': 'bottom-ds-06 left-ds-06',
  },
}

export interface CardActionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Which corner the action sits in. @default 'top-right' */
  placement?: CardActionPlacement
  /**
   * Pull the action a step toward its corner (`-m-ds-02`) so an icon button's GLYPH —
   * not its padding box — aligns to the content-edge line. Use for ghost/icon buttons
   * placed in a corner; leave off for badges/text where the padding box is the edge.
   */
  tuck?: boolean
}

/**
 * An absolutely-positioned corner slot for a Card — a menu/icon button, a status badge,
 * an overflow action. The Card is `relative`, so this pins to one of its four corners
 * with an inset that matches the card's content padding.
 *
 * @example
 * <Card>
 *   <CardAction><IconButton aria-label="More" icon={<IconDots />} variant="ghost" tuck /></CardAction>
 *   <CardHeader><CardTitle>Project Alpha</CardTitle></CardHeader>
 * </Card>
 *
 * @example
 * // Accent status badge in the top-right:
 * <Card>
 *   <CardAction><Badge color="accent" size="xs">LIVE</Badge></CardAction>
 *   ...
 * </Card>
 */
const CardAction = React.forwardRef<HTMLDivElement, CardActionProps>(
  ({ className, placement = 'top-right', tuck, ...props }, ref) => {
    const size = React.useContext(CardSizeContext)
    return (
      <div
        ref={ref}
        className={cn(
          'absolute z-[1] flex items-center gap-ds-02',
          cornerPositions[size][placement],
          tuck && '-m-ds-02',
          className,
        )}
        {...props}
      />
    )
  },
)
CardAction.displayName = 'CardAction'

export { Card, CardAction, CardContent,CardDescription, CardFooter, CardHeader, CardTitle, cardVariants }
export type { CardActionPlacement }
