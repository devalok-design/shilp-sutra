'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/ui/popover'
import { IconPlus, IconX } from '@tabler/icons-react'
import type { LabelOption } from '../task-types'

// ============================================================
// Types
// ============================================================

export interface TaskLabelEditorProps {
  value: string[]
  onChange: (labels: string[]) => void
  availableLabels?: LabelOption[]
  readOnly?: boolean
  className?: string
}

// ============================================================
// TaskLabelEditor
// ============================================================

const TaskLabelEditor = React.forwardRef<HTMLDivElement, TaskLabelEditorProps>(
  function TaskLabelEditor(
    { value, onChange, availableLabels = [], readOnly, className },
    ref,
  ) {
    const [inputValue, setInputValue] = React.useState('')
    const [showInput, setShowInput] = React.useState(false)
    const [suggestionOpen, setSuggestionOpen] = React.useState(false)
    const inputRef = React.useRef<HTMLInputElement>(null)
    const skipBlurRef = React.useRef(false)

    // Build a color map from availableLabels for quick lookup
    const colorMap = React.useMemo(() => {
      const map = new Map<string, string | undefined>()
      for (const opt of availableLabels) {
        map.set(opt.name, opt.color)
      }
      return map
    }, [availableLabels])

    // Filter suggestions: match input, not already selected
    const suggestions = React.useMemo(() => {
      if (!inputValue.trim()) return []
      const lower = inputValue.toLowerCase()
      return availableLabels.filter(
        (opt) =>
          opt.name.toLowerCase().includes(lower) && !value.includes(opt.name),
      )
    }, [inputValue, availableLabels, value])

    const addLabel = (label: string) => {
      const trimmed = label.trim()
      if (trimmed && !value.includes(trimmed)) {
        onChange([...value, trimmed])
      }
      setInputValue('')
      setShowInput(false)
      setSuggestionOpen(false)
    }

    const removeLabel = (label: string) => {
      onChange(value.filter((l) => l !== label))
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        // If there's a matching suggestion, select it; otherwise create new
        if (suggestions.length > 0) {
          addLabel(suggestions[0].name)
        } else {
          addLabel(inputValue)
        }
      }
      if (e.key === 'Escape') {
        setShowInput(false)
        setInputValue('')
        setSuggestionOpen(false)
      }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value)
    }

    // Re-evaluate suggestion popover when suggestions change
    React.useEffect(() => {
      setSuggestionOpen(inputValue.trim().length > 0 && suggestions.length > 0)
    }, [suggestions, inputValue])

    return (
      <div ref={ref} className={cn('flex flex-wrap items-center gap-ds-02b', className)}>
        {/* Label chips */}
        {value.map((label) => {
          const color = colorMap.get(label)
          return (
            <span
              key={label}
              className="inline-flex items-center gap-ds-02 rounded-ds-full bg-accent-2 px-ds-03 py-ds-01 text-ds-sm font-medium text-accent-11"
            >
              {color && (
                <span
                  className="h-2 w-2 shrink-0 rounded-ds-full"
                  style={{ backgroundColor: color }}
                />
              )}
              {label}
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => removeLabel(label)}
                  className="rounded-ds-full p-ds-01 transition-colors hover:bg-surface-3"
                  aria-label={`Remove label ${label}`}
                >
                  <IconX className="h-ds-03 w-ds-03" />
                </button>
              )}
            </span>
          )
        })}

        {/* Add label UI */}
        {!readOnly && (
          showInput ? (
            <Popover open={suggestionOpen} onOpenChange={setSuggestionOpen}>
              <PopoverTrigger asChild>
                <div className="inline-flex items-center gap-ds-02">
                  {/* eslint-disable jsx-a11y/no-autofocus -- intentional: input appears after user clicks "+" */}
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onBlur={() => {
                      if (skipBlurRef.current) {
                        skipBlurRef.current = false
                        return
                      }
                      if (inputValue.trim()) {
                        addLabel(inputValue)
                      } else {
                        setShowInput(false)
                        setSuggestionOpen(false)
                      }
                    }}
                    placeholder="Label name"
                    aria-label="New label name"
                    className="h-5 w-24 rounded border border-surface-border-strong bg-transparent px-ds-02b text-ds-sm text-surface-fg outline-none placeholder:text-surface-fg-subtle focus:border-surface-border"
                    autoFocus
                  />
                  {/* eslint-enable jsx-a11y/no-autofocus */}
                </div>
              </PopoverTrigger>
              {suggestions.length > 0 && (
                <PopoverContent
                  className="w-[180px] border-surface-border-strong bg-surface-1 p-ds-02"
                  align="start"
                  sideOffset={4}
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  {suggestions.map((opt) => (
                    <button
                      key={opt.name}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        skipBlurRef.current = true
                        addLabel(opt.name)
                      }}
                      className="flex w-full items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-02b text-left text-ds-sm transition-colors hover:bg-surface-3"
                    >
                      {opt.color && (
                        <span
                          className="h-2 w-2 shrink-0 rounded-ds-full"
                          style={{ backgroundColor: opt.color }}
                        />
                      )}
                      <span className="text-surface-fg">{opt.name}</span>
                    </button>
                  ))}
                </PopoverContent>
              )}
            </Popover>
          ) : (
            <button
              type="button"
              onClick={() => setShowInput(true)}
              className="inline-flex h-ico-md w-ico-md items-center justify-center rounded-ds-full border border-dashed border-surface-border transition-colors hover:bg-surface-3 hover:border-surface-border"
              aria-label="Add label"
            >
              <IconPlus className="h-3 w-3 text-surface-fg-subtle" />
            </button>
          )
        )}

        {readOnly && value.length === 0 && (
          <span className="text-ds-md text-surface-fg-subtle">None</span>
        )}
      </div>
    )
  },
)

TaskLabelEditor.displayName = 'TaskLabelEditor'

export { TaskLabelEditor }
