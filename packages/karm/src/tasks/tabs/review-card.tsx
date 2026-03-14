'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/ui/avatar'
import { Badge } from '@/ui/badge'
import { getInitials } from '@/composed/lib/string-utils'
import { REVIEW_STATUS_MAP } from '../task-constants'
import type { ReviewRequest } from '../task-types'
import { ReviewResponseForm } from './review-response-form'

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

// ============================================================
// Types
// ============================================================

export interface ReviewCardProps extends React.HTMLAttributes<HTMLDivElement> {
  review: ReviewRequest
  onUpdateStatus?: (reviewId: string, status: string, feedback?: string) => void
}

// ============================================================
// ReviewCard
// ============================================================

const ReviewCard = React.forwardRef<HTMLDivElement, ReviewCardProps>(
  function ReviewCard({ review, onUpdateStatus, className, ...props }, ref) {
    const statusInfo = REVIEW_STATUS_MAP[review.status]

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-ds-lg border border-surface-border-strong bg-surface-1 shadow-01 p-ds-04',
          className,
        )}
        {...props}
      >
        {/* Header */}
        <div className="flex items-center gap-ds-03">
          <Avatar className="h-ds-xs w-ds-xs shrink-0">
            {review.reviewer.image && (
              <AvatarImage
                src={review.reviewer.image}
                alt={review.reviewer.name}
              />
            )}
            <AvatarFallback className="bg-surface-3 text-ds-xs font-semibold text-accent-fg">
              {getInitials(review.reviewer.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <span className="text-ds-md font-medium text-surface-fg">
              {review.reviewer.name}
            </span>
            <span className="ml-ds-03 text-ds-sm text-surface-fg-subtle">
              requested by {review.requestedBy.name}
            </span>
          </div>
          <Badge
            color={statusInfo.color}
          >
            {statusInfo.label}
          </Badge>
        </div>

        {/* Feedback */}
        {review.feedback && (
          <div className="mt-ds-03 rounded-ds-md bg-surface-2 px-ds-04 py-ds-03">
            <p className="text-ds-sm text-surface-fg-muted">
              {review.feedback}
            </p>
          </div>
        )}

        {/* Actions for pending reviews */}
        {review.status === 'PENDING' && onUpdateStatus && (
          <div className="mt-ds-03">
            <ReviewResponseForm
              reviewId={review.id}
              onSubmit={onUpdateStatus}
            />
          </div>
        )}

        {/* Timestamp */}
        <p className="mt-ds-03 text-ds-xs text-surface-fg-subtle">
          {formatDate(review.createdAt)}
        </p>
      </div>
    )
  },
)

ReviewCard.displayName = 'ReviewCard'

export { ReviewCard }
