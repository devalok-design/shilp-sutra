'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'framer-motion'
import * as React from 'react'

import { motionProps, springs } from './lib/motion'
import { cn } from './lib/utils'

// Bundlers (Vite, Next.js, webpack) define process.env.NODE_ENV; guard for raw ESM.
declare const process: { env: { NODE_ENV?: string } } | undefined

type CardSize = 'sm' | 'md' | 'lg'

const cardVariants = cva(
  // Gap model, variable-driven: `size` sets --card-spacing / --card-gap once on the
  // container; the container reads them for its vertical edge (py) and inter-slot
  // rhythm (gap), slots read the same variables for their horizontal inset (px), and
  // CardAction/CardBleed read them for corner offsets / negative margins. One variable
  // pair is the whole size system — override it with a single arbitrary property
  // (`[--card-spacing:var(--spacing-ds-07)]`) and every part follows.
  // No per-slot py, no pt-0, no per-element margins — adding/removing a slot can't
  // unbalance the bottom edge (make-kit rule: shadow ring is the edge, gap is the rhythm).
  // `relative` establishes the positioning context for <CardAction> corner slots.
  'relative flex text-surface-fg rounded-surface transition-shadow duration-fast-02 ease-productive-standard',
  {
    variants: {
      variant: {
        // Tonal (default): depth from a surface-tone shift + a whisper hairline in the
        // surface's own colour (`border-card`), NO shadow — the DS-wide anti-slop edge
        // (Setu tonal-elevation). The `color` prop overrides the hairline colour to paint
        // a deliberate accent/status edge.
        default: 'bg-surface-panel border border-card shadow-none',
        // Elevation-led: the shadow's own ring is the edge (make-kit rule #6 — no
        // border+shadow double-edge). Reach for it when a card should visibly pop
        // (a dragged tile, a spotlight panel). border-transparent keeps `color` paintable.
        elevated: 'bg-surface-panel border border-transparent shadow-raised-hover',
        // Border-led, strong: a firmly visible edge, no shadow.
        outline: 'bg-transparent border border-surface-border-strong shadow-none',
        flat: 'bg-surface-panel border-none shadow-none',
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
      // size only assigns the two variables; the orientation axis decides where
      // they're consumed (container in vertical, <CardSection> in horizontal).
      size: {
        sm: '[--card-spacing:var(--spacing-ds-05)] [--card-gap:var(--spacing-ds-03)]',
        md: '[--card-spacing:var(--spacing-ds-05b)] [--card-gap:var(--spacing-ds-04)]',
        lg: '[--card-spacing:var(--spacing-ds-06)] [--card-gap:var(--spacing-ds-05)]',
      },
      // vertical: the container owns py + gap (the default gap model).
      // horizontal: the container is a padding-less row; a <CardSection> child
      // re-establishes py + gap for the text column while a media pane owns an edge.
      orientation: {
        vertical: 'flex-col py-(--card-spacing) gap-(--card-gap)',
        horizontal: 'flex-row items-stretch',
      },
    },
    defaultVariants: { variant: 'default', color: 'default', size: 'md', orientation: 'vertical' },
  },
)

/**
 * Props for Card — a general-purpose content container with 4 elevation/style variants and
 * an optional interactive hover state.
 *
 * **Variants (tonal, elevation-led, or border-led — never border+shadow together):** `default`
 * (tonal — surface shift + `border-card` hairline, no shadow) | `elevated` (shadow-raised-hover,
 * no border — use when a card should visibly pop) | `outline` (strong visible border, no shadow) |
 * `flat` (filled background, no edge). The shadow tokens carry their own 1px ring, so `elevated`
 * needs no explicit border (make-kit rule #6).
 *
 * **Composition:** Use sub-components `<CardHeader>`, `<CardTitle>`, `<CardDescription>`,
 * `<CardContent>`, and `<CardFooter>` for consistent internal spacing. Text content must live
 * inside a slot — raw text as a direct child gets no horizontal inset (direct children span the
 * full card width by design, which is what makes full-width dividers and bands free).
 *
 * **Spacing:** `size` sets `--card-spacing` / `--card-gap` once; container, slots, `CardAction`,
 * and `CardBleed` all read the same pair. Retune a card with a single override:
 * `className="[--card-spacing:var(--spacing-ds-07)]"`.
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
 * // Full-bleed cover image + edge-to-edge divider:
 * <Card>
 *   <CardBleed side="top"><img src={cover} alt="" /></CardBleed>
 *   <CardHeader><CardTitle>Muhurat launch site</CardTitle></CardHeader>
 *   <Separator />
 *   <CardFooter><Badge color="success">On track</Badge></CardFooter>
 * </Card>
 *
 * @example
 * // Horizontal media card — media pane owns the left edge, CardSection restores rhythm:
 * <Card orientation="horizontal">
 *   <div className="w-32 shrink-0 rounded-l-surface overflow-hidden">
 *     <img src={thumb} alt="" className="h-full w-full object-cover" />
 *   </div>
 *   <CardSection>
 *     <CardHeader><CardTitle>Field notes</CardTitle></CardHeader>
 *     <CardFooter>edited yesterday</CardFooter>
 *   </CardSection>
 * </Card>
 *
 * @example
 * // Flat card for a sidebar panel section (no shadow):
 * <Card variant="flat">
 *   <CardContent>
 *     <p className="text-surface-fg-muted text-body-sm">No recent activity</p>
 *   </CardContent>
 * </Card>
 */
export interface CardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof cardVariants> {
  interactive?: boolean
}

export type { CardSize }

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, color, size, orientation, interactive, children, ...props }, ref) => {
    if (typeof process !== 'undefined' && process?.env.NODE_ENV !== 'production') {
      warnOnUnwrappedTextChildren(children)
    }
    const classes = cn(
      cardVariants({ variant, color, size, orientation }),
      interactive && 'hover:bg-surface-panel-hover cursor-pointer transition-colors duration-fast-02 ease-productive-standard',
      className,
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
          {children}
        </motion.div>
      )
    }

    return (
      <div ref={ref} className={classes} {...props}>
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
    className={cn(
      'flex flex-col gap-ds-02b px-(--card-spacing) [&>:first-child]:mt-0 [&>:last-child]:mb-0',
      className,
    )}
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
    className={cn('text-body-md text-surface-fg-muted', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Reset first/last child margins so a raw <p>/<h*>'s UA margin can't leak
      // past the slot onto the container's gap-model padding (the bottom-heavy bug).
      'px-(--card-spacing) [&>:first-child]:mt-0 [&>:last-child]:mb-0',
      className,
    )}
    {...props}
  />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center gap-ds-03 px-(--card-spacing)', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

/**
 * A vertical stack that re-establishes the card's padding + gap rhythm — the text column
 * of a `<Card orientation="horizontal">`. Reads the same `--card-spacing` / `--card-gap`
 * variables the container sets, so the horizontal card's content column matches a vertical
 * card of the same `size` exactly.
 */
const CardSection = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex min-w-0 flex-1 flex-col py-(--card-spacing) gap-(--card-gap)', className)}
    {...props}
  />
))
CardSection.displayName = 'CardSection'

type CardBleedSide = 'x' | 'top' | 'bottom' | 'y' | 'all'

const bleedSideClasses: Record<CardBleedSide, string> = {
  // Inside a slot: escape the slot's horizontal inset.
  x: '-mx-(--card-spacing)',
  // As a direct child: escape the container's vertical edge (direct children are
  // already full-width — never add `x` bleed to a direct child, it would overflow).
  top: '-mt-(--card-spacing) rounded-t-surface overflow-hidden',
  bottom: '-mb-(--card-spacing) rounded-b-surface overflow-hidden',
  y: '-my-(--card-spacing) rounded-surface overflow-hidden',
  // Inside a slot, escaping every edge (e.g. an image-only card body).
  all: '-my-(--card-spacing) -mx-(--card-spacing) rounded-surface overflow-hidden',
}

export interface CardBleedProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Which card padding to negate. `top`/`bottom`/`y` are for direct children of Card
   * (full-bleed media, edge bands) and inherit the card's corner radius; `x`/`all` are
   * for content INSIDE a slot that needs to escape the slot's horizontal inset.
   * Direct children of Card already span its full width — don't use `x`/`all` there.
   * @default 'x'
   */
  side?: CardBleedSide
}

/**
 * Escape hatch from the card's padding — the shilp-sutra equivalent of Radix Themes'
 * `Inset` / Polaris `Bleed`. Negates the same `--card-spacing` variable the padding
 * reads, so it stays exact across sizes and overrides.
 *
 * @example
 * // Cover image touching the card's top + side edges:
 * <Card>
 *   <CardBleed side="top"><img src={cover} alt="" /></CardBleed>
 *   <CardHeader><CardTitle>Project</CardTitle></CardHeader>
 * </Card>
 *
 * @example
 * // A tinted band inside CardContent, running edge-to-edge:
 * <CardContent>
 *   <CardBleed><div className="bg-accent-2 px-(--card-spacing) py-ds-03">Heads up…</div></CardBleed>
 * </CardContent>
 */
const CardBleed = React.forwardRef<HTMLDivElement, CardBleedProps>(
  ({ className, side = 'x', ...props }, ref) => (
    <div ref={ref} className={cn(bleedSideClasses[side], className)} {...props} />
  ),
)
CardBleed.displayName = 'CardBleed'

type CardActionPlacement = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'

// Corner inset reads --card-spacing so an action's edge lines up with the slot
// content edge at every size.
const cornerPositions: Record<CardActionPlacement, string> = {
  'top-right': 'top-(--card-spacing) right-(--card-spacing)',
  'top-left': 'top-(--card-spacing) left-(--card-spacing)',
  'bottom-right': 'bottom-(--card-spacing) right-(--card-spacing)',
  'bottom-left': 'bottom-(--card-spacing) left-(--card-spacing)',
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
  ({ className, placement = 'top-right', tuck, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'absolute z-[1] flex items-center gap-ds-02',
        cornerPositions[placement],
        tuck && '-m-ds-02',
        className,
      )}
      {...props}
    />
  ),
)
CardAction.displayName = 'CardAction'

// Text-shaped tags that almost certainly expected a slot's horizontal inset.
// Structural tags (div, section, img, table, hr…) are legitimate full-width direct
// children, so they stay silent.
const TEXTUAL_TAGS = new Set(['p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'label', 'small', 'strong', 'em'])
let warnedUnwrappedText = false

function warnOnUnwrappedTextChildren(children: React.ReactNode): void {
  if (warnedUnwrappedText) return
  React.Children.forEach(children, (child) => {
    const isBareText = typeof child === 'string' && child.trim() !== ''
    const isTextualTag =
      React.isValidElement(child) &&
      typeof child.type === 'string' &&
      TEXTUAL_TAGS.has(child.type)
    if (isBareText || isTextualTag) {
      warnedUnwrappedText = true
      console.warn(
        '[shilp-sutra] <Card> received text content as a direct child. Direct children span the full card width and get no horizontal inset — wrap text in <CardContent> (or <CardHeader>/<CardFooter>). See the Card docs, "Composition".',
      )
    }
  })
}

export { Card, CardAction, CardBleed, CardContent, CardDescription, CardFooter, CardHeader, CardSection, CardTitle, cardVariants }
export type { CardActionPlacement, CardBleedSide }
