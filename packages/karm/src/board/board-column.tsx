'use client'

import * as React from 'react'
import { useState, useRef } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { cn } from '@/ui/lib/utils'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu'
import { IconPlus, IconDots, IconPencil, IconTrash, IconEye, IconEyeOff } from '@tabler/icons-react'
import { TaskCard, type BoardTask } from './task-card'

// ============================================================
// Types
// ============================================================

export interface BoardColumnData {
  id: string
  name: string
  isClientVisible?: boolean
  tasks: BoardTask[]
}

// ============================================================
// Column accent colors (subtle left border)
// ============================================================

const COLUMN_ACCENTS = [
  'border-l-category-cyan',
  'border-l-category-amber',
  'border-l-category-teal',
  'border-l-category-indigo',
  'border-l-category-orange',
  'border-l-category-emerald',
  'border-l-category-slate',
  'border-l-accent',
]

// ============================================================
// Component
// ============================================================

export interface BoardColumnProps {
  column: BoardColumnData
  index: number
  isOverlay?: boolean
  onAddTask: (columnId: string, title: string) => void
  onClickTask?: (taskId: string) => void
  onRenameColumn?: (columnId: string, name: string) => void
  onDeleteColumn?: (columnId: string) => void
  onToggleVisibility?: (columnId: string, visible: boolean) => void
}

export const BoardColumn = React.forwardRef<HTMLDivElement, BoardColumnProps>(
  function BoardColumn({
  column,
  index,
  isOverlay,
  onAddTask,
  onClickTask,
  onRenameColumn,
  onDeleteColumn,
  onToggleVisibility,
}, ref) {
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(column.name)
  const inputRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: {
      type: 'column',
      column,
    },
  })

  const taskIds = column.tasks.map((t) => t.id)
  const accentColor = COLUMN_ACCENTS[index % COLUMN_ACCENTS.length]

  const handleAddTask = () => {
    if (newTitle.trim()) {
      onAddTask(column.id, newTitle.trim())
      setNewTitle('')
      setIsAdding(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask()
    }
    if (e.key === 'Escape') {
      setNewTitle('')
      setIsAdding(false)
    }
  }

  const handleRename = () => {
    if (editName.trim() && editName.trim() !== column.name) {
      onRenameColumn?.(column.id, editName.trim())
    }
    setIsEditing(false)
  }

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRename()
    if (e.key === 'Escape') {
      setEditName(column.name)
      setIsEditing(false)
    }
  }

  return (
    <div
      ref={ref}
      className={cn(
        /* intentional: board column fixed width — matches add-column button */
        'flex h-full w-[300px] flex-shrink-0 flex-col rounded-ds-xl border-l-[3px] bg-layer-01 shadow-01',
        accentColor,
        isOverlay && 'shadow-04',
      )}
    >
      {/* Column Header */}
      <div className="flex items-center gap-ds-03 px-ds-04 py-ds-04">
        {/* eslint-disable jsx-a11y/no-autofocus -- intentional: input appears after user double-clicks to rename column */}
        {isEditing ? (
          <Input
            ref={editInputRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleRenameKeyDown}
            className="h-ds-xs-plus text-ds-md font-semibold"
            autoFocus
          />
        ) : (
          <h3
            className="text-ds-md font-semibold text-text-primary truncate"
            onDoubleClick={() => {
              setEditName(column.name)
              setIsEditing(true)
            }}
          >
            {column.name}
          </h3>
        )}
        {/* eslint-enable jsx-a11y/no-autofocus */}

        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-ds-full bg-field px-ds-02b text-ds-sm font-medium text-text-tertiary">
          {column.tasks.length}
        </span>

        {/* Client visibility indicator */}
        {column.isClientVisible && (
          <IconEye
            className="h-3 w-3 text-text-tertiary"
            aria-label="Visible to client"
          />
        )}

        <div className="flex-1" />

        {/* Add task button */}
        <Button
          variant="ghost"
          size="icon-md"
          className="h-ds-xs w-ds-xs opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 hover:bg-interactive-subtle hover:text-interactive transition-opacity"
          aria-label="Add task"
          onClick={() => {
            setIsAdding(true)
            setTimeout(() => inputRef.current?.focus(), 50)
          }}
        >
          <IconPlus className="h-ico-sm w-ico-sm" />
        </Button>

        {/* Column menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-md"
              className="h-ds-xs w-ds-xs opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 transition-opacity"
              aria-label="Column options"
            >
              <IconDots className="h-ico-sm w-ico-sm" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onClick={() => {
                setEditName(column.name)
                setIsEditing(true)
              }}
            >
              <IconPencil className="mr-ds-03 h-ico-sm w-ico-sm" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                onToggleVisibility?.(column.id, !column.isClientVisible)
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
              onClick={() => onDeleteColumn?.(column.id)}
            >
              <IconTrash className="mr-ds-03 h-ico-sm w-ico-sm" />
              Delete column
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Task list -- droppable area */}
      <div
        ref={setNodeRef}
        className={cn(
          'no-scrollbar flex flex-1 flex-col gap-ds-03 overflow-y-auto px-ds-03 pb-ds-03 transition-colors duration-fast-02 ease-productive-standard',
          isOver && 'bg-interactive-subtle/50',
        )}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClickTask={onClickTask} />
          ))}
        </SortableContext>

        {/* Empty state */}
        {column.tasks.length === 0 && !isAdding && (
          <div className="flex flex-1 items-center justify-center py-ds-07">
            <p className="text-ds-sm text-text-placeholder">No tasks</p>
          </div>
        )}
      </div>

      {/* Quick-add input */}
      {isAdding ? (
        <div className="border-t border-border-subtle p-ds-03">
          {/* eslint-disable jsx-a11y/no-autofocus -- intentional: input appears after user clicks "Add task" */}
          <Input
            ref={inputRef}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (!newTitle.trim()) setIsAdding(false)
            }}
            placeholder="Task title..."
            className="h-ds-sm text-ds-md"
            autoFocus
          />
          {/* eslint-enable jsx-a11y/no-autofocus */}
          <div className="mt-ds-02b flex items-center gap-ds-02">
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
      ) : (
        <button
          onClick={() => {
            setIsAdding(true)
            setTimeout(() => inputRef.current?.focus(), 50)
          }}
          className="flex items-center gap-ds-02b border-t border-border-subtle px-ds-04 py-ds-03 text-ds-sm text-text-placeholder transition-colors hover:bg-field hover:text-text-tertiary"
        >
          <IconPlus className="h-3 w-3" />
          Add task
        </button>
      )}
    </div>
  )
},
)

BoardColumn.displayName = 'BoardColumn'
