'use client'

import { line, area, curveMonotoneX } from 'd3-shape'
import { scaleLinear } from 'd3-scale'
import { cn } from '../lib/utils'
import { resolveColor } from './_internal/colors'

export interface SparklineProps {
  /** Numeric data points */
  data: number[]
  /** Visual variant */
  variant?: 'line' | 'bar' | 'area'
  /** Width (default: 120) */
  width?: number
  /** Height (default: 32) */
  height?: number
  /** Color token or CSS color */
  color?: string
  /** Show a dot on the last data point (line/area only) */
  showLastDot?: boolean
  /** Line stroke width (line/area only, default: 1.5) */
  strokeWidth?: number
  className?: string
}

export function Sparkline({
  data,
  variant = 'line',
  width = 120,
  height = 32,
  color,
  showLastDot = false,
  strokeWidth = 1.5,
  className,
}: SparklineProps) {
  const resolvedColor = resolveColor(color, 0)

  if (!data.length) return null

  const padding = variant === 'bar' ? 1 : strokeWidth
  const innerWidth = width - padding * 2
  const innerHeight = height - padding * 2

  const xScale = scaleLinear()
    .domain([0, Math.max(data.length - 1, 1)])
    .range([padding, padding + innerWidth])

  const yMin = Math.min(...data)
  const yMax = Math.max(...data)
  const yDomain = yMin === yMax ? [yMin - 1, yMax + 1] : [yMin, yMax]

  const yScale = scaleLinear()
    .domain(yDomain)
    .range([padding + innerHeight, padding])

  if (variant === 'bar') {
    const barGap = 1
    const barWidth = Math.max(
      1,
      (innerWidth - barGap * (data.length - 1)) / data.length,
    )
    // For bars, baseline is the bottom of the chart
    const baselineY = padding + innerHeight

    return (
      <svg
        width={width}
        height={height}
        role="img"
        aria-label="Sparkline bar chart"
        className={cn('inline-block align-middle', className)}
      >
        {data.map((value, i) => {
          const x = padding + i * (barWidth + barGap)
          const y = yScale(value)
          const barHeight = Math.max(1, baselineY - y)
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={Math.min(1, barWidth / 2)}
              fill={resolvedColor}
            />
          )
        })}
      </svg>
    )
  }

  if (variant === 'area') {
    const areaGen = area<number>()
      .curve(curveMonotoneX)
      .x((_, i) => xScale(i))
      .y0(padding + innerHeight)
      .y1((d) => yScale(d))

    const lineGen = line<number>()
      .curve(curveMonotoneX)
      .x((_, i) => xScale(i))
      .y((d) => yScale(d))

    const areaD = areaGen(data) ?? ''
    const lineD = lineGen(data) ?? ''

    const lastX = xScale(data.length - 1)
    const lastY = yScale(data[data.length - 1])

    return (
      <svg
        width={width}
        height={height}
        role="img"
        aria-label="Sparkline area chart"
        className={cn('inline-block align-middle', className)}
      >
        <path d={areaD} fill={resolvedColor} opacity={0.2} />
        <path
          d={lineD}
          fill="none"
          stroke={resolvedColor}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {showLastDot && (
          <circle
            cx={lastX}
            cy={lastY}
            r={strokeWidth + 1}
            fill={resolvedColor}
          />
        )}
      </svg>
    )
  }

  // Default: line variant
  const lineGen = line<number>()
    .curve(curveMonotoneX)
    .x((_, i) => xScale(i))
    .y((d) => yScale(d))

  const pathD = lineGen(data) ?? ''

  const lastX = xScale(data.length - 1)
  const lastY = yScale(data[data.length - 1])

  return (
    <svg
      width={width}
      height={height}
      role="img"
      aria-label="Sparkline chart"
      className={cn('inline-block align-middle', className)}
    >
      <path
        d={pathD}
        fill="none"
        stroke={resolvedColor}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {showLastDot && (
        <circle
          cx={lastX}
          cy={lastY}
          r={strokeWidth + 1}
          fill={resolvedColor}
        />
      )}
    </svg>
  )
}
Sparkline.displayName = 'Sparkline'
