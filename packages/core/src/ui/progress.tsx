'use client'

import * as ProgressPrimitive from '@primitives/react-progress'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'framer-motion'
import * as React from 'react'

import { springs } from './lib/motion'
import { cn } from './lib/utils'

// Bundlers (Vite, Next.js, webpack) define process.env.NODE_ENV; guard for raw ESM.
declare const process: { env: { NODE_ENV?: string } } | undefined

/* ---------------------------------------------------------------------------
 * Progress — a linear progress bar.
 *
 * Two ways to use it:
 *   1. Smart all-in-one `<Progress value={70} />` — covers the common cases
 *      (value, size, color, label, %-value, auto-color, indeterminate, segments).
 *   2. Compound parts `<Progress.Root>/<Progress.Track>/<Progress.Indicator>` etc.
 *      — full layout control, borrowed from Ark UI / Chakra's structure, with
 *      Mantine-style `<Progress.Segment>` for multi-colour bars.
 *
 * The compound parts share a context so `value`/`max`/`size` are set once on
 * `Root` and read by Track/Indicator/Segment/Value.
 * ------------------------------------------------------------------------ */

export type ProgressSize = 'sm' | 'md' | 'lg'
export type ProgressColor = 'accent' | 'success' | 'warning' | 'error'

export const progressTrackVariants = cva(
  'relative w-full overflow-hidden rounded-pill bg-surface-panel',
  {
    variants: { size: { sm: 'h-1', md: 'h-2', lg: 'h-3' } },
    defaultVariants: { size: 'md' },
  },
)

const COLOR_FILL: Record<ProgressColor, string> = {
  accent: 'bg-accent-9',
  success: 'bg-success-9',
  warning: 'bg-warning-9',
  error: 'bg-error-9',
}

export const progressIndicatorVariants = cva(
  'h-full transition-[width] duration-moderate-02 ease-expressive-standard',
  {
    variants: { color: COLOR_FILL },
    defaultVariants: { color: 'accent' },
  },
)

/** Auto-color by value: 0–59 accent, 60–84 warning, 85–100 success, >100 error. */
function autoColorFor(value: number | null | undefined): ProgressColor {
  if (value == null) return 'accent'
  if (value > 100) return 'error'
  if (value >= 85) return 'success'
  if (value >= 60) return 'warning'
  return 'accent'
}

const clampPct = (value: number, max: number) =>
  Math.max(0, Math.min(100, (value / max) * 100))

/* ---------------------------------------------------------------------------
 * Context — set once on Root, read by Track / Indicator / Segment / Value.
 * ------------------------------------------------------------------------ */

interface ProgressContextValue {
  value: number | null
  max: number
  size: ProgressSize
  indeterminate: boolean
}

const ProgressContext = React.createContext<ProgressContextValue | null>(null)

function useProgressContext(part: string): ProgressContextValue {
  const ctx = React.useContext(ProgressContext)
  if (!ctx) {
    throw new Error(`<Progress.${part}> must be rendered inside <Progress.Root>.`)
  }
  return ctx
}

/* ---------------------------------------------------------------------------
 * Progress.Root — layout container + context. NOT the progressbar itself
 * (that's Track) so labels/value can sit outside the bar (Ark UI model).
 * ------------------------------------------------------------------------ */

export interface ProgressRootProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0–max. Omit (or null) for an indeterminate bar. */
  value?: number | null
  /** Scale maximum. @default 100 */
  max?: number
  /** Track thickness. @default 'md' */
  size?: ProgressSize
}

const ProgressRoot = React.forwardRef<HTMLDivElement, ProgressRootProps>(
  ({ value = null, max = 100, size = 'md', className, children, ...props }, ref) => {
    const ctx = React.useMemo<ProgressContextValue>(
      () => ({ value, max, size, indeterminate: value == null }),
      [value, max, size],
    )
    return (
      <ProgressContext.Provider value={ctx}>
        <div ref={ref} className={cn('flex w-full items-center gap-ds-03', className)} {...props}>
          {children}
        </div>
      </ProgressContext.Provider>
    )
  },
)
ProgressRoot.displayName = 'Progress.Root'

/* ---------------------------------------------------------------------------
 * Progress.Track — the aria progressbar + track visual. Holds Indicator/Segment.
 * ------------------------------------------------------------------------ */

export type ProgressTrackProps = React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>

const ProgressTrack = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressTrackProps
>(({ className, children, ...props }, ref) => {
  const { value, max, size, indeterminate } = useProgressContext('Track')
  // Accessible name comes from the consumer's aria-label / aria-labelledby (spread
  // via ...props) — no auto-wiring, so a Track never carries a dangling reference.
  return (
    <ProgressPrimitive.Root
      ref={ref}
      value={indeterminate ? null : value}
      max={max}
      className={cn(progressTrackVariants({ size }), 'flex-1', className)}
      {...props}
    >
      {children}
    </ProgressPrimitive.Root>
  )
})
ProgressTrack.displayName = 'Progress.Track'

/* ---------------------------------------------------------------------------
 * Progress.Indicator — single fill. Determinate width from context, or the
 * indeterminate sweep animation when Root has no value.
 * ------------------------------------------------------------------------ */

export interface ProgressIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Fill colour. Omit to auto-colour by value. */
  color?: ProgressColor
  /** Force auto-colour even when `color` is unset. @default true when color unset */
  autoColor?: boolean
}

const ProgressIndicator = React.forwardRef<HTMLDivElement, ProgressIndicatorProps>(
  ({ color, autoColor, className, ...props }, ref) => {
    const { value, max, indeterminate } = useProgressContext('Indicator')
    const resolved = color ?? (autoColor !== false ? autoColorFor(value) : 'accent')

    if (indeterminate) {
      return (
        <div
          ref={ref}
          className={cn(
            progressIndicatorVariants({ color: resolved }),
            'w-2/5 animate-progress-indeterminate motion-reduce:animate-none',
            className,
          )}
          {...props}
        />
      )
    }
    return (
      <motion.div
        ref={ref}
        className={cn(progressIndicatorVariants({ color: resolved }), 'transition-colors', className)}
        initial={false}
        animate={{ width: `${clampPct(value ?? 0, max)}%` }}
        transition={springs.smooth}
        {...(props as React.ComponentProps<typeof motion.div>)}
      />
    )
  },
)
ProgressIndicator.displayName = 'Progress.Indicator'

/* ---------------------------------------------------------------------------
 * Progress.Segment — one slice of a multi-segment bar (Mantine-style). Place
 * several inside a Track. Widths are each segment's value as a % of max.
 * ------------------------------------------------------------------------ */

export interface ProgressSegmentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** This segment's portion of `max`. */
  value: number
  color?: ProgressColor
}

const ProgressSegment = React.forwardRef<HTMLDivElement, ProgressSegmentProps>(
  ({ value, color = 'accent', className, style, ...props }, ref) => {
    const { max } = useProgressContext('Segment')
    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn('h-full first:rounded-l-pill last:rounded-r-pill', COLOR_FILL[color], className)}
        style={{ width: `${clampPct(value, max)}%`, ...style }}
        {...props}
      />
    )
  },
)
ProgressSegment.displayName = 'Progress.Segment'

/* ---------------------------------------------------------------------------
 * Progress.Label — descriptive text, associated with the bar via aria.
 * ------------------------------------------------------------------------ */

export type ProgressLabelProps = React.HTMLAttributes<HTMLSpanElement>

const ProgressLabel = React.forwardRef<HTMLSpanElement, ProgressLabelProps>(
  ({ className, ...props }, ref) => {
    useProgressContext('Label')
    return (
      <span
        ref={ref}
        className={cn('shrink-0 text-body-sm font-medium text-surface-fg', className)}
        {...props}
      />
    )
  },
)
ProgressLabel.displayName = 'Progress.Label'

/* ---------------------------------------------------------------------------
 * Progress.Value — the "{n}%" readout. Custom content via children or `format`.
 * ------------------------------------------------------------------------ */

export interface ProgressValueProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Format the percentage. Default: `${round(pct)}%`. */
  format?: (pct: number, value: number | null, max: number) => React.ReactNode
  children?: React.ReactNode
}

const ProgressValue = React.forwardRef<HTMLSpanElement, ProgressValueProps>(
  ({ className, format, children, ...props }, ref) => {
    const { value, max, indeterminate } = useProgressContext('Value')
    const pct = indeterminate ? 0 : clampPct(value ?? 0, max)
    return (
      <span
        ref={ref}
        className={cn('shrink-0 text-caption text-surface-fg-muted tabular-nums', className)}
        {...props}
      >
        {children ?? (indeterminate ? '' : format ? format(pct, value, max) : `${Math.round(pct)}%`)}
      </span>
    )
  },
)
ProgressValue.displayName = 'Progress.Value'

/* ---------------------------------------------------------------------------
 * Progress — smart all-in-one. Composes the parts for the common cases.
 * ------------------------------------------------------------------------ */

export interface ProgressProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof progressTrackVariants> {
  /** 0–max. Omit (or null) for an indeterminate bar. */
  value?: number | null
  max?: number
  /** Fill colour. Omit + set `autoColor` to colour by value. */
  color?: ProgressColor
  /** Auto-colour the fill by value (0–59 accent · 60–84 warning · 85–100 success · >100 error). @default false */
  autoColor?: boolean
  /** Descriptive label rendered before the bar. */
  label?: React.ReactNode
  /** Show the `{n}%` readout after the bar. */
  showValue?: boolean
  /** Multi-segment bar: each slice is `value` (portion of max) + `color`. Overrides the single indicator. */
  segments?: Array<{ value: number; color?: ProgressColor }>
  /** Class for the Track element. */
  trackClassName?: string
  /** Class for the single Indicator (ignored when `segments` is set). */
  indicatorClassName?: string
}

/**
 * `role="progressbar"` with no accessible name announces as just "progressbar,
 * 72%" — the value is already carried by `aria-valuenow`, so what a screen
 * reader is missing is WHAT is progressing.
 *
 * This warns rather than auto-generating a name on purpose. A generated default
 * ("Progress", or "Progress: 72%") would silence the Lighthouse audit while
 * leaving the announcement just as uninformative, which is worse than the
 * current state: the bar looks labelled and nobody fixes it. Only the consumer
 * knows what the bar measures.
 *
 * Latched at module scope so a bar that re-renders on every value tick logs
 * once, not once per frame — same pattern as Card's unwrapped-text warning.
 */
let warnedMissingProgressName = false

function warnOnMissingAccessibleName(): void {
  if (warnedMissingProgressName) return
  if (typeof process === 'undefined' || process?.env?.NODE_ENV === 'production') return
  warnedMissingProgressName = true
  console.warn(
    '[shilp-sutra] <Progress> has no accessible name, so it announces as just "progressbar" with a percentage. ' +
      'Pass `label` (renders visible text and wires aria-labelledby) or `aria-label` if the bar must stay unlabelled visually. ' +
      'Example: <Progress value={72} label="Storage used" /> or <Progress value={72} aria-label="Upload progress" />.',
  )
}

const ProgressBase = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value = null, max = 100, size, color, autoColor, label, showValue, segments,
      trackClassName, indicatorClassName, className,
      'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledby, ...props
    },
    ref,
  ) => {
    const labelId = React.useId()
    const hasLabel = label != null
    if (!hasLabel && !ariaLabel && !ariaLabelledby) warnOnMissingAccessibleName()
    return (
      <ProgressRoot ref={ref} value={value} max={max} size={size ?? 'md'} className={className} {...props}>
        {hasLabel && <ProgressLabel id={labelId}>{label}</ProgressLabel>}
        <ProgressTrack
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby ?? (hasLabel ? labelId : undefined)}
          className={cn(segments && 'flex', trackClassName)}
        >
          {segments
            ? segments.map((s, i) => <ProgressSegment key={i} value={s.value} color={s.color} />)
            : <ProgressIndicator color={color} autoColor={autoColor} className={indicatorClassName} />}
        </ProgressTrack>
        {showValue && value != null && <ProgressValue />}
      </ProgressRoot>
    )
  },
)
ProgressBase.displayName = 'Progress'

const Progress = Object.assign(ProgressBase, {
  Root: ProgressRoot,
  Track: ProgressTrack,
  Indicator: ProgressIndicator,
  Segment: ProgressSegment,
  Label: ProgressLabel,
  Value: ProgressValue,
})

export {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressRoot,
  ProgressSegment,
  ProgressTrack,
  ProgressValue,
}
