'use client'

import * as React from 'react'
import { cn } from '../../ui/lib/utils'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '../../ui/avatar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../ui/popover'
import { Badge } from '../../ui/badge'
import { EmptyState } from '../../shared/empty-state'
import {
  GitPullRequest,
  Plus,
  Check,
  X,
  MessageSquare,
} from 'lucide-react'
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
  { status: 'APPROVED', label: 'Approve', icon: Check },
  { status: 'CHANGES_REQUESTED', label: 'Request Changes', icon: MessageSquare },
  { status: 'REJECTED', label: 'Reject', icon: X },
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
  const [reviewerOpen, setReviewerOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')

  const filteredMembers = members.filter(
    (m) => m.name.toLowerCase().includes(searchTerm.toLowerCase()),
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
        <div className="space-y-3">
          {reviews.map((review) => {
            const statusInfo = REVIEW_STATUS_MAP[review.status]
            const isExpanded = expandedId === review.id

            return (
              <div
                key={review.id}
                className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-layer-01)] p-3"
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
                    <span className="text-[13px] font-body font-medium text-[var(--color-text-primary)]">
                      {review.reviewer.name}
                    </span>
                    <span className="ml-2 text-[11px] font-body text-[var(--color-text-placeholder)]">
                      requested by {review.requestedBy.name}
                    </span>
                  </div>
                  <Badge
                    variant={statusInfo.variant}
                    className={statusInfo.className}
                  >
                    {statusInfo.label}
                  </Badge>
                </div>

                {/* Feedback */}
                {review.feedback && (
                  <div className="mt-2.5 rounded-[var(--radius-md)] bg-[var(--color-layer-02)] px-3 py-2">
                    <p className="text-[12px] font-body leading-relaxed text-[var(--color-text-secondary)]">
                      {review.feedback}
                    </p>
                  </div>
                )}

                {/* Actions for pending reviews */}
                {review.status === 'PENDING' && (
                  <div className="mt-2.5">
                    {isExpanded ? (
                      <div className="space-y-2">
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
                          className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-transparent px-2.5 py-2 text-[12px] font-body text-[var(--color-text-primary)] placeholder:text-[var(--color-text-placeholder)] outline-none focus:border-[var(--color-border-subtle)]"
                        />
                        <div className="flex items-center gap-1.5">
                          {RESPONSE_OPTIONS.map((opt) => {
                            const Icon = opt.icon
                            return (
                              <button
                                key={opt.status}
                                type="button"
                                onClick={() => handleRespond(review.id, opt.status)}
                                className={cn(
                                  'inline-flex items-center gap-1 rounded-[var(--radius-md)] px-2.5 py-1 text-[11px] font-body font-semibold transition-colors',
                                  opt.status === 'APPROVED' &&
                                    'bg-[var(--color-success-surface)] text-[var(--color-text-success)] hover:opacity-90',
                                  opt.status === 'CHANGES_REQUESTED' &&
                                    'bg-[var(--color-warning-surface)] text-[var(--color-text-warning)] hover:opacity-90',
                                  opt.status === 'REJECTED' &&
                                    'bg-[var(--color-error-surface)] text-[var(--color-text-error)] hover:opacity-90',
                                )}
                              >
                                <Icon className="h-3 w-3" strokeWidth={2} />
                                {opt.label}
                              </button>
                            )
                          })}
                          <button
                            type="button"
                            onClick={() => setExpandedId(null)}
                            className="ml-auto text-[11px] font-body text-[var(--color-text-placeholder)] hover:text-[var(--color-text-secondary)]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setExpandedId(review.id)}
                        className="text-[12px] font-body font-medium text-[var(--color-interactive)] transition-colors hover:underline"
                      >
                        Respond
                      </button>
                    )}
                  </div>
                )}

                {/* Timestamp */}
                <p className="mt-2 text-[10px] font-body text-[var(--color-text-placeholder)]">
                  {formatDate(review.createdAt)}
                </p>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={GitPullRequest}
          title="No reviews yet"
          description="Request a review from a team member"
          compact
        />
      )}

      {/* Request Review */}
      <Popover open={reviewerOpen} onOpenChange={setReviewerOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="mt-3 inline-flex items-center gap-1.5 rounded-[var(--radius-lg)] px-2 py-1.5 text-[13px] font-body text-[var(--color-text-placeholder)] transition-colors hover:bg-[var(--color-field)] hover:text-[var(--color-text-secondary)]"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
            Request Review
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[220px] border-[var(--color-border-default)] bg-[var(--color-layer-01)] p-0"
          align="start"
          sideOffset={4}
        >
          <div className="border-b border-[var(--color-border-default)] px-3 py-2">
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-[13px] font-body text-[var(--color-text-primary)] placeholder:text-[var(--color-text-placeholder)] outline-none"
            />
          </div>
          <div className="max-h-[200px] overflow-y-auto py-1">
            {filteredMembers.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => {
                  onRequestReview(member.id)
                  setReviewerOpen(false)
                  setSearchTerm('')
                }}
                className="flex w-full items-center gap-2.5 px-3 py-1.5 text-left transition-colors hover:bg-[var(--color-field)]"
              >
                <Avatar className="h-5 w-5">
                  {member.image && (
                    <AvatarImage src={member.image} alt={member.name} />
                  )}
                  <AvatarFallback className="bg-[var(--color-layer-03)] text-[8px] font-semibold text-[var(--color-text-on-color)]">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 truncate text-[13px] font-body text-[var(--color-text-primary)]">
                  {member.name}
                </span>
              </button>
            ))}
            {filteredMembers.length === 0 && (
              <p className="px-3 py-4 text-center text-[12px] font-body text-[var(--color-text-placeholder)]">
                No members found
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

ReviewTab.displayName = 'ReviewTab'

export { ReviewTab }
export type { ReviewTabProps }
