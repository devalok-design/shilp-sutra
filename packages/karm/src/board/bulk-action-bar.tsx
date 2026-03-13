'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { springs, motionProps } from '@/ui/lib/motion'
import { cn } from '@/ui/lib/utils'
import { Button } from '@/ui/button'
import { MotionStagger, MotionStaggerItem } from '@/motion/primitives'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu'
import {
  IconX,
  IconArrowRight,
  IconAlertTriangle,
  IconUser,
  IconCalendar,
  IconEye,
  IconTrash,
} from '@tabler/icons-react'
import { useBoardContext } from './board-context'
import { PRIORITY_COLORS } from './board-constants'

// ============================================================
// Helpers
// ============================================================

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const

// ============================================================
// Component
// ============================================================

export interface BulkActionBarProps extends React.HTMLAttributes<HTMLDivElement> {}

export const BulkActionBar = React.forwardRef<HTMLDivElement, BulkActionBarProps>(({ className, ...props }, ref) => {
  const {
    columns,
    members,
    selectedTaskIds,
    clearSelection,
    onBulkAction,
  } = useBoardContext()

  const count = selectedTaskIds.size
  const taskIds = Array.from(selectedTaskIds)
  const allMembers = members

  const handleAction = (type: string, value?: string | null) => {
    onBulkAction({ type: type as any, taskIds, value })
    clearSelection()
  }

  return (
    <AnimatePresence initial={false}>
      {count > 0 && (
        <motion.div
          ref={ref}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={springs.smooth}
          className={cn('overflow-hidden', className)}
          {...motionProps(props)}
          aria-live="polite"
        >
          <div className="flex items-center gap-ds-03 py-ds-02">
            {/* Selection count + clear */}
            <div className="flex items-center gap-ds-02">
              <span className="text-ds-sm font-medium text-text-primary">
                {count} selected
              </span>
              <Button
                variant="ghost"
                size="icon-md"
                onClick={clearSelection}
                aria-label="Clear selection"
                title="Clear selection"
                className="h-6 w-6"
              >
                <IconX className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="h-4 w-px bg-border-subtle" />

            <MotionStagger className="contents">
              {/* Move to column */}
              <MotionStaggerItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" title="Move to column">
                      <IconArrowRight className="h-ico-sm w-ico-sm mr-ds-01" />
                      Move
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-44">
                    <DropdownMenuLabel>Move to</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {columns.map((col) => (
                      <DropdownMenuItem
                        key={col.id}
                        onClick={() => handleAction('move', col.id)}
                      >
                        {col.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </MotionStaggerItem>

              {/* Set priority */}
              <MotionStaggerItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" title="Set priority">
                      <IconAlertTriangle className="h-ico-sm w-ico-sm mr-ds-01" />
                      Priority
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-40">
                    <DropdownMenuLabel>Set priority</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {PRIORITIES.map((p) => (
                      <DropdownMenuItem
                        key={p}
                        onClick={() => handleAction('priority', p)}
                        className={PRIORITY_COLORS[p]}
                      >
                        {p.charAt(0) + p.slice(1).toLowerCase()}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </MotionStaggerItem>

              {/* Assign */}
              {allMembers.length > 0 && (
                <MotionStaggerItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" title="Assign">
                        <IconUser className="h-ico-sm w-ico-sm mr-ds-01" />
                        Assign
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-44 max-h-48 overflow-y-auto">
                      <DropdownMenuLabel>Assign to</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {allMembers.map((m) => (
                        <DropdownMenuItem
                          key={m.id}
                          onClick={() => handleAction('assign', m.id)}
                        >
                          {m.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </MotionStaggerItem>
              )}

              {/* Visibility */}
              <MotionStaggerItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" title="Set visibility">
                      <IconEye className="h-ico-sm w-ico-sm mr-ds-01" />
                      Visibility
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-40">
                    <DropdownMenuItem onClick={() => handleAction('visibility', 'INTERNAL')}>
                      Internal only
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAction('visibility', 'EVERYONE')}>
                      Visible to all
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </MotionStaggerItem>
            </MotionStagger>

            <div className="flex-1" />

            {/* Delete */}
            <MotionStagger>
              <MotionStaggerItem>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-error hover:text-error"
                  onClick={() => handleAction('delete')}
                  title="Delete selected tasks"
                >
                  <IconTrash className="h-ico-sm w-ico-sm mr-ds-01" />
                  Delete
                </Button>
              </MotionStaggerItem>
            </MotionStagger>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

BulkActionBar.displayName = 'BulkActionBar'
