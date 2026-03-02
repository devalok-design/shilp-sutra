import * as React from 'react'
import { useRef, useEffect } from 'react'
import { axisBottom, axisLeft, axisRight, axisTop } from 'd3-axis'
import { select } from 'd3-selection'
import type { ScaleLinear, ScaleBand, ScaleTime } from 'd3-scale'

type AnyScale =
  | ScaleLinear<number, number>
  | ScaleBand<string>
  | ScaleTime<number, number>

interface AxisProps {
  scale: AnyScale
  orientation: 'top' | 'right' | 'bottom' | 'left'
  transform?: string
  tickCount?: number
  tickFormat?: (value: unknown) => string
  label?: string
  className?: string
}

export function Axis({
  scale,
  orientation,
  transform,
  tickCount,
  tickFormat,
  label,
  className,
}: AxisProps) {
  const ref = useRef<SVGGElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const axisFn = {
      top: axisTop,
      right: axisRight,
      bottom: axisBottom,
      left: axisLeft,
    }[orientation]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let axis = axisFn(scale as any)
    if (tickCount) axis = axis.ticks(tickCount)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (tickFormat) axis = axis.tickFormat(tickFormat as any)

    const g = select(ref.current)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    g.call(axis as any)

    // Style using design tokens
    g.selectAll('.tick line').attr('stroke', 'var(--color-border-subtle)')
    g.selectAll('.tick text')
      .attr('fill', 'var(--color-text-secondary)')
      .attr('font-size', 'var(--font-size-xs)')
    g.selectAll('.domain').attr('stroke', 'var(--color-border-default)')
  }, [scale, orientation, tickCount, tickFormat])

  const labelProps =
    orientation === 'bottom'
      ? { x: '50%', dy: 35 }
      : orientation === 'left'
        ? { transform: 'rotate(-90)', y: -40, x: 0 }
        : {}

  return (
    <g ref={ref} transform={transform} className={className}>
      {label && (
        <text
          textAnchor="middle"
          fill="var(--color-text-secondary)"
          fontSize="var(--font-size-sm)"
          {...labelProps}
        >
          {label}
        </text>
      )}
    </g>
  )
}
