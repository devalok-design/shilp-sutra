'use client'

import { IconMinus, IconTrendingDown, IconTrendingUp } from '@tabler/icons-react'
import * as React from 'react'
import { useLink } from '../shell/link-context'
import { cn } from './lib/utils'

/**
 * Props for StatCard — a dashboard metric tile displaying a label, a large numeric value,
 * an optional trend delta (with directional arrow icon), and an optional header icon.
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
export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
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
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>
  loading?: boolean
  /** Comparison period label shown after delta, e.g. "vs last month" */
  comparisonLabel?: string
  /** Secondary metric below main value, e.g. "of $50,000 target" */
  secondaryLabel?: string
  /** Progress toward a target (0-100). Renders a thin progress bar below the value. */
  progress?: number
  /** Color accent for the left border decoration */
  accent?: 'default' | 'success' | 'warning' | 'error' | 'info'
  /** Sparkline data points. Renders a mini SVG line chart in the card. */
  sparkline?: number[]
  /** Make the card clickable with hover state */
  onClick?: () => void
  /** Href — makes the card a link (uses the LinkContext Link component) */
  href?: string
  /** Footer content rendered below the card body, e.g. "View details →" */
  footer?: React.ReactNode
}

const accentBorderMap: Record<NonNullable<StatCardProps['accent']>, string> = {
  default: 'border-l-interactive',
  success: 'border-l-success',
  warning: 'border-l-warning',
  error: 'border-l-error',
  info: 'border-l-info',
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
  const barColor =
    clamped >= 90 ? 'bg-success' : clamped >= 70 ? 'bg-warning' : 'bg-accent-9'

  return (
    <div className="h-1 w-full rounded-ds-full bg-surface-2 mt-ds-04" role="progressbar" aria-label={`${label} progress`} aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
      <div
        className={cn('h-full rounded-ds-full transition-all duration-moderate-02', barColor)}
        style={{ width: `${clamped}%` }}
      />
    </div>
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
      icon,
      loading,
      comparisonLabel,
      secondaryLabel,
      progress,
      accent,
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
        <div
          ref={ref}
          className={cn(
            'rounded-ds-lg border border-surface-border bg-surface-1 shadow-01 p-ds-05b',
            accent && `border-l-[3px] ${accentBorderMap[accent]}`,
            className,
          )}
          {...props}
        >
          <div className="h-ds-04 w-24 rounded-ds-sm bg-skeleton-base animate-pulse mb-ds-05" />
          <div className="h-ds-sm w-32 rounded-ds-md bg-skeleton-base animate-pulse mb-ds-03" />
          <div className="h-3 w-16 rounded-ds-sm bg-skeleton-base animate-pulse" />
        </div>
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
        ? 'text-success'
        : delta?.direction === 'down'
          ? 'text-error'
          : 'text-surface-fg-muted'

    const sparklineColor =
      delta?.direction === 'up'
        ? 'text-success'
        : delta?.direction === 'down'
          ? 'text-error'
          : 'text-interactive'

    const cardContent = (
      <>
        <div className="flex items-center justify-between mb-ds-04">
          <p className="text-ds-md font-medium text-surface-fg-muted animate-fade-in">{resolvedLabel}</p>
          <div className="flex items-center gap-ds-03">
            {sparkline && sparkline.length >= 2 && (
              <Sparkline data={sparkline} colorClass={sparklineColor} />
            )}
            {icon && (
              <span className="text-surface-fg-muted animate-scale-in" aria-hidden="true">
                {typeof icon === 'function'
                  ? React.createElement(icon as React.ComponentType<{ className?: string }>, {
                      className: 'h-ico-lg w-ico-lg',
                    })
                  : icon}
              </span>
            )}
          </div>
        </div>
        <div className="overflow-hidden">
          <p className="inline-block animate-count-up text-ds-3xl font-semibold text-surface-fg">
            {prefix && (
              <span className="text-surface-fg-muted text-ds-lg">{prefix}</span>
            )}
            <span className="tabular-nums">{value}</span>
            {suffix && (
              <span className="text-surface-fg-muted text-ds-lg">{suffix}</span>
            )}
          </p>
        </div>
        {secondaryLabel && (
          <p className="text-ds-sm text-surface-fg-subtle mt-ds-01 animate-fade-in" style={{ animationDelay: '100ms' }}>{secondaryLabel}</p>
        )}
        {progress != null && (
          <div className="animate-fade-in" style={{ animationDelay: '150ms' }}>
            <ProgressBar progress={progress} label={resolvedLabel} />
          </div>
        )}
        {delta && (
          <div
            className={cn(
              'mt-ds-03 flex items-center gap-ds-02 text-ds-sm font-medium animate-slide-up',
              deltaColour,
            )}
            style={{ animationDelay: '200ms' }}
          >
            <DeltaIcon className="h-ico-sm w-ico-sm animate-stamp" aria-hidden="true" />
            <span>{delta.value}</span>
            {comparisonLabel && (
              <span className="text-surface-fg-subtle font-normal">{comparisonLabel}</span>
            )}
          </div>
        )}
        {footer && (
          <div className="mt-ds-04 pt-ds-04 border-t border-surface-border text-ds-sm animate-fade-in" style={{ animationDelay: '250ms' }}>
            {footer}
          </div>
        )}
      </>
    )

    const cardClasses = cn(
      'rounded-ds-lg border border-surface-border bg-surface-1 shadow-01 p-ds-05b',
      accent && `border-l-[3px] ${accentBorderMap[accent]}`,
      isClickable &&
        'cursor-pointer hover:shadow-02 hover:border-surface-border-strong transition-all duration-fast-02 group',
      className,
    )

    if (href) {
      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          onClick={onClick}
          className={cn(cardClasses, 'block no-underline')}
          aria-label={computedAriaLabel}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {cardContent}
        </Link>
      )
    }

    return (
      <div
        ref={ref}
        className={cardClasses}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={computedAriaLabel}
        onKeyDown={
          onClick
            ? (e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onClick()
                }
              }
            : undefined
        }
        {...props}
      >
        {cardContent}
      </div>
    )
  },
)

StatCard.displayName = 'StatCard'

export { StatCard }
