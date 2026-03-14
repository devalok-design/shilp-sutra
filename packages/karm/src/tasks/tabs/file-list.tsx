'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'

// ============================================================
// Types
// ============================================================

export interface FileListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

// ============================================================
// FileList
// ============================================================

const FileList = React.forwardRef<HTMLDivElement, FileListProps>(
  function FileList({ children, className, ...props }, ref) {
    return (
      <div ref={ref} className={cn('space-y-ds-02', className)} {...props}>
        {children}
      </div>
    )
  },
)

FileList.displayName = 'FileList'

export { FileList }
