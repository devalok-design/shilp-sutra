'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
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
})
