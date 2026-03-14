'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/ui/avatar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/ui/popover'
import {
  IconColumns3,
  IconUser as UserIcon,
  IconUsers,
  IconFlag,
  IconCalendarEvent,
  IconTag,
  IconEye,
  IconPlus,
  IconCheck,
  IconX,
  IconChevronDown,
} from '@tabler/icons-react'
import { getInitials } from '@/composed/lib/string-utils'
import { MemberPicker } from '@/composed/member-picker'
import { PRIORITY_LABELS, PRIORITY_DOT_COLORS } from './task-constants'

import type { Member, Column } from './task-types'
export type { Member, Column }

// ============================================================
// Types
// ============================================================

interface TaskData {
  id: string
  columnId: string
  column: { id: string; name: string }
  ownerId: string | null
  owner: Member | null
  assignees: { user: Member }[]
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate: string | null
  labels: string[]
  visibility: 'INTERNAL' | 'EVERYONE'
}

interface TaskPropertiesProps extends React.HTMLAttributes<HTMLDivElement> {
  task: TaskData
  columns: Column[]
  members: Member[]
  onUpdate: (field: string, value: unknown) => void
  onAssign: (userId: string) => void
  onUnassign: (userId: string) => void
  /** When true, most fields are display-only except those in editableFields */
  readOnly?: boolean
  /** Field names the client can still edit (e.g. ['priority', 'dueDate']) */
  editableFields?: string[]
  /** Optional priority indicator component. Falls back to text label. */
  renderPriorityIndicator?: (props: { priority: string }) => React.ReactNode
  /** Optional date picker component. Falls back to native date input. */
  renderDatePicker?: (props: {
    value: Date | null
    onChange: (date: Date | null) => void
    placeholder: string
    className?: string
  }) => React.ReactNode
  /** Called when switching visibility to EVERYONE. If omitted, the change applies immediately. */
  onConfirmVisibilityChange?: () => void
}

// ============================================================
// Helpers
// ============================================================

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const

// ============================================================
// Property Row
// ============================================================

function PropertyRow({
  icon: Icon,
  label,
  children,
  className,
}: {
  icon: React.ElementType
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-ds-04 py-ds-03',
        className,
      )}
    >
      <div className="flex w-[120px] shrink-0 items-center gap-ds-03 text-surface-fg-subtle">
        <Icon className="h-ico-sm w-ico-sm" stroke={1.5} />
        <span className="text-ds-sm">{label}</span>
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}

// ============================================================
// Default Priority Indicator
// ============================================================

function DefaultPriorityIndicator({ priority }: { priority: string }) {
  return (
    <div className="flex items-center gap-ds-02b">
      <div className={cn('h-2 w-2 rounded-ds-full', PRIORITY_DOT_COLORS[priority])} />
      <span className="text-ds-md text-surface-fg">
        {PRIORITY_LABELS[priority] || priority}
      </span>
    </div>
  )
}

// ============================================================
// Task Properties Component
// ============================================================

const TaskProperties = React.forwardRef<HTMLDivElement, TaskPropertiesProps>(
  function TaskProperties({
  task,
  columns,
  members,
  onUpdate,
  onAssign,
  onUnassign,
  className,
  readOnly = false,
  editableFields,
  renderPriorityIndicator,
  renderDatePicker,
  onConfirmVisibilityChange,
  ...props
}, ref) {
  const [labelInput, setLabelInput] = React.useState('')
  const [showLabelInput, setShowLabelInput] = React.useState(false)

  const assigneeIds = task.assignees.map((a) => a.user.id)

  const pickerMembers = React.useMemo(
    () => members.map((m) => ({ id: m.id, name: m.name, avatar: m.image ?? undefined })),
    [members],
  )

  const handleColumnChange = (columnId: string) => {
    onUpdate('columnId', columnId)
  }

  const handleOwnerChange = (userId: string) => {
    onUpdate('ownerId', userId === task.ownerId ? null : userId)
  }

  const handleAssigneeToggle = (userId: string) => {
    if (assigneeIds.includes(userId)) {
      onUnassign(userId)
    } else {
      onAssign(userId)
    }
  }

  const handlePriorityChange = (priority: string) => {
    onUpdate('priority', priority)
  }

  const handleDueDateChange = (date: Date | null) => {
    onUpdate('dueDate', date ? date.toISOString() : null)
  }

  const handleAddLabel = () => {
    const trimmed = labelInput.trim()
    if (trimmed && !task.labels.includes(trimmed)) {
      onUpdate('labels', [...task.labels, trimmed])
    }
    setLabelInput('')
    setShowLabelInput(false)
  }

  const handleRemoveLabel = (label: string) => {
    onUpdate('labels', task.labels.filter((l) => l !== label))
  }

  const handleVisibilityToggle = () => {
    const newVisibility = task.visibility === 'INTERNAL' ? 'EVERYONE' : 'INTERNAL'

    if (newVisibility === 'EVERYONE' && onConfirmVisibilityChange) {
      onConfirmVisibilityChange()
      return
    }

    onUpdate('visibility', newVisibility)
  }

  const PriorityIndicator = renderPriorityIndicator || DefaultPriorityIndicator

  return (
    <div ref={ref} className={cn('space-y-ds-01', className)} {...props}>
      {/* Column */}
      <PropertyRow icon={IconColumns3} label="Column">
        {readOnly && !editableFields?.includes('columnId') ? (
          <span className="px-ds-03 py-ds-02 text-ds-md text-surface-fg">
            {task.column.name}
          </span>
        ) : (
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-ds-02b rounded-ds-md px-ds-03 py-ds-02 text-ds-md text-surface-fg transition-colors hover:bg-surface-3"
              >
                <span>{task.column.name}</span>
                <IconChevronDown className="h-3 w-3 text-surface-fg-subtle" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[180px] border-surface-border-strong bg-surface-1 p-ds-02"
              align="start"
              sideOffset={4}
            >
              {columns.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => handleColumnChange(col.id)}
                  className={cn(
                    'flex w-full items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-02b text-left text-ds-md transition-colors',
                    'hover:bg-surface-3',
                    col.id === task.columnId
                      ? 'text-accent-11'
                      : 'text-surface-fg',
                  )}
                >
                  {col.name}
                  {col.id === task.columnId && (
                    <IconCheck className="ml-auto h-ico-sm w-ico-sm" />
                  )}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        )}
      </PropertyRow>

      {/* Owner -- hidden in client readOnly mode */}
      {!readOnly && (
        <PropertyRow icon={UserIcon} label="Owner">
          <MemberPicker
            members={pickerMembers}
            selectedIds={task.ownerId ? [task.ownerId] : []}
            onSelect={handleOwnerChange}
          >
            <button
              type="button"
              className="inline-flex items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-02 transition-colors hover:bg-surface-3"
            >
              {task.owner ? (
                <>
                  <Avatar className="h-ico-md w-ico-md">
                    {task.owner.image && (
                      <AvatarImage src={task.owner.image} alt={task.owner.name} />
                    )}
                    <AvatarFallback className="bg-surface-3 text-ds-xs font-semibold text-accent-fg">
                      {getInitials(task.owner.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-ds-md text-surface-fg">
                    {task.owner.name}
                  </span>
                </>
              ) : (
                <span className="text-ds-md text-surface-fg-subtle">
                  No owner
                </span>
              )}
            </button>
          </MemberPicker>
        </PropertyRow>
      )}

      {/* Assignees */}
      <PropertyRow icon={IconUsers} label="Assignees">
        <div className="flex flex-wrap items-center gap-ds-02b">
          {task.assignees.map((a) => (
            <div
              key={a.user.id}
              className="inline-flex items-center gap-ds-02 rounded-ds-full bg-surface-2 py-ds-01 pl-ds-01 pr-ds-03"
            >
              <Avatar className="h-ico-sm w-ico-sm">
                {a.user.image && (
                  <AvatarImage src={a.user.image} alt={a.user.name} />
                )}
                <AvatarFallback className="bg-surface-3 text-ds-xs font-semibold text-accent-fg">
                  {getInitials(a.user.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-ds-sm text-surface-fg-muted">
                {a.user.name.split(' ')[0]}
              </span>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => onUnassign(a.user.id)}
                  className="ml-ds-01 rounded-ds-full p-ds-01 transition-colors hover:bg-surface-3"
                  aria-label={`Remove ${a.user.name}`}
                >
                  <IconX className="h-ds-03 w-ds-03 text-surface-fg-subtle" />
                </button>
              )}
            </div>
          ))}
          {!readOnly && (
            <MemberPicker
              members={pickerMembers}
              selectedIds={assigneeIds}
              onSelect={handleAssigneeToggle}
              multiple
            >
              <button
                type="button"
                className="inline-flex h-ico-md w-ico-md items-center justify-center rounded-ds-full border border-dashed border-surface-border transition-colors hover:bg-surface-3 hover:border-surface-border"
                aria-label="Add assignee"
              >
                <IconPlus className="h-3 w-3 text-surface-fg-subtle" />
              </button>
            </MemberPicker>
          )}
          {readOnly && task.assignees.length === 0 && (
            <span className="text-ds-md text-surface-fg-subtle">
              None
            </span>
          )}
        </div>
      </PropertyRow>

      {/* Priority */}
      <PropertyRow icon={IconFlag} label="Priority">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="rounded-ds-md px-ds-03 py-ds-02 transition-colors hover:bg-surface-3"
            >
              <PriorityIndicator priority={task.priority} />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[160px] border-surface-border-strong bg-surface-1 p-ds-02"
            align="start"
            sideOffset={4}
          >
            {PRIORITIES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handlePriorityChange(p)}
                className={cn(
                  'flex w-full items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-02b transition-colors',
                  'hover:bg-surface-3',
                  p === task.priority && 'bg-surface-3',
                )}
              >
                <PriorityIndicator priority={p} />
              </button>
            ))}
          </PopoverContent>
        </Popover>
      </PropertyRow>

      {/* Due Date */}
      <PropertyRow icon={IconCalendarEvent} label="Due Date">
        <div className="flex items-center gap-ds-02">
          {renderDatePicker ? (
            renderDatePicker({
              value: task.dueDate ? new Date(task.dueDate) : null,
              onChange: handleDueDateChange,
              placeholder: 'No due date',
              className: 'h-ds-xs-plus border-none bg-transparent px-ds-03 text-ds-md hover:bg-surface-3',
            })
          ) : (
            <input
              type="date"
              value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
              onChange={(e) => handleDueDateChange(e.target.value ? new Date(e.target.value) : null)}
              aria-label="Due date"
              className="h-ds-xs-plus border-none bg-transparent px-ds-03 text-ds-md text-surface-fg outline-none hover:bg-surface-3 rounded-ds-md"
            />
          )}
          {task.dueDate && (
            <button
              type="button"
              onClick={() => handleDueDateChange(null)}
              className="rounded-ds-md p-ds-02 transition-colors hover:bg-surface-3"
              aria-label="Clear due date"
            >
              <IconX className="h-3 w-3 text-surface-fg-subtle" />
            </button>
          )}
        </div>
      </PropertyRow>

      {/* Labels */}
      <PropertyRow icon={IconTag} label="Labels">
        <div className="flex flex-wrap items-center gap-ds-02b">
          {task.labels.map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-ds-02 rounded-ds-full bg-accent-2 px-ds-03 py-ds-01 text-ds-sm font-medium text-accent-11"
            >
              {label}
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleRemoveLabel(label)}
                  className="rounded-ds-full p-ds-01 transition-colors hover:bg-surface-3"
                  aria-label={`Remove label ${label}`}
                >
                  <IconX className="h-ds-03 w-ds-03" />
                </button>
              )}
            </span>
          ))}
          {!readOnly && (
            showLabelInput ? (
              <div className="inline-flex items-center gap-ds-02">
                {/* eslint-disable jsx-a11y/no-autofocus -- intentional: input appears after user clicks "+" to add label */}
                <input
                  type="text"
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  aria-label="New label name"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddLabel()
                    if (e.key === 'Escape') {
                      setShowLabelInput(false)
                      setLabelInput('')
                    }
                  }}
                  onBlur={handleAddLabel}
                  placeholder="Label name"
                  className="h-5 w-20 rounded border border-surface-border-strong bg-transparent px-ds-02b text-ds-sm text-surface-fg outline-none placeholder:text-surface-fg-subtle focus:border-surface-border"
                  autoFocus
                />
                {/* eslint-enable jsx-a11y/no-autofocus */}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowLabelInput(true)}
                className="inline-flex h-ico-md w-ico-md items-center justify-center rounded-ds-full border border-dashed border-surface-border transition-colors hover:bg-surface-3 hover:border-surface-border"
                aria-label="Add label"
              >
                <IconPlus className="h-3 w-3 text-surface-fg-subtle" />
              </button>
            )
          )}
          {readOnly && task.labels.length === 0 && (
            <span className="text-ds-md text-surface-fg-subtle">
              None
            </span>
          )}
        </div>
      </PropertyRow>

      {/* Visibility -- hidden in client readOnly mode */}
      {!readOnly && (
        <PropertyRow icon={IconEye} label="Visibility">
          <button
            type="button"
            onClick={handleVisibilityToggle}
            className={cn(
              'inline-flex items-center gap-ds-02b rounded-ds-full px-ds-03 py-ds-01 text-ds-sm font-semibold tracking-wide transition-colors',
              task.visibility === 'EVERYONE'
                ? 'bg-success-3 text-success-11'
                : 'bg-surface-2 text-surface-fg-subtle',
            )}
          >
            <span
              className={cn(
                'h-ds-02b w-ds-02b rounded-ds-full',
                task.visibility === 'EVERYONE'
                  ? 'bg-success-9'
                  : 'bg-disabled',
              )}
            />
            {task.visibility === 'EVERYONE' ? 'Everyone' : 'Internal'}
          </button>
        </PropertyRow>
      )}
    </div>
  )
},
)

TaskProperties.displayName = 'TaskProperties'

export { TaskProperties }
export type { TaskPropertiesProps, TaskData }
