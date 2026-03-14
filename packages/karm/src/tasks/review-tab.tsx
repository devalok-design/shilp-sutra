'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { EmptyState } from '@/composed/empty-state'
import { IconGitPullRequest } from '@tabler/icons-react'
import {
  ReviewCard,
  ReviewRequestButton,
} from './tabs'

import type { ReviewRequest, Member } from './task-types'
export type { ReviewRequest }

// ============================================================
// Types
// ============================================================

interface ReviewTabProps extends React.HTMLAttributes<HTMLDivElement> {
  reviews: ReviewRequest[]
  members: Member[]
  onRequestReview: (reviewerId: string) => void
  onUpdateStatus: (
    reviewId: string,
    status: ReviewRequest['status'],
    feedback?: string,
  ) => void
  /** When true, hide ReviewRequestButton and disable status updates */
  readOnly?: boolean
}

// ============================================================
// Review Tab
// ============================================================

const ReviewTab = React.forwardRef<HTMLDivElement, ReviewTabProps>(
  function ReviewTab({
  reviews,
  members,
  onRequestReview,
  onUpdateStatus,
  className,
  readOnly = false,
  ...props
}, ref) {
  return (
    <div ref={ref} className={cn('flex flex-col', className)} {...props}>
      {reviews.length > 0 ? (
        <div className="space-y-ds-04">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onUpdateStatus={readOnly ? undefined : onUpdateStatus}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<IconGitPullRequest />}
          title="No reviews yet"
          description="Request a review from a team member"
          compact
        />
      )}

      {/* Request Review -- hidden in readOnly mode */}
      {!readOnly && (
        <ReviewRequestButton
          members={members}
          onRequest={onRequestReview}
        />
      )}
    </div>
  )
},
)

ReviewTab.displayName = 'ReviewTab'

export { ReviewTab }
export type { ReviewTabProps }
