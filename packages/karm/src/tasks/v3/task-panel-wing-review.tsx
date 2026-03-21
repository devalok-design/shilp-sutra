'use client'

import { IconEye, IconCheck } from '@tabler/icons-react'
import { motion } from 'framer-motion'
import { tweens } from '@/ui/lib/motion'
import { Button } from '@/ui/button'
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
// Wing animation config
// ---------------------------------------------------------------------------

const wingVariants = {
  hidden: { opacity: 0, x: 12, scale: 0.97 },
  visible: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: 12, scale: 0.97 },
}

// ---------------------------------------------------------------------------
// TaskPanelReviewCard
// ---------------------------------------------------------------------------

export function TaskPanelReviewCard() {
  const { task, onApproveReview, onRequestChanges } = useTaskPanel()

  return (
    <motion.div
      variants={wingVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={tweens.fade}
      className="w-[280px] rounded-ds-xl border border-surface-border-strong bg-surface-raised shadow-floating"
      data-testid="review-wing"
    >
      <div className="p-ds-05">
        <div className="flex items-center gap-ds-02 mb-ds-03">
          <IconEye className="h-ico-sm w-ico-sm text-accent-11" />
          <span className="text-ds-sm font-semibold text-accent-11">
            Review Requested
          </span>
        </div>

        {task.reviewSubmittedBy && (
          <p className="text-ds-xs text-surface-fg-muted mb-ds-03">
            {task.reviewSubmittedBy.name} &middot;{' '}
            {timeAgo(task.reviewSubmittedBy.timestamp)}
          </p>
        )}

        <div className="flex items-center gap-ds-02">
          <Button
            variant="solid"
            size="sm"
            className="bg-success-9 hover:bg-success-10 text-white"
            onClick={onApproveReview}
          >
            <IconCheck className="mr-ds-01 h-ico-sm w-ico-sm" />
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
    </motion.div>
  )
}

TaskPanelReviewCard.displayName = 'TaskPanelReviewCard'
