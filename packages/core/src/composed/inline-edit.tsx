'use client'

import * as React from 'react'
import { IconPencil } from '@tabler/icons-react'
import { cn } from '../ui/lib/utils'
import { Spinner } from '../ui/spinner'

// ============================================================
// Types
// ============================================================

export interface InlineEditProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSave'> {
  value: string
  onSave: (newValue: string) => void | Promise<void>
  placeholder?: string
  /** CSS class applied to the editable text (e.g. 'text-ds-lg font-semibold') */
  textClassName?: string
  readOnly?: boolean
  maxLength?: number
  /** External saving state — shows spinner */
  saving?: boolean
}

// ============================================================
// InlineEdit — contentEditable approach
//
// No mode switch. No input field. The text IS the editor.
// Click → cursor appears in the text. Type. Enter saves. Escape reverts.
// Like Notion, Linear, Figma layer names.
// ============================================================

function InlineEdit({
  value,
  onSave,
  placeholder = 'Click to edit',
  textClassName,
  readOnly = false,
  maxLength,
  saving: savingProp = false,
  className,
  ...props
}: InlineEditProps) {
  const [saving, setSaving] = React.useState(false)
  const [focused, setFocused] = React.useState(false)
  const editRef = React.useRef<HTMLSpanElement>(null)
  const snapshotRef = React.useRef(value)

  const isSaving = savingProp || saving
  const isEmpty = !value

  // Sync DOM text when value changes externally (and not focused)
  React.useEffect(() => {
    if (!focused && editRef.current) {
      editRef.current.textContent = value
    }
  }, [value, focused])

  function handleFocus() {
    if (readOnly || isSaving) return
    setFocused(true)
    snapshotRef.current = value

    // Select all text on focus (like clicking a file name in Finder)
    requestAnimationFrame(() => {
      if (!editRef.current) return
      const range = document.createRange()
      range.selectNodeContents(editRef.current)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
    })
  }

  async function commit() {
    if (!editRef.current) return
    setFocused(false)
    const raw = editRef.current.textContent ?? ''
    const trimmed = raw.trim()

    // Enforce maxLength
    const final = maxLength ? trimmed.slice(0, maxLength) : trimmed

    // Reset DOM to clean value
    editRef.current.textContent = final || value

    if (final === value) return
    const result = onSave(final)
    if (result instanceof Promise) {
      setSaving(true)
      try {
        await result
      } catch {
        // Revert on error
        if (editRef.current) editRef.current.textContent = value
      } finally {
        setSaving(false)
      }
    }
  }

  function cancel() {
    if (!editRef.current) return
    editRef.current.textContent = snapshotRef.current
    setFocused(false)
    editRef.current.blur()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      cancel()
    } else if (e.key === 'Enter') {
      e.preventDefault()
      commit()
    }
  }

  function handleInput() {
    if (!editRef.current || !maxLength) return
    const text = editRef.current.textContent ?? ''
    if (text.length > maxLength) {
      editRef.current.textContent = text.slice(0, maxLength)
      // Move cursor to end
      const range = document.createRange()
      range.selectNodeContents(editRef.current)
      range.collapse(false)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
  }

  // Prevent paste from inserting rich content
  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  return (
    <div className={cn('group inline-flex items-center gap-ds-02', className)} {...props}>
      <span
        ref={editRef}
        role={readOnly ? undefined : 'textbox'}
        contentEditable={!readOnly && !isSaving}
        suppressContentEditableWarning
        tabIndex={readOnly ? undefined : 0}
        onFocus={handleFocus}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        onPaste={handlePaste}
        spellCheck={focused}
        className={cn(
          'font-sans text-surface-fg outline-none',
          textClassName,
          // Idle: subtle hover hint
          !readOnly && !focused && 'cursor-text rounded-ds-sm -mx-ds-01 px-ds-01 hover:bg-surface-raised-hover transition-colors duration-fast-01',
          // Focused: subtle underline to indicate editing
          focused && 'rounded-ds-sm -mx-ds-01 px-ds-01 bg-surface-raised-hover ring-1 ring-accent-7',
          // Empty: show placeholder styling
          isEmpty && !focused && 'text-surface-fg-subtle italic',
          // Read-only
          readOnly && 'cursor-default',
        )}
        data-placeholder={placeholder}
      >
        {value || (focused ? '' : placeholder)}
      </span>
      {!readOnly && !focused && !isSaving && (
        <IconPencil className="h-3 w-3 text-surface-fg-subtle opacity-0 group-hover:opacity-100 transition-opacity duration-fast-01 shrink-0" aria-hidden="true" />
      )}
      {isSaving && <Spinner size="sm" />}
    </div>
  )
}

export { InlineEdit }
