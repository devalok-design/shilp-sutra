'use client'

import * as React from 'react'
import { Sheet, SheetContent, SheetTitle } from '@/ui/sheet'
import { VisuallyHidden } from '@/ui/visually-hidden'
import { TaskPanel } from './task-panel'
import type { TaskPanelProviderProps } from './task-panel-context'
import type { TaskPanelMode } from './task-panel-types'

export interface TaskPanelSheetWrapperProps extends Omit<TaskPanelProviderProps, 'mode' | 'children'> {
  /** Whether the sheet is open */
  open: boolean
  /** Called when the sheet should close */
  onOpenChange: (open: boolean) => void
  /** Whether the panel is loading data */
  loading?: boolean
  /** Panel mode — defaults to 'side' */
  mode?: TaskPanelMode
  /** Panel content */
  children: React.ReactNode
}

/**
 * TaskPanelSheetWrapper — convenience wrapper that owns the Sheet + loading state.
 * Eliminates the duplicated Sheet boilerplate across all three karm-v2 consumers.
 *
 * @example
 * <TaskPanelSheetWrapper
 *   open={panel.open}
 *   onOpenChange={panel.onOpenChange}
 *   loading={panel.loading}
 *   task={panel.taskDetail}
 *   {...callbacks}
 * >
 *   <TaskPanel.Wings>...</TaskPanel.Wings>
 *   <TaskPanel.Header />
 *   <TaskPanel.Timeline />
 *   <TaskPanel.MessageInput />
 * </TaskPanelSheetWrapper>
 */
export function TaskPanelSheetWrapper({
  open,
  onOpenChange,
  loading = false,
  mode = 'side',
  children,
  ...panelProps
}: TaskPanelSheetWrapperProps) {
  return (
    <Sheet modal={false} open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-hidden p-0 sm:max-w-none sm:w-[480px] border-l border-surface-border-strong bg-surface-overlay"
      >
        <VisuallyHidden>
          <SheetTitle>Task Details</SheetTitle>
        </VisuallyHidden>
        {loading ? (
          <TaskPanel.Loading />
        ) : (
          <TaskPanel mode={mode} {...panelProps}>
            {children}
          </TaskPanel>
        )}
      </SheetContent>
    </Sheet>
  )
}

TaskPanelSheetWrapper.displayName = 'TaskPanelSheetWrapper'
