'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/ui/popover'
import {
  IconAlertTriangleFilled,
  IconArrowUp,
  IconMinus,
  IconArrowDown,
  IconCheck,
  IconChevronDown,
} from '@tabler/icons-react'
import { PRIORITY_LABELS } from '../task-constants'
import type { Priority } from '../task-types'

// ============================================================
// Priority icon mapping
// ============================================================

const PRIORITY_ICONS: Record<Priority, { icon: React.ElementType; className: string }> = {
  URGENT: { icon: IconAlertTriangleFilled, className: 'text-error-9' },
  HIGH: { icon: IconArrowUp, className: 'text-warning-9' },
  MEDIUM: { icon: IconMinus, className: 'text-surface-fg-muted' },
  LOW: { icon: IconArrowDown, className: 'text-surface-fg-subtle' },
}

const PRIORITIES: Priority[] = ['URGENT', 'HIGH', 'MEDIUM', 'LOW']

// ============================================================
// Types
// ============================================================

export interface TaskPriorityPickerProps {
  value: Priority
  onChange: (priority: Priority) => void
  readOnly?: boolean
  className?: string
}

// ============================================================
// PriorityIndicator (internal)
// ============================================================

function PriorityIndicator({ priority }: { priority: Priority }) {
  const config = PRIORITY_ICONS[priority]
  const Icon = config.icon
  return (
    <div className="flex items-center gap-ds-02b">
      <Icon className={cn('h-ico-sm w-ico-sm', config.className)} />
      <span className="text-ds-md text-surface-fg">
        {PRIORITY_LABELS[priority] ?? priority}
      </span>
    </div>
  )
}

// ============================================================
// TaskPriorityPicker
// ============================================================

const TaskPriorityPicker = React.forwardRef<HTMLButtonElement, TaskPriorityPickerProps>(
  function TaskPriorityPicker({ value, onChange, readOnly, className }, ref) {
    const [open, setOpen] = React.useState(false)

    if (readOnly) {
      return (
        <div className={cn('px-ds-03 py-ds-02', className)}>
          <PriorityIndicator priority={value} />
        </div>
      )
    }

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            type="button"
            className={cn(
              'inline-flex items-center gap-ds-02b rounded-ds-md px-ds-03 py-ds-02 transition-colors hover:bg-surface-3',
              className,
            )}
          >
            <PriorityIndicator priority={value} />
            <IconChevronDown className="h-3 w-3 text-surface-fg-subtle" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[180px] border-surface-border-strong bg-surface-1 p-ds-02"
          align="start"
          sideOffset={4}
        >
          {PRIORITIES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                onChange(p)
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-02b transition-colors',
                'hover:bg-surface-3',
                p === value && 'bg-surface-3',
              )}
            >
              <PriorityIndicator priority={p} />
              {p === value && (
                <IconCheck className="ml-auto h-ico-sm w-ico-sm text-accent-11" />
              )}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    )
  },
)

TaskPriorityPicker.displayName = 'TaskPriorityPicker'

export { TaskPriorityPicker }
