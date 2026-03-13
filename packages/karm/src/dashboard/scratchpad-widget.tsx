'use client'

import * as React from 'react'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IconX } from '@tabler/icons-react'
import { springs } from '@/ui/lib/motion'
import { cn } from '@/ui/lib/utils'
import { Checkbox } from '@/ui/checkbox'
import { Input } from '@/ui/input'
import { Button } from '@/ui/button'

// ============================================================
// Types
// ============================================================

export interface ScratchpadItem {
  id: string
  text: string
  done: boolean
}

export interface ScratchpadWidgetProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  items: ScratchpadItem[]
  maxItems?: number
  onToggle: (id: string, done: boolean) => void
  onAdd: (text: string) => void
  onDelete: (id: string) => void
  title?: string
  resetLabel?: string
  emptyText?: string
  emptyIcon?: React.ComponentType<{ className?: string }>
  loading?: boolean
}

// ============================================================
// Progress Ring
// ============================================================

const RING_SIZE = 20
const RING_STROKE = 2
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

function ProgressRing({ count, max, allDone }: { count: number; max: number; allDone: boolean }) {
  const progress = max > 0 ? count / max : 0
  const offset = RING_CIRCUMFERENCE * (1 - progress)

  return (
    <motion.div
      className="relative flex items-center justify-center"
      animate={allDone ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      <svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`} className="-rotate-90">
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          strokeWidth={RING_STROKE}
          className="stroke-surface-2"
        />
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={offset}
          className={cn(
            'transition-all duration-300',
            allDone ? 'stroke-success-9' : 'stroke-accent-9',
          )}
        />
      </svg>
      <span className="absolute text-[8px] font-medium text-surface-fg-muted" data-testid="progress-count">
        {count}/{max}
      </span>
    </motion.div>
  )
}

// ============================================================
// Component
// ============================================================

const ScratchpadWidget = React.forwardRef<HTMLDivElement, ScratchpadWidgetProps>(
  function ScratchpadWidget(
    {
      items,
      maxItems = 5,
      onToggle,
      onAdd,
      onDelete,
      title = 'My Scratchpad',
      resetLabel,
      emptyText = 'Nothing here yet. Add a task!',
      emptyIcon: EmptyIcon,
      loading = false,
      className,
      ...props
    },
    ref,
  ) {
    const [isAdding, setIsAdding] = useState(false)
    const [addText, setAddText] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    const allDone = items.length > 0 && items.every((item) => item.done)

    useEffect(() => {
      if (isAdding && inputRef.current) {
        inputRef.current.focus()
      }
    }, [isAdding])

    function handleSubmit() {
      const trimmed = addText.trim()
      if (trimmed) {
        onAdd(trimmed)
        setAddText('')
        // Stay in adding mode for rapid entry
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

    // Loading state
    if (loading) {
      return (
        <div
          ref={ref}
          className={cn(
            'flex flex-col gap-ds-04 rounded-ds-2xl border border-surface-border-strong bg-surface-1 shadow-01 p-ds-05b',
            className,
          )}
          {...props}
        >
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 animate-pulse rounded bg-surface-2" />
            <div className="h-5 w-5 animate-pulse rounded-full bg-surface-2" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-ds-03">
              <div className="h-ico-md w-ico-md shrink-0 animate-pulse rounded-ds-sm bg-surface-2" />
              <div
                className="h-4 animate-pulse rounded bg-surface-2"
                style={{ width: `${50 + i * 12}%` }}
              />
            </div>
          ))}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col rounded-ds-2xl border border-surface-border-strong bg-surface-1 shadow-01',
          className,
        )}
        {...props}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-ds-05b py-ds-05">
          <span className="text-ds-base font-semibold text-surface-fg">{title}</span>
          <ProgressRing count={items.length} max={maxItems} allDone={allDone} />
        </div>

        {/* Items */}
        <div className="flex flex-col border-t border-surface-border-strong px-ds-05b pb-ds-04 pt-ds-04">
          {items.length === 0 && !isAdding ? (
            <div className="flex flex-col items-center justify-center gap-ds-03 py-ds-06 text-center">
              {EmptyIcon && <EmptyIcon className="h-ico-lg w-ico-lg text-surface-fg-subtle" />}
              <span className="text-ds-md text-surface-fg-subtle">{emptyText}</span>
            </div>
          ) : (
            <div className="flex flex-col gap-ds-02b">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={springs.snappy}
                    className="group flex items-center gap-ds-03 rounded-ds-md px-ds-02 py-ds-02 transition-colors hover:bg-surface-2"
                  >
                    <Checkbox
                      checked={item.done}
                      onCheckedChange={(checked) => onToggle(item.id, checked === true)}
                      aria-label={`Toggle ${item.text}`}
                    />
                    <span
                      className={cn(
                        'flex-1 text-ds-md transition-all duration-200 ease-in-out',
                        item.done && 'text-surface-fg-subtle line-through',
                      )}
                    >
                      {item.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      aria-label={`Delete ${item.text}`}
                      className="flex h-ico-md w-ico-md items-center justify-center rounded-ds-sm opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 hover:bg-surface-3"
                    >
                      <IconX className="h-3 w-3 text-surface-fg-subtle" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Add flow */}
          {items.length < maxItems && (
            <div className="mt-ds-02b">
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
                    placeholder="What needs doing?"
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
                  + Add a task...
                </button>
              )}
            </div>
          )}

          {/* Footer */}
          {resetLabel && (
            <span className="mt-ds-03 text-ds-xs text-surface-fg-subtle">{resetLabel}</span>
          )}
        </div>
      </div>
    )
  },
)

ScratchpadWidget.displayName = 'ScratchpadWidget'

export { ScratchpadWidget }
