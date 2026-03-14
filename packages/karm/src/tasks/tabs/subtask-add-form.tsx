'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { IconPlus } from '@tabler/icons-react'

// ============================================================
// Types
// ============================================================

export interface SubtaskAddFormProps extends React.HTMLAttributes<HTMLDivElement> {
  onCreate: (title: string) => void
  placeholder?: string
}

// ============================================================
// SubtaskAddForm
// ============================================================

const SubtaskAddForm = React.forwardRef<HTMLDivElement, SubtaskAddFormProps>(
  function SubtaskAddForm({ onCreate, placeholder = 'Subtask title...', className, ...props }, ref) {
    const [newTitle, setNewTitle] = React.useState('')
    const [isAdding, setIsAdding] = React.useState(false)
    const inputRef = React.useRef<HTMLInputElement>(null)

    const handleSubmit = () => {
      const trimmed = newTitle.trim()
      if (trimmed) {
        onCreate(trimmed)
        setNewTitle('')
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSubmit()
      }
      if (e.key === 'Escape') {
        setIsAdding(false)
        setNewTitle('')
      }
    }

    React.useEffect(() => {
      if (isAdding && inputRef.current) {
        inputRef.current.focus()
      }
    }, [isAdding])

    return (
      <div ref={ref} className={cn(className)} {...props}>
        {isAdding ? (
          <div className="mt-ds-03 flex items-center gap-ds-03 rounded-ds-lg border border-surface-border-strong bg-surface-1 shadow-01 px-ds-04 py-ds-03">
            <input
              ref={inputRef}
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (!newTitle.trim()) setIsAdding(false)
              }}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-ds-md text-surface-fg placeholder:text-surface-fg-subtle outline-none"
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!newTitle.trim()}
              className="inline-flex h-6 items-center gap-ds-02 rounded-ds-md bg-accent-9 px-ds-03 text-ds-sm font-semibold text-accent-fg transition-colors hover:bg-accent-10 disabled:opacity-action-disabled"
            >
              Add
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="mt-ds-03 inline-flex items-center gap-ds-02b rounded-ds-lg px-ds-03 py-ds-02b text-ds-md text-surface-fg-subtle transition-colors hover:bg-surface-3 hover:text-surface-fg-muted"
          >
            <IconPlus className="h-ico-sm w-ico-sm" stroke={1.5} />
            Add subtask
          </button>
        )}
      </div>
    )
  },
)

SubtaskAddForm.displayName = 'SubtaskAddForm'

export { SubtaskAddForm }
