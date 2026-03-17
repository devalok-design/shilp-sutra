'use client'

import * as React from 'react'
import { cn } from '../ui/lib/utils'
import { Spinner } from '../ui/spinner'

// ============================================================
// Types
// ============================================================

export interface InlineEditProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSave'> {
  value: string
  onSave: (newValue: string) => void | Promise<void>
  placeholder?: string
  /** CSS class for text in read mode (e.g. 'text-ds-lg font-semibold') */
  textClassName?: string
  /** Input size for edit mode @default 'sm' */
  inputSize?: 'xs' | 'sm' | 'md'
  multiline?: boolean
  readOnly?: boolean
  maxLength?: number
  /** External saving state — shows spinner */
  saving?: boolean
}

// ============================================================
// InlineEdit
// ============================================================

const inputSizeClasses: Record<string, string> = {
  xs: 'h-ds-xs-plus text-ds-sm px-ds-02',
  sm: 'h-ds-sm text-ds-sm px-ds-03',
  md: 'h-ds-md text-ds-md px-ds-04',
}

function InlineEdit({
  value,
  onSave,
  placeholder = 'Click to edit',
  textClassName,
  inputSize = 'sm',
  multiline = false,
  readOnly = false,
  maxLength,
  saving: savingProp = false,
  className,
  ...props
}: InlineEditProps) {
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState(value)
  const [saving, setSaving] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  const isSaving = savingProp || saving

  // Sync draft when value changes externally
  React.useEffect(() => {
    if (!editing) setDraft(value)
  }, [value, editing])

  // Auto-focus and select on edit
  React.useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  function startEditing() {
    if (readOnly || isSaving) return
    setDraft(value)
    setEditing(true)
  }

  async function commit() {
    const trimmed = draft.trim()
    setEditing(false)
    if (trimmed === value) return
    const result = onSave(trimmed)
    if (result instanceof Promise) {
      setSaving(true)
      try {
        await result
      } finally {
        setSaving(false)
      }
    }
  }

  function cancel() {
    setDraft(value)
    setEditing(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      cancel()
    } else if (e.key === 'Enter') {
      if (multiline && !e.metaKey && !e.ctrlKey) return // allow newlines
      e.preventDefault()
      commit()
    }
  }

  if (editing) {
    const sharedClasses = cn(
      'w-full font-sans bg-surface-raised-hover text-surface-fg border border-surface-border rounded-ds-md',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-7',
      inputSizeClasses[inputSize],
    )

    if (multiline) {
      return (
        <div className={cn('relative', className)} {...props}>
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={commit}
            maxLength={maxLength}
            className={cn(sharedClasses, 'min-h-[60px] resize-y py-ds-02')}
          />
        </div>
      )
    }

    return (
      <div className={cn('relative', className)} {...props}>
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          maxLength={maxLength}
          className={sharedClasses}
        />
      </div>
    )
  }

  // Read mode
  return (
    <div className={cn('inline-flex items-center gap-ds-02', className)} {...props}>
      <span
        role="button"
        tabIndex={readOnly ? undefined : 0}
        onClick={startEditing}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            startEditing()
          }
        }}
        className={cn(
          'font-sans text-surface-fg',
          textClassName,
          !readOnly && 'cursor-pointer hover:underline hover:decoration-dashed hover:decoration-surface-fg-subtle',
          !value && 'text-surface-fg-subtle italic',
        )}
      >
        {value || placeholder}
      </span>
      {isSaving && <Spinner size="sm" />}
    </div>
  )
}

export { InlineEdit }
