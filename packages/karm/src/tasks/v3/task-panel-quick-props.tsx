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
  'inline-flex items-center gap-ds-02 rounded-full text-ds-sm px-ds-03 py-ds-01'

const pillInteractive =
  'bg-surface-raised-hover transition-colors hover:bg-surface-3 cursor-pointer'

const pillStatic = 'bg-surface-raised-hover'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
// Status Pill
// ---------------------------------------------------------------------------

function StatusPill({ interactive }: { interactive: boolean }) {
  const { task, onUpdateStatus } = useTaskPanel()
  const [open, setOpen] = React.useState(false)

  const statusName =
    task.statusOptions.find((o) => o.id === task.status)?.name ?? task.status

  const dot = (
    <span className="h-2 w-2 shrink-0 rounded-full bg-accent-9" aria-hidden />
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
        {task.statusOptions.map((opt) => (
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
            <span className="h-2 w-2 shrink-0 rounded-full bg-accent-9" aria-hidden />
            <span className="text-ds-sm text-surface-fg">{opt.name}</span>
            {opt.id === task.status && (
              <IconCheck className="ml-auto h-ico-sm w-ico-sm text-accent-11" />
            )}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}

// ---------------------------------------------------------------------------
// Assignee Pill
// ---------------------------------------------------------------------------

function AssigneePill({ interactive }: { interactive: boolean }) {
  const { task, onUpdateAssignee } = useTaskPanel()
  const [open, setOpen] = React.useState(false)

  const content = task.assignee ? (
    <>
      <Avatar size="xs" className="h-5 w-5">
        {task.assignee.image && <AvatarImage src={task.assignee.image} />}
        <AvatarFallback className="text-[9px]">
          {getInitials(task.assignee.name)}
        </AvatarFallback>
      </Avatar>
      <span className="text-surface-fg">{task.assignee.name}</span>
    </>
  ) : (
    <>
      <IconUser className="h-3.5 w-3.5 text-surface-fg-subtle" />
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
        <TooltipContent>Assignee (A)</TooltipContent>
      </Tooltip>
      <PopoverContent
        className="w-[200px] border-surface-border-strong bg-surface-overlay p-ds-02"
        align="start"
        sideOffset={4}
      >
        {/* Unassign option */}
        <button
          type="button"
          onClick={() => {
            onUpdateAssignee(null)
            setOpen(false)
          }}
          className={cn(
            'flex w-full items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-02b transition-colors',
            'hover:bg-surface-raised-hover',
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
              setOpen(false)
            }}
            className={cn(
              'flex w-full items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-02b transition-colors',
              'hover:bg-surface-raised-hover',
              task.assignee?.id === member.id && 'bg-surface-raised-hover',
            )}
          >
            <Avatar size="xs">
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
  )
}

// ---------------------------------------------------------------------------
// Priority Pill
// ---------------------------------------------------------------------------

function PriorityPill({ interactive }: { interactive: boolean }) {
  const { task, onUpdatePriority } = useTaskPanel()
  const [open, setOpen] = React.useState(false)

  const config = PRIORITY_CONFIG[task.priority]
  const Icon = config.icon

  const content = (
    <>
      <Icon className={cn('h-3.5 w-3.5', config.className)} />
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
  )
}

// ---------------------------------------------------------------------------
// Due Date Pill
// ---------------------------------------------------------------------------

function DueDatePill({ interactive }: { interactive: boolean }) {
  const { task, onUpdateDueDate } = useTaskPanel()
  const [open, setOpen] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const content = (
    <>
      <IconCalendar className="h-3.5 w-3.5 text-surface-fg-subtle" />
      <span className={task.dueDate ? 'text-surface-fg' : 'text-surface-fg-subtle'}>
        {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
      </span>
    </>
  )

  if (!interactive) {
    return (
      <span className={cn(pillBase, pillStatic)} data-testid="due-date-pill">
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
              data-testid="due-date-pill"
            >
              {content}
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Due date (D)</TooltipContent>
      </Tooltip>
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
            className="rounded-ds-md border border-surface-border bg-surface-1 px-ds-03 py-ds-02 text-ds-sm text-surface-fg outline-none focus:border-accent-9"
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
  const { task, onUpdateStatus, onUpdatePriority, onUpdateAssignee } =
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
            <span className="h-2 w-2 shrink-0 rounded-full bg-accent-9" aria-hidden />
            {statusName}
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
                'flex w-full items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-02b transition-colors',
                'hover:bg-surface-raised-hover',
                opt.id === task.status && 'bg-surface-raised-hover',
              )}
            >
              <span className="text-ds-sm">{opt.name}</span>
            </button>
          ))}
        </PopoverContent>
      </Popover>

      {/* Priority */}
      <Popover open={priorityOpen} onOpenChange={setPriorityOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(pillBase, pillInteractive, 'text-ds-xs')}
          >
            <PriorityIcon className={cn('h-3 w-3', priorityCfg.className)} />
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
                <PIcon className={cn('h-ico-sm w-ico-sm', c.className)} />
                <span className="text-ds-sm">{c.label}</span>
              </button>
            )
          })}
        </PopoverContent>
      </Popover>

      {/* Assignee */}
      <Popover open={assigneeOpen} onOpenChange={setAssigneeOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(pillBase, pillInteractive, 'text-ds-xs')}
          >
            {task.assignee ? (
              <>
                <Avatar size="xs" className="h-4 w-4">
                  {task.assignee.image && (
                    <AvatarImage src={task.assignee.image} />
                  )}
                  <AvatarFallback className="text-[8px]">
                    {getInitials(task.assignee.name)}
                  </AvatarFallback>
                </Avatar>
                {task.assignee.name}
              </>
            ) : (
              <>
                <IconUser className="h-3 w-3 text-surface-fg-subtle" />
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
          <button
            type="button"
            onClick={() => {
              onUpdateAssignee(null)
              setAssigneeOpen(false)
            }}
            className={cn(
              'flex w-full items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-02b transition-colors',
              'hover:bg-surface-raised-hover',
            )}
          >
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
                'flex w-full items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-02b transition-colors',
                'hover:bg-surface-raised-hover',
                task.assignee?.id === member.id && 'bg-surface-raised-hover',
              )}
            >
              <Avatar size="xs" className="h-5 w-5">
                {member.image && <AvatarImage src={member.image} />}
                <AvatarFallback className="text-[8px]">
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-ds-sm">{member.name}</span>
            </button>
          ))}
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
  const interactive = !clientMode

  return (
    <div className={cn('px-ds-05 pb-ds-03', className)} {...props}>
      {/* Property pills */}
      <div className="flex flex-wrap items-center gap-ds-02">
        <StatusPill interactive={interactive} />
        <AssigneePill interactive={interactive} />
        <PriorityPill interactive={interactive} />
        <DueDatePill interactive={interactive} />
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
