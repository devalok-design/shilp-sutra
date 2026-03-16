'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/ui/lib/utils'
import { motionProps } from '@/ui/lib/motion'
import { Badge } from '@/ui/badge'
import { Progress } from '@/ui/progress'

// ============================================================
// Types
// ============================================================

export interface ProjectHealthData {
  id: string
  name: string
  completed: number
  total: number
  overdue?: number
  urgent?: number
  contextLine?: string
  /** 7 values (0–1) for sparkline */
  trend?: number[]
}

export interface ProjectHealthCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'> {
  project: ProjectHealthData
  onClick?: () => void
  loading?: boolean
  className?: string
}

// ============================================================
// Sparkline helpers
// ============================================================

function generateSparklinePath(
  points: number[],
  width: number,
  height: number,
  padding: number,
): { path: string; endX: number; endY: number; startX: number } {
  if (points.length < 2) return { path: '', endX: 0, endY: 0, startX: 0 }

  const n = points.length
  const usableW = width - padding * 2
  const usableH = height - padding * 2

  // Normalize Y values
  let min = Math.min(...points)
  let max = Math.max(...points)
  if (max - min < 0.1) {
    const mid = (max + min) / 2
    min = mid - 0.05
    max = mid + 0.05
  }

  const xs = points.map((_, i) => padding + (i / (n - 1)) * usableW)
  const ys = points.map(
    (v) => padding + (1 - (v - min) / (max - min)) * usableH,
  )

  // Catmull-Rom to cubic bezier conversion
  const segments: string[] = []
  segments.push(`M ${xs[0]} ${ys[0]}`)

  for (let i = 0; i < n - 1; i++) {
    // Tangents using catmull-rom (tension 0)
    const p0x = xs[Math.max(0, i - 1)]
    const p0y = ys[Math.max(0, i - 1)]
    const p1x = xs[i]
    const p1y = ys[i]
    const p2x = xs[i + 1]
    const p2y = ys[i + 1]
    const p3x = xs[Math.min(n - 1, i + 2)]
    const p3y = ys[Math.min(n - 1, i + 2)]

    // Tangent at p1
    const t1x = (p2x - p0x) / 6
    const t1y = (p2y - p0y) / 6
    // Tangent at p2
    const t2x = (p3x - p1x) / 6
    const t2y = (p3y - p1y) / 6

    // Control points
    const cp1x = p1x + t1x
    const cp1y = p1y + t1y
    const cp2x = p2x - t2x
    const cp2y = p2y - t2y

    segments.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2x} ${p2y}`)
  }

  return {
    path: segments.join(' '),
    endX: xs[n - 1],
    endY: ys[n - 1],
    startX: xs[0],
  }
}

function getSparklineColors(trend: number[]): {
  stroke: string
  fill: string
} {
  const len = trend.length
  if (len < 6) {
    return { stroke: 'var(--warning-9)', fill: 'var(--warning-4)' }
  }
  const first3Avg = (trend[0] + trend[1] + trend[2]) / 3
  const last3Avg = (trend[len - 3] + trend[len - 2] + trend[len - 1]) / 3
  const diff = last3Avg - first3Avg

  if (diff > 0.05) {
    return { stroke: 'var(--success-9)', fill: 'var(--success-4)' }
  }
  if (diff < -0.05) {
    return { stroke: 'var(--error-9)', fill: 'var(--error-4)' }
  }
  return { stroke: 'var(--warning-9)', fill: 'var(--warning-4)' }
}

// ============================================================
// Sparkline sub-component
// ============================================================

function Sparkline({ trend, id }: { trend: number[]; id: string }) {
  const w = 48
  const h = 20
  const pad = 2
  const { path, endX, endY, startX } = generateSparklinePath(
    trend,
    w,
    h,
    pad,
  )
  const { stroke, fill } = getSparklineColors(trend)

  if (!path) return null

  const gradientId = `sparkline-fill-${id}`

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="sparkline"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity={0.15} />
          <stop offset="100%" stopColor={fill} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path
        d={`${path} L ${endX} ${h - pad} L ${startX} ${h - pad} Z`}
        fill={`url(#${gradientId})`}
      />
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={endX} cy={endY} r={2} fill={stroke} />
    </svg>
  )
}

// ============================================================
// Loading skeleton
// ============================================================

function ProjectHealthCardSkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-ds-md border border-surface-border bg-surface-raised p-ds-04',
        className,
      )}
      {...props}
    >
      <div className="flex flex-col gap-ds-03">
        <div className="flex justify-between">
          <div className="h-5 w-32 animate-pulse rounded bg-surface-raised-hover" />
          <div className="h-5 w-16 animate-pulse rounded bg-surface-raised-hover" />
        </div>
        <div className="h-2 w-full animate-pulse rounded bg-surface-raised-hover" />
        <div className="h-4 w-48 animate-pulse rounded bg-surface-raised-hover" />
      </div>
    </div>
  )
}

// ============================================================
// Badge helper
// ============================================================

function StatusBadge({
  urgent,
  overdue,
}: {
  urgent?: number
  overdue?: number
}) {
  if (urgent && urgent > 0) {
    return (
      <Badge variant="solid" color="error" size="xs" className="whitespace-nowrap">
        {urgent} urgent
      </Badge>
    )
  }
  if (overdue && overdue > 0) {
    return (
      <Badge variant="subtle" color="warning" size="xs" className="whitespace-nowrap">
        {overdue} overdue
      </Badge>
    )
  }
  return (
    <Badge variant="subtle" color="success" size="xs" className="whitespace-nowrap">
      on track
    </Badge>
  )
}

// ============================================================
// Progress color helper
// ============================================================

function getProgressColor(
  pct: number,
): 'success' | 'warning' | 'error' {
  if (pct > 75) return 'success'
  if (pct >= 25) return 'warning'
  return 'error'
}

// ============================================================
// Component
// ============================================================

const ProjectHealthCard = React.forwardRef<
  HTMLDivElement,
  ProjectHealthCardProps
>(function ProjectHealthCard(
  { project, onClick, loading, className, ...props },
  ref,
) {
  if (loading) {
    return <ProjectHealthCardSkeleton className={className} {...props} />
  }

  const { id, name, completed, total, overdue, urgent, contextLine, trend } =
    project
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  // Build context fragments
  const contextParts: React.ReactNode[] = []
  if (contextLine) {
    contextParts.push(
      <span key="ctx">{contextLine}</span>,
    )
  }
  if (overdue && overdue > 0) {
    if (contextParts.length > 0) {
      contextParts.push(
        <span key="sep" aria-hidden="true">
          {' \u00b7 '}
        </span>,
      )
    }
    contextParts.push(
      <span key="overdue" className="text-error-11">
        {overdue} overdue
      </span>,
    )
  }

  const clickableProps = onClick
    ? {
        whileTap: { scale: 0.98 },
        onClick,
        role: 'button' as const,
        tabIndex: 0,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick()
          }
        },
      }
    : {}

  return (
    <motion.div
      ref={ref}
      data-testid="project-health-card"
      className={cn(
        'rounded-ds-md border border-surface-border bg-surface-raised p-ds-04',
        onClick && 'cursor-pointer hover:bg-surface-raised-hover transition-colors duration-150',
        className,
      )}
      {...clickableProps}
      {...motionProps(props)}
    >
      <div className="flex flex-col gap-ds-03">
        {/* Row 1: Name + Badge */}
        <div className="flex items-center justify-between gap-ds-02">
          <span className="min-w-0 truncate text-ds-md font-semibold text-surface-fg">
            {name}
          </span>
          <StatusBadge urgent={urgent} overdue={overdue} />
        </div>

        {/* Row 2: Progress + Count + Sparkline */}
        <div className="flex items-center gap-ds-03">
          <div className="flex-1 flex items-center gap-ds-03">
            <div className="flex-1">
              <Progress size="sm" color={getProgressColor(pct)} value={pct} aria-label={`${name} progress`} />
            </div>
            <span className="shrink-0 text-ds-sm text-surface-fg-muted">
              {completed}/{total} tasks
            </span>
          </div>
          {trend && trend.length >= 2 && <Sparkline trend={trend} id={id} />}
        </div>

        {/* Row 3: Context line */}
        {contextParts.length > 0 && (
          <div className="text-ds-xs text-surface-fg-subtle">
            {contextParts}
          </div>
        )}
      </div>
    </motion.div>
  )
})

ProjectHealthCard.displayName = 'ProjectHealthCard'

export { ProjectHealthCard }
