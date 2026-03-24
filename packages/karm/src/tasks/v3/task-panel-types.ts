import type React from 'react'
import type { Comment, CommentAuthorType, CommentAuthor, Subtask } from '../task-types'

// Re-export existing types used by v3 components
export type { Comment, CommentAuthorType, CommentAuthor, Subtask }

// ---------------------------------------------------------------------------
// View modes
// ---------------------------------------------------------------------------

export type TaskPanelMode = 'peek' | 'side' | 'full'

// ---------------------------------------------------------------------------
// Reactions (comments and agent responses)
// ---------------------------------------------------------------------------

export interface Reaction {
  emoji: string
  count: number
  /** Whether the current user has reacted with this emoji */
  reacted: boolean
}

// ---------------------------------------------------------------------------
// Timeline
// ---------------------------------------------------------------------------

export type TimelineEntry =
  | { type: 'comment'; comment: Comment; reactions?: Reaction[]; deleted?: boolean }
  | { type: 'system-event'; event: SystemEvent }
  | { type: 'review-event'; event: ReviewEvent }
  | { type: 'agent-response'; response: AgentResponse; reactions?: Reaction[] }

export interface SystemEvent {
  id: string
  actorId: string
  actorName: string
  action:
    | 'status-change'
    | 'assignment'
    | 'priority'
    | 'label-add'
    | 'label-remove'
    | 'due-date'
    | 'visibility'
  description: string
  timestamp: string
}

export interface ReviewEvent {
  id: string
  reviewerId: string
  reviewerName: string
  action: 'submitted' | 'approved' | 'changes-requested'
  comment?: string
  timestamp: string
}

/**
 * Agent messages use this type exclusively, NOT the Comment type.
 * Agents have icon, summary, streaming -- fields that don't belong on Comment.
 */
export interface AgentResponse {
  id: string
  agentId: string
  agentName: string
  agentIcon?: React.ReactNode
  content: string
  summary?: string
  isStreaming?: boolean
  timestamp: string
}

// ---------------------------------------------------------------------------
// Files attached to a task
// ---------------------------------------------------------------------------

export interface TaskFile {
  id: string
  name: string
  fileUrl: string
  downloadUrl: string
  fileType: string
  size: number
  uploadedBy: { id: string; name: string; image?: string | null }
  createdAt: string
  gDriveUrl?: string
  isClientVisible?: boolean
}

// ---------------------------------------------------------------------------
// Client permission mode
// ---------------------------------------------------------------------------

/**
 * `false` = staff (not a client).
 * `'VIEW_ONLY'` = client can view but not edit.
 * `'COLLABORATOR'` = client can edit certain fields.
 */
export type ClientMode = false | 'VIEW_ONLY' | 'COLLABORATOR'

// ---------------------------------------------------------------------------
// Task shape for the panel
// ---------------------------------------------------------------------------

export interface TaskPanelTask {
  id: string
  /** Display ID, e.g. "KRM-847" */
  taskId: string
  title: string
  description: string
  descriptionUpdatedBy?: { name: string; timestamp: string }
  status: string
  statusOptions: { id: string; name: string }[]
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  assignees: { id: string; name: string; image?: string | null; bandwidth?: 'HEALTHY' | 'ELEVATED' | 'OVERLOADED'; isOnLeave?: boolean }[]
  leads: { id: string; name: string; image?: string | null; bandwidth?: 'HEALTHY' | 'ELEVATED' | 'OVERLOADED'; isOnLeave?: boolean }[]
  members: { id: string; name: string; image?: string | null }[]
  dueDate: string | null
  labels: string[]
  visibility: 'INTERNAL' | 'EVERYONE'
  project?: string
  createdAt: string
  updatedAt: string
  subtasks: Subtask[]
  isInReview: boolean
  reviewSubmittedBy?: { name: string; timestamp: string }
  reviewFiles?: { name: string; size: string }[]
  startDate: string | null
  phase?: { id: string; name: string } | null
  phaseOptions?: { id: string; name: string }[]
  createdByType?: 'LOKWASI' | 'CLIENT' | 'SYSTEM'
  createdByName?: string
  humanId?: string
  projectName?: string
  parentTaskId?: string | null
  files?: TaskFile[]
}
