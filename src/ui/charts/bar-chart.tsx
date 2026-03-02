'use client'

import * as React from 'react'
import { scaleBand, scaleLinear } from 'd3-scale'
import { cn } from '../lib/utils'
import { ChartContainer } from './chart-container'
import { Axis } from './_internal/axes'
import { GridLines } from './_internal/grid-lines'
import { Legend } from './_internal/legend'
import { ChartTooltip, useChartTooltip } from './_internal/tooltip'
import { resolveColor } from './_internal/colors'
import { useReducedMotion, getTransitionDuration } from './_internal/animation'
import type { DataPoint, ChartColor } from './_internal/types'

export interface BarChartProps {
  /** Data array */
  data: DataPoint[]
  /** Key for x-axis categories */
  xKey: string
  /** Key(s) for y-axis values. String for single series, array for multi-series */
  yKey: string | string[]
  /** Bar orientation */
  orientation?: 'vertical' | 'horizontal'
  /** Stack multiple series */
  stacked?: boolean
  /** Group multiple series side by side */
  grouped?: boolean
  /** Color(s) for bars */
  color?: ChartColor | ChartColor[] | string | string[]
  /** Chart height in pixels */
  height?: number
  /** Show background grid lines */
  showGrid?: boolean
  /** Show tooltip on hover */
  showTooltip?: boolean
  /** Show legend (only for multi-series) */
  showLegend?: boolean
  /** Animate bars on mount */
  animate?: boolean
  /** Bar corner radius */
  barRadius?: number
  /** X-axis label */
  xLabel?: string
  /** Y-axis label */
  yLabel?: string
  /** Series labels (for legend) */
  seriesLabels?: string[]
  className?: string
}

export function BarChart({
  data,
  xKey,
  yKey,
  orientation = 'vertical',
  stacked = false,
  grouped = false,
  color,
  height = 300,
  showGrid = true,
  showTooltip = true,
  showLegend = false,
  animate = true,
  barRadius = 4,
  xLabel,
  yLabel,
  seriesLabels,
  className,
}: BarChartProps) {
  const { tooltip, show, hide } = useChartTooltip()
  const reducedMotion = useReducedMotion()
  const isVertical = orientation === 'vertical'

  // Keep animate/reducedMotion/getTransitionDuration accessible for future animation work
  const _duration = getTransitionDuration(reducedMotion, animate ? 300 : 0)
  void _duration

  // Normalize yKey to array
  const yKeys = Array.isArray(yKey) ? yKey : [yKey]
  const isMultiSeries = yKeys.length > 1

  // Resolve colors
  const colors = isMultiSeries
    ? yKeys.map((_, i) =>
        resolveColor(
          Array.isArray(color) ? color[i] : typeof color === 'string' ? color : undefined,
          i,
        ),
      )
    : [
        resolveColor(
          typeof color === 'string'
            ? color
            : Array.isArray(color)
              ? color[0]
              : undefined,
          0,
        ),
      ]

  return (
    <div className={cn('relative', className)}>
      <ChartContainer height={height}>
        {({ width, height: innerHeight, margin }) => {
          // Suppress unused-var lint for margin (available for extensions)
          void margin

          // Category labels
          const categories = data.map((d) => String(d[xKey]))

          // Calculate max value
          let maxValue: number
          if (stacked) {
            maxValue = Math.max(
              ...data.map((d) =>
                yKeys.reduce((sum, k) => sum + (Number(d[k]) || 0), 0),
              ),
            )
          } else {
            maxValue = Math.max(
              ...data.flatMap((d) => yKeys.map((k) => Number(d[k]) || 0)),
            )
          }

          // Build scales
          const categoryScale = scaleBand()
            .domain(categories)
            .range(isVertical ? [0, width] : [0, innerHeight])
            .padding(0.2)

          const valueScale = scaleLinear()
            .domain([0, maxValue * 1.1])
            .range(isVertical ? [innerHeight, 0] : [0, width])
            .nice()

          const barBandwidth = categoryScale.bandwidth()
          const barWidth =
            isMultiSeries && grouped
              ? barBandwidth / yKeys.length
              : barBandwidth

          return (
            <>
              {/* Grid */}
              {showGrid && (
                <GridLines
                  width={width}
                  height={innerHeight}
                  yScale={isVertical ? valueScale : undefined}
                  xScale={!isVertical ? valueScale : undefined}
                  horizontal={isVertical}
                  vertical={!isVertical}
                />
              )}

              {/* Bars */}
              {data.map((d) => {
                const category = String(d[xKey])
                let stackOffset = 0

                return yKeys.map((key, seriesIdx) => {
                  const value = Number(d[key]) || 0
                  const barColor = colors[seriesIdx] || colors[0]

                  let x: number, y: number, w: number, h: number

                  if (isVertical) {
                    x =
                      (categoryScale(category) ?? 0) +
                      (grouped && isMultiSeries ? seriesIdx * barWidth : 0)
                    y = stacked
                      ? valueScale(stackOffset + value)
                      : valueScale(value)
                    w = barWidth
                    h = stacked
                      ? valueScale(stackOffset) - valueScale(stackOffset + value)
                      : innerHeight - valueScale(value)
                  } else {
                    x = stacked ? valueScale(stackOffset) : 0
                    y =
                      (categoryScale(category) ?? 0) +
                      (grouped && isMultiSeries ? seriesIdx * barWidth : 0)
                    w = stacked
                      ? valueScale(stackOffset + value) - valueScale(stackOffset)
                      : valueScale(value)
                    h = barWidth
                  }

                  if (stacked) stackOffset += value

                  return (
                    <rect
                      key={`${category}-${key}`}
                      x={x}
                      y={y}
                      width={Math.max(0, w)}
                      height={Math.max(0, h)}
                      rx={barRadius}
                      fill={barColor}
                      className="transition-opacity hover:opacity-80"
                      onMouseMove={(e) => {
                        if (showTooltip) {
                          const rect = e.currentTarget
                            .closest('div')
                            ?.getBoundingClientRect()
                          show(
                            e.clientX - (rect?.left ?? 0),
                            e.clientY - (rect?.top ?? 0),
                            <div>
                              <div className="font-medium">{category}</div>
                              {isMultiSeries && (
                                <div className="text-[var(--color-text-secondary)]">
                                  {seriesLabels?.[seriesIdx] ?? key}
                                </div>
                              )}
                              <div>{value.toLocaleString()}</div>
                            </div>,
                          )
                        }
                      }}
                      onMouseLeave={hide}
                    />
                  )
                })
              })}

              {/* Axes */}
              {isVertical ? (
                <>
                  <Axis
                    scale={categoryScale}
                    orientation="bottom"
                    transform={`translate(0,${innerHeight})`}
                    label={xLabel}
                  />
                  <Axis scale={valueScale} orientation="left" label={yLabel} />
                </>
              ) : (
                <>
                  <Axis
                    scale={valueScale}
                    orientation="bottom"
                    transform={`translate(0,${innerHeight})`}
                    label={xLabel}
                  />
                  <Axis
                    scale={categoryScale}
                    orientation="left"
                    label={yLabel}
                  />
                </>
              )}
            </>
          )
        }}
      </ChartContainer>

      {/* Tooltip overlay */}
      {showTooltip && <ChartTooltip state={tooltip} />}

      {/* Legend */}
      {showLegend && isMultiSeries && (
        <Legend
          items={yKeys.map((key, i) => ({
            label: seriesLabels?.[i] ?? key,
            color: colors[i],
          }))}
          className="mt-ds-04"
        />
      )}
    </div>
  )
}
