// Domain constants for task components — internal to karm/, not exported publicly

export const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
}

export const PRIORITY_DOT_COLORS: Record<string, string> = {
  LOW: 'bg-blue-400',
  MEDIUM: 'bg-yellow-400',
  HIGH: 'bg-orange-400',
  URGENT: 'bg-red-500',
}

export type BadgeVariant = 'neutral' | 'blue' | 'green' | 'red' | 'yellow' | 'magenta' | 'purple'

export interface ReviewStatusConfig {
  variant: BadgeVariant
  label: string
  className: string
}

export const REVIEW_STATUS_MAP: Record<string, ReviewStatusConfig> = {
  PENDING: {
    variant: 'yellow',
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  APPROVED: {
    variant: 'green',
    label: 'Approved',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  CHANGES_REQUESTED: {
    variant: 'magenta',
    label: 'Changes Requested',
    className: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  REJECTED: {
    variant: 'red',
    label: 'Rejected',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
}
