'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'

// ============================================================
// Types
// ============================================================

export interface SubtaskListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

// ============================================================
// SubtaskList
// ============================================================

const SubtaskList = React.forwardRef<HTMLDivElement, SubtaskListProps>(
  function SubtaskList({ children, className, ...props }, ref) {
    return (
      <div ref={ref} className={cn('space-y-ds-01', className)} {...props}>
        {children}
      </div>
    )
  },
)

SubtaskList.displayName = 'SubtaskList'

export { SubtaskList }
