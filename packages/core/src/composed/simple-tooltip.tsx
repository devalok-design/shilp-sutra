'use client'

import * as React from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'

export interface SimpleTooltipProps extends Omit<React.ComponentPropsWithRef<'div'>, 'content'> {
  content: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  delayDuration?: number
  children: React.ReactNode
}

const SimpleTooltip = React.forwardRef<HTMLButtonElement, SimpleTooltipProps>(
  (
    {
      content,
      side = 'top',
      align = 'center',
      delayDuration = 300,
      children,
      className,
      ...props
    },
    ref,
  ) => (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger ref={ref} asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} align={align} className={className} {...props}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
)
SimpleTooltip.displayName = 'SimpleTooltip'

export { SimpleTooltip }
