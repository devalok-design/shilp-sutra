'use client'

import * as React from 'react'
import {
  IconCheck,
  IconPlus,
  IconCalendar,
  IconAlertTriangleFilled,
  IconArrowUp,
  IconArrowDown,
  IconMinus,
} from '@tabler/icons-react'
import { Icon } from '@/ui/icon'
import { motion } from 'framer-motion'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { cn } from '@/ui/lib/utils'
import { Badge } from '@/ui/badge'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/ui/tooltip'
import { Popover, PopoverTrigger, PopoverContent } from '@/ui/popover'
import { Switch } from '@/ui/switch'
import { Progress } from '@/ui/progress'
import { tweens } from '@/ui/lib/motion'
import { StatusBadge } from '@/composed/status-badge'
import { AvatarGroup } from '@/composed/avatar-group'
import { PeoplePicker } from '../../composed/people-picker'
import { TaskSection } from '../../composed/task-section'
import { useTaskPanel } from './task-panel-context'
import type { TaskPanelTask } from './task-panel-types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function formatMetaDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/** Returns human-readable relative string + urgency flags */
function formatRelativeLabel(iso: string): {
  text: string
  isOverdue: boolean
  isSoon: boolean
} {
  const diffDays = Math.ceil(
    (new Date(iso).getTime() - Date.now()) / 86_400_000,
  )
  if (diffDays < -1)
    return { text: `${Math.abs(diffDays)} days overdue`, isOverdue: true, isSoon: false }
  if (diffDays === -1)
    return { text: '1 day overdue', isOverdue: true, isSoon: false }
  if (diffDays === 0)
    return { text: 'Today', isOverdue: false, isSoon: true }
  if (diffDays === 1)
    return { text: 'Tomorrow', isOverdue: false, isSoon: true }
  if (diffDays <= 3)
    return { text: `In ${diffDays} days`, isOverdue: false, isSoon: true }
  if (diffDays <= 7)
    return { text: `In ${diffDays} days`, isOverdue: false, isSoon: false }
  return { text: '', isOverdue: false, isSoon: false }
}

/** Progress ratio between start and due dates (0-1), clamped */
function getDateProgress(
  startIso: string | undefined,
  dueIso: string | undefined,
): number | null {
  if (!startIso || !dueIso) return null
  const start = new Date(startIso).getTime()
  const due = new Date(dueIso).getTime()
  const total = due - start
  if (total <= 0) return null
  const elapsed = Date.now() - start
  return Math.max(0, Math.min(1, elapsed / total))
}

// ─── Status helpers ──────────────────────────────────────────────────────────

/** Dot color for the status picker popover items */
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

// ─── Status → StatusBadge mapping ────────────────────────────────────────────

type StatusBadgeMapping =
  | { status: 'completed' | 'in-progress' | 'review' | 'draft' | 'blocked' | 'pending' | 'active' | 'approved' | 'rejected' | 'cancelled'; color?: never }
  | { status?: never; color: 'success' | 'warning' | 'error' | 'info' | 'neutral' }

function mapStatusToBadge(statusName: string): StatusBadgeMapping {
  const lower = statusName.toLowerCase()
  if (lower === 'done' || lower === 'complete' || lower === 'completed')
    return { status: 'completed' }
  if (lower === 'in progress' || lower === 'in-progress')
    return { status: 'in-progress' }
  if (lower === 'review')
    return { color: 'warning' }
  if (lower === 'backlog' || lower === 'todo' || lower === 'to do')
    return { color: 'neutral' }
  if (lower === 'blocked')
    return { status: 'blocked' }
  if (lower === 'draft')
    return { status: 'draft' }
  if (lower === 'cancelled' || lower === 'canceled')
    return { status: 'cancelled' }
  return { color: 'info' }
}

// ─── Priority config ─────────────────────────────────────────────────────────

type Priority = TaskPanelTask['priority']
const PRIORITIES: Priority[] = ['URGENT', 'HIGH', 'MEDIUM', 'LOW']
const PRIORITY_CONFIG: Record<
  Priority,
  { icon: React.ElementType; className: string; bgClassName: string; label: string }
> = {
  URGENT: { icon: IconAlertTriangleFilled, className: 'text-error-9', bgClassName: 'bg-error-3 text-error-11', label: 'Urgent' },
  HIGH: { icon: IconArrowUp, className: 'text-warning-9', bgClassName: 'bg-warning-3 text-warning-11', label: 'High' },
  MEDIUM: { icon: IconMinus, className: 'text-surface-fg-muted', bgClassName: 'bg-surface-raised-hover text-surface-fg-muted', label: 'Medium' },
  LOW: { icon: IconArrowDown, className: 'text-surface-fg-subtle', bgClassName: 'bg-surface-raised-hover text-surface-fg-subtle', label: 'Low' },
}

// ─── Animation ───────────────────────────────────────────────────────────────

const wingVariants = {
  hidden: { opacity: 0, x: 40, scale: 0.97 },
  visible: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: 40, scale: 0.97 },
}

const popoverCls = 'border-surface-border-strong bg-surface-overlay shadow-floating'

// ─── People bandwidth / leave indicators ─────────────────────────────────────

type PersonWithBandwidth = TaskPanelTask['assignees'][number]

function PeopleIndicators({ summary }: {
  summary: {
    overloaded: PersonWithBandwidth[]
    elevated: PersonWithBandwidth[]
    onLeave: PersonWithBandwidth[]
  }
}) {
  const { overloaded, elevated, onLeave } = summary
  if (overloaded.length === 0 && elevated.length === 0 && onLeave.length === 0) return null

  return (
    <span className="ml-auto flex items-center gap-1 shrink-0">
      {overloaded.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="h-2 w-2 rounded-full bg-error-9" aria-label="Overloaded" />
          </TooltipTrigger>
          <TooltipContent>
            Overloaded: {overloaded.map((p) => p.name.split(' ')[0]).join(', ')}
          </TooltipContent>
        </Tooltip>
      )}
      {elevated.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="h-2 w-2 rounded-full bg-warning-9" aria-label="Elevated workload" />
          </TooltipTrigger>
          <TooltipContent>
            Elevated: {elevated.map((p) => p.name.split(' ')[0]).join(', ')}
          </TooltipContent>
        </Tooltip>
      )}
      {onLeave.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Badge variant="subtle" color="warning" size="xs">On leave</Badge>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            On leave: {onLeave.map((p) => p.name.split(' ')[0]).join(', ')}
          </TooltipContent>
        </Tooltip>
      )}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════

export function TaskPanelPropertiesCard() {
  const {
    task, clientMode,
    onUpdateStatus, onUpdatePriority,
    onAddAssignee, onRemoveAssignee, onAddLead, onRemoveLead,
    onUpdateDueDate, onUpdateStartDate, onUpdatePhase,
    onToggleVisibility, onAddLabel, onRemoveLabel,
  } = useTaskPanel()

  const [statusOpen, setStatusOpen] = React.useState(false)
  const [priorityOpen, setPriorityOpen] = React.useState(false)
  const [dueDateOpen, setDueDateOpen] = React.useState(false)
  const [startDateOpen, setStartDateOpen] = React.useState(false)
  const [phaseOpen, setPhaseOpen] = React.useState(false)
  const [labelOpen, setLabelOpen] = React.useState(false)
  const [newLabel, setNewLabel] = React.useState('')

  const statusName = task.statusOptions.find((o) => o.id === task.status)?.name ?? task.status
  const statusBadgeProps = mapStatusToBadge(statusName)
  const priorityCfg = PRIORITY_CONFIG[task.priority]
  const interactive = !clientMode
  const relDue = task.dueDate ? formatRelativeLabel(task.dueDate) : null
  const hasPhase = task.phaseOptions && task.phaseOptions.length > 0
  const dateProgress = getDateProgress(task.startDate ?? undefined, task.dueDate ?? undefined)

  // Merge all people (assignees + leads that aren't already assignees)
  const leadIds = React.useMemo(() => new Set(task.leads.map((l) => l.id)), [task.leads])
  const allPeople = React.useMemo(() => {
    const ids = new Set(task.assignees.map((a) => a.id))
    const merged = [...task.assignees]
    for (const lead of task.leads) {
      if (!ids.has(lead.id)) merged.push(lead)
    }
    return merged
  }, [task.assignees, task.leads])

  // AvatarGroup-compatible users
  const avatarUsers = React.useMemo(
    () => allPeople.map((p) => ({
      name: p.name,
      image: p.image,
      indicator: leadIds.has(p.id) ? 'lead' as const : undefined,
    })),
    [allPeople, leadIds],
  )

  // Smart people label: show lead's first name if one lead, otherwise count
  const peopleLabel = React.useMemo(() => {
    if (allPeople.length === 0) return ''
    const leadName = task.leads.length === 1 ? task.leads[0].name.split(' ')[0] : null
    const othersCount = allPeople.length - (leadName ? 1 : 0)
    if (leadName && othersCount > 0) return `${leadName} +${othersCount}`
    if (leadName) return leadName
    if (allPeople.length === 1) return allPeople[0].name.split(' ')[0]
    return `${allPeople.length} people`
  }, [allPeople, task.leads])

  // Bandwidth + leave summary for indicator rendering
  const bandwidthSummary = React.useMemo(() => {
    const overloaded = allPeople.filter((p) => p.bandwidth === 'OVERLOADED')
    const elevated = allPeople.filter((p) => p.bandwidth === 'ELEVATED')
    const onLeave = allPeople.filter((p) => p.isOnLeave)
    return { overloaded, elevated, onLeave }
  }, [allPeople])

  const handleToggleLead = React.useCallback(
    (memberId: string) => {
      if (leadIds.has(memberId)) onRemoveLead(memberId)
      else onAddLead(memberId)
    },
    [leadIds, onAddLead, onRemoveLead],
  )

  const handleAddLabel = React.useCallback(() => {
    const trimmed = newLabel.trim()
    if (trimmed) { onAddLabel(trimmed); setNewLabel('') }
  }, [newLabel, onAddLabel])

  const handleLabelKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') { e.preventDefault(); handleAddLabel() }
      else if (e.key === 'Escape') { e.preventDefault(); setNewLabel(''); setLabelOpen(false) }
    },
    [handleAddLabel],
  )

  return (
    <motion.div
      variants={wingVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ ...tweens.fade, delay: 0.25 }}
      className="w-[280px] overflow-hidden rounded-ds-xl border border-surface-border bg-surface-raised shadow-floating"
      data-testid="properties-wing"
    >
      <div className="p-ds-04 flex flex-col gap-4">

        {/* ═══ Top bar: Status + Priority + Visibility ══════════════════ */}
        <div className="flex items-center gap-2">
          {/* Status chip */}
          {interactive ? (
            <Popover open={statusOpen} onOpenChange={setStatusOpen}>
              <PopoverTrigger asChild>
                <span className="flex-1">
                  <StatusBadge
                    {...statusBadgeProps}
                    label={statusName}
                    size="sm"
                    onClick={() => setStatusOpen((o) => !o)}
                    className="w-full justify-center"
                  />
                </span>
              </PopoverTrigger>
              <PopoverContent className={cn('w-[180px] p-ds-02', popoverCls)} align="start" sideOffset={4}>
                {task.statusOptions.length === 0 ? (
                  <p className="px-ds-03 py-ds-02 text-ds-xs text-surface-fg-subtle">No status options</p>
                ) : (
                  task.statusOptions.map((opt) => (
                    <Button
                      key={opt.id} variant="ghost" size="compact-sm" weight="normal"
                      onClick={() => { onUpdateStatus(opt.id); setStatusOpen(false) }}
                      className={cn('w-full justify-start gap-ds-02', opt.id === task.status && 'bg-surface-raised-hover')}
                    >
                      <span className={cn('h-2 w-2 shrink-0 rounded-full', getStatusDotColor(opt.name))} aria-hidden />
                      <span className="text-ds-sm">{opt.name}</span>
                      {opt.id === task.status && <Icon icon={IconCheck} size="sm" className="ml-auto text-accent-11" />}
                    </Button>
                  ))
                )}
              </PopoverContent>
            </Popover>
          ) : (
            <StatusBadge
              {...statusBadgeProps}
              label={statusName}
              size="sm"
              className="flex-1 justify-center"
            />
          )}

          {/* Priority chip */}
          {interactive ? (
            <Popover open={priorityOpen} onOpenChange={setPriorityOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn('inline-flex items-center gap-1 rounded-ds-md px-2.5 py-1.5 transition-colors cursor-pointer hover:opacity-80', priorityCfg.bgClassName)}
                >
                  <Icon icon={priorityCfg.icon as any} size="xs" className={priorityCfg.className} />
                  <span className="text-[12px] font-medium">{priorityCfg.label}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className={cn('w-[160px] p-ds-02', popoverCls)} align="start" sideOffset={4}>
                {PRIORITIES.map((p) => {
                  const c = PRIORITY_CONFIG[p]
                  return (
                    <Button key={p} variant="ghost" size="compact-sm" weight="normal"
                      onClick={() => { onUpdatePriority(p); setPriorityOpen(false) }}
                      className={cn('w-full justify-start gap-ds-02', p === task.priority && 'bg-surface-raised-hover')}
                    >
                      <Icon icon={c.icon as any} size="sm" className={c.className} />
                      <span className="text-ds-sm">{c.label}</span>
                      {p === task.priority && <Icon icon={IconCheck} size="sm" className="ml-auto text-accent-11" />}
                    </Button>
                  )
                })}
              </PopoverContent>
            </Popover>
          ) : (
            <span className={cn('inline-flex items-center gap-1 rounded-ds-md px-2.5 py-1.5', priorityCfg.bgClassName)}>
              <Icon icon={priorityCfg.icon as any} size="xs" className={priorityCfg.className} />
              <span className="text-[12px] font-medium">{priorityCfg.label}</span>
            </span>
          )}

          {/* Visibility toggle */}
          {interactive && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="ml-auto flex items-center"
                  aria-label={task.visibility === 'EVERYONE' ? 'Visible to clients — click to make internal' : 'Internal only — click to make client visible'}
                >
                  <Switch
                    size="sm"
                    color="success"
                    checked={task.visibility === 'EVERYONE'}
                    onCheckedChange={() => onToggleVisibility()}
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {task.visibility === 'EVERYONE' ? 'Client visible' : 'Internal only'}
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* ═══ Due Date ═══════════════════════════════════════════════════ */}
        <div className="flex flex-col gap-1">
          {interactive ? (
            <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 w-full rounded-ds-sm px-1.5 py-1.5 -mx-1.5 hover:bg-surface-raised-hover transition-colors cursor-pointer text-left"
                >
                  <Icon
                    icon={IconCalendar}
                    size="xs"
                    className={cn(
                      relDue?.isOverdue ? 'text-error-9' : relDue?.isSoon ? 'text-warning-9' : 'text-surface-fg-subtle/50',
                    )}
                  />
                  {task.dueDate ? (
                    <span className="flex items-baseline gap-1.5 min-w-0">
                      <span className={cn(
                        'text-[13px]',
                        relDue?.isOverdue ? 'text-error-11' : 'text-surface-fg',
                      )}>
                        Due {formatDate(task.dueDate)}
                      </span>
                      {relDue?.text && (
                        <span className={cn(
                          'text-[12px]',
                          relDue.isOverdue ? 'text-error-11/70' : relDue.isSoon ? 'text-warning-11' : 'text-surface-fg-subtle/60',
                        )}>
                          · {relDue.text}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-[13px] text-surface-fg-subtle/40">Set due date</span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent key={task.dueDate ?? 'empty'} className={cn('w-[220px] p-ds-03', popoverCls)} align="start" sideOffset={4}>
                <div className="flex flex-col gap-ds-01 mb-ds-03">
                  {[
                    { label: 'Today', days: 0 },
                    { label: 'Tomorrow', days: 1 },
                    { label: 'Next week', days: 7 },
                    { label: 'In 2 weeks', days: 14 },
                    { label: 'Next month', days: 30 },
                  ].map(({ label, days }) => (
                    <Button key={label} variant="ghost" size="compact-sm" weight="normal" className="w-full justify-start"
                      onClick={() => { const d = new Date(); d.setDate(d.getDate() + days); d.setHours(0, 0, 0, 0); onUpdateDueDate(d); setDueDateOpen(false) }}
                    >{label}</Button>
                  ))}
                  {task.dueDate && (
                    <Button variant="ghost" size="compact-sm" weight="normal" color="error" className="w-full justify-start"
                      onClick={() => { onUpdateDueDate(null); setDueDateOpen(false) }}
                    >Remove</Button>
                  )}
                </div>
                <div className="border-t border-surface-border-subtle pt-ds-03">
                  <Input type="date" size="sm" defaultValue={task.dueDate ? task.dueDate.slice(0, 10) : ''}
                    onChange={(e) => { const v = e.target.value; onUpdateDueDate(v ? new Date(v + 'T00:00:00') : null); setDueDateOpen(false) }}
                  />
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <div className="flex items-center gap-2 px-1.5 py-1.5">
              <Icon icon={IconCalendar} size="xs" className={relDue?.isOverdue ? 'text-error-9' : 'text-surface-fg-subtle/50'} />
              {task.dueDate ? (
                <span className="flex items-baseline gap-1.5">
                  <span className={cn('text-[13px]', relDue?.isOverdue ? 'text-error-11' : 'text-surface-fg')}>
                    Due {formatDate(task.dueDate)}
                  </span>
                  {relDue?.text && (
                    <span className={cn('text-[12px]', relDue.isOverdue ? 'text-error-11/70' : 'text-surface-fg-subtle/60')}>
                      · {relDue.text}
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-[13px] text-surface-fg-subtle/40">No due date</span>
              )}
            </div>
          )}

          {/* Progress bar */}
          {dateProgress !== null && (
            <Progress autoColor value={Math.round(dateProgress * 100)} size="sm" />
          )}
        </div>

        {/* ═══ People ═════════════════════════════════════════════════════ */}
        {interactive ? (
          <PeoplePicker
            members={task.members}
            assignees={task.assignees}
            leads={task.leads}
            onAssign={onAddAssignee}
            onUnassign={onRemoveAssignee}
            onToggleLead={handleToggleLead}
            align="end"
          >
            <button
              type="button"
              className="flex items-center gap-2.5 w-full rounded-ds-sm px-1.5 py-1.5 -mx-1.5 hover:bg-surface-raised-hover transition-colors cursor-pointer text-left"
            >
              {allPeople.length > 0 ? (
                <>
                  <AvatarGroup users={avatarUsers} max={4} size="xs" />
                  <span className="text-[13px] text-surface-fg truncate">
                    {peopleLabel}
                  </span>
                  <PeopleIndicators summary={bandwidthSummary} />
                </>
              ) : (
                <>
                  <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-dashed border-surface-fg-subtle/30">
                    <Icon icon={IconPlus} size="xs" className="text-surface-fg-subtle/40" />
                  </span>
                  <span className="text-[13px] text-surface-fg-subtle/50">Add people</span>
                </>
              )}
            </button>
          </PeoplePicker>
        ) : allPeople.length > 0 ? (
          <div className="flex items-center gap-2.5 px-1.5 py-1.5">
            <AvatarGroup users={avatarUsers} max={4} size="xs" />
            <span className="text-[13px] text-surface-fg truncate">{peopleLabel}</span>
            <PeopleIndicators summary={bandwidthSummary} />
          </div>
        ) : null}

        {/* ═══ Details (collapsible — labels, phase, dates, meta) ═══════ */}
        <TaskSection title="Details" chevronPosition="right" defaultOpen={false}>
          <div className="flex flex-col gap-3 pt-2">
            {/* Labels — inline badges, no separate header */}
            <div className="flex flex-wrap items-center gap-1.5">
              {task.labels.length > 0 ? (
                task.labels.map((label) => (
                  <Badge key={label} variant="outline" size="sm"
                    onDismiss={interactive ? () => onRemoveLabel(label) : undefined}
                  >{label}</Badge>
                ))
              ) : (
                <span className="text-[12px] text-surface-fg-subtle/40">No labels</span>
              )}
              {interactive && (
                <Popover open={labelOpen} onOpenChange={setLabelOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex h-[22px] items-center gap-0.5 rounded-ds-sm px-1.5 border border-dashed border-surface-fg-subtle/20 text-surface-fg-subtle/40 hover:text-accent-11 hover:border-accent-9/40 hover:bg-surface-raised-hover transition-colors"
                      aria-label="Add label"
                    >
                      <Icon icon={IconPlus} size="xs" />
                      <span className="text-[11px]">Add</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className={cn('w-[200px] p-ds-03', popoverCls)} align="start" sideOffset={4}>
                    <Input type="text" size="sm" value={newLabel} onChange={(e) => setNewLabel(e.target.value)}
                      onKeyDown={handleLabelKeyDown} placeholder="Label name..." autoFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>

            {/* 2-column grid: Phase + Started */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              {(hasPhase && (task.phase || interactive)) && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-surface-fg-subtle/40 uppercase tracking-wider">Phase</span>
                  {interactive ? (
                    <Popover open={phaseOpen} onOpenChange={setPhaseOpen}>
                      <PopoverTrigger asChild>
                        <button type="button" className="text-[12px] text-surface-fg-muted hover:text-surface-fg hover:bg-surface-raised-hover rounded-ds-sm px-1.5 py-1 -mx-1.5 transition-colors text-left truncate">
                          {task.phase?.name ?? <span className="text-surface-fg-subtle/40">None</span>}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className={cn('w-[180px] p-ds-02', popoverCls)} align="start" sideOffset={4}>
                        {task.phaseOptions!.map((opt) => (
                          <Button key={opt.id} variant="ghost" size="compact-sm" weight="normal"
                            onClick={() => { onUpdatePhase(opt.id); setPhaseOpen(false) }}
                            className={cn('w-full justify-start', opt.id === task.phase?.id && 'bg-surface-raised-hover')}
                          >
                            {opt.name}
                            {opt.id === task.phase?.id && <Icon icon={IconCheck} size="sm" className="ml-auto text-accent-11" />}
                          </Button>
                        ))}
                        {task.phase && (
                          <Button variant="ghost" size="compact-sm" weight="normal" color="error"
                            onClick={() => { onUpdatePhase(null); setPhaseOpen(false) }}
                            className="w-full justify-start mt-ds-01"
                          >Remove</Button>
                        )}
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <span className="text-[12px] text-surface-fg-muted truncate">{task.phase?.name ?? 'None'}</span>
                  )}
                </div>
              )}

              {(task.startDate || interactive) && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-surface-fg-subtle/40 uppercase tracking-wider">Started</span>
                  {interactive ? (
                    <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                      <PopoverTrigger asChild>
                        <button type="button" className="text-[12px] text-surface-fg-muted hover:text-surface-fg hover:bg-surface-raised-hover rounded-ds-sm px-1.5 py-1 -mx-1.5 transition-colors text-left">
                          {task.startDate ? formatDate(task.startDate) : <span className="text-surface-fg-subtle/40">Not set</span>}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent key={task.startDate ?? 'empty'} className={cn('w-[220px] p-ds-03', popoverCls)} align="start" sideOffset={4}>
                        <Input type="date" size="sm" defaultValue={task.startDate ? task.startDate.slice(0, 10) : ''}
                          onChange={(e) => { const v = e.target.value; onUpdateStartDate(v ? new Date(v + 'T00:00:00') : null); setStartDateOpen(false) }}
                        />
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <span className="text-[12px] text-surface-fg-muted">{task.startDate ? formatDate(task.startDate) : 'Not set'}</span>
                  )}
                </div>
              )}
            </div>

            {/* Created by */}
            {task.createdByName && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-surface-fg-subtle/40 uppercase tracking-wider">Created by</span>
                <div className="flex items-center gap-1">
                  <span className="text-[12px] text-surface-fg-muted">{task.createdByName}</span>
                  {task.createdByType === 'SYSTEM' && <Badge variant="subtle" color="accent" size="xs">AI</Badge>}
                  {task.createdByType === 'CLIENT' && <Badge variant="subtle" color="success" size="xs">Client</Badge>}
                </div>
              </div>
            )}

            {/* 2-column grid: Created + Updated */}
            <div className="grid grid-cols-2 gap-x-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-surface-fg-subtle/40 uppercase tracking-wider">Created</span>
                <span className="text-[12px] text-surface-fg-subtle/60">{formatMetaDate(task.createdAt)}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-surface-fg-subtle/40 uppercase tracking-wider">Updated</span>
                <span className="text-[12px] text-surface-fg-subtle/60">{timeAgo(task.updatedAt)}</span>
              </div>
            </div>
          </div>
        </TaskSection>
      </div>
    </motion.div>
  )
}

TaskPanelPropertiesCard.displayName = 'TaskPanelPropertiesCard'
