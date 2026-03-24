'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type {
  ClientMode,
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
  clientMode: ClientMode
  currentUserId: string | null
  timeline: TimelineEntry[]
  lastViewedAt?: string

  // Callbacks
  onUpdateTitle: (title: string) => void
  onUpdateDescription: (content: string) => void
  onUpdateStatus: (statusId: string) => void
  onUpdatePriority: (priority: string) => void
  onAddAssignee: (memberId: string) => void
  onRemoveAssignee: (memberId: string) => void
  onAddLead: (memberId: string) => void
  onRemoveLead: (memberId: string) => void
  onUpdateDueDate: (date: Date | null) => void
  onUpdateStartDate: (date: Date | null) => void
  onUpdatePhase: (phaseId: string | null) => void
  onPostComment: (content: string, visibility?: 'INTERNAL' | 'CLIENT') => void
  onToggleVisibility: () => void
  onToggleSubtask: (subtaskId: string) => void
  onAddSubtask: (title: string) => void
  onAddLabel: (label: string) => void
  onRemoveLabel: (label: string) => void
  onApproveReview: () => void
  onRequestChanges: (comment: string) => void
  onEditComment: (commentId: string, newContent: string) => void
  onDeleteComment: (commentId: string) => void
  onReact: (entryId: string, emoji: string) => void
  onDeleteTask: () => void
  onMoveToProject: (projectId: string) => void
  onDuplicateTask: () => void
  onCopyLink: () => void
  onUploadFile: (file: File) => void
  onDeleteFile: (fileId: string) => void
  onClose: () => void
  onExpand: () => void
  onNavigatePrev?: () => void
  onNavigateNext?: () => void

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
  /** Accepts `boolean` for backward compat — `true` normalizes to `'VIEW_ONLY'`. */
  clientMode: boolean | 'VIEW_ONLY' | 'COLLABORATOR'
  currentUserId: string | null
  timeline: TimelineEntry[]
  lastViewedAt?: string
  children: ReactNode

  // Callbacks (optional on provider — default to noop)
  onUpdateTitle?: (title: string) => void
  onUpdateDescription?: (content: string) => void
  onUpdateStatus?: (statusId: string) => void
  onUpdatePriority?: (priority: string) => void
  onAddAssignee?: (memberId: string) => void
  onRemoveAssignee?: (memberId: string) => void
  onAddLead?: (memberId: string) => void
  onRemoveLead?: (memberId: string) => void
  onUpdateDueDate?: (date: Date | null) => void
  onUpdateStartDate?: (date: Date | null) => void
  onUpdatePhase?: (phaseId: string | null) => void
  onPostComment?: (content: string, visibility?: 'INTERNAL' | 'CLIENT') => void
  onToggleVisibility?: () => void
  onToggleSubtask?: (subtaskId: string) => void
  onAddSubtask?: (title: string) => void
  onAddLabel?: (label: string) => void
  onRemoveLabel?: (label: string) => void
  onApproveReview?: () => void
  onRequestChanges?: (comment: string) => void
  onEditComment?: (commentId: string, newContent: string) => void
  onDeleteComment?: (commentId: string) => void
  onReact?: (entryId: string, emoji: string) => void
  onDeleteTask?: () => void
  onMoveToProject?: (projectId: string) => void
  onDuplicateTask?: () => void
  onCopyLink?: () => void
  onUploadFile?: (file: File) => void
  onDeleteFile?: (fileId: string) => void
  onClose?: () => void
  onExpand?: () => void
  onNavigatePrev?: () => void
  onNavigateNext?: () => void

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
  // Normalize boolean clientMode for backward compat: true → 'VIEW_ONLY'
  const normalizedClientMode: ClientMode =
    value.clientMode === true
      ? 'VIEW_ONLY'
      : value.clientMode === false
        ? false
        : value.clientMode

  const stable = useMemo<TaskPanelContextValue>(
    () => ({
      task: value.task,
      mode: value.mode,
      clientMode: normalizedClientMode,
      currentUserId: value.currentUserId,
      timeline: value.timeline,
      lastViewedAt: value.lastViewedAt,

      onUpdateTitle: value.onUpdateTitle ?? noop,
      onUpdateDescription: value.onUpdateDescription ?? noop,
      onUpdateStatus: value.onUpdateStatus ?? noop,
      onUpdatePriority: value.onUpdatePriority ?? noop,
      onAddAssignee: value.onAddAssignee ?? noop,
      onRemoveAssignee: value.onRemoveAssignee ?? noop,
      onAddLead: value.onAddLead ?? noop,
      onRemoveLead: value.onRemoveLead ?? noop,
      onUpdateDueDate: value.onUpdateDueDate ?? noop,
      onUpdateStartDate: value.onUpdateStartDate ?? noop,
      onUpdatePhase: value.onUpdatePhase ?? noop,
      onPostComment: value.onPostComment ?? noop,
      onToggleVisibility: value.onToggleVisibility ?? noop,
      onToggleSubtask: value.onToggleSubtask ?? noop,
      onAddSubtask: value.onAddSubtask ?? noop,
      onAddLabel: value.onAddLabel ?? noop,
      onRemoveLabel: value.onRemoveLabel ?? noop,
      onApproveReview: value.onApproveReview ?? noop,
      onRequestChanges: value.onRequestChanges ?? noop,
      onEditComment: value.onEditComment ?? noop,
      onDeleteComment: value.onDeleteComment ?? noop,
      onReact: value.onReact ?? noop,
      onDeleteTask: value.onDeleteTask ?? noop,
      onMoveToProject: value.onMoveToProject ?? noop,
      onDuplicateTask: value.onDuplicateTask ?? noop,
      onCopyLink: value.onCopyLink ?? noop,
      onUploadFile: value.onUploadFile ?? noop,
      onDeleteFile: value.onDeleteFile ?? noop,
      onClose: value.onClose ?? noop,
      onExpand: value.onExpand ?? noop,
      onNavigatePrev: value.onNavigatePrev,
      onNavigateNext: value.onNavigateNext,

      isAgentStreaming: value.isAgentStreaming,
      agentStreamingText: value.agentStreamingText,
      onCancelAgentStream: value.onCancelAgentStream,
      typingUsers: value.typingUsers,
    }),
    [
      value.task,
      value.mode,
      normalizedClientMode,
      value.currentUserId,
      value.timeline,
      value.lastViewedAt,
      value.onUpdateTitle,
      value.onUpdateDescription,
      value.onUpdateStatus,
      value.onUpdatePriority,
      value.onAddAssignee,
      value.onRemoveAssignee,
      value.onAddLead,
      value.onRemoveLead,
      value.onUpdateDueDate,
      value.onUpdateStartDate,
      value.onUpdatePhase,
      value.onPostComment,
      value.onToggleVisibility,
      value.onToggleSubtask,
      value.onAddSubtask,
      value.onAddLabel,
      value.onRemoveLabel,
      value.onApproveReview,
      value.onRequestChanges,
      value.onEditComment,
      value.onDeleteComment,
      value.onReact,
      value.onDeleteTask,
      value.onMoveToProject,
      value.onDuplicateTask,
      value.onCopyLink,
      value.onUploadFile,
      value.onDeleteFile,
      value.onClose,
      value.onExpand,
      value.onNavigatePrev,
      value.onNavigateNext,
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
