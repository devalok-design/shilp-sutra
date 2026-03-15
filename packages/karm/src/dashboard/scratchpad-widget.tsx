'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { Scratchpad } from './scratchpad'
import type { ScratchpadItem } from './scratchpad/scratchpad-context'

// ============================================================
// Types
// ============================================================

export type { ScratchpadItem }

export interface ScratchpadWidgetProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  items: ScratchpadItem[]
  maxItems?: number
  onToggle: (id: string, done: boolean) => void
  onAdd: (text: string) => void
  onDelete: (id: string) => void
  onEdit?: (id: string, text: string) => void
  onReorder?: (items: ScratchpadItem[]) => void
  onPromote?: (id: string) => void
  title?: string
  resetLabel?: string
  emptyText?: string
  emptyIcon?: React.ComponentType<{ className?: string }>
  loading?: boolean
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
      onEdit,
      onReorder,
      onPromote,
      title = 'My Scratchpad',
      resetLabel,
      emptyText = 'Nothing here yet. Add a task!',
      emptyIcon,
      loading = false,
      className,
      ...props
    },
    ref,
  ) {
    // Loading state
    if (loading) {
      return (
        <div
          ref={ref}
          className={cn(
            'flex flex-col gap-ds-04 rounded-ds-2xl border border-surface-border-strong bg-surface-2 shadow-01 p-ds-05b',
            className,
          )}
          {...props}
        >
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 animate-pulse rounded bg-surface-3" />
            <div className="h-5 w-5 animate-pulse rounded-full bg-surface-3" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-ds-03">
              <div className="h-ico-md w-ico-md shrink-0 animate-pulse rounded-ds-sm bg-surface-3" />
              <div
                className="h-4 animate-pulse rounded bg-surface-3"
                style={{ width: `${50 + i * 12}%` }}
              />
            </div>
          ))}
        </div>
      )
    }

    return (
      <Scratchpad.Root
        ref={ref}
        items={items}
        maxItems={maxItems}
        onToggle={onToggle}
        onAdd={onAdd}
        onDelete={onDelete}
        onEdit={onEdit}
        onReorder={onReorder}
        onPromote={onPromote}
        className={cn(
          'rounded-ds-2xl border border-surface-border-strong bg-surface-2 shadow-01',
          className,
        )}
        {...props}
      >
        {/* Header */}
        <Scratchpad.Header title={title}>
          <Scratchpad.ProgressRing />
        </Scratchpad.Header>

        {/* Items */}
        <div className="flex flex-col border-t border-surface-border-strong px-ds-05b pb-ds-04 pt-ds-04">
          <Scratchpad.EmptyState icon={emptyIcon} message={emptyText} />
          <Scratchpad.List />
          <Scratchpad.AddInput />

          {/* Footer */}
          {resetLabel && (
            <span className="mt-ds-03 text-ds-xs text-surface-fg-subtle">{resetLabel}</span>
          )}
        </div>
      </Scratchpad.Root>
    )
  },
)

ScratchpadWidget.displayName = 'ScratchpadWidget'

export { ScratchpadWidget }
