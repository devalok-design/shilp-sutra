'use client'

import * as React from 'react'
import { IconEye } from '@tabler/icons-react'
import { cn } from '@/ui/lib/utils'
import { Button } from '@/ui/button'
import { MotionCollapse } from '@/motion/primitives'
import { useTaskPanel } from './task-panel-context'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timeAgo(timestamp: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(timestamp).getTime()) / 1000,
  )
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TaskPanelReviewBannerProps
  extends React.HTMLAttributes<HTMLDivElement> {}

// ---------------------------------------------------------------------------
// TaskPanelReviewBanner
// ---------------------------------------------------------------------------

export function TaskPanelReviewBanner({
  className,
  ...props
}: TaskPanelReviewBannerProps) {
  const { task, clientMode, onApproveReview, onRequestChanges } = useTaskPanel()

  return (
    <MotionCollapse show={task.isInReview && !clientMode}>
      <div
        className={cn(
          'bg-accent-2 border border-accent-6 rounded-ds-lg mx-ds-05 mb-ds-03 p-ds-04',
          className,
        )}
        {...props}
      >
        <div className="flex items-start gap-ds-03">
          <IconEye className="h-ico-md w-ico-md shrink-0 text-accent-11" />
          <div className="min-w-0 flex-1">
            <p className="text-ds-sm font-semibold text-accent-11">
              REVIEW REQUESTED
            </p>
            {task.reviewSubmittedBy && (
              <p className="text-ds-xs text-surface-fg-muted">
                Submitted by {task.reviewSubmittedBy.name} &middot;{' '}
                {timeAgo(task.reviewSubmittedBy.timestamp)}
              </p>
            )}
          </div>
        </div>

        <div className="mt-ds-03 flex items-center gap-ds-02">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Scroll to the review submission in timeline
              const reviewEntry = document.querySelector('[data-review-submitted]')
              reviewEntry?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }}
          >
            <IconEye className="mr-ds-02 h-ico-sm w-ico-sm" />
            View Changes
          </Button>
          <Button
            variant="solid"
            size="sm"
            className="bg-success-9 hover:bg-success-10 text-white"
            onClick={onApproveReview}
          >
            Approve
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-surface-fg-muted hover:text-error-11"
            onClick={() => onRequestChanges('')}
          >
            Request Changes
          </Button>
        </div>
      </div>
    </MotionCollapse>
  )
}

TaskPanelReviewBanner.displayName = 'TaskPanelReviewBanner'
