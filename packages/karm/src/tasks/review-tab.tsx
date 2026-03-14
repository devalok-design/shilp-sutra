'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { EmptyState } from '@/composed/empty-state'
import { IconGitPullRequest } from '@tabler/icons-react'
import {
  ReviewCard,
  ReviewRequestButton,
} from './tabs'

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

interface ReviewTabProps extends React.HTMLAttributes<HTMLDivElement> {
  reviews: ReviewRequest[]
  members: Member[]
  onRequestReview: (reviewerId: string) => void
  onUpdateStatus: (
    reviewId: string,
    status: ReviewRequest['status'],
    feedback?: string,
  ) => void
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
              onUpdateStatus={onUpdateStatus as (reviewId: string, status: string, feedback?: string) => void}
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

      {/* Request Review */}
      <ReviewRequestButton
        members={members}
        onRequest={onRequestReview}
      />
    </div>
  )
},
)

ReviewTab.displayName = 'ReviewTab'

export { ReviewTab }
export type { ReviewTabProps }
