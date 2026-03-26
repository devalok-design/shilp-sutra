import * as React from 'react'
import { cn } from '../lib/utils'

export interface UnreadSeparatorProps {
  label?: string
  count?: number
  className?: string
}

function UnreadSeparator({
  label = 'NEW',
  count,
  className,
}: UnreadSeparatorProps) {
  return (
    <div className={cn('relative flex items-center py-ds-02', className)}>
      <div className="flex-1 border-t-2 border-accent-7" />
      <span className="px-ds-03 text-ds-xs font-semibold text-accent-11">
        {count ? `${count} ${label}` : label}
      </span>
      <div className="flex-1 border-t-2 border-accent-7" />
    </div>
  )
}
UnreadSeparator.displayName = 'UnreadSeparator'

export { UnreadSeparator }
