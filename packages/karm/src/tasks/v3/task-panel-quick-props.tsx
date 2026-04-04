'use client'

import * as React from 'react'
import {
  IconCalendar,
  IconAlertTriangleFilled,
  IconArrowUp,
  IconArrowDown,
  IconMinus,
  IconCheck,
  IconUser,
} from '@tabler/icons-react'
import { Icon } from '@/ui/icon'
import { cn } from '@/ui/lib/utils'
import { Avatar, AvatarImage, AvatarFallback } from '@/ui/avatar'
import { Popover, PopoverTrigger, PopoverContent } from '@/ui/popover'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/ui/tooltip'
import { useTaskPanel } from './task-panel-context'
import type { TaskPanelTask } from './task-panel-types'

// ---------------------------------------------------------------------------
// Priority config
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
// Shared pill styles
// ---------------------------------------------------------------------------

const pillBase =
  'inline-flex items-center gap-ds-02 rounded-full text-ds-sm px-ds-04 py-ds-02'

const pillInteractive =
  'bg-surface-raised-hover transition-colors hover:bg-surface-raised-active cursor-pointer'

const pillStatic = 'bg-surface-raised-hover'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatRelativeDate(iso: string): { text: string; isOverdue: boolean } {
  const now = new Date()
  const due = new Date(iso)
  const diffMs = due.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / 86_400_000)

  if (diffDays < -1) return { text: `${Math.abs(diffDays)}d overdue`, isOverdue: true }
  if (diffDays === -1) return { text: 'Overdue by 1d', isOverdue: true }
  if (diffDays === 0) return { text: 'Due today', isOverdue: false }
  if (diffDays === 1) return { text: 'Due tomorrow', isOverdue: false }
  if (diffDays <= 7) return { text: `Due in ${diffDays}d`, isOverdue: false }
  return { text: formatDate(iso), isOverdue: false }
}

function getInitials(name: string): string {
  return (name || '')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'
}

// ---------------------------------------------------------------------------
// Status Pill
// ---------------------------------------------------------------------------

function StatusPill({ interactive }: { interactive: boolean }) {
  const { task, onUpdateStatus } = useTaskPanel()
  const [open, setOpen] = React.useState(false)

  const statusName =
    task.statusOptions.find((o) => o.id === task.status)?.name ?? task.status

  const dot = (
    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent-9" aria-hidden />
  )

  const content = (
    <>
      {dot}
      <span className="text-surface-fg">{statusName}</span>
    </>
  )

  if (!interactive) {
    return (
      <span className={cn(pillBase, pillStatic)} data-testid="status-pill">
        {content}
      </span>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(pillBase, pillInteractive)}
              data-testid="status-pill"
            >
              {content}
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Status (S)</TooltipContent>
      </Tooltip>
      <PopoverContent
        className="w-[180px] border-surface-border-strong bg-surface-overlay p-ds-02"
        align="start"
        sideOffset={4}
      >
        {task.statusOptions.length === 0 ? (
          <p className="px-ds-03 py-ds-02 text-ds-xs text-surface-fg-subtle">No status options configured</p>
        ) : (
          task.statusOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                onUpdateStatus(opt.id)
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-02b transition-colors',
                'hover:bg-surface-raised-hover',
                opt.id === task.status && 'bg-surface-raised-hover',
              )}
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent-9" aria-hidden />
              <span className="text-ds-sm text-surface-fg">{opt.name}</span>
              {opt.id === task.status && (
                <Icon icon={IconCheck} size="sm" className="ml-auto text-accent-11" />
              )}
            </button>
          ))
        )}
      </PopoverContent>
    </Popover>
  )
}

// ---------------------------------------------------------------------------
// Assignee Pill
// ---------------------------------------------------------------------------

function AssigneePill({ interactive }: { interactive: boolean }) {
  const { task, onAddAssignee, onRemoveAssignee } = useTaskPanel()
  const [open, setOpen] = React.useState(false)

  const first = task.assignees[0]
  const content = first ? (
    <>
      <Avatar size="xs" className="h-4 w-4">
        {first.image && <AvatarImage src={first.image} />}
        <AvatarFallback className="text-[8px]">
          {getInitials(first.name)}
        </AvatarFallback>
      </Avatar>
      <span className="text-surface-fg">
        {first.name}
        {task.assignees.length > 1 && (
          <span className="text-surface-fg-muted">{` & ${task.assignees.length - 1} more`}</span>
        )}
      </span>
    </>
  ) : (
    <>
      <Icon icon={IconUser} size="xs" className="text-surface-fg-subtle" />
      <span className="text-surface-fg-subtle">Unassigned</span>
    </>
  )

  if (!interactive) {
    return (
      <span className={cn(pillBase, pillStatic)} data-testid="assignee-pill">
        {content}
      </span>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(pillBase, pillInteractive)}
              data-testid="assignee-pill"
            >
              {content}
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Assignees (A)</TooltipContent>
      </Tooltip>
      <PopoverContent
        className="w-[200px] border-surface-border-strong bg-surface-overlay p-ds-02"
        align="start"
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
                'flex w-full items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-02b transition-colors',
                'hover:bg-surface-raised-hover',
                isSelected && 'bg-surface-raised-hover',
              )}
            >
              <Avatar size="xs">
                {member.image && <AvatarImage src={member.image} />}
                <AvatarFallback className="text-[10px]">
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-ds-sm text-surface-fg">{member.name}</span>
              {isSelected && (
                <Icon icon={IconCheck} size="sm" className="ml-auto text-accent-11" />
              )}
            </button>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}

// ---------------------------------------------------------------------------
// Priority Pill
// ---------------------------------------------------------------------------

function PriorityPill({ interactive }: { interactive: boolean }) {
  const { task, onUpdatePriority } = useTaskPanel()
  const [open, setOpen] = React.useState(false)

  const config = PRIORITY_CONFIG[task.priority]
  const PrioIcon = config.icon

  const content = (
    <>
      <Icon icon={PrioIcon as any} size="xs" className={config.className} />
      <span className="text-surface-fg">{config.label}</span>
    </>
  )

  if (!interactive) {
    return (
      <span className={cn(pillBase, pillStatic)} data-testid="priority-pill">
        {content}
      </span>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(pillBase, pillInteractive)}
              data-testid="priority-pill"
            >
              {content}
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Priority (P)</TooltipContent>
      </Tooltip>
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
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-02b transition-colors',
                'hover:bg-surface-raised-hover',
                p === task.priority && 'bg-surface-raised-hover',
              )}
            >
              <Icon icon={PIcon as any} size="sm" className={c.className} />
              <span className="text-ds-sm text-surface-fg">{c.label}</span>
              {p === task.priority && (
                <Icon icon={IconCheck} size="sm" className="ml-auto text-accent-11" />
              )}
            </button>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}

// ---------------------------------------------------------------------------
// Due Date Pill
// ---------------------------------------------------------------------------

function DueDatePill({ interactive }: { interactive: boolean }) {
  const { task, onUpdateDueDate } = useTaskPanel()
  const [open, setOpen] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const relDue = task.dueDate ? formatRelativeDate(task.dueDate) : null
  const overdue = relDue?.isOverdue ?? false

  const overduePillStyle = 'bg-error-3 transition-colors hover:bg-error-4 cursor-pointer'
  const overdueStaticStyle = 'bg-error-3'

  const content = (
    <>
      <Icon icon={IconCalendar} size="xs" className={overdue ? 'text-error-11' : 'text-surface-fg-subtle'} />
      <span className={overdue ? 'text-error-11 font-medium' : task.dueDate ? 'text-surface-fg' : 'text-surface-fg-subtle'}>
        {relDue ? relDue.text : 'No due date'}
      </span>
    </>
  )

  if (!interactive) {
    return (
      <span className={cn(pillBase, overdue ? overdueStaticStyle : pillStatic)} data-testid="due-date-pill">
        {content}
      </span>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(pillBase, overdue ? overduePillStyle : pillInteractive)}
              data-testid="due-date-pill"
            >
              {content}
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Due date (D)</TooltipContent>
      </Tooltip>
      <PopoverContent
        key={task.dueDate ?? 'empty'}
        className="w-[220px] border-surface-border-strong bg-surface-overlay p-ds-03"
        align="start"
        sideOffset={4}
      >
        <label className="flex flex-col gap-ds-02">
          <span className="text-ds-xs font-medium text-surface-fg-muted">
            Due date
          </span>
          <input
            ref={inputRef}
            type="date"
            defaultValue={task.dueDate ? task.dueDate.slice(0, 10) : ''}
            onChange={(e) => {
              const val = e.target.value
              if (val) {
                onUpdateDueDate(new Date(val + 'T00:00:00'))
              } else {
                onUpdateDueDate(null)
              }
              setOpen(false)
            }}
            className="rounded-ds-md border border-surface-border bg-surface-base px-ds-03 py-ds-02 text-ds-sm text-surface-fg outline-none focus:border-accent-9"
          />
        </label>
      </PopoverContent>
    </Popover>
  )
}

// ---------------------------------------------------------------------------
// Peek Triage Row
// ---------------------------------------------------------------------------

function PeekTriageRow() {
  const { task, onUpdateStatus, onUpdatePriority, onAddAssignee, onRemoveAssignee } =
    useTaskPanel()
  const [statusOpen, setStatusOpen] = React.useState(false)
  const [priorityOpen, setPriorityOpen] = React.useState(false)
  const [assigneeOpen, setAssigneeOpen] = React.useState(false)

  const statusName =
    task.statusOptions.find((o) => o.id === task.status)?.name ?? task.status
  const priorityCfg = PRIORITY_CONFIG[task.priority]
  const PriorityIcon = priorityCfg.icon

  return (
    <div
      className="flex items-center gap-ds-02 rounded-ds-lg bg-surface-sunken p-ds-03"
      data-testid="peek-triage-row"
    >
      {/* Status */}
      <Popover open={statusOpen} onOpenChange={setStatusOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(pillBase, pillInteractive, 'text-ds-xs')}
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent-9" aria-hidden />
            {statusName}
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[180px] border-surface-border-strong bg-surface-overlay p-ds-02"
          align="start"
          sideOffset={4}
        >
          {task.statusOptions.length === 0 ? (
            <p className="px-ds-03 py-ds-02 text-ds-xs text-surface-fg-subtle">No status options configured</p>
          ) : (
            task.statusOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onUpdateStatus(opt.id)
                  setStatusOpen(false)
                }}
                className={cn(
                  'flex w-full items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-02b transition-colors',
                  'hover:bg-surface-raised-hover',
                  opt.id === task.status && 'bg-surface-raised-hover',
                )}
              >
                <span className="text-ds-sm">{opt.name}</span>
              </button>
            ))
          )}
        </PopoverContent>
      </Popover>

      {/* Priority */}
      <Popover open={priorityOpen} onOpenChange={setPriorityOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(pillBase, pillInteractive, 'text-ds-xs')}
          >
            <Icon icon={PriorityIcon as any} size="xs" className={priorityCfg.className} />
            {priorityCfg.label}
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[160px] border-surface-border-strong bg-surface-overlay p-ds-02"
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
                  'flex w-full items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-02b transition-colors',
                  'hover:bg-surface-raised-hover',
                  p === task.priority && 'bg-surface-raised-hover',
                )}
              >
                <Icon icon={PIcon as any} size="sm" className={c.className} />
                <span className="text-ds-sm">{c.label}</span>
              </button>
            )
          })}
        </PopoverContent>
      </Popover>

      {/* Assignees */}
      <Popover open={assigneeOpen} onOpenChange={setAssigneeOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(pillBase, pillInteractive, 'text-ds-xs')}
          >
            {task.assignees.length > 0 ? (
              <>
                <Avatar size="xs" className="h-4 w-4">
                  {task.assignees[0].image && (
                    <AvatarImage src={task.assignees[0].image} />
                  )}
                  <AvatarFallback className="text-[8px]">
                    {getInitials(task.assignees[0].name)}
                  </AvatarFallback>
                </Avatar>
                {task.assignees[0].name}
                {task.assignees.length > 1 && (
                  <span className="text-surface-fg-muted">{` & ${task.assignees.length - 1} more`}</span>
                )}
              </>
            ) : (
              <>
                <Icon icon={IconUser} size="xs" className="text-surface-fg-subtle" />
                Unassigned
              </>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[180px] border-surface-border-strong bg-surface-overlay p-ds-02"
          align="start"
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
                  'flex w-full items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-02b transition-colors',
                  'hover:bg-surface-raised-hover',
                  isSelected && 'bg-surface-raised-hover',
                )}
              >
                <Avatar size="xs" className="h-5 w-5">
                  {member.image && <AvatarImage src={member.image} />}
                  <AvatarFallback className="text-[8px]">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-ds-sm">{member.name}</span>
                {isSelected && (
                  <Icon icon={IconCheck} size="sm" className="ml-auto text-accent-11" />
                )}
              </button>
            )
          })}
        </PopoverContent>
      </Popover>
    </div>
  )
}

// ---------------------------------------------------------------------------
// TaskPanelQuickProps
// ---------------------------------------------------------------------------

export interface TaskPanelQuickPropsProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function TaskPanelQuickProps({
  className,
  ...props
}: TaskPanelQuickPropsProps) {
  const { mode, clientMode } = useTaskPanel()
  const isStaff = !clientMode
  const canEditBasic = isStaff || clientMode === 'COLLABORATOR'

  return (
    <div className={cn('px-ds-06 pt-ds-03 pb-ds-02', className)} {...props}>
      {/* Property pills */}
      <div className="flex flex-wrap items-center gap-ds-03">
        <StatusPill interactive={isStaff} />
        <AssigneePill interactive={isStaff} />
        <PriorityPill interactive={canEditBasic} />
        <DueDatePill interactive={canEditBasic} />
      </div>

      {/* Peek triage row — staff mode only */}
      {mode === 'peek' && !clientMode && (
        <div className="mt-ds-03">
          <PeekTriageRow />
        </div>
      )}
    </div>
  )
}

TaskPanelQuickProps.displayName = 'TaskPanelQuickProps'
