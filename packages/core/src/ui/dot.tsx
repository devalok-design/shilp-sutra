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

const FILL: Record<DotColor, string> = {
  accent: 'bg-accent-9',
  success: 'bg-success-9',
  warning: 'bg-warning-9',
  error: 'bg-error-9',
  info: 'bg-info-9',
  neutral: 'bg-neutral-8',
  current: 'bg-current',
}

const RING: Record<DotColor, string> = {
  accent: 'border-accent-9',
  success: 'border-success-9',
  warning: 'border-warning-9',
  error: 'border-error-9',
  info: 'border-info-9',
  neutral: 'border-neutral-8',
  current: 'border-current',
}

// Off — "exists but inactive": faint same-tone fill + a light border.
const OFF: Record<DotColor, string> = {
  accent: 'border-accent-9/40 bg-accent-9/10',
  success: 'border-success-9/40 bg-success-9/10',
  warning: 'border-warning-9/40 bg-warning-9/10',
  error: 'border-error-9/40 bg-error-9/10',
  info: 'border-info-9/40 bg-info-9/10',
  neutral: 'border-neutral-8/40 bg-neutral-8/10',
  current: 'border-current/40 bg-current/10',
}

// Pulse ripple — the fill colour at low opacity.
const PULSE: Record<DotColor, string> = {
  accent: 'bg-accent-9/40',
  success: 'bg-success-9/40',
  warning: 'bg-warning-9/40',
  error: 'bg-error-9/40',
  info: 'bg-info-9/40',
  neutral: 'bg-neutral-8/40',
  current: 'bg-current/40',
}

const TEXT: Record<DotColor, string> = {
  accent: 'text-accent-11',
  success: 'text-success-11',
  warning: 'text-warning-11',
  error: 'text-error-11',
  info: 'text-info-11',
  neutral: 'text-surface-fg-muted',
  current: '',
}

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
  xs: 'text-ds-xs',
  sm: 'text-ds-xs',
  md: 'text-ds-sm',
  lg: 'text-ds-sm',
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
      variant === 'filled' && FILL[color],
      variant === 'ring' && cn('border-[1.5px] bg-transparent', RING[color]),
      variant === 'off' && cn('border', OFF[color]),
      withBorder && 'ring-2 ring-surface-raised',
    )

    const labelEl =
      label != null ? (
        <span className={cn(labelTextSize[resolvedSize], TEXT[color], 'font-sans', labelClassName)}>{label}</span>
      ) : null

    return (
      <span
        ref={ref}
        role={isAnnounced ? 'status' : undefined}
        aria-hidden={isAnnounced ? undefined : true}
        aria-label={ariaLabel}
        className={cn('inline-flex items-center gap-ds-02', className)}
        {...props}
      >
        {labelPosition === 'start' && labelEl}
        <span className="relative inline-flex shrink-0">
          {showPulse && (
            <span
              data-pulse=""
              style={{ animationDuration: PULSE_SPEED[pulseSpeed] }}
              className={cn('absolute inset-0 inline-flex rounded-pill animate-ping motion-reduce:animate-none', PULSE[color])}
            />
          )}
          <span className={disc} />
        </span>
        {labelPosition === 'end' && labelEl}
      </span>
    )
  },
)
Dot.displayName = 'Dot'

export { Dot, dotVariants }
