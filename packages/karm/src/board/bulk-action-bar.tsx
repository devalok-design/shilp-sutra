'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { Button } from '@/ui/button'
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

export function BulkActionBar() {
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
    <div
      className={cn(
        'grid transition-[grid-template-rows,opacity] duration-moderate-02 ease-expressive-entrance',
        count > 0 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
      )}
      aria-live="polite"
    >
      <div className="overflow-hidden">
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

          {/* Move to column */}
          <div className="animate-fade-in delay-stagger" style={{ '--stagger-index': 0 } as React.CSSProperties}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" title="Move to column" tabIndex={count > 0 ? 0 : -1}>
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
          </div>

          {/* Set priority */}
          <div className="animate-fade-in delay-stagger" style={{ '--stagger-index': 1 } as React.CSSProperties}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" title="Set priority" tabIndex={count > 0 ? 0 : -1}>
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
          </div>

          {/* Assign */}
          {allMembers.length > 0 && (
            <div className="animate-fade-in delay-stagger" style={{ '--stagger-index': 2 } as React.CSSProperties}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" title="Assign" tabIndex={count > 0 ? 0 : -1}>
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
            </div>
          )}

          {/* Visibility */}
          <div className="animate-fade-in delay-stagger" style={{ '--stagger-index': 3 } as React.CSSProperties}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" title="Set visibility" tabIndex={count > 0 ? 0 : -1}>
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
          </div>

          <div className="flex-1" />

          {/* Delete */}
          <div className="animate-fade-in delay-stagger" style={{ '--stagger-index': 4 } as React.CSSProperties}>
            <Button
              variant="ghost"
              size="sm"
              className="text-error hover:text-error"
              onClick={() => handleAction('delete')}
              title="Delete selected tasks"
              tabIndex={count > 0 ? 0 : -1}
            >
              <IconTrash className="h-ico-sm w-ico-sm mr-ds-01" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

BulkActionBar.displayName = 'BulkActionBar'
