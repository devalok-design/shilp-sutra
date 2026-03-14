'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import {
  IconCheck,
  IconX,
  IconMessage,
} from '@tabler/icons-react'
import type { ReviewRequest } from '../task-types'

type ReviewStatus = ReviewRequest['status']

// ============================================================
// Constants
// ============================================================

const RESPONSE_OPTIONS: {
  status: ReviewStatus
  label: string
  icon: React.ElementType
}[] = [
  { status: 'APPROVED', label: 'Approve', icon: IconCheck },
  { status: 'CHANGES_REQUESTED', label: 'Request Changes', icon: IconMessage },
  { status: 'REJECTED', label: 'Reject', icon: IconX },
]

// ============================================================
// Types
// ============================================================

export interface ReviewResponseFormProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSubmit'> {
  reviewId: string
  onSubmit: (id: string, status: ReviewStatus, feedback?: string) => void
}

// ============================================================
// ReviewResponseForm
// ============================================================

const ReviewResponseForm = React.forwardRef<HTMLDivElement, ReviewResponseFormProps>(
  function ReviewResponseForm({ reviewId, onSubmit, className, ...props }, ref) {
    const [feedback, setFeedback] = React.useState('')
    const [isExpanded, setIsExpanded] = React.useState(false)

    const handleRespond = (status: ReviewStatus) => {
      onSubmit(reviewId, status, feedback || undefined)
      setFeedback('')
      setIsExpanded(false)
    }

    return (
      <div ref={ref} className={cn(className)} {...props}>
        {isExpanded ? (
          <div className="space-y-ds-03">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Add feedback (optional)..."
              rows={2}
              className="w-full resize-none rounded-ds-md border border-surface-border-strong bg-transparent px-ds-03 py-ds-03 text-ds-sm text-surface-fg placeholder:text-surface-fg-subtle outline-none focus:border-surface-border"
            />
            <div className="flex items-center gap-ds-02b">
              {RESPONSE_OPTIONS.map((opt) => {
                const Icon = opt.icon
                return (
                  <button
                    key={opt.status}
                    type="button"
                    onClick={() => handleRespond(opt.status)}
                    className={cn(
                      'inline-flex items-center gap-ds-02 rounded-ds-md px-ds-03 py-ds-02 text-ds-sm font-semibold transition-colors',
                      opt.status === 'APPROVED' &&
                        'bg-success-3 text-success-11 hover:opacity-90',
                      opt.status === 'CHANGES_REQUESTED' &&
                        'bg-warning-3 text-warning-11 hover:opacity-90',
                      opt.status === 'REJECTED' &&
                        'bg-error-3 text-error-11 hover:opacity-90',
                    )}
                  >
                    <Icon className="h-3 w-3" stroke={2} />
                    {opt.label}
                  </button>
                )
              })}
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="ml-auto text-ds-sm text-surface-fg-subtle hover:text-surface-fg-muted"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="text-ds-sm font-medium text-accent-11 transition-colors hover:underline"
          >
            Respond
          </button>
        )}
      </div>
    )
  },
)

ReviewResponseForm.displayName = 'ReviewResponseForm'

export { ReviewResponseForm }
