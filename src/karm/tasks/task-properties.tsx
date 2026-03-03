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
        'flex items-center gap-ds-04 py-ds-03',
        className,
      )}
    >
      <div className="flex w-[120px] shrink-0 items-center gap-ds-03 text-text-placeholder">
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
      <span className="text-ds-md text-text-primary">
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

    if (newVisibility === 'EVERYONE' && task.visibility === 'INTERNAL') {
      if (!window.confirm('This will make this task visible to project clients. Continue?')) {
        return
      }
    }

    onUpdate('visibility', newVisibility)
  }

  const PriorityIndicator = renderPriorityIndicator || DefaultPriorityIndicator

  return (
    <div ref={ref} className={cn('space-y-ds-01', className)}>
      {/* Column */}
      <PropertyRow icon={IconColumns3} label="Column">
        {readOnly && !editableFields?.includes('columnId') ? (
          <span className="px-ds-03 py-ds-02 text-ds-md text-text-primary">
            {task.column.name}
          </span>
        ) : (
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-ds-02b rounded-ds-md px-ds-03 py-ds-02 text-ds-md text-text-primary transition-colors hover:bg-field"
              >
                <span>{task.column.name}</span>
                <IconChevronDown className="h-3 w-3 text-text-placeholder" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[180px] border-border bg-layer-01 p-ds-02"
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
                    'hover:bg-field',
                    col.id === task.columnId
                      ? 'text-interactive'
                      : 'text-text-primary',
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
              className="inline-flex items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-02 transition-colors hover:bg-field"
            >
              {task.owner ? (
                <>
                  <Avatar className="h-ico-md w-ico-md">
                    {task.owner.image && (
                      <AvatarImage src={task.owner.image} alt={task.owner.name} />
                    )}
                    <AvatarFallback className="bg-layer-03 text-ds-xs font-semibold text-text-on-color">
                      {getInitials(task.owner.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-ds-md text-text-primary">
                    {task.owner.name}
                  </span>
                </>
              ) : (
                <span className="text-ds-md text-text-placeholder">
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
              className="inline-flex items-center gap-ds-02 rounded-ds-full bg-layer-02 py-ds-01 pl-ds-01 pr-ds-03"
            >
              <Avatar className="h-ico-sm w-ico-sm">
                {a.user.image && (
                  <AvatarImage src={a.user.image} alt={a.user.name} />
                )}
                <AvatarFallback className="bg-layer-03 text-ds-xs font-semibold text-text-on-color">
                  {getInitials(a.user.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-ds-sm text-text-secondary">
                {a.user.name.split(' ')[0]}
              </span>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => onUnassign(a.user.id)}
                  className="ml-ds-01 rounded-ds-full p-ds-01 transition-colors hover:bg-field"
                >
                  <IconX className="h-ds-03 w-ds-03 text-text-placeholder" />
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
                className="inline-flex h-ico-md w-ico-md items-center justify-center rounded-ds-full border border-dashed border-border-subtle transition-colors hover:bg-field hover:border-text-placeholder"
              >
                <IconPlus className="h-3 w-3 text-text-placeholder" />
              </button>
            </MemberPicker>
          )}
          {readOnly && task.assignees.length === 0 && (
            <span className="text-ds-md text-text-placeholder">
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
              className="rounded-ds-md px-ds-03 py-ds-02 transition-colors hover:bg-field"
            >
              <PriorityIndicator priority={task.priority} />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[160px] border-border bg-layer-01 p-ds-02"
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
                  'hover:bg-field',
                  p === task.priority && 'bg-field',
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
              className: 'h-ds-xs-plus border-none bg-transparent px-ds-03 text-ds-md hover:bg-field',
            })
          ) : (
            <input
              type="date"
              value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
              onChange={(e) => handleDueDateChange(e.target.value ? new Date(e.target.value) : null)}
              className="h-ds-xs-plus border-none bg-transparent px-ds-03 text-ds-md text-text-primary outline-none hover:bg-field rounded-ds-md"
            />
          )}
          {task.dueDate && (
            <button
              type="button"
              onClick={() => handleDueDateChange(null)}
              className="rounded-ds-md p-ds-02 transition-colors hover:bg-field"
            >
              <IconX className="h-3 w-3 text-text-placeholder" />
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
              className="inline-flex items-center gap-ds-02 rounded-ds-full bg-interactive/10 px-ds-03 py-ds-01 text-ds-sm font-medium text-interactive"
            >
              {label}
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleRemoveLabel(label)}
                  className="rounded-ds-full p-ds-01 transition-colors hover:bg-field"
                >
                  <IconX className="h-ds-03 w-ds-03" />
                </button>
              )}
            </span>
          ))}
          {!readOnly && (
            showLabelInput ? (
              <div className="inline-flex items-center gap-ds-02">
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
                  className="h-5 w-20 rounded border border-border bg-transparent px-ds-02b text-ds-sm text-text-primary outline-none placeholder:text-text-placeholder focus:border-border-subtle"
                  autoFocus
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowLabelInput(true)}
                className="inline-flex h-ico-md w-ico-md items-center justify-center rounded-ds-full border border-dashed border-border-subtle transition-colors hover:bg-field hover:border-text-placeholder"
              >
                <IconPlus className="h-3 w-3 text-text-placeholder" />
              </button>
            )
          )}
          {readOnly && task.labels.length === 0 && (
            <span className="text-ds-md text-text-placeholder">
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
                ? 'bg-success-surface text-text-success'
                : 'bg-layer-02 text-text-tertiary',
            )}
          >
            <span
              className={cn(
                'h-ds-02b w-ds-02b rounded-ds-full',
                task.visibility === 'EVERYONE'
                  ? 'bg-success'
                  : 'bg-icon-disabled',
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
