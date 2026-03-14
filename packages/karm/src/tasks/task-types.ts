// ============================================================
// Shared domain types for the task panel
// ============================================================

// --- Scalar type aliases ---

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export type Visibility = 'INTERNAL' | 'EVERYONE'

export type CommentAuthorType = 'INTERNAL' | 'CLIENT'

// --- Option types ---

export interface LabelOption {
  name: string
  color?: string
}

// --- Entity types ---

export interface Member {
  id: string
  name: string
  email?: string
  image?: string | null
}

export interface Column {
  id: string
  name: string
  isDefault?: boolean
  isTerminal?: boolean
}

export interface Subtask {
  id: string
  title: string
  priority: Priority
  columnId: string
  column?: { id: string; name: string; isTerminal?: boolean }
  assignees: {
    user: { id: string; name: string; image?: string | null }
  }[]
}

export interface ReviewUser {
  id: string
  name: string
  image: string | null
}

export interface ReviewRequest {
  id: string
  taskId: string
  status: 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED'
  feedback: string | null
  requestedBy: ReviewUser
  reviewer: ReviewUser
  createdAt: string
  updatedAt: string
}

export interface CommentAuthor {
  id: string
  name: string
  email?: string
  image?: string | null
}

export interface Comment {
  id: string
  taskId: string
  authorType: CommentAuthorType
  authorId: string
  content: string
  createdAt: string
  updatedAt: string
  internalAuthor?: CommentAuthor | null
  clientAuthor?: { id: string; name: string; email: string } | null
}

export interface TaskFile {
  id: string
  taskId: string
  title: string
  fileUrl: string
  downloadUrl?: string
  fileType: string | null
  uploadedBy: {
    id: string
    name: string
    image: string | null
  }
  createdAt: string
  /** External link (e.g. Google Drive) displayed alongside the download button */
  externalUrl?: string
  /** Label for the external link tooltip (default: "Open externally") */
  externalLabel?: string
}

export interface AuditLogEntry {
  id: string
  timestamp: string
  actorType: 'USER' | 'CLIENT' | 'SYSTEM' | 'AGENT'
  actorId: string | null
  action: string
  entityType: string
  entityId: string
  projectId: string | null
  metadata: Record<string, unknown> | null
}
