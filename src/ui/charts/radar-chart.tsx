'use client'

import * as React from 'react'
import { useState, useRef, useEffect } from 'react'
import { lineRadial, curveLinearClosed } from 'd3-shape'
import { cn } from '../lib/utils'
import { Legend } from './_internal/legend'
import { ChartTooltip, useChartTooltip } from './_internal/tooltip'
import { resolveColor } from './_internal/colors'
import { useReducedMotion, getTransitionDuration } from './_internal/animation'

export interface RadarChartProps {
  /** Data array (one entry per data point / axis) */
  data: Record<string, string | number>[]
  /** Axis labels (3-8 axes) */
  axes: string[]
  /** Series to plot */
  series: { key: string; label: string; color?: string }[]
  /** Max value (auto-detect if not set) */
  maxValue?: number
  /** Number of concentric grid rings (default: 5) */
  levels?: number
  /** Fill opacity for the data polygon (default: 0.25) */
  fillOpacity?: number
  /** Show dots at vertices */
  showDots?: boolean
  /** Chart height (default: 300) */
  height?: number
  /** Show tooltip on hover */
  showTooltip?: boolean
  /** Show legend */
  showLegend?: boolean
  /** Animate on mount */
  animate?: boolean
  className?: string
}

export function RadarChart({
  data,
  axes,
  series,
  maxValue: maxValueProp,
  levels = 5,
  fillOpacity = 0.25,
  showDots = false,
  height = 300,
  showTooltip = true,
  showLegend = false,
  animate = true,
  className,
}: RadarChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const { tooltip, show, hide } = useChartTooltip()
  const reducedMotion = useReducedMotion()

  // Keep animate/reducedMotion accessible for future animation work
  const _duration = getTransitionDuration(reducedMotion, animate ? 600 : 0)
  void _duration

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) setContainerWidth(entry.contentRect.width)
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // Radar chart is square — use the smaller of width/height
  const svgSize = containerWidth > 0 ? Math.min(containerWidth, height) : height
  const radius = svgSize / 2 - 40 // leave room for labels

  // Resolve colors for each series
  const colors = series.map((s, i) => resolveColor(s.color, i))

  // Auto-detect maxValue if not provided
  const maxValue =
    maxValueProp ??
    Math.max(
      ...data.flatMap((d) => series.map((s) => Number(d[s.key]) || 0)),
      1,
    )

  // Angle per axis slice
  const angleSlice = (2 * Math.PI) / axes.length

  // D3 radial line generator for the data polygon
  const radarLine = lineRadial<number>()
    .radius((d) => (radius * d) / maxValue)
    .angle((_, i) => i * angleSlice)
    .curve(curveLinearClosed)

  // Convert a data row into an array of values aligned with axes
  const getSeriesValues = (seriesKey: string): number[] =>
    axes.map((_, i) => Number(data[i]?.[seriesKey]) || 0)

  // Convert polar to cartesian for a given axis index and value
  const polarToXY = (axisIndex: number, value: number) => {
    const angle = angleSlice * axisIndex - Math.PI / 2
    const r = (radius * value) / maxValue
    return {
      x: r * Math.cos(angle),
      y: r * Math.sin(angle),
    }
  }

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {containerWidth > 0 && (
        <>
          <svg
            width={containerWidth}
            height={height}
            role="img"
            aria-label="Radar chart"
          >
            <g transform={`translate(${containerWidth / 2},${height / 2})`}>
              {/* Concentric grid polygons */}
              {Array.from({ length: levels }, (_, i) => {
                const levelRadius = (radius / levels) * (i + 1)
                const points = axes
                  .map((_, j) => {
                    const angle = angleSlice * j - Math.PI / 2
                    return `${levelRadius * Math.cos(angle)},${levelRadius * Math.sin(angle)}`
                  })
                  .join(' ')
                return (
                  <polygon
                    key={`grid-${i}`}
                    points={points}
                    fill="none"
                    stroke="var(--color-border-subtle)"
                    strokeDasharray="3,3"
                    strokeWidth={1}
                  />
                )
              })}

              {/* Axis lines from center to outer edge */}
              {axes.map((_, i) => {
                const angle = angleSlice * i - Math.PI / 2
                const x = radius * Math.cos(angle)
                const y = radius * Math.sin(angle)
                return (
                  <line
                    key={`axis-${i}`}
                    x1={0}
                    y1={0}
                    x2={x}
                    y2={y}
                    stroke="var(--color-border-subtle)"
                    strokeWidth={1}
                  />
                )
              })}

              {/* Axis labels */}
              {axes.map((label, i) => {
                const angle = angleSlice * i - Math.PI / 2
                const labelRadius = radius + 18
                const x = labelRadius * Math.cos(angle)
                const y = labelRadius * Math.sin(angle)

                // Determine text-anchor based on position
                let textAnchor: 'start' | 'middle' | 'end' = 'middle'
                if (Math.abs(Math.cos(angle)) > 0.1) {
                  textAnchor = Math.cos(angle) > 0 ? 'start' : 'end'
                }

                return (
                  <text
                    key={`label-${i}`}
                    x={x}
                    y={y}
                    textAnchor={textAnchor}
                    dominantBaseline="central"
                    className="fill-[var(--color-text-secondary)] text-ds-xs"
                  >
                    {label}
                  </text>
                )
              })}

              {/* Level value labels on the first axis */}
              {Array.from({ length: levels }, (_, i) => {
                const levelValue = Math.round((maxValue / levels) * (i + 1))
                const levelRadius = (radius / levels) * (i + 1)
                const angle = -Math.PI / 2 // first axis is at top
                const x = levelRadius * Math.cos(angle) + 4
                const y = levelRadius * Math.sin(angle)
                return (
                  <text
                    key={`level-label-${i}`}
                    x={x}
                    y={y}
                    textAnchor="start"
                    dominantBaseline="auto"
                    className="fill-[var(--color-text-muted)] text-[10px]"
                  >
                    {levelValue}
                  </text>
                )
              })}

              {/* Data polygons — one per series */}
              {series.map((s, seriesIdx) => {
                const values = getSeriesValues(s.key)
                const pathD = radarLine(values)
                if (!pathD) return null

                return (
                  <g key={s.key}>
                    <path
                      d={pathD}
                      fill={colors[seriesIdx]}
                      fillOpacity={fillOpacity}
                      stroke={colors[seriesIdx]}
                      strokeWidth={2}
                      strokeLinejoin="round"
                    />

                    {/* Vertex dots */}
                    {showDots &&
                      values.map((v, i) => {
                        const { x, y } = polarToXY(i, v)
                        return (
                          <circle
                            key={`dot-${s.key}-${i}`}
                            cx={x}
                            cy={y}
                            r={4}
                            fill={colors[seriesIdx]}
                            stroke="var(--color-layer-01)"
                            strokeWidth={2}
                            className="transition-opacity"
                          />
                        )
                      })}
                  </g>
                )
              })}

              {/* Invisible hover areas at each vertex for tooltips */}
              {showTooltip &&
                axes.map((axisLabel, i) => {
                  // Place a transparent circle at the outermost series point
                  // for hit detection. Use the max value point for the axis.
                  const angle = angleSlice * i - Math.PI / 2
                  const hitX = radius * Math.cos(angle)
                  const hitY = radius * Math.sin(angle)

                  return (
                    <circle
                      key={`hover-${i}`}
                      cx={hitX}
                      cy={hitY}
                      r={16}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseMove={(e) => {
                        const rect = e.currentTarget
                          .closest('div')
                          ?.getBoundingClientRect()
                        show(
                          e.clientX - (rect?.left ?? 0),
                          e.clientY - (rect?.top ?? 0),
                          <div>
                            <div className="font-medium">{axisLabel}</div>
                            {series.map((s, sIdx) => {
                              const val = Number(data[i]?.[s.key]) || 0
                              return (
                                <div
                                  key={s.key}
                                  className="flex items-center gap-ds-02"
                                >
                                  <span
                                    className="inline-block h-2 w-2 rounded-full"
                                    style={{ backgroundColor: colors[sIdx] }}
                                  />
                                  <span className="text-[var(--color-text-secondary)]">
                                    {s.label}:
                                  </span>{' '}
                                  {val.toLocaleString()}
                                </div>
                              )
                            })}
                          </div>,
                        )
                      }}
                      onMouseLeave={hide}
                    />
                  )
                })}
            </g>
          </svg>

          {/* Tooltip overlay */}
          {showTooltip && <ChartTooltip state={tooltip} />}
        </>
      )}

      {/* Legend */}
      {showLegend && (
        <Legend
          items={series.map((s, i) => ({
            label: s.label,
            color: colors[i],
          }))}
          className="mt-ds-04"
        />
      )}
    </div>
  )
}
