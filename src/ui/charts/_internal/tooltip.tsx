import * as React from 'react'
import { useState, useCallback } from 'react'
import { cn } from '../../lib/utils'

interface TooltipState {
  visible: boolean
  x: number
  y: number
  content: React.ReactNode
}

interface ChartTooltipProps {
  state: TooltipState
  className?: string
}

export function ChartTooltip({ state, className }: ChartTooltipProps) {
  if (!state.visible) return null

  return (
    <div
      className={cn(
        'pointer-events-none absolute z-tooltip',
        'rounded-ds-md border border-border',
        'bg-layer-01 px-ds-03 py-ds-02',
        'shadow-02',
        'text-ds-sm text-text-primary',
        className,
      )}
      style={{ left: state.x + 12, top: state.y - 12 }}
    >
      {state.content}
    </div>
  )
}

/** Hook to manage chart tooltip state */
export function useChartTooltip() {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    content: null,
  })

  const show = useCallback((x: number, y: number, content: React.ReactNode) => {
    setTooltip({ visible: true, x, y, content })
  }, [])

  const hide = useCallback(() => {
    setTooltip((prev) => ({ ...prev, visible: false }))
  }, [])

  return { tooltip, show, hide }
}

export type { TooltipState, ChartTooltipProps }
