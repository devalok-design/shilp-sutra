'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'

// ============================================================
// Types
// ============================================================

export interface ScratchpadHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Title text displayed in the header */
  title?: string
}

// ============================================================
// Component
// ============================================================

const ScratchpadHeader = React.forwardRef<HTMLDivElement, ScratchpadHeaderProps>(
  function ScratchpadHeader({ title = 'Scratchpad', className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-between px-ds-05b py-ds-05', className)}
        {...props}
      >
        <span className="text-ds-base font-semibold text-surface-fg">{title}</span>
        {children && <div className="flex items-center gap-ds-02">{children}</div>}
      </div>
    )
  },
)

ScratchpadHeader.displayName = 'ScratchpadHeader'

export { ScratchpadHeader }
