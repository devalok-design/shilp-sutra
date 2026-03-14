'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/ui/dialog'
import { Button } from '@/ui/button'
import { IconLock, IconWorld, IconCheck, IconChevronDown } from '@tabler/icons-react'
import type { Visibility } from '../task-types'

// ============================================================
// Option config
// ============================================================

const VISIBILITY_OPTIONS: {
  value: Visibility
  icon: React.ElementType
  label: string
  description: string
}[] = [
  {
    value: 'INTERNAL',
    icon: IconLock,
    label: 'Internal',
    description: 'Only team members',
  },
  {
    value: 'EVERYONE',
    icon: IconWorld,
    label: 'Everyone',
    description: 'Visible to clients',
  },
]

// ============================================================
// Types
// ============================================================

export interface TaskVisibilityPickerProps {
  value: Visibility
  onChange: (visibility: Visibility) => void
  confirmOnPublic?: boolean
  readOnly?: boolean
  className?: string
}

// ============================================================
// TaskVisibilityPicker
// ============================================================

const TaskVisibilityPicker = React.forwardRef<HTMLButtonElement, TaskVisibilityPickerProps>(
  function TaskVisibilityPicker(
    { value, onChange, confirmOnPublic, readOnly, className },
    ref,
  ) {
    const [open, setOpen] = React.useState(false)
    const [confirmOpen, setConfirmOpen] = React.useState(false)

    const current = VISIBILITY_OPTIONS.find((o) => o.value === value) ?? VISIBILITY_OPTIONS[0]
    const CurrentIcon = current.icon

    const handleSelect = (newValue: Visibility) => {
      if (newValue === value) {
        setOpen(false)
        return
      }

      if (newValue === 'EVERYONE' && confirmOnPublic) {
        setOpen(false)
        setConfirmOpen(true)
        return
      }

      onChange(newValue)
      setOpen(false)
    }

    const handleConfirm = () => {
      onChange('EVERYONE')
      setConfirmOpen(false)
    }

    if (readOnly) {
      return (
        <div className={cn('inline-flex items-center gap-ds-02b px-ds-03 py-ds-02 text-ds-md text-surface-fg', className)}>
          <CurrentIcon className="h-ico-sm w-ico-sm" stroke={1.5} />
          <span>{current.label}</span>
        </div>
      )
    }

    return (
      <>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              ref={ref}
              type="button"
              className={cn(
                'inline-flex items-center gap-ds-02b rounded-ds-md px-ds-03 py-ds-02 text-ds-md text-surface-fg transition-colors hover:bg-surface-3',
                className,
              )}
            >
              <CurrentIcon className="h-ico-sm w-ico-sm" stroke={1.5} />
              <span>{current.label}</span>
              <IconChevronDown className="h-3 w-3 text-surface-fg-subtle" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[220px] border-surface-border-strong bg-surface-1 p-ds-02"
            align="start"
            sideOffset={4}
          >
            {VISIBILITY_OPTIONS.map((opt) => {
              const Icon = opt.icon
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    'flex w-full items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-02b text-left transition-colors',
                    'hover:bg-surface-3',
                    opt.value === value && 'bg-surface-3',
                  )}
                >
                  <Icon className="h-ico-sm w-ico-sm shrink-0 text-surface-fg-muted" stroke={1.5} />
                  <div className="flex-1 min-w-0">
                    <div className="text-ds-md text-surface-fg">{opt.label}</div>
                    <div className="text-ds-xs text-surface-fg-subtle">{opt.description}</div>
                  </div>
                  {opt.value === value && (
                    <IconCheck className="h-ico-sm w-ico-sm shrink-0 text-accent-11" />
                  )}
                </button>
              )
            })}
          </PopoverContent>
        </Popover>

        {/* Confirmation dialog for switching to EVERYONE */}
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Make visible to everyone?</DialogTitle>
              <DialogDescription>
                This task will become visible to clients. Team-only comments and internal
                details may be exposed. Are you sure you want to continue?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleConfirm}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  },
)

TaskVisibilityPicker.displayName = 'TaskVisibilityPicker'

export { TaskVisibilityPicker }
