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
import { Plus, MoreHorizontal, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
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
  'border-l-blue-400',
  'border-l-violet-400',
  'border-l-amber-400',
  'border-l-emerald-400',
  'border-l-pink-400',
  'border-l-cyan-400',
  'border-l-orange-400',
  'border-l-teal-400',
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
        'flex h-full w-[300px] flex-shrink-0 flex-col rounded-xl border-l-[3px] bg-white/80 backdrop-blur-sm',
        accentColor,
        isOverlay && 'shadow-xl',
      )}
    >
      {/* Column Header */}
      <div className="flex items-center gap-2 px-3 py-3">
        {isEditing ? (
          <Input
            ref={editInputRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleRenameKeyDown}
            className="h-7 text-sm font-semibold"
            autoFocus
          />
        ) : (
          <h3
            className="text-sm font-semibold text-foreground truncate"
            onDoubleClick={() => {
              setEditName(column.name)
              setIsEditing(true)
            }}
          >
            {column.name}
          </h3>
        )}

        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-muted px-1.5 text-[11px] font-medium text-muted-foreground">
          {column.tasks.length}
        </span>

        {/* Client visibility indicator */}
        {column.isClientVisible && (
          <Eye
            className="h-3 w-3 text-muted-foreground"
            aria-label="Visible to client"
          />
        )}

        <div className="flex-1" />

        {/* Add task button */}
        <Button
          variant="ghost"
          size="icon-md"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-pink-50 hover:text-pink-600 transition-opacity"
          onClick={() => {
            setIsAdding(true)
            setTimeout(() => inputRef.current?.focus(), 50)
          }}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>

        {/* Column menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-md"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onClick={() => {
                setEditName(column.name)
                setIsEditing(true)
              }}
            >
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                onToggleVisibility?.(column.id, !column.isClientVisible)
              }
            >
              {column.isClientVisible ? (
                <>
                  <EyeOff className="mr-2 h-3.5 w-3.5" />
                  Hide from client
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-3.5 w-3.5" />
                  Show to client
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDeleteColumn?.(column.id)}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete column
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Task list -- droppable area */}
      <div
        ref={setNodeRef}
        className={cn(
          'no-scrollbar flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2 transition-colors duration-200',
          isOver && 'bg-pink-50/50',
        )}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClickTask={onClickTask} />
          ))}
        </SortableContext>

        {/* Empty state */}
        {column.tasks.length === 0 && !isAdding && (
          <div className="flex flex-1 items-center justify-center py-8">
            <p className="text-xs text-muted-foreground/60">No tasks</p>
          </div>
        )}
      </div>

      {/* Quick-add input */}
      {isAdding ? (
        <div className="border-t border-border/40 p-2">
          <Input
            ref={inputRef}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (!newTitle.trim()) setIsAdding(false)
            }}
            placeholder="Task title..."
            className="h-8 text-sm"
            autoFocus
          />
          <div className="mt-1.5 flex items-center gap-1">
            <Button
              size="sm"
              className="h-7 bg-pink-500 hover:bg-pink-600 text-white text-xs"
              onClick={handleAddTask}
              disabled={!newTitle.trim()}
            >
              Add
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
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
          className="flex items-center gap-1.5 border-t border-border/40 px-3 py-2.5 text-xs text-muted-foreground/70 transition-colors hover:bg-muted/30 hover:text-muted-foreground"
        >
          <Plus className="h-3 w-3" />
          Add task
        </button>
      )}
    </div>
  )
}
