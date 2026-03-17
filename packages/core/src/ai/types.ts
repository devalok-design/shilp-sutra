// ── Block protocol ──

export interface Block {
  type: string
  id?: string
  data: Record<string, unknown>
  confidence?: 'high' | 'medium' | 'low'
}

export interface AIResponse {
  blocks: Block[]
  conversationId?: string
  pendingAction?: {
    id: string
    label: string
    description?: string
    destructive?: boolean
  }
}

export interface ProcessingStep {
  id: string
  label: string
  status: 'pending' | 'active' | 'done' | 'error'
}

export interface ConversationMessage {
  id: string
  role: 'user' | 'assistant'
  content?: string
  blocks?: Block[]
  createdAt: Date
  steps?: ProcessingStep[]
}

// ── Block component props ──

export interface BlockComponentProps<T = Record<string, unknown>> {
  data: T
  blockId?: string
  confidence?: 'high' | 'medium' | 'low'
  onAction?: (actionId: string, type: 'confirm' | 'cancel' | 'undo') => void
}

// ── Block data shapes ──

export interface BlockTableColumn {
  key: string
  label: string
  variant?: 'badge' | 'number' | 'text'
}

export interface BlockTableData {
  columns: BlockTableColumn[]
  rows: Record<string, unknown>[]
  caption?: string
  sortable?: boolean
}

export interface ConfirmBlockData {
  actionId: string
  label: string
  description?: string
  destructive?: boolean
  rationale?: string
}

export interface SuccessBlockData {
  title: string
  message: string
  undoable?: boolean
  undoTimeout?: number
}

export interface ErrorBlockData {
  title: string
  message: string
  suggestion?: string
}

export interface LoadingBlockData {
  lines?: number
  steps?: ProcessingStep[]
}

export interface StatRowStat {
  label: string
  value: string | number
  change?: { value: string; direction: 'up' | 'down' | 'neutral' }
}

export interface StatRowBlockData {
  stats: StatRowStat[]
}
