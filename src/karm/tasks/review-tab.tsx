'use client'

import * as React from 'react'
import { cn } from '../../ui/lib/utils'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '../../ui/avatar'
import { Badge } from '../../ui/badge'
import { EmptyState } from '../../shared/empty-state'
import { MemberPicker } from '../../shared/member-picker'
import {
  IconGitPullRequest,
  IconPlus,
  IconCheck,
  IconX,
  IconMessage,
} from '@tabler/icons-react'
import { getInitials } from '../../shared/lib/string-utils'
import { REVIEW_STATUS_MAP } from './task-constants'

// ============================================================
// Types
// ============================================================

interface ReviewUser {
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

interface Member {
  id: string
  name: string
  image?: string | null
}

interface ReviewTabProps {
  reviews: ReviewRequest[]
  members: Member[]
  onRequestReview: (reviewerId: string) => void
  onUpdateStatus: (
    reviewId: string,
    status: ReviewRequest['status'],
    feedback?: string,
  ) => void
  className?: string
}

// ============================================================
// Helpers
// ============================================================

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const RESPONSE_OPTIONS: {
  status: ReviewRequest['status']
  label: string
  icon: React.ElementType
}[] = [
  { status: 'APPROVED', label: 'Approve', icon: IconCheck },
  { status: 'CHANGES_REQUESTED', label: 'Request Changes', icon: IconMessage },
  { status: 'REJECTED', label: 'Reject', icon: IconX },
]

// ============================================================
// Review Tab
// ============================================================

function ReviewTab({
  reviews,
  members,
  onRequestReview,
  onUpdateStatus,
  className,
}: ReviewTabProps) {
  const [feedbackMap, setFeedbackMap] = React.useState<Record<string, string>>({})
  const [expandedId, setExpandedId] = React.useState<string | null>(null)

  const pickerMembers = React.useMemo(
    () => members.map((m) => ({ id: m.id, name: m.name, avatar: m.image ?? undefined })),
    [members],
  )

  const handleRespond = (
    reviewId: string,
    status: ReviewRequest['status'],
  ) => {
    onUpdateStatus(reviewId, status, feedbackMap[reviewId])
    setFeedbackMap((prev) => {
      const next = { ...prev }
      delete next[reviewId]
      return next
    })
    setExpandedId(null)
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {reviews.length > 0 ? (
        <div className="space-y-ds-04">
          {reviews.map((review) => {
            const statusInfo = REVIEW_STATUS_MAP[review.status]
            const isExpanded = expandedId === review.id

            return (
              <div
                key={review.id}
                className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-layer-01)] p-ds-04"
              >
                {/* Header */}
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-6 w-6 shrink-0">
                    {review.reviewer.image && (
                      <AvatarImage
                        src={review.reviewer.image}
                        alt={review.reviewer.name}
                      />
                    )}
                    <AvatarFallback className="bg-[var(--color-layer-03)] text-[8px] font-semibold text-[var(--color-text-on-color)]">
                      {getInitials(review.reviewer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <span className="text-ds-md font-medium text-[var(--color-text-primary)]">
                      {review.reviewer.name}
                    </span>
                    <span className="ml-ds-03 text-ds-sm text-[var(--color-text-placeholder)]">
                      requested by {review.requestedBy.name}
                    </span>
                  </div>
                  <Badge
                    variant={statusInfo.variant}
                  >
                    {statusInfo.label}
                  </Badge>
                </div>

                {/* Feedback */}
                {review.feedback && (
                  <div className="mt-2.5 rounded-[var(--radius-md)] bg-[var(--color-layer-02)] px-ds-04 py-ds-03">
                    <p className="text-ds-sm text-[var(--color-text-secondary)]">
                      {review.feedback}
                    </p>
                  </div>
                )}

                {/* Actions for pending reviews */}
                {review.status === 'PENDING' && (
                  <div className="mt-2.5">
                    {isExpanded ? (
                      <div className="space-y-ds-03">
                        <textarea
                          value={feedbackMap[review.id] || ''}
                          onChange={(e) =>
                            setFeedbackMap((prev) => ({
                              ...prev,
                              [review.id]: e.target.value,
                            }))
                          }
                          placeholder="Add feedback (optional)..."
                          rows={2}
                          className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-transparent px-2.5 py-ds-03 text-ds-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-placeholder)] outline-none focus:border-[var(--color-border-subtle)]"
                        />
                        <div className="flex items-center gap-ds-02b">
                          {RESPONSE_OPTIONS.map((opt) => {
                            const Icon = opt.icon
                            return (
                              <button
                                key={opt.status}
                                type="button"
                                onClick={() => handleRespond(review.id, opt.status)}
                                className={cn(
                                  'inline-flex items-center gap-ds-02 rounded-[var(--radius-md)] px-2.5 py-ds-02 text-ds-sm font-semibold transition-colors',
                                  opt.status === 'APPROVED' &&
                                    'bg-[var(--color-success-surface)] text-[var(--color-text-success)] hover:opacity-90',
                                  opt.status === 'CHANGES_REQUESTED' &&
                                    'bg-[var(--color-warning-surface)] text-[var(--color-text-warning)] hover:opacity-90',
                                  opt.status === 'REJECTED' &&
                                    'bg-[var(--color-error-surface)] text-[var(--color-text-error)] hover:opacity-90',
                                )}
                              >
                                <Icon className="h-3 w-3" stroke={2} />
                                {opt.label}
                              </button>
                            )
                          })}
                          <button
                            type="button"
                            onClick={() => setExpandedId(null)}
                            className="ml-auto text-ds-sm text-[var(--color-text-placeholder)] hover:text-[var(--color-text-secondary)]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setExpandedId(review.id)}
                        className="text-ds-sm font-medium text-[var(--color-interactive)] transition-colors hover:underline"
                      >
                        Respond
                      </button>
                    )}
                  </div>
                )}

                {/* Timestamp */}
                <p className="mt-ds-03 text-ds-xs text-[var(--color-text-placeholder)]">
                  {formatDate(review.createdAt)}
                </p>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={IconGitPullRequest}
          title="No reviews yet"
          description="Request a review from a team member"
          compact
        />
      )}

      {/* Request Review */}
      <MemberPicker
        members={pickerMembers}
        selectedIds={[]}
        onSelect={(memberId) => onRequestReview(memberId)}
      >
        <button
          type="button"
          className="mt-ds-04 inline-flex items-center gap-ds-02b rounded-[var(--radius-lg)] px-ds-03 py-ds-02b text-ds-md text-[var(--color-text-placeholder)] transition-colors hover:bg-[var(--color-field)] hover:text-[var(--color-text-secondary)]"
        >
          <IconPlus className="h-[var(--icon-sm)] w-[var(--icon-sm)]" stroke={1.5} />
          Request Review
        </button>
      </MemberPicker>
    </div>
  )
}

ReviewTab.displayName = 'ReviewTab'

export { ReviewTab }
export type { ReviewTabProps }
