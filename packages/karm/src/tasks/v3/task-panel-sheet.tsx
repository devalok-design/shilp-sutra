'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { Sheet, SheetContent, SheetTitle } from '@/ui/sheet'
import { VisuallyHidden } from '@/ui/visually-hidden'
import { useTaskPanel } from './task-panel-context'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TaskPanelSheetProps {
  open: boolean
  onClose: () => void
  className?: string
  children: React.ReactNode
}

// ---------------------------------------------------------------------------
// SheetContainer
// ---------------------------------------------------------------------------

export function TaskPanelSheet({
  open,
  onClose,
  className,
  children,
}: TaskPanelSheetProps) {
  const { task } = useTaskPanel()

  return (
    <Sheet open={open} onOpenChange={(value) => !value && onClose()}>
      <SheetContent
        side="right"
        className={cn('w-[480px] sm:max-w-[480px] bg-surface-raised', className)}
      >
        <VisuallyHidden>
          <SheetTitle>{task.title}</SheetTitle>
        </VisuallyHidden>
        {children}
      </SheetContent>
    </Sheet>
  )
}

TaskPanelSheet.displayName = 'TaskPanelSheet'
