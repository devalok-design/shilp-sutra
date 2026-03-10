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

export function ColumnHeader({ column, index }: ColumnHeaderProps) {
  const {
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
  const addInputRef = useRef<HTMLInputElement>(null)

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

  const handleAddTask = () => {
    const trimmed = newTitle.trim()
    if (trimmed) {
      onTaskAdd(column.id, trimmed)
      setNewTitle('')
      setIsAdding(false)
    }
  }

  const handleAddKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAddTask()
    if (e.key === 'Escape') {
      setNewTitle('')
      setIsAdding(false)
    }
  }

  const openAddTask = () => {
    setIsAdding(true)
    setTimeout(() => addInputRef.current?.focus(), 50)
  }

  return (
    <div className="flex flex-col gap-ds-02">
      {/* Primary header row */}
      <div className="group/header flex items-center gap-ds-02 px-ds-04 pt-ds-03 pb-ds-02">
        {/* Accent dot */}
        <span
          className={cn('h-2.5 w-2.5 flex-shrink-0 rounded-full', accentColor)}
          aria-hidden="true"
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
          >
            {column.name}
          </h3>
        )}

        {/* Task count / WIP badge */}
        {isEditingWip ? (
          <WipEditor
            columnId={column.id}
            currentLimit={wipLimit}
            onClose={() => setIsEditingWip(false)}
          />
        ) : (
          <span
            className={cn(
              'flex-shrink-0 text-ds-xs tabular-nums',
              isWipExceeded
                ? 'font-semibold text-error'
                : 'text-text-tertiary',
            )}
            aria-label={
              wipLimit != null
                ? `${taskCount} of ${wipLimit} tasks${isWipExceeded ? ', WIP limit exceeded' : ''}`
                : `${taskCount} tasks`
            }
          >
            {wipLimit != null ? `${taskCount}/${wipLimit}` : taskCount}
          </span>
        )}

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
          onClick={openAddTask}
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

      {/* Quick-add task inline input */}
      {isAdding && (
        <div className="px-ds-04 pb-ds-03">
          {/* eslint-disable-next-line jsx-a11y/no-autofocus -- intentional: input appears after user clicks "Add task" */}
          <Input
            ref={addInputRef}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleAddKeyDown}
            onBlur={() => {
              if (!newTitle.trim()) setIsAdding(false)
            }}
            placeholder="Task title..."
            aria-label="New task title"
            size="sm"
            autoFocus
          />
          <div className="mt-ds-02 flex items-center gap-ds-02">
            <Button
              size="sm"
              className="h-ds-xs-plus bg-interactive hover:bg-interactive-hover text-text-on-color text-ds-sm"
              onClick={handleAddTask}
              disabled={!newTitle.trim()}
            >
              Add
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-ds-xs-plus text-ds-sm"
              onClick={() => {
                setNewTitle('')
                setIsAdding(false)
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

ColumnHeader.displayName = 'ColumnHeader'
