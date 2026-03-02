'use client'

import { useState, useRef } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { cn } from '../../ui/lib/utils'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu'
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
  'border-l-[var(--color-info)]',
  'border-l-[var(--color-accent)]',
  'border-l-[var(--color-warning)]',
  'border-l-[var(--color-success)]',
  'border-l-[var(--color-interactive)]',
  'border-l-[var(--color-info-border)]',
  'border-l-[var(--color-warning-border)]',
  'border-l-[var(--color-success-border)]',
]

// ============================================================
// Component
// ============================================================

interface BoardColumnProps {
  column: BoardColumnData
  index: number
  isOverlay?: boolean
  onAddTask: (columnId: string, title: string) => void
  onClickTask?: (taskId: string) => void
  onRenameColumn?: (columnId: string, name: string) => void
  onDeleteColumn?: (columnId: string) => void
  onToggleVisibility?: (columnId: string, visible: boolean) => void
}

export function BoardColumn({
  column,
  index,
  isOverlay,
  onAddTask,
  onClickTask,
  onRenameColumn,
  onDeleteColumn,
  onToggleVisibility,
}: BoardColumnProps) {
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
      className={cn(
        'flex h-full w-[300px] flex-shrink-0 flex-col rounded-[var(--radius-xl)] border-l-[3px] bg-[var(--color-layer-01)]/80 backdrop-blur-sm',
        accentColor,
        isOverlay && 'shadow-04',
      )}
    >
      {/* Column Header */}
      <div className="flex items-center gap-ds-03 px-ds-04 py-ds-04">
        {isEditing ? (
          <Input
            ref={editInputRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleRenameKeyDown}
            className="h-7 B2-Semibold"
            autoFocus
          />
        ) : (
          <h3
            className="B2-Semibold text-[var(--color-text-primary)] truncate"
            onDoubleClick={() => {
              setEditName(column.name)
              setIsEditing(true)
            }}
          >
            {column.name}
          </h3>
        )}

        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-field)] px-ds-02b B3-Reg font-medium text-[var(--color-text-tertiary)]">
          {column.tasks.length}
        </span>

        {/* Client visibility indicator */}
        {column.isClientVisible && (
          <IconEye
            className="h-3 w-3 text-[var(--color-text-tertiary)]"
            aria-label="Visible to client"
          />
        )}

        <div className="flex-1" />

        {/* Add task button */}
        <Button
          variant="ghost"
          size="icon-md"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-[var(--color-interactive-subtle)] hover:text-[var(--color-interactive)] transition-opacity"
          onClick={() => {
            setIsAdding(true)
            setTimeout(() => inputRef.current?.focus(), 50)
          }}
        >
          <IconPlus className="h-[var(--icon-sm)] w-[var(--icon-sm)]" />
        </Button>

        {/* Column menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-md"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <IconDots className="h-[var(--icon-sm)] w-[var(--icon-sm)]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onClick={() => {
                setEditName(column.name)
                setIsEditing(true)
              }}
            >
              <IconPencil className="mr-ds-03 h-[var(--icon-sm)] w-[var(--icon-sm)]" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                onToggleVisibility?.(column.id, !column.isClientVisible)
              }
            >
              {column.isClientVisible ? (
                <>
                  <IconEyeOff className="mr-ds-03 h-[var(--icon-sm)] w-[var(--icon-sm)]" />
                  Hide from client
                </>
              ) : (
                <>
                  <IconEye className="mr-ds-03 h-[var(--icon-sm)] w-[var(--icon-sm)]" />
                  Show to client
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-[var(--color-error)] focus:text-[var(--color-error)]"
              onClick={() => onDeleteColumn?.(column.id)}
            >
              <IconTrash className="mr-ds-03 h-[var(--icon-sm)] w-[var(--icon-sm)]" />
              Delete column
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Task list -- droppable area */}
      <div
        ref={setNodeRef}
        className={cn(
          'no-scrollbar flex flex-1 flex-col gap-ds-03 overflow-y-auto px-ds-03 pb-ds-03 transition-colors duration-[var(--duration-moderate)]',
          isOver && 'bg-[var(--color-interactive-subtle)]/50',
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
            <p className="B3-Reg text-[var(--color-text-placeholder)]">No tasks</p>
          </div>
        )}
      </div>

      {/* Quick-add input */}
      {isAdding ? (
        <div className="border-t border-[var(--color-border-subtle)] p-ds-03">
          <Input
            ref={inputRef}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (!newTitle.trim()) setIsAdding(false)
            }}
            placeholder="Task title..."
            className="h-8 B2-Reg"
            autoFocus
          />
          <div className="mt-ds-02b flex items-center gap-ds-02">
            <Button
              size="sm"
              className="h-7 bg-[var(--color-interactive)] hover:bg-[var(--color-interactive-hover)] text-[var(--color-text-on-color)] B3-Reg"
              onClick={handleAddTask}
              disabled={!newTitle.trim()}
            >
              Add
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 B3-Reg"
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
          className="flex items-center gap-ds-02b border-t border-[var(--color-border-subtle)] px-ds-04 py-2.5 B3-Reg text-[var(--color-text-placeholder)] transition-colors hover:bg-[var(--color-field)] hover:text-[var(--color-text-tertiary)]"
        >
          <IconPlus className="h-3 w-3" />
          Add task
        </button>
      )}
    </div>
  )
}
