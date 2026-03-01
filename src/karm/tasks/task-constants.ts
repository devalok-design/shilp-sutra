// Domain constants for task components — internal to karm/, not exported publicly

export const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
}

export const PRIORITY_DOT_COLORS: Record<string, string> = {
  LOW: 'bg-[var(--color-info)]',
  MEDIUM: 'bg-[var(--color-warning)]',
  HIGH: 'bg-[var(--color-error)]',
  URGENT: 'bg-[var(--color-error)]',
}

export type BadgeVariant = 'neutral' | 'blue' | 'green' | 'red' | 'yellow' | 'magenta' | 'purple'

export interface ReviewStatusConfig {
  variant: BadgeVariant
  label: string
}

export const REVIEW_STATUS_MAP: Record<string, ReviewStatusConfig> = {
  PENDING: { variant: 'yellow', label: 'Pending' },
  APPROVED: { variant: 'green', label: 'Approved' },
  CHANGES_REQUESTED: { variant: 'magenta', label: 'Changes Requested' },
  REJECTED: { variant: 'red', label: 'Rejected' },
}
