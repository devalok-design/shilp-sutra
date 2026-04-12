'use client'

import * as React from 'react'
import { motion, useMotionValue, useTransform, animate, useReducedMotion } from 'framer-motion'
import { springs } from './lib/motion'
import { cn } from './lib/utils'

const colorMap: Record<string, string> = {
  default: 'var(--color-accent-9)',
  success: 'var(--color-success-9)',
  warning: 'var(--color-warning-9)',
  error: 'var(--color-error-9)',
  info: 'var(--color-info-9)',
}

const sizeConfig = {
  sm: { size: 32, strokeWidth: 3, fontSize: 'text-ds-xs' },
  md: { size: 48, strokeWidth: 3.5, fontSize: 'text-ds-sm' },
  lg: { size: 64, strokeWidth: 4, fontSize: 'text-ds-md' },
} as const

/**
 * A circular progress indicator with optional label and animated fill.
 *
 * @example
 * <ProgressRing value={75} />
 * <ProgressRing value={3} max={12} size="lg" color="warning" showValue />
 */
export interface ProgressRingProps extends Omit<React.SVGAttributes<SVGSVGElement>, 'color'> {
  /** Current progress value */
  value: number
  /** Maximum value @default 100 */
  max?: number
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg'
  /** @default 'default' */
  color?: 'default' | 'success' | 'warning' | 'error' | 'info'
  /** Show percentage text in center */
  showValue?: boolean
  /** Accessible label */
  label?: string
}

const ProgressRing = React.forwardRef<SVGSVGElement, ProgressRingProps>(
  ({ value, max = 100, size = 'md', color = 'default', showValue = false, label, className, ...props }, ref) => {
    const prefersReducedMotion = useReducedMotion()
    const config = sizeConfig[size]
    const radius = (config.size - config.strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const progress = Math.min(Math.max(value / max, 0), 1)
    const offset = circumference * (1 - progress)
    const center = config.size / 2
    const percentage = Math.round(progress * 100)

    // Animated counter — drives from 0 → target percentage in sync with the ring fill
    const motionVal = useMotionValue(0)
    const displayValue = useTransform(motionVal, (v) => `${Math.round(v)}%`)

    React.useEffect(() => {
      const controls = animate(motionVal, progress * 100, prefersReducedMotion
        ? { type: 'tween', duration: 0 }
        /* Intentionally slower than springs.gentle (200/25/0.8) for smooth ring fill */
        : { stiffness: 100, damping: 30, type: 'spring' },
      )
      return () => controls.stop()
    }, [progress, motionVal, prefersReducedMotion])

    return (
      <svg
        ref={ref}
        width={config.size}
        height={config.size}
        viewBox={`0 0 ${config.size} ${config.size}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label ?? `${percentage}% progress`}
        className={cn('shrink-0', className)}
        {...props}
      >
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--color-surface-raised-hover)"
          strokeWidth={config.strokeWidth}
        />
        {/* Value */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={colorMap[color]}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={prefersReducedMotion ? { duration: 0 } : springs.smooth}
          transform={`rotate(-90 ${center} ${center})`}
        />
        {showValue && (
          <motion.text
            x={center}
            y={center}
            textAnchor="middle"
            dominantBaseline="central"
            className={cn(config.fontSize, 'fill-surface-fg font-sans font-semibold')}
          >
            {displayValue}
          </motion.text>
        )}
      </svg>
    )
  },
)
ProgressRing.displayName = 'ProgressRing'

/**
 * Multi-ring progress display (Activity Ring style).
 *
 * @example
 * <MultiProgressRing rings={[
 *   { value: 80, color: 'error', label: 'Move' },
 *   { value: 60, color: 'success', label: 'Exercise' },
 * ]} size="lg" />
 */
export interface MultiProgressRingProps extends Omit<React.SVGAttributes<SVGSVGElement>, 'color'> {
  rings: Array<{
    value: number
    max?: number
    color?: 'default' | 'success' | 'warning' | 'error' | 'info'
    label?: string
  }>
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg'
}

const MultiProgressRing = React.forwardRef<SVGSVGElement, MultiProgressRingProps>(
  ({ rings, size = 'md', className, ...props }, ref) => {
    const prefersReducedMotion = useReducedMotion()
    const config = sizeConfig[size]
    const center = config.size / 2
    const gap = config.strokeWidth + 2

    return (
      <svg
        ref={ref}
        width={config.size}
        height={config.size}
        viewBox={`0 0 ${config.size} ${config.size}`}
        role="group"
        aria-label="Progress rings"
        className={cn('shrink-0', className)}
        {...props}
      >
        {rings.map((ring, i) => {
          const radius = (config.size - config.strokeWidth) / 2 - i * gap
          if (radius <= 0) return null
          const circumference = 2 * Math.PI * radius
          const progress = Math.min(Math.max((ring.value) / (ring.max ?? 100), 0), 1)
          const offset = circumference * (1 - progress)

          return (
            <React.Fragment key={i}>
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="var(--color-surface-raised-hover)"
                strokeWidth={config.strokeWidth}
              />
              <motion.circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={colorMap[ring.color ?? 'default']}
                strokeWidth={config.strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={prefersReducedMotion ? { duration: 0 } : springs.smooth}
                transform={`rotate(-90 ${center} ${center})`}
              />
            </React.Fragment>
          )
        })}
      </svg>
    )
  },
)
MultiProgressRing.displayName = 'MultiProgressRing'

export { ProgressRing, MultiProgressRing }
