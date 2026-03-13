'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  area,
  line,
  stack,
  stackOrderNone,
  stackOffsetNone,
  curveMonotoneX,
  curveLinear,
} from 'd3-shape'
import { scaleLinear, scalePoint } from 'd3-scale'
import type { ScaleLinear, ScalePoint } from 'd3-scale'
import { cn } from '../lib/utils'
import { tweens, motionProps } from '../lib/motion'
import { ChartContainer } from './chart-container'
import { Axis, type AnyScale } from './_internal/axes'
import { GridLines } from './_internal/grid-lines'
import { Legend } from './_internal/legend'
import { ChartTooltip, useChartTooltip } from './_internal/tooltip'
import { resolveColor } from './_internal/colors'
import { useReducedMotion } from './_internal/animation'
import type { DataPoint, Series } from './_internal/types'

export interface AreaChartProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Data array */
  data: DataPoint[]
  /** Key for x-axis */
  xKey: string
  /** Series definitions — each becomes an area */
  series: Series[]
  /** Use curved (monotone) interpolation */
  curved?: boolean
  /** Stack areas on top of each other */
  stacked?: boolean
  /** Fill opacity for area shapes */
  fillOpacity?: number
  /** Use vertical gradient fill */
  gradient?: boolean
  /** Stroke width for area outline */
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
  className?: string
}

/** Type for rows fed to d3 stack — all numeric except the xKey */
interface StackableRow {
  [key: string]: number | string
}

export const AreaChart = React.forwardRef<HTMLDivElement, AreaChartProps>(
  (
    {
      data,
      xKey,
      series,
      curved = false,
      stacked = false,
      fillOpacity = 0.3,
      gradient = false,
      strokeWidth = 2,
      height = 300,
      showGrid = true,
      showTooltip = true,
      showLegend = false,
      animate = true,
      xLabel,
      yLabel,
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

  // Stable unique ID for gradient definitions
  const chartId = React.useId()

  return (
    <motion.div
      ref={ref}
      className={cn('relative', className)}
      {...(shouldAnimate
        ? { initial: { opacity: 0, scale: 0.96 }, animate: { opacity: 1, scale: 1 }, transition: tweens.fade }
        : {})}
      {...motionProps(props)}
    >
      <ChartContainer height={height}>
        {({ width, height: innerHeight, margin }) => {
          void margin

          // Determine if x-axis data is numeric or categorical
          const xValues = data.map((d) => d[xKey])
          const isNumericX = xValues.every((v) => typeof v === 'number')

          // Build x scale and accessor
          let xAxisScale: ScaleLinear<number, number> | ScalePoint<string>
          let getX: (d: DataPoint) => number
          let getXByIndex: (i: number) => number

          if (isNumericX) {
            const numericValues = xValues as number[]
            const xMin = Math.min(...numericValues)
            const xMax = Math.max(...numericValues)
            const linearX = scaleLinear<number, number>()
              .domain([xMin, xMax])
              .range([0, width])
            xAxisScale = linearX
            getX = (d: DataPoint) => linearX(Number(d[xKey]))
            getXByIndex = (i: number) => linearX(Number(data[i][xKey]))
          } else {
            const categories = xValues.map(String)
            const pointX = scalePoint<string>()
              .domain(categories)
              .range([0, width])
              .padding(0.5)
            xAxisScale = pointX
            getX = (d: DataPoint) => pointX(String(d[xKey])) ?? 0
            getXByIndex = (i: number) => pointX(String(data[i][xKey])) ?? 0
          }

          // Build y scale
          let yMax: number
          if (stacked) {
            yMax = Math.max(
              ...data.map((d) =>
                series.reduce((sum, s) => sum + (Number(d[s.key]) || 0), 0),
              ),
            )
          } else {
            yMax = Math.max(
              ...data.flatMap((d) =>
                series.map((s) => Number(d[s.key]) || 0),
              ),
            )
          }

          const yScale = scaleLinear<number, number>()
            .domain([0, yMax * 1.1])
            .range([innerHeight, 0])
            .nice()

          const curveType = curved ? curveMonotoneX : curveLinear

          // Shared tooltip render function
          const renderTooltipZones = () =>
            data.map((d, i) => {
              const cx = getX(d)
              const sliceWidth = width / Math.max(data.length - 1, 1)
              return (
                <rect
                  key={`hover-${i}`}
                  x={cx - sliceWidth / 2}
                  y={0}
                  width={sliceWidth}
                  height={innerHeight}
                  fill="transparent"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget
                      .closest('div')
                      ?.getBoundingClientRect()
                    show(
                      e.clientX - (rect?.left ?? 0),
                      e.clientY - (rect?.top ?? 0),
                      <div>
                        <div className="font-medium">
                          {String(d[xKey])}
                        </div>
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
                      </div>,
                    )
                  }}
                  onMouseLeave={hide}
                />
              )
            })

          // Shared gradient definitions
          const renderGradientDefs = () =>
            gradient ? (
              <defs>
                {series.map((_, sIdx) => (
                  <linearGradient
                    key={`grad-${sIdx}`}
                    id={`${chartId}-gradient-${sIdx}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={colors[sIdx]}
                      stopOpacity={fillOpacity}
                    />
                    <stop
                      offset="100%"
                      stopColor={colors[sIdx]}
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                ))}
              </defs>
            ) : null

          // Shared axes
          const renderAxes = () => (
            <>
              <Axis
                scale={xAxisScale as AnyScale}
                orientation="bottom"
                transform={`translate(0,${innerHeight})`}
                label={xLabel}
              />
              <Axis scale={yScale} orientation="left" label={yLabel} />
            </>
          )

          // Stacked layout
          if (stacked) {
            const seriesKeys = series.map((s) => s.key)
            const stackGen = stack<StackableRow>()
              .keys(seriesKeys)
              .order(stackOrderNone)
              .offset(stackOffsetNone)

            // Coerce data to StackableRow (numeric values for series keys)
            const numericData: StackableRow[] = data.map((d) => {
              const row: StackableRow = { [xKey]: String(d[xKey]) }
              for (const s of series) {
                row[s.key] = Number(d[s.key]) || 0
              }
              return row
            })

            const stackedData = stackGen(numericData)

            const areaGen = area<[number, number]>()
              .curve(curveType)
              .x((_, i) => getXByIndex(i))
              .y0((d) => yScale(d[0]))
              .y1((d) => yScale(d[1]))

            const lineGen = line<[number, number]>()
              .curve(curveType)
              .x((_, i) => getXByIndex(i))
              .y((d) => yScale(d[1]))

            return (
              <>
                {renderGradientDefs()}

                {/* Grid */}
                {showGrid && (
                  <GridLines
                    width={width}
                    height={innerHeight}
                    yScale={yScale}
                    horizontal
                  />
                )}

                {/* Stacked areas (render in reverse so first series is on top) */}
                {[...stackedData].reverse().map((layer, reversedIdx) => {
                  const seriesIdx = stackedData.length - 1 - reversedIdx
                  const layerData = layer as unknown as [number, number][]
                  const areaD = areaGen(layerData) ?? ''
                  const lineD = lineGen(layerData) ?? ''
                  const fillColor = gradient
                    ? `url(#${chartId}-gradient-${seriesIdx})`
                    : colors[seriesIdx]

                  return (
                    <g key={series[seriesIdx].key}>
                      <path
                        d={areaD}
                        fill={fillColor}
                        opacity={gradient ? 1 : fillOpacity}
                      />
                      <path
                        d={lineD}
                        fill="none"
                        stroke={colors[seriesIdx]}
                        strokeWidth={strokeWidth}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    </g>
                  )
                })}

                {/* Tooltip hover zones */}
                {showTooltip && renderTooltipZones()}

                {renderAxes()}
              </>
            )
          }

          // Non-stacked areas
          const areaGen = area<DataPoint>()
            .curve(curveType)
            .defined((d) => d !== undefined && d !== null)

          const lineGen = line<DataPoint>()
            .curve(curveType)
            .defined((d) => d !== undefined && d !== null)

          return (
            <>
              {renderGradientDefs()}

              {/* Grid */}
              {showGrid && (
                <GridLines
                  width={width}
                  height={innerHeight}
                  yScale={yScale}
                  horizontal
                />
              )}

              {/* Areas (render in reverse so first series is visually on top) */}
              {[...series].reverse().map((s, reversedIdx) => {
                const seriesIdx = series.length - 1 - reversedIdx

                const areaPath = areaGen
                  .x((d) => getX(d))
                  .y0(innerHeight)
                  .y1((d) => yScale(Number(d[s.key]) || 0))

                const linePath = lineGen
                  .x((d) => getX(d))
                  .y((d) => yScale(Number(d[s.key]) || 0))

                const areaD = areaPath(data) ?? ''
                const lineD = linePath(data) ?? ''

                const fillColor = gradient
                  ? `url(#${chartId}-gradient-${seriesIdx})`
                  : colors[seriesIdx]

                return (
                  <g key={s.key}>
                    <path
                      d={areaD}
                      fill={fillColor}
                      opacity={gradient ? 1 : fillOpacity}
                    />
                    <path
                      d={lineD}
                      fill="none"
                      stroke={colors[seriesIdx]}
                      strokeWidth={strokeWidth}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  </g>
                )
              })}

              {/* Tooltip hover zones */}
              {showTooltip && renderTooltipZones()}

              {renderAxes()}
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
AreaChart.displayName = 'AreaChart'
