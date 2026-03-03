import * as React from 'react'
import { cn } from '../../lib/utils'

interface LegendItem {
  label: string
  color: string // CSS color value or var() reference
}

interface LegendProps {
  items: LegendItem[]
  position?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export function Legend({ items, position = 'bottom', className }: LegendProps) {
  const isVertical = position === 'left' || position === 'right'

  return (
    <div
      className={cn(
        'flex gap-ds-04 text-ds-sm text-text-secondary',
        isVertical ? 'flex-col' : 'flex-row flex-wrap justify-center',
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-ds-02">
          <span
            className="inline-block h-3 w-3 shrink-0 rounded-ds-sm"
            style={{ backgroundColor: item.color }}
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  )
}
Legend.displayName = 'Legend'

export type { LegendItem, LegendProps }
