'use client'

import * as React from 'react'
import { useState, useRef, useEffect } from 'react'
import { cn } from '../lib/utils'
import type { ChartMargin } from './_internal/types'
import { DEFAULT_MARGIN } from './_internal/types'

export interface ChartContainerProps {
  /** Fixed height in pixels */
  height?: number
  /** Chart margins */
  margin?: Partial<ChartMargin>
  className?: string
  /** Render function receiving inner dimensions (width/height minus margins) */
  children: (dimensions: {
    width: number
    height: number
    margin: ChartMargin
  }) => React.ReactNode
}

export function ChartContainer({
  height = 300,
  margin: marginOverride,
  className,
  children,
}: ChartContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  const margin = { ...DEFAULT_MARGIN, ...marginOverride }

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) setWidth(entry.contentRect.width)
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const innerWidth = Math.max(0, width - margin.left - margin.right)
  const innerHeight = Math.max(0, height - margin.top - margin.bottom)

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label="Chart">
          <g transform={`translate(${margin.left},${margin.top})`}>
            {children({ width: innerWidth, height: innerHeight, margin })}
          </g>
        </svg>
      )}
    </div>
  )
}
ChartContainer.displayName = 'ChartContainer'
