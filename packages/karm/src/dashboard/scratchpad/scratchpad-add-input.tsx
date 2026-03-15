'use client'

import * as React from 'react'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/ui/lib/utils'
import { Input } from '@/ui/input'
import { Button } from '@/ui/button'
import { useScratchpad } from './scratchpad-context'

// ============================================================
// Types
// ============================================================

export interface ScratchpadAddInputProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Placeholder text for the input */
  placeholder?: string
  /** Label for the trigger button */
  triggerLabel?: string
}

// ============================================================
// Component
// ============================================================

const ScratchpadAddInput = React.forwardRef<HTMLDivElement, ScratchpadAddInputProps>(
  function ScratchpadAddInput(
    {
      placeholder = 'What needs doing?',
      triggerLabel = '+ Add a task...',
      className,
      ...props
    },
    ref,
  ) {
    const { onAdd, canAdd, items, maxItems } = useScratchpad()
    const [isAdding, setIsAdding] = useState(false)
    const [addText, setAddText] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
      if (isAdding && inputRef.current) {
        inputRef.current.focus()
      }
    }, [isAdding])

    // Render nothing if onAdd not provided or max reached
    if (!canAdd || items.length >= maxItems) return null

    function handleSubmit() {
      const trimmed = addText.trim()
      if (trimmed && onAdd) {
        onAdd(trimmed)
        setAddText('')
      }
    }

    function handleKeyDown(e: React.KeyboardEvent) {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSubmit()
      } else if (e.key === 'Escape') {
        setIsAdding(false)
        setAddText('')
      }
    }

    return (
      <div ref={ref} className={cn('mt-ds-02b', className)} {...props}>
        {isAdding ? (
          <div className="flex items-center gap-ds-03">
            <Input
              ref={inputRef}
              size="sm"
              value={addText}
              onChange={(e) => setAddText(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (!addText.trim()) {
                  setIsAdding(false)
                  setAddText('')
                }
              }}
              placeholder={placeholder}
              className="flex-1"
            />
            <Button
              size="sm"
              onClick={handleSubmit}
              onMouseDown={(e) => e.preventDefault()}
            >
              Add
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="w-full rounded-ds-md px-ds-02 py-ds-02 text-left text-ds-md text-surface-fg-subtle transition-colors hover:bg-surface-2"
          >
            {triggerLabel}
          </button>
        )}
      </div>
    )
  },
)

ScratchpadAddInput.displayName = 'ScratchpadAddInput'

export { ScratchpadAddInput }
