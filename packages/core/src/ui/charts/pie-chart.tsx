'use client'

import * as React from 'react'
import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { pie as d3Pie, arc as d3Arc } from 'd3-shape'
import type { PieArcDatum } from 'd3-shape'
import { cn } from '../lib/utils'
import { tweens, motionProps } from '../lib/motion'
import { Legend } from './_internal/legend'
import { ChartTooltip, useChartTooltip } from './_internal/tooltip'
import { resolveColor } from './_internal/colors'
import { useReducedMotion } from './_internal/animation'

interface PieSlice {
  label: string
  value: number
  color?: string
}

export interface PieChartProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Data with label and value */
  data: PieSlice[]
  /** Pie or donut variant */
  variant?: 'pie' | 'donut'
  /** Inner radius ratio for donut (0-1, default 0.6) */
  innerRadius?: number
  /** Gap angle between slices in radians */
  padAngle?: number
  /** Corner radius for slice edges */
  cornerRadius?: number
  /** Chart height (and width, since pie is square) */
  height?: number
  /** Show tooltip on hover */
  showTooltip?: boolean
  /** Show legend */
  showLegend?: boolean
  /** Show percentage labels on/near slices */
  showLabels?: boolean
  /** Animate slices */
  animate?: boolean
  className?: string
  /** Content to show in center of donut */
  centerLabel?: React.ReactNode
}

export const PieChart = React.forwardRef<HTMLDivElement, PieChartProps>(
  (
    {
      data,
      variant = 'pie',
      innerRadius: innerRadiusRatio = 0.6,
      padAngle = 0,
      cornerRadius = 0,
      height = 300,
      showTooltip = true,
      showLegend = false,
      showLabels = false,
      animate = true,
      className,
      centerLabel,
      ...props
    },
    ref,
  ) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const { tooltip, show, hide } = useChartTooltip()
  const reducedMotion = useReducedMotion()
  const shouldAnimate = animate && !reducedMotion

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) setContainerWidth(entry.contentRect.width)
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // Pie chart is square — use the smaller of width/height
  const size = containerWidth > 0 ? Math.min(containerWidth, height) : height
  const outerRadius = size / 2
  const innerR = variant === 'donut' ? outerRadius * innerRadiusRatio : 0

  // Resolve colors for each slice
  const colors = data.map((d, i) => resolveColor(d.color, i))

  // Compute total for percentages
  const total = data.reduce((sum, d) => sum + d.value, 0)

  // D3 pie layout
  const pieLayout = d3Pie<PieSlice>()
    .value((d) => d.value)
    .padAngle(padAngle)
    .sort(null)

  const arcs = pieLayout(data)

  // D3 arc generator
  const arcGenerator = d3Arc<PieArcDatum<PieSlice>>()
    .innerRadius(innerR)
    .outerRadius(outerRadius - 2) // slight inset so hover offset doesn't clip
    .cornerRadius(cornerRadius)

  // Label arc — position labels at 70% of the way from inner to outer radius
  const labelRadius = innerR + (outerRadius - 2 - innerR) * 0.7
  const labelArc = d3Arc<PieArcDatum<PieSlice>>()
    .innerRadius(labelRadius)
    .outerRadius(labelRadius)

  return (
    <motion.div
      ref={(node) => {
        (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
      }}
      className={cn('relative w-full', className)}
      {...(shouldAnimate
        ? { initial: { opacity: 0, scale: 0.96 }, animate: { opacity: 1, scale: 1 }, transition: tweens.fade }
        : {})}
      {...motionProps(props)}
    >
      {containerWidth > 0 && (
        <>
          <svg
            width={containerWidth}
            height={height}
            role="img"
            aria-label="Pie chart"
          >
            <g transform={`translate(${containerWidth / 2},${height / 2})`}>
              {arcs.map((d, i) => {
                const path = arcGenerator(d)
                if (!path) return null

                // Hover offset: push slice outward along its centroid angle
                const [cx, cy] = arcGenerator.centroid(d)
                const angle = Math.atan2(cy, cx)
                const offsetX = Math.cos(angle) * 4
                const offsetY = Math.sin(angle) * 4
                const isHovered = hoveredIndex === i

                return (
                  <path
                    key={`slice-${d.data.label}-${i}`}
                    d={path}
                    fill={colors[i]}
                    className="cursor-pointer transition-transform"
                    style={{
                      transform: isHovered
                        ? `translate(${offsetX}px, ${offsetY}px)`
                        : undefined,
                    }}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseMove={(e) => {
                      if (showTooltip) {
                        const rect = e.currentTarget
                          .closest('div')
                          ?.getBoundingClientRect()
                        const pct =
                          total > 0
                            ? ((d.data.value / total) * 100).toFixed(1)
                            : '0'
                        show(
                          e.clientX - (rect?.left ?? 0),
                          e.clientY - (rect?.top ?? 0),
                          <div>
                            <div className="font-medium">{d.data.label}</div>
                            <div>
                              {d.data.value.toLocaleString()} ({pct}%)
                            </div>
                          </div>,
                        )
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredIndex(null)
                      hide()
                    }}
                  />
                )
              })}

              {/* Percentage labels */}
              {showLabels &&
                arcs.map((d, i) => {
                  const [lx, ly] = labelArc.centroid(d)
                  const pct =
                    total > 0
                      ? ((d.data.value / total) * 100).toFixed(0)
                      : '0'

                  // Skip tiny slices (< 3%) to avoid label overlap
                  if (total > 0 && d.data.value / total < 0.03) return null

                  return (
                    <text
                      key={`label-${d.data.label}-${i}`}
                      x={lx}
                      y={ly}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="pointer-events-none fill-accent-fg text-ds-xs font-medium"
                    >
                      {pct}%
                    </text>
                  )
                })}

              {/* Center label for donut variant */}
              {variant === 'donut' && centerLabel && innerR > 0 && (
                <foreignObject
                  x={-innerR * 0.7}
                  y={-innerR * 0.7}
                  width={innerR * 1.4}
                  height={innerR * 1.4}
                >
                  <div className="flex h-full w-full items-center justify-center text-center text-surface-fg">
                    {centerLabel}
                  </div>
                </foreignObject>
              )}
            </g>
          </svg>

          {/* Tooltip overlay */}
          {showTooltip && <ChartTooltip state={tooltip} />}
        </>
      )}

      {/* Legend */}
      {showLegend && (
        <Legend
          items={data.map((d, i) => ({
            label: d.label,
            color: colors[i],
          }))}
          className="mt-ds-04"
        />
      )}
    </motion.div>
  )
  },
)
PieChart.displayName = 'PieChart'
