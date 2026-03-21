'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type {
  TaskPanelMode,
  TaskPanelTask,
  TimelineEntry,
} from './task-panel-types'

// ---------------------------------------------------------------------------
// Context value
// ---------------------------------------------------------------------------

export interface TaskPanelContextValue {
  task: TaskPanelTask
  mode: TaskPanelMode
  clientMode: boolean
  currentUserId: string | null
  timeline: TimelineEntry[]
  lastViewedAt?: string

  // Callbacks
  onUpdateTitle: (title: string) => void
  onUpdateDescription: (content: string) => void
  onUpdateStatus: (statusId: string) => void
  onUpdatePriority: (priority: string) => void
  onUpdateAssignee: (memberId: string | null) => void
  onUpdateDueDate: (date: Date | null) => void
  onPostComment: (content: string, authorType?: 'INTERNAL' | 'CLIENT') => void
  onToggleSubtask: (subtaskId: string) => void
  onAddSubtask: (title: string) => void
  onApproveReview: () => void
  onRequestChanges: (comment: string) => void
  onEditComment: (commentId: string, newContent: string) => void
  onReact: (entryId: string, emoji: string) => void
  onClose: () => void
  onExpand: () => void

  // Agent
  isAgentStreaming?: boolean
  agentStreamingText?: string
  onCancelAgentStream?: () => void
  typingUsers?: { name: string; image?: string | null }[]
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const TaskPanelContext = createContext<TaskPanelContextValue | null>(null)

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTaskPanel(): TaskPanelContextValue {
  const ctx = useContext(TaskPanelContext)
  if (!ctx) {
    throw new Error('useTaskPanel must be used within <TaskPanelProvider>')
  }
  return ctx
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

const noop = () => {}

export interface TaskPanelProviderProps {
  task: TaskPanelTask
  mode: TaskPanelMode
  clientMode: boolean
  currentUserId: string | null
  timeline: TimelineEntry[]
  lastViewedAt?: string
  children: ReactNode

  // Callbacks (optional on provider — default to noop)
  onUpdateTitle?: (title: string) => void
  onUpdateDescription?: (content: string) => void
  onUpdateStatus?: (statusId: string) => void
  onUpdatePriority?: (priority: string) => void
  onUpdateAssignee?: (memberId: string | null) => void
  onUpdateDueDate?: (date: Date | null) => void
  onPostComment?: (content: string, authorType?: 'INTERNAL' | 'CLIENT') => void
  onToggleSubtask?: (subtaskId: string) => void
  onAddSubtask?: (title: string) => void
  onApproveReview?: () => void
  onRequestChanges?: (comment: string) => void
  onEditComment?: (commentId: string, newContent: string) => void
  onReact?: (entryId: string, emoji: string) => void
  onClose?: () => void
  onExpand?: () => void

  // Agent
  isAgentStreaming?: boolean
  agentStreamingText?: string
  onCancelAgentStream?: () => void
  typingUsers?: { name: string; image?: string | null }[]
}

export function TaskPanelProvider({
  children,
  ...value
}: TaskPanelProviderProps) {
  const stable = useMemo<TaskPanelContextValue>(
    () => ({
      task: value.task,
      mode: value.mode,
      clientMode: value.clientMode,
      currentUserId: value.currentUserId,
      timeline: value.timeline,
      lastViewedAt: value.lastViewedAt,

      onUpdateTitle: value.onUpdateTitle ?? noop,
      onUpdateDescription: value.onUpdateDescription ?? noop,
      onUpdateStatus: value.onUpdateStatus ?? noop,
      onUpdatePriority: value.onUpdatePriority ?? noop,
      onUpdateAssignee: value.onUpdateAssignee ?? noop,
      onUpdateDueDate: value.onUpdateDueDate ?? noop,
      onPostComment: value.onPostComment ?? noop,
      onToggleSubtask: value.onToggleSubtask ?? noop,
      onAddSubtask: value.onAddSubtask ?? noop,
      onApproveReview: value.onApproveReview ?? noop,
      onRequestChanges: value.onRequestChanges ?? noop,
      onEditComment: value.onEditComment ?? noop,
      onReact: value.onReact ?? noop,
      onClose: value.onClose ?? noop,
      onExpand: value.onExpand ?? noop,

      isAgentStreaming: value.isAgentStreaming,
      agentStreamingText: value.agentStreamingText,
      onCancelAgentStream: value.onCancelAgentStream,
      typingUsers: value.typingUsers,
    }),
    [
      value.task,
      value.mode,
      value.clientMode,
      value.currentUserId,
      value.timeline,
      value.lastViewedAt,
      value.onUpdateTitle,
      value.onUpdateDescription,
      value.onUpdateStatus,
      value.onUpdatePriority,
      value.onUpdateAssignee,
      value.onUpdateDueDate,
      value.onPostComment,
      value.onToggleSubtask,
      value.onAddSubtask,
      value.onApproveReview,
      value.onRequestChanges,
      value.onEditComment,
      value.onReact,
      value.onClose,
      value.onExpand,
      value.isAgentStreaming,
      value.agentStreamingText,
      value.onCancelAgentStream,
      value.typingUsers,
    ],
  )

  return (
    <TaskPanelContext.Provider value={stable}>
      {children}
    </TaskPanelContext.Provider>
  )
}
