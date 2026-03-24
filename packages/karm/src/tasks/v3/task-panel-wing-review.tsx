'use client'

import { IconEye, IconCheck, IconFile, IconPhoto } from '@tabler/icons-react'
import { Icon } from '@/ui/icon'
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

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']

function getFileIcon(name: string) {
  const lower = name.toLowerCase()
  if (IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
    return IconPhoto
  }
  return IconFile
}

// ---------------------------------------------------------------------------
// Wing animation config
// ---------------------------------------------------------------------------

const wingVariants = {
  hidden: { opacity: 0, x: 40, scale: 0.97 },
  visible: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: 40, scale: 0.97 },
}

// ---------------------------------------------------------------------------
// Review files list
// ---------------------------------------------------------------------------

function ReviewFilesList({
  files,
}: {
  files: { name: string; size: string }[]
}) {
  if (files.length === 0) return null

  return (
    <div className="mt-ds-03 flex flex-col gap-ds-01">
      <span className="text-[10px] uppercase tracking-wider text-surface-fg-subtle/50">
        Files
      </span>
      {files.map((file) => {
        const FileIcon = getFileIcon(file.name)
        return (
          <div
            key={file.name}
            className="flex items-center gap-ds-02 rounded-ds-md px-ds-02 py-ds-01 text-ds-xs text-surface-fg-muted"
          >
            <Icon icon={FileIcon} size="xs" className="shrink-0 text-surface-fg-subtle" />
            <span className="min-w-0 truncate">{file.name}</span>
            <span className="ml-auto shrink-0 text-surface-fg-subtle">
              {file.size}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// TaskPanelReviewCard
// ---------------------------------------------------------------------------

export function TaskPanelReviewCard() {
  const { task, clientMode, onApproveReview, onRequestChanges } = useTaskPanel()

  const reviewFiles = task.reviewFiles ?? []

  return (
    <motion.div
      variants={wingVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ ...tweens.fade, delay: 0.2 }}
      className="w-[280px] overflow-hidden rounded-ds-xl border border-surface-border-strong bg-surface-raised shadow-floating"
      data-testid="review-wing"
    >
      <div className="p-ds-05">
        {clientMode ? (
          /* Client view — action buttons to approve/reject */
          <>
            <div className="flex items-center gap-ds-02 mb-ds-03">
              <Icon icon={IconEye} size="sm" className="text-accent-11" />
              <span className="text-ds-sm font-semibold text-accent-11">
                Review Requested
              </span>
            </div>

            <p className="text-ds-xs text-surface-fg-muted mb-ds-03">
              Please review the submitted deliverables.
            </p>

            {task.reviewSubmittedBy && (
              <p className="text-ds-xs text-surface-fg-subtle mb-ds-03">
                Submitted by {task.reviewSubmittedBy.name} &middot;{' '}
                {timeAgo(task.reviewSubmittedBy.timestamp)}
              </p>
            )}

            {reviewFiles.length > 0 && (
              <ReviewFilesList files={reviewFiles} />
            )}

            <div className="flex items-center gap-ds-02 mt-ds-04">
              <Button
                variant="solid"
                color="success"
                size="sm"
                onClick={onApproveReview}
              >
                <Icon icon={IconCheck} size="sm" className="mr-ds-01" />
                Approve
              </Button>
              <Button
                variant="ghost"
                color="error"
                size="sm"
                onClick={() => onRequestChanges('')}
              >
                Request Changes
              </Button>
            </div>
          </>
        ) : (
          /* Staff view — read-only status */
          <>
            <div className="flex items-center gap-ds-02 mb-ds-03">
              <Icon icon={IconEye} size="sm" className="text-accent-11" />
              <span className="text-ds-sm font-semibold text-accent-11">
                Awaiting Review
              </span>
            </div>

            {task.reviewSubmittedBy && (
              <p className="text-ds-xs text-surface-fg-muted">
                Submitted by {task.reviewSubmittedBy.name} &middot;{' '}
                {timeAgo(task.reviewSubmittedBy.timestamp)}
              </p>
            )}

            <p className="text-ds-xs text-surface-fg-subtle mt-ds-02">
              Waiting for client approval.
            </p>

            {reviewFiles.length > 0 && (
              <ReviewFilesList files={reviewFiles} />
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}

TaskPanelReviewCard.displayName = 'TaskPanelReviewCard'
