// Domain constants for task components — internal to karm/, not exported publicly

export const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
}

export const PRIORITY_DOT_COLORS: Record<string, string> = {
  LOW: 'bg-category-slate-9',
  MEDIUM: 'bg-warning-9',
  HIGH: 'bg-error-9',
  URGENT: 'bg-error-9',
}

export const PRIORITY_ICON_CONFIG: Record<string, { icon: string; className: string }> = {
  URGENT: { icon: 'IconAlertTriangleFilled', className: 'text-error-9' },
  HIGH: { icon: 'IconArrowUp', className: 'text-warning-9' },
  MEDIUM: { icon: 'IconMinus', className: 'text-surface-fg-muted' },
  LOW: { icon: 'IconArrowDown', className: 'text-surface-fg-subtle' },
}

export type BadgeColor = 'default' | 'info' | 'success' | 'error' | 'warning' | 'brand' | 'accent' | 'teal' | 'amber' | 'slate' | 'indigo' | 'cyan' | 'orange' | 'emerald'

export interface ReviewStatusConfig {
  color: BadgeColor
  label: string
}

export const REVIEW_STATUS_MAP: Record<string, ReviewStatusConfig> = {
  PENDING: { color: 'warning', label: 'Pending' },
  APPROVED: { color: 'success', label: 'Approved' },
  CHANGES_REQUESTED: { color: 'brand', label: 'Changes Requested' },
  REJECTED: { color: 'error', label: 'Rejected' },
}
