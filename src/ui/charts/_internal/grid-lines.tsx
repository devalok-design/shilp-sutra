import * as React from 'react'
import type { ScaleLinear, ScaleTime } from 'd3-scale'

type TickableScale = ScaleLinear<number, number> | ScaleTime<number, number>

interface GridLinesProps {
  width: number
  height: number
  xScale?: TickableScale
  yScale?: TickableScale
  horizontal?: boolean
  vertical?: boolean
}

export function GridLines({
  width,
  height,
  xScale,
  yScale,
  horizontal = true,
  vertical = false,
}: GridLinesProps) {
  return (
    <g className="grid-lines">
      {horizontal &&
        yScale?.ticks &&
        yScale.ticks().map((tick: number | Date, i: number) => (
          <line
            key={`h-${i}`}
            x1={0}
            x2={width}
            y1={yScale(tick as number)}
            y2={yScale(tick as number)}
            stroke="var(--color-border-subtle)"
            strokeDasharray="3,3"
            opacity={0.6}
          />
        ))}
      {vertical &&
        xScale?.ticks &&
        xScale.ticks().map((tick: number | Date, i: number) => (
          <line
            key={`v-${i}`}
            x1={xScale(tick as number)}
            x2={xScale(tick as number)}
            y1={0}
            y2={height}
            stroke="var(--color-border-subtle)"
            strokeDasharray="3,3"
            opacity={0.6}
          />
        ))}
    </g>
  )
}
