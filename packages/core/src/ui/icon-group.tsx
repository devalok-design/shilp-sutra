'use client'

import * as React from 'react'
import { cn } from './lib/utils'
import { IconProvider, type IconSize, type IconStroke } from './icon-context'

const gapClasses = {
  tight: 'gap-0.5',
  default: 'gap-1',
  loose: 'gap-2',
} as const

export interface IconGroupProps {
  /** Icon size for all children */
  size?: IconSize
  /** Stroke weight for all children */
  stroke?: IconStroke
  /** Gap between icons. Default: 'default' (4px) */
  gap?: 'tight' | 'default' | 'loose'
  /** Accessible label — required when role is "toolbar" */
  label?: string
  /** Set to "toolbar" for formatting toolbars. Default: no role. */
  role?: 'toolbar'
  className?: string
  children: React.ReactNode
}

const IconGroup = React.forwardRef<HTMLDivElement, IconGroupProps>(({
  size,
  stroke,
  gap = 'default',
  label,
  role: ariaRole,
  className,
  children,
}, ref) => {
  return (
    <IconProvider size={size} stroke={stroke}>
      <div
        ref={ref}
        role={ariaRole}
        aria-label={ariaRole ? label : undefined}
        className={cn('inline-flex items-center', gapClasses[gap], className)}
      >
        {children}
      </div>
    </IconProvider>
  )
})
IconGroup.displayName = 'IconGroup'

export { IconGroup }
