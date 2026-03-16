'use client'

import * as React from 'react'
import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { IconGripVertical, IconArrowUp, IconX } from '@tabler/icons-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { springs } from '@/ui/lib/motion'
import { cn } from '@/ui/lib/utils'
import { Checkbox } from '@/ui/checkbox'
import { Input } from '@/ui/input'
import { useScratchpad } from './scratchpad-context'
import type { ScratchpadItem as ScratchpadItemType } from './scratchpad-context'

// ============================================================
// Types
// ============================================================

export interface ScratchpadItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'id'> {
  item: ScratchpadItemType
  /** Compact layout for sidebar use */
  compact?: boolean
  /** Whether drag-and-drop is active for this item */
  sortable?: boolean
}

// ============================================================
// Component
// ============================================================

const ScratchpadItem = React.forwardRef<HTMLDivElement, ScratchpadItemProps>(
  function ScratchpadItem({ item, compact = false, sortable = false, className, ...props }, ref) {
    const { onToggle, onEdit, onDelete, onPromote, canEdit, canDelete, canPromote } =
      useScratchpad()

    const [isEditing, setIsEditing] = useState(false)
    const [editText, setEditText] = useState(item.text)
    const inputRef = useRef<HTMLInputElement>(null)

    // dnd-kit sortable hook — only active when sortable=true
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: item.id,
      disabled: !sortable,
    })

    const sortableStyle = sortable
      ? {
          transform: CSS.Transform.toString(transform),
          transition,
        }
      : undefined

    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus()
        inputRef.current.select()
      }
    }, [isEditing])

    function handleEditConfirm() {
      const trimmed = editText.trim()
      if (trimmed && trimmed !== item.text && onEdit) {
        onEdit(item.id, trimmed)
      }
      setIsEditing(false)
      setEditText(item.text)
    }

    function handleEditKeyDown(e: React.KeyboardEvent) {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleEditConfirm()
      } else if (e.key === 'Escape') {
        setIsEditing(false)
        setEditText(item.text)
      }
    }

    function handleDoubleClick() {
      if (canEdit) {
        setEditText(item.text)
        setIsEditing(true)
      }
    }

    // Merge refs: forwardRef + sortable ref
    const mergedRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        setNodeRef(node)
        if (typeof ref === 'function') ref(node)
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
      },
      [ref, setNodeRef],
    )

    return (
      <motion.div
        ref={sortable ? mergedRef : ref}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: isDragging ? 0.5 : 1, x: 0 }}
        exit={{ opacity: 0, x: 20, height: 0 }}
        transition={springs.snappy}
        style={sortableStyle}
        className={cn(
          'group flex items-center rounded-ds-md transition-colors duration-150 hover:bg-surface-raised-hover',
          compact ? 'gap-ds-02 px-ds-02 py-0.5' : 'gap-ds-03 px-ds-02 py-ds-02',
          className,
        )}
        {...(props as Record<string, unknown>)}
        {...(sortable ? attributes : undefined)}
      >
        {/* Checkbox */}
        <Checkbox
          checked={item.done}
          onCheckedChange={(checked) => onToggle(item.id, checked === true)}
          aria-label={`Toggle ${item.text}`}
          className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'}
        />

        {/* Text / inline edit */}
        {isEditing ? (
          <Input
            ref={inputRef}
            size="sm"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleEditKeyDown}
            onBlur={handleEditConfirm}
            className="flex-1"
          />
        ) : (
          <span
            onDoubleClick={handleDoubleClick}
            className={cn(
              'flex-1 transition-all duration-200 ease-in-out',
              compact ? 'text-ds-sm' : 'text-ds-md',
              item.done && 'text-surface-fg-subtle line-through',
              !item.done && (compact ? 'text-surface-fg' : ''),
            )}
          >
            {item.text}
          </span>
        )}

        {/* Action buttons — hover-reveal */}
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
          {/* Promote */}
          {canPromote && onPromote && (
            <button
              type="button"
              onClick={() => onPromote(item.id)}
              aria-label={`Promote ${item.text}`}
              className="flex h-ico-md w-ico-md items-center justify-center rounded-ds-sm text-accent-11 transition-colors duration-150 hover:bg-accent-3 hover:text-accent-12"
            >
              <IconArrowUp className="h-3 w-3" />
            </button>
          )}

          {/* Delete */}
          {canDelete && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              aria-label={`Delete ${item.text}`}
              className="flex h-ico-md w-ico-md items-center justify-center rounded-ds-sm text-surface-fg-subtle transition-colors duration-150 hover:bg-error-3 hover:text-error-11"
            >
              <IconX className="h-3 w-3" />
            </button>
          )}

          {/* Drag handle — rightmost */}
          {sortable && (
            <button
              type="button"
              className="flex h-ico-md w-ico-md shrink-0 cursor-grab items-center justify-center text-surface-fg-muted"
              aria-label={`Drag ${item.text}`}
              {...listeners}
            >
              <IconGripVertical className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </motion.div>
    )
  },
)

ScratchpadItem.displayName = 'ScratchpadItem'

export { ScratchpadItem }
