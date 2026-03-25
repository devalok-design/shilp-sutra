'use client'

import * as React from 'react'
import { cn } from './lib/utils'
import { Badge, type BadgeProps } from './badge'

const GAP_CLASSES = {
  tight: 'gap-1',
  default: 'gap-1.5',
  loose: 'gap-2',
} as const

export interface BadgeGroupProps {
  max?: number
  gap?: keyof typeof GAP_CLASSES
  size?: BadgeProps['size']
  onOverflowClick?: () => void
  className?: string
  children: React.ReactNode
}

export function BadgeGroup({
  max,
  gap = 'default',
  size,
  onOverflowClick,
  className,
  children,
}: BadgeGroupProps) {
  const childArray = React.Children.toArray(children)
  const total = childArray.length
  const hasOverflow = max !== undefined && total > max
  const visible = hasOverflow ? childArray.slice(0, max) : childArray
  const overflowCount = hasOverflow ? total - max! : 0

  return (
    <div className={cn('flex flex-wrap items-center', GAP_CLASSES[gap], className)}>
      {visible}
      {hasOverflow && (
        <Badge
          variant="outline"
          color="neutral"
          size={size ?? 'sm'}
          onClick={onOverflowClick}
        >
          +{overflowCount}
        </Badge>
      )}
    </div>
  )
}

BadgeGroup.displayName = 'BadgeGroup'
