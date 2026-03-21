'use client'

import * as React from 'react'
import { IconEye, IconCheck } from '@tabler/icons-react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/ui/lib/utils'
import { Sheet, SheetContent, SheetTitle } from '@/ui/sheet'
import { VisuallyHidden } from '@/ui/visually-hidden'
import { Button } from '@/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/ui/avatar'
import { Badge } from '@/ui/badge'
import { tweens } from '@/ui/lib/motion'
import { useTaskPanel } from './task-panel-context'
import type { TaskPanelTask } from './task-panel-types'

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

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// ---------------------------------------------------------------------------
// Priority display config
// ---------------------------------------------------------------------------

const PRIORITY_LABELS: Record<TaskPanelTask['priority'], string> = {
  URGENT: 'Urgent',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
}

const PRIORITY_COLORS: Record<TaskPanelTask['priority'], string> = {
  URGENT: 'text-error-9',
  HIGH: 'text-warning-9',
  MEDIUM: 'text-surface-fg-muted',
  LOW: 'text-surface-fg-subtle',
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
// ReviewWingCard
// ---------------------------------------------------------------------------

function ReviewWingCard() {
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
      <div className="p-ds-04">
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

// ---------------------------------------------------------------------------
// PropertiesWingCard
// ---------------------------------------------------------------------------

function PropertiesWingCard() {
  const { task } = useTaskPanel()

  const statusName =
    task.statusOptions.find((o) => o.id === task.status)?.name ?? task.status

  return (
    <motion.div
      variants={wingVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ ...tweens.fade, delay: 0.05 }}
      className="w-[280px] rounded-ds-xl border border-surface-border-strong bg-surface-raised shadow-floating"
      data-testid="properties-wing"
    >
      <div className="p-ds-04">
        <h3 className="text-ds-xs font-medium text-surface-fg-muted uppercase tracking-wider mb-ds-03">
          Properties
        </h3>

        <div className="flex flex-col gap-ds-03">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-ds-xs text-surface-fg-subtle">Status</span>
            <div className="flex items-center gap-ds-02">
              <span className="h-2 w-2 rounded-full bg-accent-9" />
              <span className="text-ds-sm text-surface-fg">{statusName}</span>
            </div>
          </div>

          {/* Priority */}
          <div className="flex items-center justify-between">
            <span className="text-ds-xs text-surface-fg-subtle">Priority</span>
            <span className={cn('text-ds-sm', PRIORITY_COLORS[task.priority])}>
              {PRIORITY_LABELS[task.priority]}
            </span>
          </div>

          {/* Assignee */}
          <div className="flex items-center justify-between">
            <span className="text-ds-xs text-surface-fg-subtle">Assignee</span>
            {task.assignee ? (
              <div className="flex items-center gap-ds-02">
                <Avatar size="xs" className="h-4 w-4">
                  {task.assignee.image && (
                    <AvatarImage src={task.assignee.image} />
                  )}
                  <AvatarFallback className="text-[8px]">
                    {getInitials(task.assignee.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-ds-sm text-surface-fg">
                  {task.assignee.name}
                </span>
              </div>
            ) : (
              <span className="text-ds-sm text-surface-fg-subtle">
                Unassigned
              </span>
            )}
          </div>

          {/* Due Date */}
          <div className="flex items-center justify-between">
            <span className="text-ds-xs text-surface-fg-subtle">Due date</span>
            <span
              className={cn(
                'text-ds-sm',
                task.dueDate ? 'text-surface-fg' : 'text-surface-fg-subtle',
              )}
            >
              {task.dueDate ? formatDate(task.dueDate) : 'None'}
            </span>
          </div>

          {/* Lead */}
          {task.lead && (
            <div className="flex items-center justify-between">
              <span className="text-ds-xs text-surface-fg-subtle">Lead</span>
              <div className="flex items-center gap-ds-02">
                <Avatar size="xs" className="h-4 w-4">
                  {task.lead.image && <AvatarImage src={task.lead.image} />}
                  <AvatarFallback className="text-[8px]">
                    {getInitials(task.lead.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-ds-sm text-surface-fg">
                  {task.lead.name}
                </span>
              </div>
            </div>
          )}

          {/* Labels */}
          {task.labels.length > 0 && (
            <div className="flex items-start justify-between">
              <span className="text-ds-xs text-surface-fg-subtle pt-ds-01">
                Labels
              </span>
              <div className="flex flex-wrap gap-ds-01 justify-end">
                {task.labels.map((label) => (
                  <Badge key={label} variant="outline" size="xs">
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Visibility */}
          <div className="flex items-center justify-between">
            <span className="text-ds-xs text-surface-fg-subtle">
              Visibility
            </span>
            <Badge
              variant="subtle"
              size="xs"
              color={task.visibility === 'EVERYONE' ? 'success' : 'slate'}
            >
              {task.visibility === 'EVERYONE' ? 'Client visible' : 'Internal'}
            </Badge>
          </div>

          {/* Project */}
          {task.project && (
            <div className="flex items-center justify-between">
              <span className="text-ds-xs text-surface-fg-subtle">
                Project
              </span>
              <span className="text-ds-sm text-surface-fg">
                {task.project}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TaskPanelSheetProps {
  open: boolean
  onClose: () => void
  className?: string
  children: React.ReactNode
}

// ---------------------------------------------------------------------------
// SheetContainer
// ---------------------------------------------------------------------------

export function TaskPanelSheet({
  open,
  onClose,
  className,
  children,
}: TaskPanelSheetProps) {
  const { task, clientMode } = useTaskPanel()

  return (
    <Sheet open={open} onOpenChange={(value) => !value && onClose()}>
      <SheetContent
        side="right"
        className={cn(
          'sm:max-w-[640px] w-full bg-surface-raised overflow-visible',
          className,
        )}
      >
        <VisuallyHidden>
          <SheetTitle>{task.title}</SheetTitle>
        </VisuallyHidden>

        {/* Wings — positioned to the left of the panel */}
        <AnimatePresence>
          {open && (
            <div className="absolute right-full top-ds-05 mr-ds-03 hidden flex-col gap-ds-03 lg:flex">
              {task.isInReview && !clientMode && <ReviewWingCard />}
              <PropertiesWingCard />
            </div>
          )}
        </AnimatePresence>

        {/* Main content */}
        <div className="flex h-full flex-col">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  )
}

TaskPanelSheet.displayName = 'TaskPanelSheet'
