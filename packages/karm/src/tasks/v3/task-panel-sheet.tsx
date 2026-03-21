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
        className={cn(
          'sm:max-w-[640px] w-full bg-surface-raised overflow-visible [&>button[class*="absolute"]]:hidden',
          className,
        )}
      >
        <VisuallyHidden>
          <SheetTitle>{task.title}</SheetTitle>
        </VisuallyHidden>

        {/* Main content */}
        <div className="flex h-full flex-col">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  )
}

TaskPanelSheet.displayName = 'TaskPanelSheet'
