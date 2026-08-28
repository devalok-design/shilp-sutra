'use client'

import { IconMinus, IconTrendingDown, IconTrendingUp } from '@tabler/icons-react'
import { motion } from 'framer-motion'
import * as React from 'react'

import { MotionPreference } from '../motion/motion-preference'
import { Card, CardContent, CardFooter, type CardSize } from './card'
import { Icon } from './icon'
import { IconProvider } from './icon-context'
import type { IconInput } from './lib/icon-input'
import { useLink } from './lib/link-context'
import { springs, tweens } from './lib/motion'
import { normalizeIcon } from './lib/normalize-icon'
import { cn } from './lib/utils'
import { Progress, type ProgressColor } from './progress'
import { Skeleton } from './skeleton'
import { type FlashPreset, type FlashSpec, type FlashSpeed,StatFlash } from './stat-flash'

/**
 * Props for StatCard — a dashboard metric tile displaying a label, a large numeric value,
 * an optional trend delta (with directional arrow icon), and an optional header icon.
 *
 * **Surface:** delegated to `Card` via `variant` — `default` (tonal hairline, no shadow) |
 * `elevated` (shadow) | `outline` (strong border, no shadow) | `flat`. StatCard composes `<Card>`, so the surface,
 * padding (gap model), and elevation all live in one place.
 *
 * **Accent:** `accentStyle="none"` (default) is neutral; `"icon"` wraps `icon` in an accent chip
 * (`iconFill="soft" | "solid"`); `"tint"` applies a subtle accent surface wash + accent value.
 * (Replaces the removed `accent` left-rail prop — see CHANGELOG migration.)
 *
 * **Delta direction:** `'up'` renders a green trending-up arrow, `'down'` renders a red
 * trending-down arrow, `'neutral'` renders a grey dash. The `delta.value` is a formatted
 * string (e.g. `"+8%"` or `"−120"`).
 *
 * **Loading state:** Pass `loading={true}` to render a pulse-skeleton placeholder instead of data.
 *
 * @example
 * // Revenue metric with a positive trend:
 * <StatCard
 *   label="Monthly Revenue"
 *   value="$48,200"
 *   delta={{ value: "+12%", direction: "up" }}
 *   icon={<IconCurrencyDollar />}
 * />
 *
 * @example
 * // Open ticket count with a downward trend (good for support queues):
 * <StatCard
 *   label="Open Tickets"
 *   value={142}
 *   delta={{ value: "−18", direction: "down" }}
 * />
 *
 * @example
 * // Loading skeleton while data is fetching:
 * <StatCard label="Users" value={0} loading={isFetching} />
 *
 * @example
 * // Simple metric with no trend (stable, neutral):
 * <StatCard
 *   label="Storage Used"
 *   value="4.2 GB"
 *   delta={{ value: "No change", direction: "neutral" }}
 * />
 * // These are just a few ways — feel free to combine props creatively!
 */
export interface StatCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  /** Heading text for the metric. `title` is an alias for `label`. */
  label?: string
  /** Alias for `label` — use whichever feels natural. */
  title?: string
  value: string | number
  /** Prefix before value, e.g. "$" */
  prefix?: string
  /** Suffix after value, e.g. "users" */
  suffix?: string
  delta?: {
    value: string
    direction: 'up' | 'down' | 'neutral'
  }
  /** Where the delta sits relative to the value: `block` (below — default) or `inline` (on the value's baseline, to its right). @default 'block' */
  deltaPlacement?: 'block' | 'inline'
  icon?: IconInput
  loading?: boolean
  /** Comparison period label shown after delta, e.g. "vs last month" */
  comparisonLabel?: string
  /** Secondary metric below main value, e.g. "of $50,000 target" */
  secondaryLabel?: string
  /** Progress toward a target (0-100). Renders a thin progress bar below the value. */
  progress?: number
  /** Surface variant, delegated to Card: `default` (tonal hairline, no shadow) | `elevated` (shadow) | `outline` (strong border, no shadow) | `flat`. @default 'default' */
  variant?: 'default' | 'elevated' | 'outline' | 'flat'
  /**
   * Tile density, delegated to Card's size axis. `sm` tightens padding to 16px and steps
   * the value down to `text-heading-md` — use it for dense KPI rows and narrow stat grids
   * (e.g. stat-row's 140px tiles). @default 'md'
   */
  size?: CardSize
  /** How the brand accent reads: `none` (neutral — default), `icon` (accent chip around `icon`), or `tint` (subtle accent surface wash + accent value). */
  accentStyle?: 'none' | 'icon' | 'tint'
  /** Animate value/label in on mount (subtle settle; content stays visible either way, never opacity-gated). @default false */
  reveal?: boolean
  /** When `accentStyle="icon"`: `soft` (tinted chip) or `solid` (filled accent chip). @default 'soft' */
  iconFill?: 'soft' | 'solid'
  /**
   * Opt-in entrance flash: the icon chip mounts showing a transient state (e.g. a green up-arrow)
   * then settles to `icon`. A preset (`'up' | 'down' | 'goal' | 'record' | 'alert' | 'live'`) or an
   * explicit `{ tone, icon }`. Requires `icon`; implies the icon chip. Off by default.
   */
  flash?: FlashPreset | FlashSpec
  /** Speed of the entrance flash: `fast` | `normal` | `slow`. @default 'normal' */
  flashSpeed?: FlashSpeed
  /** Sparkline data points. Renders a mini SVG line chart in the card. */
  sparkline?: number[]
  /** Make the card clickable with hover state */
  onClick?: () => void
  /** Href — makes the card a link (uses the LinkContext Link component) */
  href?: string
  /** Footer content rendered below the card body, e.g. "View details →" */
  footer?: React.ReactNode
}

function buildSparklinePath(raw: number[], width: number, height: number): string {
  const data = raw.filter((v) => Number.isFinite(v))
  if (data.length < 2) return ''
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const stepX = width / (data.length - 1)
  return data
    .map((v, i) => {
      const x = i * stepX
      const y = height - ((v - min) / range) * height
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

function Sparkline({
  data,
  colorClass,
}: {
  data: number[]
  colorClass: string
}) {
  const id = React.useId()
  const pathRef = React.useRef<SVGPathElement>(null)
  const [pathLength, setPathLength] = React.useState(0)
  const svgWidth = 80
  const svgHeight = 32
  const path = buildSparklinePath(data, svgWidth, svgHeight)

  React.useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength())
    }
  }, [path])

  if (!path) return null

  // Build area fill path (close to bottom-right then bottom-left)
  const areaPath = `${path} L${svgWidth.toFixed(1)},${svgHeight.toFixed(1)} L0,${svgHeight.toFixed(1)} Z`

  return (
    <div className={cn('w-20 h-8', colorClass)} aria-hidden="true">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`sparkline-fill-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#sparkline-fill-${id})`} />
        <path
          ref={pathRef}
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            opacity: pathLength === 0 ? 0 : 1,
            strokeDasharray: pathLength,
            strokeDashoffset: pathLength,
            animation: pathLength > 0 ? `sparkline-draw-${id.replace(/:/g, '')} 1s ease-out forwards` : 'none',
          }}
        />
      </svg>
      {pathLength > 0 && (
        <style>{`@keyframes sparkline-draw-${id.replace(/:/g, '')} { to { stroke-dashoffset: 0; } }`}</style>
      )}
    </div>
  )
}

function ProgressBar({ progress, label }: { progress: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, progress))
  // StatCard's own thresholds (90 = success, 70 = warning) — deliberately distinct
  // from Progress's autoColor (85/60), so we pass an explicit color.
  const barColor: ProgressColor =
    clamped >= 90 ? 'success' : clamped >= 70 ? 'warning' : 'accent'

  return (
    <Progress.Root value={clamped} size="sm">
      <Progress.Track aria-label={`${label} progress`}>
        <Progress.Indicator color={barColor} />
      </Progress.Track>
    </Progress.Root>
  )
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      className,
      label,
      title,
      value,
      prefix,
      suffix,
      delta,
      deltaPlacement = 'block',
      icon,
      loading,
      comparisonLabel,
      secondaryLabel,
      progress,
      variant = 'default',
      size = 'md',
      accentStyle = 'none',
      reveal = false,
      iconFill = 'soft',
      flash,
      flashSpeed,
      sparkline,
      onClick,
      href,
      footer,
      ...props
    },
    ref,
  ) => {
    const Link = useLink()
    const resolvedLabel = title ?? label ?? ''
    const isClickable = !!(onClick || href)
    const computedAriaLabel =
      isClickable && !props['aria-label'] ? `View ${resolvedLabel}` : props['aria-label']

    if (loading) {
      return (
        <Card ref={ref} variant={variant} size={size} className={className} aria-busy="true" {...props}>
          <CardContent className="flex flex-col gap-ds-03">
            <Skeleton className="h-ds-04 w-24 rounded-control-inner" />
            <Skeleton className="h-ds-sm w-32" />
            <Skeleton className="h-3 w-16 rounded-control-inner" />
          </CardContent>
        </Card>
      )
    }

    const DeltaIcon =
      delta?.direction === 'up'
        ? IconTrendingUp
        : delta?.direction === 'down'
          ? IconTrendingDown
          : IconMinus

    const deltaColour =
      delta?.direction === 'up'
        ? 'text-success-11'
        : delta?.direction === 'down'
          ? 'text-error-11'
          : 'text-surface-fg-muted'

    const sparklineColor =
      delta?.direction === 'up'
        ? 'text-success-11'
        : delta?.direction === 'down'
          ? 'text-error-11'
          : 'text-accent-11'

    const deltaNode = delta ? (
      <motion.div
        className={cn(
          // Rhythm comes from CardContent's flex gap — no placement margins.
          'flex items-center gap-ds-02 text-body-sm font-medium',
          deltaColour,
        )}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springs.smooth, delay: 0.2 }}
      >
        <motion.span
          className="inline-flex"
          initial={{ opacity: 0.5, scale: 1.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={springs.smooth}
        >
          <Icon icon={DeltaIcon} size="sm" />
        </motion.span>
        <span>{delta.value}</span>
        {comparisonLabel && (
          <span className="text-surface-fg-subtle font-normal">{comparisonLabel}</span>
        )}
      </motion.div>
    ) : null

    // reveal=false → static (content-safe default). reveal=true → subtle settle; opacity NEVER gated.
    const revealProps = reveal
      ? { initial: { y: 8 }, animate: { y: 0 }, transition: springs.smooth }
      : { initial: false as const }

    const cardContent = (
      <>
        <div className="flex items-center justify-between">
          <motion.p
            className="text-body-md font-medium text-surface-fg-muted"
            {...revealProps}
          >
            {resolvedLabel}
          </motion.p>
          <div className="flex items-center gap-ds-03">
            {sparkline && sparkline.length >= 2 && (
              <Sparkline data={sparkline} colorClass={sparklineColor} />
            )}
            {icon && flash ? (
              <StatFlash icon={icon} flash={flash} fill={iconFill} speed={flashSpeed} />
            ) : icon ? (
              accentStyle === 'icon' ? (
                <motion.span
                  className={cn(
                    'inline-flex items-center justify-center rounded-control p-ds-02',
                    iconFill === 'solid'
                      ? 'bg-accent-9 text-accent-fg'
                      : 'bg-accent-3 text-accent-11',
                  )}
                  {...revealProps}
                  aria-hidden="true"
                >
                  <IconProvider size="md">{normalizeIcon(icon, 'md')}</IconProvider>
                </motion.span>
              ) : (
                <motion.span
                  className="text-surface-fg-muted"
                  {...revealProps}
                  aria-hidden="true"
                >
                  <IconProvider size="lg">{normalizeIcon(icon, 'lg')}</IconProvider>
                </motion.span>
              )
            ) : null}
          </div>
        </div>
        <div className="flex flex-col gap-ds-01">
          <div className={cn(deltaPlacement === 'inline' && delta && 'flex items-baseline gap-ds-03')}>
            <div className="overflow-hidden">
              <motion.p
                className={cn(
                  'inline-block font-semibold',
                  size === 'sm' ? 'text-heading-md' : 'text-heading-lg',
                  accentStyle === 'tint' ? 'text-accent-11' : 'text-surface-fg',
                )}
                {...revealProps}
              >
                {prefix && (
                  <span className={cn('text-surface-fg-muted', size === 'sm' ? 'text-body-md' : 'text-heading-xs')}>{prefix}</span>
                )}
                <span className="tabular-nums">{value}</span>
                {suffix && (
                  <span className={cn('text-surface-fg-muted', size === 'sm' ? 'text-body-md' : 'text-heading-xs')}>{suffix}</span>
                )}
              </motion.p>
            </div>
            {deltaPlacement === 'inline' && deltaNode}
          </div>
          {secondaryLabel && (
            <motion.p
              className="text-body-sm text-surface-fg-subtle"
              {...revealProps}
            >
              {secondaryLabel}
            </motion.p>
          )}
        </div>
        {progress != null && (
          <motion.div
            {...revealProps}
          >
            <ProgressBar progress={progress} label={resolvedLabel} />
          </motion.div>
        )}
        {deltaPlacement === 'block' && deltaNode}
      </>
    )

    // accentStyle="tint" → a subtle accent gradient wash over Card's surface.
    const tintClass =
      accentStyle === 'tint' ? 'bg-linear-to-t from-accent-2 to-surface-panel' : undefined
    // Footer sits outside CardContent behind a full-width divider (both are direct
    // children of Card, so the rule spans edge-to-edge — no inset border-t).
    const body = (
      <>
        <CardContent className="flex flex-col gap-ds-03">{cardContent}</CardContent>
        {footer && (
          <>
            <div aria-hidden="true" className="h-px w-full bg-surface-border-subtle" />
            <CardFooter className="text-body-sm">
              <motion.div
                className="w-full"
                initial={false}
                animate={{ opacity: 1 }}
                transition={{ ...tweens.fade, delay: 0.25 }}
              >
                {footer}
              </motion.div>
            </CardFooter>
          </>
        )}
      </>
    )

    // href → wrap Card in the framework Link (Card stays the shell; hover-lift inside).
    if (href) {
      return (
        <MotionPreference>
          <Link
            ref={ref as React.Ref<HTMLAnchorElement>}
            href={href}
            onClick={onClick}
            className="block no-underline"
            aria-label={computedAriaLabel}
            {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
          >
            <Card variant={variant} size={size} interactive className={tintClass}>
              {body}
            </Card>
          </Link>
        </MotionPreference>
      )
    }

    // onClick → interactive Card with button semantics + keyboard activation.
    if (onClick) {
      return (
        <MotionPreference>
          <Card
            ref={ref}
            variant={variant}
            size={size}
            interactive
            className={cn(tintClass, className)}
            role="button"
            tabIndex={0}
            aria-label={computedAriaLabel}
            onClick={onClick}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }}
            {...props}
          >
            {body}
          </Card>
        </MotionPreference>
      )
    }

    return (
      <MotionPreference>
        <Card ref={ref} variant={variant} size={size} className={cn(tintClass, className)} {...props}>
          {body}
        </Card>
      </MotionPreference>
    )
  },
)

StatCard.displayName = 'StatCard'

export { StatCard }
