// Domain constants for task components — internal to karm/, not exported publicly

export const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
}

export const PRIORITY_DOT_COLORS: Record<string, string> = {
  LOW: 'bg-[var(--color-category-slate)]',
  MEDIUM: 'bg-[var(--color-warning)]',
  HIGH: 'bg-[var(--color-error)]',
  URGENT: 'bg-[var(--color-error)]',
}

export type BadgeVariant = 'neutral' | 'info' | 'success' | 'error' | 'warning' | 'brand' | 'accent' | 'teal' | 'amber' | 'slate' | 'indigo' | 'cyan' | 'orange' | 'emerald'

export interface ReviewStatusConfig {
  variant: BadgeVariant
  label: string
}

export const REVIEW_STATUS_MAP: Record<string, ReviewStatusConfig> = {
  PENDING: { variant: 'warning', label: 'Pending' },
  APPROVED: { variant: 'success', label: 'Approved' },
  CHANGES_REQUESTED: { variant: 'brand', label: 'Changes Requested' },
  REJECTED: { variant: 'error', label: 'Rejected' },
}
