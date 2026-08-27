'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from './lib/utils'

/* ---------------------------------------------------------------------------
 * Dot — a small semantic status/indicator dot. The low-level primitive behind
 * StatusBadge, status/presence/health indicators, legend swatches, Avatar status.
 *
 * Intent-coloured, sized (xs–lg), filled / ring / off, optionally pulsing (with
 * a speed), optionally with a contrast border, and an optional label on either
 * side. Decorative by default (aria-hidden); a `label` (or `aria-label`) makes
 * it an announced status.
 *
 * For a dot/count that overlays a child element (notification badge), use
 * `BadgeIndicator` instead — that's the positioned-overlay pattern.
 *
 * API informed by Mantine `Indicator`, Ant `Badge status`, Chakra `Status`.
 * ------------------------------------------------------------------------ */

export type DotColor = 'accent' | 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'current'
export type DotSize = 'xs' | 'sm' | 'md' | 'lg'
export type DotVariant = 'filled' | 'ring' | 'off'

/**
 * Colour per variant. Twenty-eight hand-written lines become four functions,
 * because the hue comes from `data-palette` — with two genuine exceptions.
 *
 * `current` is not a palette at all: it means "inherit whatever colour the
 * surrounding text is", which no token can express.
 *
 * `neutral` sits at step 8, darker than the palette's `solid` (neutral-5). That
 * value exists because a filled *button* needs it; an 8px dot needs the extra
 * weight to register at all, and neutral-5 would nearly vanish on a panel.
 */
const isCurrent = (c: DotColor) => c === 'current'
const isNeutral = (c: DotColor) => c === 'neutral'

const fillFor = (c: DotColor) =>
  isCurrent(c) ? 'bg-current' : isNeutral(c) ? 'bg-neutral-8' : 'bg-palette-solid'

const ringFor = (c: DotColor) =>
  isCurrent(c) ? 'border-current' : isNeutral(c) ? 'border-neutral-8' : 'border-palette-solid'

/** Off — "exists but inactive": faint same-tone fill + a light border. */
const offFor = (c: DotColor) =>
  isCurrent(c)
    ? 'border-current/40 bg-current/10'
    : isNeutral(c)
      ? 'border-neutral-8/40 bg-neutral-8/10'
      : 'border-palette-solid/40 bg-palette-solid/10'

/** Label text. `neutral` needs no exception — the role already resolves muted. */
const textFor = (c: DotColor) => (isCurrent(c) ? '' : 'text-palette-text')

const PULSE_SPEED: Record<'slow' | 'normal' | 'fast', string> = {
  slow: '2s',
  normal: '1s',
  fast: '0.6s',
}

const dotVariants = cva('relative inline-flex shrink-0 rounded-pill', {
  variants: {
    size: {
      xs: 'h-1 w-1',
      sm: 'h-1.5 w-1.5',
      md: 'h-2 w-2',
      lg: 'h-2.5 w-2.5',
    },
  },
  defaultVariants: { size: 'md' },
})

const labelTextSize: Record<DotSize, string> = {
  xs: 'text-body-xs',
  sm: 'text-body-xs',
  md: 'text-body-sm',
  lg: 'text-body-sm',
}

/**
 * Props for Dot — a small semantic indicator dot.
 *
 * @example
 * <Dot color="success" />                              // bare dot
 * <Dot color="error" pulse pulseSpeed="fast" label="Recording" />
 * <Dot color="neutral" variant="off" label="Offline" /> // inactive
 * <Dot color="success" withBorder />                    // contrast ring on busy bg
 */
export interface DotProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'>,
    VariantProps<typeof dotVariants> {
  /** Intent colour, or `current` to inherit text colour. @default 'neutral' */
  color?: DotColor
  /** `filled` disc, hollow `ring`, or `off` (faint fill + light border = inactive). @default 'filled' */
  variant?: DotVariant
  /** A contrast ring around the dot so it stays visible on busy/colored backgrounds. @default false */
  withBorder?: boolean
  /** Animate a pulsing ripple (ignored for `off`). @default false */
  pulse?: boolean
  /** Pulse tempo. @default 'normal' */
  pulseSpeed?: 'slow' | 'normal' | 'fast'
  /** Inline label. Makes the dot an announced status. */
  label?: React.ReactNode
  /** Which side the label sits on. @default 'end' */
  labelPosition?: 'start' | 'end'
  labelClassName?: string
}

const Dot = React.forwardRef<HTMLSpanElement, DotProps>(
  (
    {
      color = 'neutral',
      size = 'md',
      variant = 'filled',
      withBorder = false,
      pulse = false,
      pulseSpeed = 'normal',
      label,
      labelPosition = 'end',
      labelClassName,
      className,
      'aria-label': ariaLabel,
      ...props
    },
    ref,
  ) => {
    const resolvedSize = size ?? 'md'
    // A dot with a label (or explicit aria-label) is an announced status;
    // a bare dot is decorative (the surrounding element carries the meaning).
    const isAnnounced = label != null || ariaLabel != null
    // Off dots are inactive — a pulse would contradict that.
    const showPulse = pulse && variant !== 'off'

    const disc = cn(
      dotVariants({ size: resolvedSize }),
      variant === 'filled' && fillFor(color),
      variant === 'ring' && cn('border-[1.5px] bg-transparent', ringFor(color)),
      variant === 'off' && cn('border', offFor(color)),
      withBorder && 'ring-2 ring-surface-panel',
    )

    const labelEl =
      label != null ? (
        <span className={cn(labelTextSize[resolvedSize], textFor(color), 'font-sans', labelClassName)}>{label}</span>
      ) : null

    return (
      <span
        ref={ref}
        role={isAnnounced ? 'status' : undefined}
        aria-hidden={isAnnounced ? undefined : true}
        aria-label={ariaLabel}
        // `current` deliberately sets no palette: it inherits the surrounding
        // text colour, which is the whole point of that value.
        data-palette={color === 'current' ? undefined : color}
        className={cn('inline-flex items-center gap-ds-02', className)}
        {...props}
      >
        {labelPosition === 'start' && labelEl}
        <span className="relative inline-flex shrink-0">
          {/* Contained opacity breathe on the disc itself — never an expanding halo/ring. */}
          <span
            data-pulse={showPulse ? '' : undefined}
            style={showPulse ? { animationDuration: PULSE_SPEED[pulseSpeed] } : undefined}
            className={cn(disc, showPulse && 'animate-pulse motion-reduce:animate-none')}
          />
        </span>
        {labelPosition === 'end' && labelEl}
      </span>
    )
  },
)
Dot.displayName = 'Dot'

export { Dot, dotVariants }
