'use client'

import * as React from 'react'
import {
  IconEye,
  IconLock,
  IconCheck,
  IconUser,
  IconAlertTriangleFilled,
  IconArrowUp,
  IconArrowDown,
  IconMinus,
  IconPlus,
} from '@tabler/icons-react'
import { motion } from 'framer-motion'
import { cn } from '@/ui/lib/utils'
import { Avatar, AvatarImage, AvatarFallback } from '@/ui/avatar'
import { Badge } from '@/ui/badge'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/ui/tooltip'
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

function formatMetaDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function isOverdue(iso: string): boolean {
  return new Date(iso).getTime() < Date.now()
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
// Status color helpers
// ---------------------------------------------------------------------------

function getStatusDotColor(statusName: string): string {
  const lower = statusName.toLowerCase()
  if (lower === 'done' || lower === 'complete' || lower === 'completed')
    return 'bg-success-9'
  if (lower === 'in progress' || lower === 'in-progress') return 'bg-accent-9'
  if (lower === 'review') return 'bg-warning-9'
  if (lower === 'backlog') return 'bg-surface-fg-subtle'
  if (lower === 'todo' || lower === 'to do') return 'bg-surface-fg-muted'
  return 'bg-accent-9'
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
// Shared styles
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
// Property row — label on left, value on right
// ---------------------------------------------------------------------------

function PropertyRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-ds-03">
      <span className="shrink-0 text-ds-xs font-medium text-surface-fg-subtle">
        {label}
      </span>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// TaskPanelPropertiesCard — tiered information hierarchy
// ---------------------------------------------------------------------------

export function TaskPanelPropertiesCard() {
  const {
    task,
    clientMode,
    onUpdateStatus,
    onUpdatePriority,
    onAddAssignee,
    onRemoveAssignee,
    onAddLead,
    onRemoveLead,
    onUpdateDueDate,
    onToggleVisibility,
    onAddLabel,
    onRemoveLabel,
  } = useTaskPanel()

  const [statusOpen, setStatusOpen] = React.useState(false)
  const [priorityOpen, setPriorityOpen] = React.useState(false)
  const [assigneeOpen, setAssigneeOpen] = React.useState(false)
  const [leadOpen, setLeadOpen] = React.useState(false)
  const [dueDateOpen, setDueDateOpen] = React.useState(false)
  const [labelOpen, setLabelOpen] = React.useState(false)
  const [newLabel, setNewLabel] = React.useState('')

  const statusName =
    task.statusOptions.find((o) => o.id === task.status)?.name ?? task.status
  const statusDotColor = getStatusDotColor(statusName)

  const priorityCfg = PRIORITY_CONFIG[task.priority]
  const PriorityIcon = priorityCfg.icon

  const interactive = !clientMode

  const dueDateOverdue = task.dueDate ? isOverdue(task.dueDate) : false

  const handleAddLabel = React.useCallback(() => {
    const trimmed = newLabel.trim()
    if (trimmed) {
      onAddLabel(trimmed)
      setNewLabel('')
    }
  }, [newLabel, onAddLabel])

  const handleLabelKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleAddLabel()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setNewLabel('')
        setLabelOpen(false)
      }
    },
    [handleAddLabel],
  )

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
      <div className="p-ds-06">
        {/* Header with visibility toggle */}
        <div className="flex items-center justify-between mb-ds-04">
          <span className="text-ds-xs font-semibold uppercase tracking-wider text-surface-fg-muted">
            Properties
          </span>
          {/* Client visibility toggle — staff only */}
          {interactive && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onToggleVisibility}
                  className={cn(
                    'flex items-center gap-ds-02 rounded-full px-ds-03 py-ds-01 text-ds-xs font-medium transition-colors',
                    task.visibility === 'EVERYONE'
                      ? 'bg-success-3 text-success-11 hover:bg-success-4'
                      : 'bg-surface-raised-hover text-surface-fg-subtle hover:bg-surface-3',
                  )}
                >
                  {task.visibility === 'EVERYONE' ? (
                    <>
                      <IconEye className="h-3 w-3" />
                      Client
                    </>
                  ) : (
                    <>
                      <IconLock className="h-3 w-3" />
                      Internal
                    </>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {task.visibility === 'EVERYONE'
                  ? 'Visible to clients'
                  : 'Team only'}
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* 3-column top section: Status, Priority, Due Date */}
        <div className="grid grid-cols-3 gap-ds-03 mb-ds-04">
          {/* Status */}
          <div className="flex flex-col gap-ds-01">
            <span className="text-[10px] text-surface-fg-subtle/50 uppercase tracking-wider">
              Status
            </span>
            {interactive ? (
              <Popover open={statusOpen} onOpenChange={setStatusOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-ds-02 rounded-ds-md px-ds-02 py-ds-01 hover:bg-surface-raised-hover transition-colors"
                  >
                    <span className={cn('h-2 w-2 shrink-0 rounded-full', statusDotColor)} />
                    <span className="text-ds-sm text-surface-fg truncate">{statusName}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[180px] border-surface-border-strong bg-surface-overlay p-ds-02"
                  align="start"
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
                      <span className={cn('h-2 w-2 shrink-0 rounded-full', getStatusDotColor(opt.name))} aria-hidden />
                      <span className="text-ds-sm text-surface-fg">{opt.name}</span>
                      {opt.id === task.status && (
                        <IconCheck className="ml-auto h-ico-sm w-ico-sm text-accent-11" />
                      )}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            ) : (
              <div className="flex items-center gap-ds-02 px-ds-02 py-ds-01">
                <span className={cn('h-2 w-2 shrink-0 rounded-full', statusDotColor)} />
                <span className="text-ds-sm text-surface-fg truncate">{statusName}</span>
              </div>
            )}
          </div>

          {/* Priority */}
          <div className="flex flex-col gap-ds-01">
            <span className="text-[10px] text-surface-fg-subtle/50 uppercase tracking-wider">
              Priority
            </span>
            {interactive ? (
              <Popover open={priorityOpen} onOpenChange={setPriorityOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-ds-02 rounded-ds-md px-ds-02 py-ds-01 hover:bg-surface-raised-hover transition-colors"
                  >
                    <PriorityIcon className={cn('h-3.5 w-3.5', priorityCfg.className)} />
                    <span className={cn('text-ds-sm truncate', priorityCfg.className)}>
                      {priorityCfg.label}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[180px] border-surface-border-strong bg-surface-overlay p-ds-02"
                  align="start"
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
              <div className="flex items-center gap-ds-02 px-ds-02 py-ds-01">
                <PriorityIcon className={cn('h-3.5 w-3.5', priorityCfg.className)} />
                <span className={cn('text-ds-sm truncate', priorityCfg.className)}>
                  {priorityCfg.label}
                </span>
              </div>
            )}
          </div>

          {/* Due Date */}
          <div className="flex flex-col gap-ds-01">
            <span className="text-[10px] text-surface-fg-subtle/50 uppercase tracking-wider">
              Due
            </span>
            {interactive ? (
              <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-ds-02 rounded-ds-md px-ds-02 py-ds-01 hover:bg-surface-raised-hover transition-colors"
                  >
                    <span
                      className={cn(
                        'text-ds-sm truncate',
                        task.dueDate
                          ? dueDateOverdue
                            ? 'text-error-11'
                            : 'text-surface-fg'
                          : 'text-surface-fg-subtle',
                      )}
                    >
                      {task.dueDate ? formatDate(task.dueDate) : 'None'}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[220px] border-surface-border-strong bg-surface-overlay p-ds-03"
                  align="start"
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
              <div className="flex items-center gap-ds-02 px-ds-02 py-ds-01">
                <span
                  className={cn(
                    'text-ds-sm truncate',
                    task.dueDate
                      ? dueDateOverdue
                        ? 'text-error-11'
                        : 'text-surface-fg'
                      : 'text-surface-fg-subtle',
                  )}
                >
                  {task.dueDate ? formatDate(task.dueDate) : 'None'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Remaining properties as standard rows */}
        <div className="flex flex-col gap-ds-04">
          {/* Leads */}
          <PropertyRow label="Leads">
            {interactive ? (
              <Popover open={leadOpen} onOpenChange={setLeadOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn('flex items-center gap-ds-02', interactiveValueBase)}
                  >
                    {task.leads.length > 0 ? (
                      <>
                        <div className="flex items-center -space-x-1">
                          {task.leads.slice(0, 3).map((lead) => (
                            <Avatar key={lead.id} size="xs" className="h-5 w-5 ring-1 ring-surface-raised">
                              {lead.image && <AvatarImage src={lead.image} />}
                              <AvatarFallback className="text-[8px]">
                                {getInitials(lead.name)}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {task.leads.length > 3 && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-raised-hover ring-1 ring-surface-raised text-[8px] font-medium text-surface-fg-muted">
                              +{task.leads.length - 3}
                            </span>
                          )}
                        </div>
                        <span className="text-ds-sm text-surface-fg">
                          {task.leads.length === 1 ? task.leads[0].name : `${task.leads.length} people`}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-dashed border-surface-fg-subtle">
                          <IconUser className="h-3 w-3 text-surface-fg-subtle" />
                        </span>
                        <span className="text-ds-sm text-surface-fg-subtle">
                          None
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
                  {task.members.map((member) => {
                    const isSelected = task.leads.some((l) => l.id === member.id)
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            onRemoveLead(member.id)
                          } else {
                            onAddLead(member.id)
                          }
                        }}
                        className={cn(
                          popoverOptionBase,
                          isSelected && 'bg-surface-raised-hover',
                        )}
                      >
                        <Avatar size="xs" className="h-5 w-5">
                          {member.image && <AvatarImage src={member.image} />}
                          <AvatarFallback className="text-[10px]">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-ds-sm text-surface-fg">{member.name}</span>
                        {isSelected && (
                          <IconCheck className="ml-auto h-ico-sm w-ico-sm text-accent-11" />
                        )}
                      </button>
                    )
                  })}
                </PopoverContent>
              </Popover>
            ) : (
              task.leads.length > 0 ? (
                <div className="flex items-center gap-ds-02">
                  <div className="flex items-center -space-x-1">
                    {task.leads.slice(0, 3).map((lead) => (
                      <Avatar key={lead.id} size="xs" className="h-5 w-5 ring-1 ring-surface-raised">
                        {lead.image && <AvatarImage src={lead.image} />}
                        <AvatarFallback className="text-[8px]">
                          {getInitials(lead.name)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {task.leads.length > 3 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-raised-hover ring-1 ring-surface-raised text-[8px] font-medium text-surface-fg-muted">
                        +{task.leads.length - 3}
                      </span>
                    )}
                  </div>
                  <span className="text-ds-sm text-surface-fg">
                    {task.leads.length === 1 ? task.leads[0].name : `${task.leads.length} people`}
                  </span>
                </div>
              ) : (
                <span className="text-ds-sm text-surface-fg-subtle">None</span>
              )
            )}
          </PropertyRow>

          {/* Assignees */}
          <PropertyRow label="Assignees">
            {interactive ? (
              <Popover open={assigneeOpen} onOpenChange={setAssigneeOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn('flex items-center gap-ds-02', interactiveValueBase)}
                  >
                    {task.assignees.length > 0 ? (
                      <>
                        <div className="flex items-center -space-x-1">
                          {task.assignees.slice(0, 3).map((assignee) => (
                            <Avatar key={assignee.id} size="xs" className="h-5 w-5 ring-1 ring-surface-raised">
                              {assignee.image && (
                                <AvatarImage src={assignee.image} />
                              )}
                              <AvatarFallback className="text-[8px]">
                                {getInitials(assignee.name)}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {task.assignees.length > 3 && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-raised-hover ring-1 ring-surface-raised text-[8px] font-medium text-surface-fg-muted">
                              +{task.assignees.length - 3}
                            </span>
                          )}
                        </div>
                        <span className="text-ds-sm text-surface-fg">
                          {task.assignees.length === 1 ? task.assignees[0].name : `${task.assignees.length} people`}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-dashed border-surface-fg-subtle">
                          <IconUser className="h-3 w-3 text-surface-fg-subtle" />
                        </span>
                        <span className="text-ds-sm text-surface-fg-subtle">
                          None
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
                  {task.members.map((member) => {
                    const isSelected = task.assignees.some((a) => a.id === member.id)
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            onRemoveAssignee(member.id)
                          } else {
                            onAddAssignee(member.id)
                          }
                        }}
                        className={cn(
                          popoverOptionBase,
                          isSelected && 'bg-surface-raised-hover',
                        )}
                      >
                        <Avatar size="xs" className="h-5 w-5">
                          {member.image && <AvatarImage src={member.image} />}
                          <AvatarFallback className="text-[10px]">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-ds-sm text-surface-fg">{member.name}</span>
                        {isSelected && (
                          <IconCheck className="ml-auto h-ico-sm w-ico-sm text-accent-11" />
                        )}
                      </button>
                    )
                  })}
                </PopoverContent>
              </Popover>
            ) : (
              task.assignees.length > 0 ? (
                <div className="flex items-center gap-ds-02">
                  <div className="flex items-center -space-x-1">
                    {task.assignees.slice(0, 3).map((assignee) => (
                      <Avatar key={assignee.id} size="xs" className="h-5 w-5 ring-1 ring-surface-raised">
                        {assignee.image && (
                          <AvatarImage src={assignee.image} />
                        )}
                        <AvatarFallback className="text-[8px]">
                          {getInitials(assignee.name)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {task.assignees.length > 3 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-raised-hover ring-1 ring-surface-raised text-[8px] font-medium text-surface-fg-muted">
                        +{task.assignees.length - 3}
                      </span>
                    )}
                  </div>
                  <span className="text-ds-sm text-surface-fg">
                    {task.assignees.length === 1 ? task.assignees[0].name : `${task.assignees.length} people`}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-ds-02">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-dashed border-surface-fg-subtle">
                    <IconUser className="h-3 w-3 text-surface-fg-subtle" />
                  </span>
                  <span className="text-ds-sm text-surface-fg-subtle">
                    None
                  </span>
                </div>
              )
            )}
          </PropertyRow>

          {/* Labels */}
          <PropertyRow label="Labels">
            <div className="flex flex-wrap gap-ds-01 justify-end items-center">
              {task.labels.length > 0 ? (
                task.labels.map((label) => (
                  <Badge
                    key={label}
                    variant="outline"
                    size="xs"
                    onDismiss={interactive ? () => onRemoveLabel(label) : undefined}
                  >
                    {label}
                  </Badge>
                ))
              ) : (
                <span className="text-ds-sm text-surface-fg-subtle">None</span>
              )}
              {interactive && (
                <Popover open={labelOpen} onOpenChange={setLabelOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex h-[16px] w-[16px] items-center justify-center rounded-full border border-dashed border-surface-fg-subtle text-surface-fg-subtle hover:border-accent-9 hover:text-accent-11 transition-colors"
                      aria-label="Add label"
                    >
                      <IconPlus className="h-2.5 w-2.5" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[200px] border-surface-border-strong bg-surface-overlay p-ds-03"
                    align="end"
                    sideOffset={4}
                  >
                    <label className="flex flex-col gap-ds-02">
                      <span className="text-ds-xs font-medium text-surface-fg-muted">
                        New label
                      </span>
                      <input
                        type="text"
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        onKeyDown={handleLabelKeyDown}
                        className="rounded-ds-md border border-surface-border bg-surface-1 px-ds-03 py-ds-02 text-ds-sm text-surface-fg outline-none focus:border-accent-9"
                        placeholder="Label name..."
                        autoFocus
                      />
                    </label>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </PropertyRow>

          {/* Project */}
          <PropertyRow label="Project">
            <span className={cn('text-ds-sm', task.project ? 'text-surface-fg' : 'text-surface-fg-subtle')}>
              {task.project ?? 'None'}
            </span>
          </PropertyRow>
        </div>

        {/* Separator before meta */}
        <div className="border-t border-surface-border mt-ds-04 pt-ds-04" />

        {/* Meta — Updated / Created (two-column) */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-ds-01">
            <span className="text-[9px] uppercase tracking-widest text-surface-fg-subtle/40">Updated</span>
            <span className="text-ds-xs text-surface-fg-muted">{timeAgo(task.updatedAt)}</span>
          </div>
          <div className="flex flex-col gap-ds-01 items-end">
            <span className="text-[9px] uppercase tracking-widest text-surface-fg-subtle/40">Created</span>
            <span className="text-ds-xs text-surface-fg-muted">{formatMetaDate(task.createdAt)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

TaskPanelPropertiesCard.displayName = 'TaskPanelPropertiesCard'
