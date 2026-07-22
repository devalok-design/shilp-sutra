'use client'

import * as React from 'react'

import { Badge, type BadgeProps } from './badge'
import { cn } from './lib/utils'

const GAP_CLASSES = {
  tight: 'gap-1',
  default: 'gap-1.5',
  loose: 'gap-2',
} as const

export interface BadgeGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number
  gap?: keyof typeof GAP_CLASSES
  size?: BadgeProps['size']
  onOverflowClick?: () => void
  children: React.ReactNode
}

export const BadgeGroup = React.forwardRef<HTMLDivElement, BadgeGroupProps>(function BadgeGroup(
  { max, gap = 'default', size, onOverflowClick, className, children, ...rest },
  ref,
) {
  const childArray = React.Children.toArray(children)
  const total = childArray.length
  const hasOverflow = max !== undefined && total > max
  const visible = hasOverflow ? childArray.slice(0, max) : childArray
  const overflowCount = hasOverflow ? total - max! : 0

  return (
    <div
      ref={ref}
      className={cn('flex flex-wrap items-center', GAP_CLASSES[gap], className)}
      {...rest}
    >
      {visible}
      {hasOverflow && (
        // With onClick, Badge renders a real, keyboard-reachable <button>; add a
        // label since "+N" alone isn't descriptive to a screen reader.
        <Badge
          variant="outline"
          color="neutral"
          size={size ?? 'sm'}
          onClick={onOverflowClick}
          aria-label={onOverflowClick ? `Show ${overflowCount} more` : undefined}
        >
          +{overflowCount}
        </Badge>
      )}
    </div>
  )
})

BadgeGroup.displayName = 'BadgeGroup'
