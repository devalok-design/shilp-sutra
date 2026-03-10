'use client'

import * as React from 'react'
import { useState, useRef, useCallback } from 'react'
import { cn } from '@/ui/lib/utils'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { AvatarGroup } from '@/composed/avatar-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu'
import {
  IconPlus,
  IconDots,
  IconPencil,
  IconTrash,
  IconEye,
  IconEyeOff,
  IconGauge,
  IconCalendar,
  IconUser,
  IconX,
  IconCheck,
} from '@tabler/icons-react'
import { useBoardContext } from './board-context'
import { COLUMN_ACCENT_COLORS } from './board-constants'
import type { BoardColumn, BoardMember } from './board-types'

// ============================================================
// Helpers
// ============================================================

function collectUniqueMembers(column: BoardColumn): BoardMember[] {
  const seen = new Set<string>()
  const members: BoardMember[] = []

  for (const task of column.tasks) {
    if (task.owner && !seen.has(task.owner.id)) {
      seen.add(task.owner.id)
      members.push(task.owner)
    }
    for (const assignee of task.assignees) {
      if (!seen.has(assignee.id)) {
        seen.add(assignee.id)
        members.push(assignee)
      }
    }
  }

  return members
}

// ============================================================
// WIP limit inline editor
// ============================================================

interface WipEditorProps {
  columnId: string
  currentLimit: number | null
  onClose: () => void
}

function WipEditor({ columnId, currentLimit, onClose }: WipEditorProps) {
  const { onColumnWipLimitChange } = useBoardContext()
  const [value, setValue] = useState(currentLimit != null ? String(currentLimit) : '')

  const commit = useCallback(() => {
    const trimmed = value.trim()
    if (trimmed === '') {
      onColumnWipLimitChange(columnId, null)
    } else {
      const parsed = parseInt(trimmed, 10)
      if (!isNaN(parsed) && parsed > 0) {
        onColumnWipLimitChange(columnId, parsed)
      }
    }
    onClose()
  }, [value, columnId, onColumnWipLimitChange, onClose])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') onClose()
  }

  return (
    // eslint-disable-next-line jsx-a11y/no-autofocus -- intentional: input opens after user selects "Set WIP Limit"
    <Input
      type="number"
      min={1}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={handleKeyDown}
      placeholder="Limit..."
      aria-label="WIP limit"
      size="sm"
      className="w-16 text-center"
      autoFocus
    />
  )
}

// ============================================================
// Props
// ============================================================

export interface ColumnHeaderProps {
  column: BoardColumn
  index: number
}

// ============================================================
// Component
// ============================================================

function collectAllMembers(columns: BoardColumn[]): BoardMember[] {
  const seen = new Set<string>()
  const members: BoardMember[] = []
  for (const col of columns) {
    for (const task of col.tasks) {
      if (task.owner && !seen.has(task.owner.id)) {
        seen.add(task.owner.id)
        members.push(task.owner)
      }
      for (const a of task.assignees) {
        if (!seen.has(a.id)) {
          seen.add(a.id)
          members.push(a)
        }
      }
    }
  }
  return members
}

export function ColumnHeader({ column, index }: ColumnHeaderProps) {
  const {
    rawColumns,
    onColumnRename,
    onColumnDelete,
    onColumnToggleVisibility,
    onTaskAdd,
  } = useBoardContext()

  const [isRenaming, setIsRenaming] = useState(false)
  const [editName, setEditName] = useState(column.name)

  const [isEditingWip, setIsEditingWip] = useState(false)

  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newOwnerId, setNewOwnerId] = useState<string | null>(null)
  const [newDueDate, setNewDueDate] = useState('')
  const addInputRef = useRef<HTMLInputElement>(null)

  const allMembers = collectAllMembers(rawColumns)

  const accentColor = COLUMN_ACCENT_COLORS[index % COLUMN_ACCENT_COLORS.length]
  const taskCount = column.tasks.length
  const wipLimit = column.wipLimit ?? null
  const isWipExceeded = wipLimit != null && taskCount > wipLimit
  const uniqueMembers = collectUniqueMembers(column)

  // ---- Rename handlers ----

  const startRenaming = () => {
    setEditName(column.name)
    setIsRenaming(true)
  }

  const commitRename = () => {
    const trimmed = editName.trim()
    if (trimmed && trimmed !== column.name) {
      onColumnRename(column.id, trimmed)
    }
    setIsRenaming(false)
  }

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitRename()
    if (e.key === 'Escape') {
      setEditName(column.name)
      setIsRenaming(false)
    }
  }

  // ---- Add task handlers ----

  const resetAddForm = () => {
    setNewTitle('')
    setNewOwnerId(null)
    setNewDueDate('')
    setIsAdding(false)
  }

  const handleAddTask = () => {
    const trimmed = newTitle.trim()
    if (trimmed) {
      onTaskAdd(column.id, {
        title: trimmed,
        ownerId: newOwnerId,
        dueDate: newDueDate || null,
      })
      resetAddForm()
    }
  }

  const handleAddKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAddTask()
    if (e.key === 'Escape') resetAddForm()
  }

  const toggleAddTask = () => {
    if (isAdding) {
      resetAddForm()
    } else {
      setIsAdding(true)
      setTimeout(() => addInputRef.current?.focus(), 50)
    }
  }

  return (
    <div className="group/header flex flex-col gap-ds-02">
      {/* Primary header row */}
      <div className="flex items-center gap-ds-02 px-ds-04 pt-ds-03 pb-ds-02">
        {/* Accent dot */}
        <span
          className={cn('h-2.5 w-2.5 flex-shrink-0 rounded-full', accentColor)}
          aria-hidden="true"
          title={column.name}
        />

        {/* Column name — normal or inline edit */}
        {isRenaming ? (
          // eslint-disable-next-line jsx-a11y/no-autofocus -- intentional: input appears after user double-clicks to rename
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={handleRenameKeyDown}
            aria-label="Column name"
            size="sm"
            className="h-ds-xs flex-1 text-ds-sm font-semibold"
            autoFocus
          />
        ) : (
          <h3
            className="flex-1 truncate text-ds-sm font-semibold text-text-primary"
            onDoubleClick={startRenaming}
            title={column.name}
            aria-label={
              wipLimit != null
                ? `${column.name}, ${taskCount} of ${wipLimit} tasks${isWipExceeded ? ', WIP limit exceeded' : ''}`
                : `${column.name}, ${taskCount} tasks`
            }
          >
            {column.name}
            <span className="ml-ds-02 text-ds-xs font-normal text-text-tertiary">({taskCount})</span>
          </h3>
        )}

        {/* WIP badge — only shown when limit is set */}
        {isEditingWip ? (
          <WipEditor
            columnId={column.id}
            currentLimit={wipLimit}
            onClose={() => setIsEditingWip(false)}
          />
        ) : wipLimit != null ? (
          <span
            className={cn(
              'flex-shrink-0 text-ds-xs tabular-nums',
              isWipExceeded
                ? 'font-semibold text-error'
                : 'text-text-tertiary',
            )}
            aria-label={`WIP limit: ${wipLimit}${isWipExceeded ? ', exceeded' : ''}`}
          >
            / {wipLimit}
          </span>
        ) : null}

        {/* Add task button — hover-visible */}
        <Button
          variant="ghost"
          size="icon-md"
          className={cn(
            'h-ds-xs w-ds-xs flex-shrink-0 opacity-0 transition-opacity',
            'group-hover/header:opacity-100 focus:opacity-100',
            'hover:bg-interactive-subtle hover:text-interactive',
          )}
          aria-label="Add task"
          title="Add task"
          onClick={toggleAddTask}
        >
          <IconPlus className="h-ico-sm w-ico-sm" />
        </Button>

        {/* Column menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-md"
              className={cn(
                'h-ds-xs w-ds-xs flex-shrink-0 opacity-0 transition-opacity',
                'group-hover/header:opacity-100 focus:opacity-100',
              )}
              aria-label="Column options"
              title="Column options"
            >
              <IconDots className="h-ico-sm w-ico-sm" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={startRenaming}>
              <IconPencil className="mr-ds-03 h-ico-sm w-ico-sm" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsEditingWip(true)}>
              <IconGauge className="mr-ds-03 h-ico-sm w-ico-sm" />
              Set WIP Limit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                onColumnToggleVisibility(column.id, !(column.isClientVisible ?? false))
              }
            >
              {column.isClientVisible ? (
                <>
                  <IconEyeOff className="mr-ds-03 h-ico-sm w-ico-sm" />
                  Hide from client
                </>
              ) : (
                <>
                  <IconEye className="mr-ds-03 h-ico-sm w-ico-sm" />
                  Show to client
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-error focus:text-error"
              onClick={() => onColumnDelete(column.id)}
            >
              <IconTrash className="mr-ds-03 h-ico-sm w-ico-sm" />
              Delete column
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Avatar stack row — only when column has members */}
      {uniqueMembers.length > 0 && (
        <div className="px-ds-04 pb-ds-02">
          <AvatarGroup
            users={uniqueMembers}
            max={3}
            size="sm"
            showTooltip
          />
        </div>
      )}

      {/* Quick-add task form — animated expand/collapse */}
      <div
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-moderate-02 ease-expressive-entrance',
          isAdding ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <div className="px-ds-04 pb-ds-03 flex flex-col gap-ds-02">
            {/* eslint-disable-next-line jsx-a11y/no-autofocus -- intentional: input appears after user clicks "Add task" */}
            <Input
              ref={addInputRef}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleAddKeyDown}
              placeholder="Task title..."
              aria-label="New task title"
              size="sm"
              tabIndex={isAdding ? 0 : -1}
              autoFocus={isAdding}
            />

            {/* Options row: lead + date icons, then confirm/cancel */}
            <div className="flex items-center gap-ds-01">
              {/* Lead picker */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      'flex items-center justify-center h-6 w-6 rounded-ds-md transition-colors',
                      newOwnerId
                        ? 'text-interactive bg-interactive-subtle'
                        : 'text-text-tertiary hover:text-text-primary hover:bg-layer-active',
                    )}
                    title={newOwnerId
                      ? `Lead: ${allMembers.find((m) => m.id === newOwnerId)?.name}`
                      : 'Assign task lead'}
                    aria-label="Assign task lead"
                    tabIndex={isAdding ? 0 : -1}
                  >
                    <IconUser className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-44 max-h-48 overflow-y-auto">
                  {allMembers.length === 0 && (
                    <div className="px-ds-03 py-ds-02 text-ds-xs text-text-tertiary">
                      No members found
                    </div>
                  )}
                  {newOwnerId && (
                    <>
                      <DropdownMenuItem onClick={() => setNewOwnerId(null)}>
                        <IconX className="mr-ds-02 h-3 w-3 text-text-tertiary" />
                        Clear lead
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {allMembers.map((member) => (
                    <DropdownMenuItem
                      key={member.id}
                      onClick={() => setNewOwnerId(member.id)}
                      className={cn(newOwnerId === member.id && 'bg-interactive-subtle')}
                    >
                      {member.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Due date — calendar icon triggers hidden date input */}
              <label
                className={cn(
                  'relative flex items-center justify-center h-6 w-6 rounded-ds-md cursor-pointer transition-colors',
                  newDueDate
                    ? 'text-interactive bg-interactive-subtle'
                    : 'text-text-tertiary hover:text-text-primary hover:bg-layer-active',
                )}
                title={newDueDate ? `Due: ${newDueDate}` : 'Set due date'}
                aria-label="Set due date"
              >
                <IconCalendar className="h-3.5 w-3.5" />
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  aria-label="Due date"
                  tabIndex={isAdding ? 0 : -1}
                />
              </label>

              <div className="flex-1" />

              {/* Confirm */}
              <button
                onClick={handleAddTask}
                disabled={!newTitle.trim()}
                className={cn(
                  'flex items-center justify-center h-6 w-6 rounded-ds-md transition-colors',
                  newTitle.trim()
                    ? 'text-success hover:bg-success-surface'
                    : 'text-text-quaternary cursor-not-allowed',
                )}
                title="Confirm add task"
                aria-label="Confirm add task"
                tabIndex={isAdding ? 0 : -1}
              >
                <IconCheck className="h-3.5 w-3.5" />
              </button>

              {/* Cancel */}
              <button
                onClick={resetAddForm}
                className="flex items-center justify-center h-6 w-6 rounded-ds-md text-text-tertiary hover:text-text-primary hover:bg-layer-active transition-colors"
                title="Cancel"
                aria-label="Cancel adding task"
                tabIndex={isAdding ? 0 : -1}
              >
                <IconX className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

ColumnHeader.displayName = 'ColumnHeader'
