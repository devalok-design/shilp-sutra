'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { Skeleton } from '@/ui/skeleton'
import { TaskPanelRoot } from './task-panel-root'
import { TaskPanelHeader } from './task-panel-header'
import { TaskPanelQuickProps } from './task-panel-quick-props'
import { TaskPanelReviewBanner } from './task-panel-review-banner'
import { TaskPanelDescription } from './task-panel-description'
import { TaskPanelSubtasks } from './task-panel-subtasks'
import { TaskPanelTimeline } from './task-panel-timeline'
import { TaskPanelMessageInput } from './task-panel-message-input'
import { TaskPanelWings } from './task-panel-wings'
import { TaskPanelReviewCard } from './task-panel-wing-review'
import { TaskPanelPropertiesCard } from './task-panel-wing-properties'
import { TaskPanelFiles } from './task-panel-files'

// ---------------------------------------------------------------------------
// Layout wrappers
// ---------------------------------------------------------------------------

export interface TaskPanelBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

function TaskPanelBody({ children, className, ...props }: TaskPanelBodyProps) {
  return (
    <div className={cn('flex flex-1 overflow-hidden', className)} {...props}>
      {children}
    </div>
  )
}

TaskPanelBody.displayName = 'TaskPanelBody'

export interface TaskPanelContentProps extends React.HTMLAttributes<HTMLDivElement> {}

function TaskPanelContent({ children, className, ...props }: TaskPanelContentProps) {
  return (
    <div className={cn('flex flex-1 flex-col overflow-hidden', className)} {...props}>
      {children}
    </div>
  )
}

TaskPanelContent.displayName = 'TaskPanelContent'

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

export interface TaskPanelLoadingProps {
  className?: string
}

function TaskPanelLoading({ className }: TaskPanelLoadingProps) {
  return (
    <div className={cn('space-y-ds-06 p-ds-06', className)}>
      <Skeleton className="h-ds-xs-plus w-3/4 bg-surface-raised-hover" />
      <div className="space-y-ds-04">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-ds-04">
            <Skeleton className="h-[16px] w-[120px] bg-surface-raised-hover" />
            <Skeleton className="h-[16px] flex-1 bg-surface-raised-hover" />
          </div>
        ))}
      </div>
      <div className="flex gap-ds-05 border-b border-surface-border-strong pb-ds-03">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[12px] w-[64px] bg-surface-raised-hover" />
        ))}
      </div>
      <div className="space-y-ds-04">
        <Skeleton className="h-ds-md w-full bg-surface-raised-hover" />
        <Skeleton className="h-ds-md w-full bg-surface-raised-hover" />
        <Skeleton className="h-ds-md w-4/5 bg-surface-raised-hover" />
      </div>
    </div>
  )
}

TaskPanelLoading.displayName = 'TaskPanelLoading'

// ---------------------------------------------------------------------------
// Compound component
// ---------------------------------------------------------------------------

export const TaskPanel = Object.assign(TaskPanelRoot, {
  Header: TaskPanelHeader,
  QuickProps: TaskPanelQuickProps,
  ReviewBanner: TaskPanelReviewBanner,
  Description: TaskPanelDescription,
  Subtasks: TaskPanelSubtasks,
  Timeline: TaskPanelTimeline,
  MessageInput: TaskPanelMessageInput,
  Body: TaskPanelBody,
  Content: TaskPanelContent,
  Wings: TaskPanelWings,
  ReviewCard: TaskPanelReviewCard,
  PropertiesCard: TaskPanelPropertiesCard,
  Files: TaskPanelFiles,
  Loading: TaskPanelLoading,
})
