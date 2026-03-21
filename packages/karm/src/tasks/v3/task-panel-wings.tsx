'use client'

import * as React from 'react'
import { AnimatePresence } from 'framer-motion'
import { cn } from '@/ui/lib/utils'

// ---------------------------------------------------------------------------
// TaskPanelWings — composable container for wing cards left of the sheet
// ---------------------------------------------------------------------------

export interface TaskPanelWingsProps {
  children: React.ReactNode
  className?: string
}

export function TaskPanelWings({ children, className }: TaskPanelWingsProps) {
  return (
    <div
      className={cn(
        'absolute right-full top-ds-05 mr-ds-04 hidden flex-col gap-ds-03 lg:flex',
        className,
      )}
    >
      <AnimatePresence>{children}</AnimatePresence>
    </div>
  )
}

TaskPanelWings.displayName = 'TaskPanelWings'
