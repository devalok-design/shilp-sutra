'use client'

import * as React from 'react'
import { cn } from '../../ui/lib/utils'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '../../ui/avatar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../ui/popover'
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
import { getInitials } from '../../shared/lib/string-utils'
import { MemberPicker } from '../../shared/member-picker'
import { PRIORITY_LABELS, PRIORITY_DOT_COLORS } from './task-constants'

// ============================================================
// Types
// ============================================================

export interface Member {
  id: string
  name: string
  email?: string
  image?: string | null
}

export interface Column {
  id: string
  name: string
  isDefault?: boolean
  isTerminal?: boolean
}

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

interface TaskPropertiesProps {
  task: TaskData
  columns: Column[]
  members: Member[]
  onUpdate: (field: string, value: unknown) => void
  onAssign: (userId: string) => void
  onUnassign: (userId: string) => void
  className?: string
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
        'flex items-center gap-3 py-2',
        className,
      )}
    >
      <div className="flex w-[120px] shrink-0 items-center gap-2 text-[var(--color-text-placeholder)]">
        <Icon className="h-[var(--icon-sm)] w-[var(--icon-sm)]" stroke={1.5} />
        <span className="B3-Reg">{label}</span>
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
    <div className="flex items-center gap-1.5">
      <div className={cn('h-2 w-2 rounded-[var(--radius-full)]', PRIORITY_DOT_COLORS[priority])} />
      <span className="text-[13px] font-body text-[var(--color-text-primary)]">
        {PRIORITY_LABELS[priority] || priority}
      </span>
    </div>
  )
}

// ============================================================
// Task Properties Component
// ============================================================

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
}: TaskPropertiesProps) {
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

    if (newVisibility === 'EVERYONE' && task.visibility === 'INTERNAL') {
      if (!window.confirm('This will make this task visible to project clients. Continue?')) {
        return
      }
    }

    onUpdate('visibility', newVisibility)
  }

  const PriorityIndicator = renderPriorityIndicator || DefaultPriorityIndicator

  return (
    <div className={cn('space-y-0.5', className)}>
      {/* Column */}
      <PropertyRow icon={IconColumns3} label="Column">
        {readOnly && !editableFields?.includes('columnId') ? (
          <span className="px-2 py-1 text-[13px] font-body text-[var(--color-text-primary)]">
            {task.column.name}
          </span>
        ) : (
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] px-2 py-1 text-[13px] font-body text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-field)]"
              >
                <span>{task.column.name}</span>
                <IconChevronDown className="h-3 w-3 text-[var(--color-text-placeholder)]" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[180px] border-[var(--color-border-default)] bg-[var(--color-layer-01)] p-1"
              align="start"
              sideOffset={4}
            >
              {columns.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => handleColumnChange(col.id)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-[var(--radius-md)] px-2.5 py-1.5 text-left text-[13px] font-body transition-colors',
                    'hover:bg-[var(--color-field)]',
                    col.id === task.columnId
                      ? 'text-[var(--color-interactive)]'
                      : 'text-[var(--color-text-primary)]',
                  )}
                >
                  {col.name}
                  {col.id === task.columnId && (
                    <IconCheck className="ml-auto h-[var(--icon-sm)] w-[var(--icon-sm)]" />
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
              className="inline-flex items-center gap-2 rounded-[var(--radius-md)] px-2 py-1 transition-colors hover:bg-[var(--color-field)]"
            >
              {task.owner ? (
                <>
                  <Avatar className="h-[var(--icon-md)] w-[var(--icon-md)]">
                    {task.owner.image && (
                      <AvatarImage src={task.owner.image} alt={task.owner.name} />
                    )}
                    <AvatarFallback className="bg-[var(--color-layer-03)] text-[8px] font-semibold text-[var(--color-text-on-color)]">
                      {getInitials(task.owner.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[13px] font-body text-[var(--color-text-primary)]">
                    {task.owner.name}
                  </span>
                </>
              ) : (
                <span className="text-[13px] font-body text-[var(--color-text-placeholder)]">
                  No owner
                </span>
              )}
            </button>
          </MemberPicker>
        </PropertyRow>
      )}

      {/* Assignees */}
      <PropertyRow icon={IconUsers} label="Assignees">
        <div className="flex flex-wrap items-center gap-1.5">
          {task.assignees.map((a) => (
            <div
              key={a.user.id}
              className="inline-flex items-center gap-1 rounded-[var(--radius-full)] bg-[var(--color-layer-02)] py-0.5 pl-0.5 pr-2"
            >
              <Avatar className="h-[var(--icon-sm)] w-[var(--icon-sm)]">
                {a.user.image && (
                  <AvatarImage src={a.user.image} alt={a.user.name} />
                )}
                <AvatarFallback className="bg-[var(--color-layer-03)] text-[7px] font-semibold text-[var(--color-text-on-color)]">
                  {getInitials(a.user.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-[11px] font-body text-[var(--color-text-secondary)]">
                {a.user.name.split(' ')[0]}
              </span>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => onUnassign(a.user.id)}
                  className="ml-0.5 rounded-[var(--radius-full)] p-0.5 transition-colors hover:bg-[var(--color-field)]"
                >
                  <IconX className="h-2.5 w-2.5 text-[var(--color-text-placeholder)]" />
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
                className="inline-flex h-[var(--icon-md)] w-[var(--icon-md)] items-center justify-center rounded-[var(--radius-full)] border border-dashed border-[var(--color-border-subtle)] transition-colors hover:bg-[var(--color-field)] hover:border-[var(--color-text-placeholder)]"
              >
                <IconPlus className="h-3 w-3 text-[var(--color-text-placeholder)]" />
              </button>
            </MemberPicker>
          )}
          {readOnly && task.assignees.length === 0 && (
            <span className="text-[13px] font-body text-[var(--color-text-placeholder)]">
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
              className="rounded-[var(--radius-md)] px-2 py-1 transition-colors hover:bg-[var(--color-field)]"
            >
              <PriorityIndicator priority={task.priority} />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[160px] border-[var(--color-border-default)] bg-[var(--color-layer-01)] p-1"
            align="start"
            sideOffset={4}
          >
            {PRIORITIES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handlePriorityChange(p)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-[var(--radius-md)] px-2.5 py-1.5 transition-colors',
                  'hover:bg-[var(--color-field)]',
                  p === task.priority && 'bg-[var(--color-field)]',
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
        <div className="flex items-center gap-1">
          {renderDatePicker ? (
            renderDatePicker({
              value: task.dueDate ? new Date(task.dueDate) : null,
              onChange: handleDueDateChange,
              placeholder: 'No due date',
              className: 'h-7 border-none bg-transparent px-2 text-[13px] hover:bg-[var(--color-field)]',
            })
          ) : (
            <input
              type="date"
              value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
              onChange={(e) => handleDueDateChange(e.target.value ? new Date(e.target.value) : null)}
              className="h-7 border-none bg-transparent px-2 text-[13px] font-body text-[var(--color-text-primary)] outline-none hover:bg-[var(--color-field)] rounded-[var(--radius-md)]"
            />
          )}
          {task.dueDate && (
            <button
              type="button"
              onClick={() => handleDueDateChange(null)}
              className="rounded-[var(--radius-md)] p-1 transition-colors hover:bg-[var(--color-field)]"
            >
              <IconX className="h-3 w-3 text-[var(--color-text-placeholder)]" />
            </button>
          )}
        </div>
      </PropertyRow>

      {/* Labels */}
      <PropertyRow icon={IconTag} label="Labels">
        <div className="flex flex-wrap items-center gap-1.5">
          {task.labels.map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-1 rounded-[var(--radius-full)] bg-[var(--color-interactive)]/10 px-2 py-0.5 text-[11px] font-body font-medium text-[var(--color-interactive)]"
            >
              {label}
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleRemoveLabel(label)}
                  className="rounded-[var(--radius-full)] p-0.5 transition-colors hover:bg-[var(--color-field)]"
                >
                  <IconX className="h-2.5 w-2.5" />
                </button>
              )}
            </span>
          ))}
          {!readOnly && (
            showLabelInput ? (
              <div className="inline-flex items-center gap-1">
                <input
                  type="text"
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddLabel()
                    if (e.key === 'Escape') {
                      setShowLabelInput(false)
                      setLabelInput('')
                    }
                  }}
                  onBlur={handleAddLabel}
                  placeholder="Label name"
                  className="h-5 w-20 rounded border border-[var(--color-border-default)] bg-transparent px-1.5 text-[11px] font-body text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-border-subtle)]"
                  autoFocus
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowLabelInput(true)}
                className="inline-flex h-[var(--icon-md)] w-[var(--icon-md)] items-center justify-center rounded-[var(--radius-full)] border border-dashed border-[var(--color-border-subtle)] transition-colors hover:bg-[var(--color-field)] hover:border-[var(--color-text-placeholder)]"
              >
                <IconPlus className="h-3 w-3 text-[var(--color-text-placeholder)]" />
              </button>
            )
          )}
          {readOnly && task.labels.length === 0 && (
            <span className="text-[13px] font-body text-[var(--color-text-placeholder)]">
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
              'inline-flex items-center gap-1.5 rounded-[var(--radius-full)] px-2.5 py-0.5 text-[11px] font-body font-semibold tracking-wide transition-colors',
              task.visibility === 'EVERYONE'
                ? 'bg-[var(--color-success-surface)] text-[var(--color-text-success)]'
                : 'bg-[var(--color-layer-02)] text-[var(--color-text-tertiary)]',
            )}
          >
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-[var(--radius-full)]',
                task.visibility === 'EVERYONE'
                  ? 'bg-[var(--green-500)]'
                  : 'bg-[var(--neutral-400)]',
              )}
            />
            {task.visibility === 'EVERYONE' ? 'Everyone' : 'Internal'}
          </button>
        </PropertyRow>
      )}
    </div>
  )
}

TaskProperties.displayName = 'TaskProperties'

export { TaskProperties }
export type { TaskPropertiesProps, TaskData }
