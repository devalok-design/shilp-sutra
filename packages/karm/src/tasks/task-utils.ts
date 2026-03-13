/**
 * Shared utilities for task tab components.
 */

import { formatRelativeTime } from '@/ui/lib/date-utils'

/**
 * Like formatRelativeTime but includes time in the >7d fallback.
 */
export function formatTimestamp(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffDays < 7) return formatRelativeTime(dateStr)

  return date.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
