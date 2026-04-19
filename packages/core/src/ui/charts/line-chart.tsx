'use client'

import type { ScaleLinear, ScalePoint } from 'd3-scale'
import { scaleLinear, scalePoint } from 'd3-scale'
import { curveLinear,curveMonotoneX, line } from 'd3-shape'
import { motion } from 'framer-motion'
import * as React from 'react'

import { motionProps,tweens } from '../lib/motion'
import { cn } from '../lib/utils'
import { useReducedMotion } from './_internal/animation'
import { type AnyScale,Axis } from './_internal/axes'
import { resolveColor } from './_internal/colors'
import { GridLines } from './_internal/grid-lines'
import { Legend } from './_internal/legend'
import { ChartTooltip, useChartTooltip } from './_internal/tooltip'
import type { DataPoint, Series } from './_internal/types'
import { ChartContainer } from './chart-container'

export interface LineChartProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Data array */
  data: DataPoint[]
  /** Key for x-axis */
  xKey: string
  /** Series definitions — each becomes a line */
  series: Series[]
  /** Use curved (monotone) interpolation */
  curved?: boolean
  /** Show dots at data points */
  showDots?: boolean
  /** Dot radius */
  dotSize?: number
  /** Line stroke width */
  strokeWidth?: number
  /** Chart height */
  height?: number
  /** Show grid lines */
  showGrid?: boolean
  /** Show tooltip on hover */
  showTooltip?: boolean
  /** Show legend */
  showLegend?: boolean
  /** Animate on mount */
  animate?: boolean
  /** X-axis label */
  xLabel?: string
  /** Y-axis label */
  yLabel?: string
  /** Accessible label for the chart */
  ariaLabel?: string
  className?: string
}

export const LineChart = React.forwardRef<HTMLDivElement, LineChartProps>(
  (
    {
      data,
      xKey,
      series,
      curved = false,
      showDots = false,
      dotSize = 4,
      strokeWidth = 2,
      height = 300,
      showGrid = true,
      showTooltip = true,
      showLegend = false,
      animate = true,
      xLabel,
      yLabel,
      ariaLabel,
      className,
      ...props
    },
    ref,
  ) => {
  const { tooltip, show, hide } = useChartTooltip()
  const reducedMotion = useReducedMotion()
  const shouldAnimate = animate && !reducedMotion

  // Resolve colors for each series
  const colors = series.map((s, i) => resolveColor(s.color, i))

  return (
    <motion.div
      ref={ref}
      className={cn('relative', className)}
      {...(shouldAnimate
        ? { initial: { opacity: 0, scale: 0.96 }, animate: { opacity: 1, scale: 1 }, transition: tweens.fade }
        : {})}
      {...motionProps(props)}
    >
      <ChartContainer height={height} ariaLabel={ariaLabel ?? 'Line chart'}>
        {({ width, height: innerHeight, margin }) => {
          void margin

          // Determine if x-axis data is numeric or categorical
          const xValues = data.map((d) => d[xKey])
          const isNumericX = xValues.every((v) => typeof v === 'number')

          // Build x scale and accessor
          let xAxisScale: ScaleLinear<number, number> | ScalePoint<string>
          let getX: (d: DataPoint) => number

          if (isNumericX) {
            const numericValues = xValues as number[]
            const xMin = Math.min(...numericValues)
            const xMax = Math.max(...numericValues)
            const linearX = scaleLinear<number, number>()
              .domain([xMin, xMax])
              .range([0, width])
            xAxisScale = linearX
            getX = (d: DataPoint) => linearX(Number(d[xKey]))
          } else {
            const categories = xValues.map(String)
            const pointX = scalePoint<string>()
              .domain(categories)
              .range([0, width])
              .padding(0.5)
            xAxisScale = pointX
            getX = (d: DataPoint) => pointX(String(d[xKey])) ?? 0
          }

          // Build y scale across all series
          const allValues = data.flatMap((d) =>
            series.map((s) => Number(d[s.key]) || 0),
          )
          const yMax = Math.max(...allValues)
          const yScale = scaleLinear<number, number>()
            .domain([0, yMax * 1.1])
            .range([innerHeight, 0])
            .nice()

          // Line generator
          const curveType = curved ? curveMonotoneX : curveLinear
          const lineGen = line<DataPoint>()
            .curve(curveType)
            .defined((d) => d !== undefined && d !== null)

          // Build data summary for screen readers
          const dataSummary = data.map((d) => {
            const xVal = String(d[xKey])
            const vals = series.map((s) =>
              `${s.label}: ${Number(d[s.key]).toLocaleString()}`
            ).join(', ')
            return `${xVal} — ${vals}`
          }).join('. ')

          return (
            <>
              {/* Screen-reader data summary */}
              <desc>{dataSummary}</desc>

              {/* Grid */}
              {showGrid && (
                <GridLines
                  width={width}
                  height={innerHeight}
                  yScale={yScale}
                  horizontal
                />
              )}

              {/* Lines */}
              {series.map((s, seriesIdx) => {
                const pathGen = lineGen
                  .x((d) => getX(d))
                  .y((d) => yScale(Number(d[s.key]) || 0))

                const pathD = pathGen(data) ?? ''

                return (
                  <g key={s.key}>
                    {/* Line path */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={colors[seriesIdx]}
                      strokeWidth={strokeWidth}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />

                    {/* Data point dots */}
                    {showDots &&
                      data.map((d, i) => {
                        const cx = getX(d)
                        const cy = yScale(Number(d[s.key]) || 0)
                        return (
                          <circle
                            key={`${s.key}-dot-${i}`}
                            cx={cx}
                            cy={cy}
                            r={dotSize}
                            fill={colors[seriesIdx]}
                            className="transition-opacity hover:opacity-80"
                          />
                        )
                      })}
                  </g>
                )
              })}

              {/* Invisible hover/focus rectangles for tooltip */}
              {showTooltip &&
                data.map((d, i) => {
                  const cx = getX(d)
                  const sliceWidth = width / Math.max(data.length - 1, 1)
                  const xVal = String(d[xKey])
                  const pointAriaLabel = `${xVal}: ${series.map((s) => `${s.label} ${Number(d[s.key]).toLocaleString()}`).join(', ')}`

                  const tooltipContent = (
                    <div>
                      <div className="font-medium">{xVal}</div>
                      {series.map((s, sIdx) => (
                        <div
                          key={s.key}
                          className="flex items-center gap-ds-02"
                        >
                          <span
                            className="inline-block h-2 w-2 rounded-ds-full"
                            style={{ backgroundColor: colors[sIdx] }}
                          />
                          <span className="text-surface-fg-muted">
                            {s.label}:
                          </span>{' '}
                          {Number(d[s.key]).toLocaleString()}
                        </div>
                      ))}
                    </div>
                  )

                  return (
                    <rect
                      key={`hover-${i}`}
                      x={cx - sliceWidth / 2}
                      y={0}
                      width={sliceWidth}
                      height={innerHeight}
                      fill="transparent"
                      tabIndex={0}
                      role="graphics-symbol"
                      aria-label={pointAriaLabel}
                      className="focus-visible:outline-hidden"
                      onMouseMove={(e) => {
                        const rect = e.currentTarget
                          .closest('div')
                          ?.getBoundingClientRect()
                        show(
                          e.clientX - (rect?.left ?? 0),
                          e.clientY - (rect?.top ?? 0),
                          tooltipContent,
                        )
                      }}
                      onMouseLeave={hide}
                      onFocus={(e) => {
                        const svgRect = e.currentTarget
                          .closest('div')
                          ?.getBoundingClientRect()
                        const sliceRect = e.currentTarget.getBoundingClientRect()
                        show(
                          sliceRect.left + sliceRect.width / 2 - (svgRect?.left ?? 0),
                          sliceRect.top + sliceRect.height / 2 - (svgRect?.top ?? 0),
                          tooltipContent,
                        )
                      }}
                      onBlur={hide}
                    />
                  )
                })}

              {/* Axes */}
              <Axis
                scale={xAxisScale as AnyScale}
                orientation="bottom"
                transform={`translate(0,${innerHeight})`}
                label={xLabel}
              />
              <Axis scale={yScale} orientation="left" label={yLabel} />
            </>
          )
        }}
      </ChartContainer>

      {/* Tooltip overlay */}
      {showTooltip && <ChartTooltip state={tooltip} />}

      {/* Legend */}
      {showLegend && series.length > 1 && (
        <Legend
          items={series.map((s, i) => ({
            label: s.label,
            color: colors[i],
          }))}
          className="mt-ds-04"
        />
      )}
    </motion.div>
  )
  },
)
LineChart.displayName = 'LineChart'
