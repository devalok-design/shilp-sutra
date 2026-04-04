'use client'

import * as React from 'react'
import { IconChevronRight } from '@tabler/icons-react'
import { motion } from 'framer-motion'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/ui/collapsible'
import { Badge } from '@/ui/badge'
import { Icon } from '@/ui/icon'
import { cn } from '@/ui/lib/utils'
import { springs } from '@/ui/lib/motion'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TaskSectionProps {
  title: string
  /** Optional badge count next to title */
  count?: number | string
  /** Initial open state. @default false */
  defaultOpen?: boolean
  /** Controlled open state */
  open?: boolean
  /** Called when open state changes */
  onOpenChange?: (open: boolean) => void
  /** Chevron position. @default 'right' */
  chevronPosition?: 'left' | 'right'
  /** Actions rendered in the header row (e.g., add button) */
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
}

// ---------------------------------------------------------------------------
// TaskSection — reusable collapsible section with header, count, actions
// ---------------------------------------------------------------------------

export function TaskSection({
  title,
  count,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  chevronPosition = 'right',
  actions,
  children,
  className,
}: TaskSectionProps) {
  const isControlled = controlledOpen !== undefined
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const isOpen = isControlled ? controlledOpen : internalOpen

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(nextOpen)
      }
      onOpenChange?.(nextOpen)
    },
    [isControlled, onOpenChange],
  )

  const chevron = (
    <motion.span
      className="flex shrink-0 items-center text-surface-fg-subtle/40"
      initial={false}
      animate={{ rotate: isOpen ? 90 : 0 }}
      transition={springs.snappy}
    >
      <Icon icon={IconChevronRight} size="xs" />
    </motion.span>
  )

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={handleOpenChange}
      className={className}
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-ds-02 rounded-ds-md py-ds-03 text-left transition-colors hover:bg-surface-raised-hover -mx-ds-02 px-ds-02"
        >
          {chevronPosition === 'left' && chevron}
          <span className="text-[11px] text-surface-fg-subtle/50 uppercase tracking-wider font-medium">
            {title}
          </span>
          {count !== undefined && (
            <Badge size="xs" variant="outline">
              {count}
            </Badge>
          )}
          {/* Spacer pushes trailing elements right */}
          <span className="flex-1" />
          {actions && (
            <span
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              className="shrink-0"
            >
              {actions}
            </span>
          )}
          {chevronPosition === 'right' && chevron}
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}

TaskSection.displayName = 'TaskSection'
