'use client'

import * as React from 'react'
import {
  IconEye,
  IconCheck,
  IconUser,
  IconAlertTriangleFilled,
  IconArrowUp,
  IconArrowDown,
  IconMinus,
} from '@tabler/icons-react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/ui/lib/utils'
import { Sheet, SheetContent, SheetTitle } from '@/ui/sheet'
import { VisuallyHidden } from '@/ui/visually-hidden'
import { Button } from '@/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/ui/avatar'
import { Badge } from '@/ui/badge'
import { Popover, PopoverTrigger, PopoverContent } from '@/ui/popover'
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

type Priority = TaskPanelTask['priority']

const PRIORITIES: Priority[] = ['URGENT', 'HIGH', 'MEDIUM', 'LOW']

const PRIORITY_CONFIG: Record<
  Priority,
  { icon: React.ElementType; className: string; label: string }
> = {
  URGENT: { icon: IconAlertTriangleFilled, className: 'text-error-9', label: 'Urgent' },
  HIGH: { icon: IconArrowUp, className: 'text-warning-9', label: 'High' },
  MEDIUM: { icon: IconMinus, className: 'text-surface-fg-muted', label: 'Medium' },
  LOW: { icon: IconArrowDown, className: 'text-surface-fg-subtle', label: 'Low' },
}

// ---------------------------------------------------------------------------
// Shared styles for interactive property values
// ---------------------------------------------------------------------------

const interactiveValueBase =
  'rounded-ds-md px-ds-02 py-ds-01 -mx-ds-02 hover:bg-surface-raised-hover transition-colors cursor-pointer'

const popoverOptionBase =
  'flex w-full items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-02b transition-colors hover:bg-surface-raised-hover'

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

// ---------------------------------------------------------------------------
// Property row wrapper
// ---------------------------------------------------------------------------

function PropertyRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ds-xs text-surface-fg-subtle">{label}</span>
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// PropertiesWingCard — interactive edition
// ---------------------------------------------------------------------------

function PropertiesWingCard() {
  const {
    task,
    clientMode,
    onUpdateStatus,
    onUpdatePriority,
    onUpdateAssignee,
    onUpdateDueDate,
  } = useTaskPanel()

  const [statusOpen, setStatusOpen] = React.useState(false)
  const [priorityOpen, setPriorityOpen] = React.useState(false)
  const [assigneeOpen, setAssigneeOpen] = React.useState(false)
  const [dueDateOpen, setDueDateOpen] = React.useState(false)

  const statusName =
    task.statusOptions.find((o) => o.id === task.status)?.name ?? task.status

  const priorityCfg = PRIORITY_CONFIG[task.priority]
  const PriorityIcon = priorityCfg.icon

  const interactive = !clientMode

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
      <div className="p-ds-05">
        <h3 className="text-ds-xs font-medium text-surface-fg-muted uppercase tracking-wider mb-ds-04">
          Properties
        </h3>

        <div className="flex flex-col gap-ds-04">
          {/* Status */}
          <PropertyRow label="Status">
            {interactive ? (
              <Popover open={statusOpen} onOpenChange={setStatusOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn('flex items-center gap-ds-02', interactiveValueBase)}
                  >
                    <span className="h-2 w-2 rounded-full bg-accent-9" />
                    <span className="text-ds-sm text-surface-fg">{statusName}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[180px] border-surface-border-strong bg-surface-overlay p-ds-02"
                  align="end"
                  sideOffset={4}
                >
                  {task.statusOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        onUpdateStatus(opt.id)
                        setStatusOpen(false)
                      }}
                      className={cn(
                        popoverOptionBase,
                        opt.id === task.status && 'bg-surface-raised-hover',
                      )}
                    >
                      <span className="h-2 w-2 shrink-0 rounded-full bg-accent-9" aria-hidden />
                      <span className="text-ds-sm text-surface-fg">{opt.name}</span>
                      {opt.id === task.status && (
                        <IconCheck className="ml-auto h-ico-sm w-ico-sm text-accent-11" />
                      )}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            ) : (
              <div className="flex items-center gap-ds-02">
                <span className="h-2 w-2 rounded-full bg-accent-9" />
                <span className="text-ds-sm text-surface-fg">{statusName}</span>
              </div>
            )}
          </PropertyRow>

          {/* Priority */}
          <PropertyRow label="Priority">
            {interactive ? (
              <Popover open={priorityOpen} onOpenChange={setPriorityOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn('flex items-center gap-ds-02', interactiveValueBase)}
                  >
                    <PriorityIcon className={cn('h-3.5 w-3.5', priorityCfg.className)} />
                    <span className={cn('text-ds-sm', priorityCfg.className)}>
                      {priorityCfg.label}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[180px] border-surface-border-strong bg-surface-overlay p-ds-02"
                  align="end"
                  sideOffset={4}
                >
                  {PRIORITIES.map((p) => {
                    const c = PRIORITY_CONFIG[p]
                    const PIcon = c.icon
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          onUpdatePriority(p)
                          setPriorityOpen(false)
                        }}
                        className={cn(
                          popoverOptionBase,
                          p === task.priority && 'bg-surface-raised-hover',
                        )}
                      >
                        <PIcon className={cn('h-ico-sm w-ico-sm', c.className)} />
                        <span className="text-ds-sm text-surface-fg">{c.label}</span>
                        {p === task.priority && (
                          <IconCheck className="ml-auto h-ico-sm w-ico-sm text-accent-11" />
                        )}
                      </button>
                    )
                  })}
                </PopoverContent>
              </Popover>
            ) : (
              <span className={cn('text-ds-sm', priorityCfg.className)}>
                {priorityCfg.label}
              </span>
            )}
          </PropertyRow>

          {/* Assignee */}
          <PropertyRow label="Assignee">
            {interactive ? (
              <Popover open={assigneeOpen} onOpenChange={setAssigneeOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn('flex items-center gap-ds-02', interactiveValueBase)}
                  >
                    {task.assignee ? (
                      <>
                        <Avatar size="xs" className="h-5 w-5">
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
                      </>
                    ) : (
                      <>
                        <IconUser className="h-3.5 w-3.5 text-surface-fg-subtle" />
                        <span className="text-ds-sm text-surface-fg-subtle">
                          Unassigned
                        </span>
                      </>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[200px] border-surface-border-strong bg-surface-overlay p-ds-02"
                  align="end"
                  sideOffset={4}
                >
                  {/* Unassign option */}
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateAssignee(null)
                      setAssigneeOpen(false)
                    }}
                    className={cn(
                      popoverOptionBase,
                      !task.assignee && 'bg-surface-raised-hover',
                    )}
                  >
                    <IconUser className="h-ico-sm w-ico-sm text-surface-fg-subtle" />
                    <span className="text-ds-sm text-surface-fg-subtle">Unassigned</span>
                  </button>

                  {task.members.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => {
                        onUpdateAssignee(member.id)
                        setAssigneeOpen(false)
                      }}
                      className={cn(
                        popoverOptionBase,
                        task.assignee?.id === member.id && 'bg-surface-raised-hover',
                      )}
                    >
                      <Avatar size="xs" className="h-5 w-5">
                        {member.image && <AvatarImage src={member.image} />}
                        <AvatarFallback className="text-[10px]">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-ds-sm text-surface-fg">{member.name}</span>
                      {task.assignee?.id === member.id && (
                        <IconCheck className="ml-auto h-ico-sm w-ico-sm text-accent-11" />
                      )}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            ) : (
              task.assignee ? (
                <div className="flex items-center gap-ds-02">
                  <Avatar size="xs" className="h-5 w-5">
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
              )
            )}
          </PropertyRow>

          {/* Due Date */}
          <PropertyRow label="Due date">
            {interactive ? (
              <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn('flex items-center gap-ds-02', interactiveValueBase)}
                  >
                    <span
                      className={cn(
                        'text-ds-sm',
                        task.dueDate ? 'text-surface-fg' : 'text-surface-fg-subtle',
                      )}
                    >
                      {task.dueDate ? formatDate(task.dueDate) : 'None'}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[220px] border-surface-border-strong bg-surface-overlay p-ds-03"
                  align="end"
                  sideOffset={4}
                >
                  <label className="flex flex-col gap-ds-02">
                    <span className="text-ds-xs font-medium text-surface-fg-muted">
                      Due date
                    </span>
                    <input
                      type="date"
                      defaultValue={task.dueDate ? task.dueDate.slice(0, 10) : ''}
                      onChange={(e) => {
                        const val = e.target.value
                        if (val) {
                          onUpdateDueDate(new Date(val + 'T00:00:00'))
                        } else {
                          onUpdateDueDate(null)
                        }
                        setDueDateOpen(false)
                      }}
                      className="rounded-ds-md border border-surface-border bg-surface-1 px-ds-03 py-ds-02 text-ds-sm text-surface-fg outline-none focus:border-accent-9"
                    />
                  </label>
                </PopoverContent>
              </Popover>
            ) : (
              <span
                className={cn(
                  'text-ds-sm',
                  task.dueDate ? 'text-surface-fg' : 'text-surface-fg-subtle',
                )}
              >
                {task.dueDate ? formatDate(task.dueDate) : 'None'}
              </span>
            )}
          </PropertyRow>

          {/* Lead — display-only (no onUpdateLead callback exists) */}
          {task.lead && (
            <PropertyRow label="Lead">
              <div className="flex items-center gap-ds-02">
                <Avatar size="xs" className="h-5 w-5">
                  {task.lead.image && <AvatarImage src={task.lead.image} />}
                  <AvatarFallback className="text-[8px]">
                    {getInitials(task.lead.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-ds-sm text-surface-fg">
                  {task.lead.name}
                </span>
              </div>
            </PropertyRow>
          )}

          {/* Labels — display-only */}
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

          {/* Visibility — display-only */}
          <PropertyRow label="Visibility">
            <Badge
              variant="subtle"
              size="xs"
              color={task.visibility === 'EVERYONE' ? 'success' : 'slate'}
            >
              {task.visibility === 'EVERYONE' ? 'Client visible' : 'Internal'}
            </Badge>
          </PropertyRow>

          {/* Project — display-only */}
          {task.project && (
            <PropertyRow label="Project">
              <span className="text-ds-sm text-surface-fg">
                {task.project}
              </span>
            </PropertyRow>
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
