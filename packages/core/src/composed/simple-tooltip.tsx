'use client'

import * as React from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'

export interface SimpleTooltipProps {
  content: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  delayDuration?: number
  children: React.ReactNode
}

const SimpleTooltip = ({
  content,
  side = 'top',
  align = 'center',
  delayDuration = 300,
  children,
}: SimpleTooltipProps) => (
  <TooltipProvider delayDuration={delayDuration}>
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} align={align}>
        {content}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)
SimpleTooltip.displayName = 'SimpleTooltip'

export { SimpleTooltip }
