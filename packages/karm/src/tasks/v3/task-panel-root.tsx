'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import {
  TaskPanelProvider,
  type TaskPanelProviderProps,
} from './task-panel-context'
import type { TaskPanelMode } from './task-panel-types'
import { TaskPanelPeek } from './task-panel-peek'
import { TaskPanelSheet } from './task-panel-sheet'
import { TaskPanelFull } from './task-panel-full'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TaskPanelRootProps extends Omit<TaskPanelProviderProps, 'children'> {
  mode: TaskPanelMode
  /** Controls open state for peek and sheet modes */
  open?: boolean
  className?: string
  children: React.ReactNode
}

// ---------------------------------------------------------------------------
// Root orchestrator
// ---------------------------------------------------------------------------

export function TaskPanelRoot({
  mode,
  open = true,
  className,
  children,
  ...providerProps
}: TaskPanelRootProps) {
  const onClose = providerProps.onClose ?? (() => {})

  return (
    <TaskPanelProvider mode={mode} onClose={providerProps.onClose} {...providerProps}>
      {mode === 'peek' && (
        <TaskPanelPeek open={open} onClose={onClose} className={className}>
          {children}
        </TaskPanelPeek>
      )}
      {mode === 'side' && (
        <TaskPanelSheet open={open} onClose={onClose} className={className}>
          {children}
        </TaskPanelSheet>
      )}
      {mode === 'full' && (
        <TaskPanelFull className={className}>
          {children}
        </TaskPanelFull>
      )}
    </TaskPanelProvider>
  )
}

TaskPanelRoot.displayName = 'TaskPanelRoot'
