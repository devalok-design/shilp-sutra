'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { arc } from 'd3-shape'
import { cn } from '../lib/utils'
import { tweens } from '../lib/motion'
import { resolveColor } from './_internal/colors'
import { useReducedMotion, getTransitionDuration } from './_internal/animation'

export interface GaugeChartProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'color'> {
  /** Current value */
  value: number
  /** Maximum value (default: 100) */
  max?: number
  /** Minimum value (default: 0) */
  min?: number
  /** Label below the value */
  label?: string
  /** Custom value display */
  valueLabel?: string | ((value: number) => string)
  /** Arc color */
  color?: string
  /** Track (background) color */
  trackColor?: string
  /** Chart height/width (default: 200) */
  height?: number
  /** Start angle in degrees (default: -120) */
  startAngle?: number
  /** End angle in degrees (default: 120) */
  endAngle?: number
  /** Arc thickness in pixels (default: 16) */
  thickness?: number
  /** Animate the value arc */
  animate?: boolean
  className?: string
}

const toRad = (deg: number) => (deg * Math.PI) / 180

export const GaugeChart = React.forwardRef<HTMLDivElement, GaugeChartProps>(
  (
    {
      value,
      max = 100,
      min = 0,
      label,
      valueLabel,
      color,
      trackColor = 'var(--color-border-subtle)',
      height = 200,
      startAngle = -120,
      endAngle = 120,
      thickness = 16,
      animate = true,
      className,
      ...props
    },
    ref,
  ) => {
  const reducedMotion = useReducedMotion()
  const duration = getTransitionDuration(reducedMotion, animate ? 600 : 0)
  const shouldAnimate = animate && !reducedMotion

  const resolvedColor = resolveColor(color, 0)
  const size = height
  const radius = size / 2

  // Clamp value to [min, max]
  const clampedValue = Math.min(Math.max(value, min), max)
  const valueFraction = max === min ? 0 : (clampedValue - min) / (max - min)
  const valueEndAngle = startAngle + (endAngle - startAngle) * valueFraction

  // Display text
  const displayValue =
    typeof valueLabel === 'function'
      ? valueLabel(clampedValue)
      : typeof valueLabel === 'string'
        ? valueLabel
        : String(clampedValue)

  // Track arc generator
  const trackGenerator = arc<unknown>()
    .innerRadius(radius - thickness)
    .outerRadius(radius)
    .startAngle(toRad(startAngle))
    .endAngle(toRad(endAngle))
    .cornerRadius(thickness / 2)

  // Value arc generator
  const valueGenerator = arc<unknown>()
    .innerRadius(radius - thickness)
    .outerRadius(radius)
    .startAngle(toRad(startAngle))
    .endAngle(toRad(valueEndAngle))
    .cornerRadius(thickness / 2)

  const trackPath = trackGenerator(null as unknown as Record<string, never>) ?? ''
  const valuePath = valueGenerator(null as unknown as Record<string, never>) ?? ''

  return (
    <motion.div
      ref={ref}
      className={cn('inline-flex flex-col items-center', className)}
      {...(shouldAnimate
        ? { initial: { opacity: 0, scale: 0.96 }, animate: { opacity: 1, scale: 1 }, transition: tweens.fade }
        : {})}
      {...props}
      role="meter"
      aria-valuenow={clampedValue}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-label={label ?? 'Gauge chart'}
    >
      <svg width={size} height={size} role="img" aria-hidden="true">
        <g transform={`translate(${radius},${radius})`}>
          {/* Background track */}
          <path d={trackPath} fill={trackColor} />

          {/* Value arc */}
          <path
            d={valuePath}
            fill={resolvedColor}
            style={
              duration > 0
                ? { transition: `d ${duration}ms ease-out` }
                : undefined
            }
          />

          {/* Center value text */}
          <text
            x={0}
            y={label ? -4 : 0}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-text-primary text-ds-2xl font-semibold"
          >
            {displayValue}
          </text>

          {/* Label below value */}
          {label && (
            <text
              x={0}
              y={20}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-text-secondary text-ds-xs"
            >
              {label}
            </text>
          )}
        </g>
      </svg>
    </motion.div>
  )
  },
)
GaugeChart.displayName = 'GaugeChart'
